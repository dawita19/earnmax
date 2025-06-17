import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { WithdrawalRequest } from '../../entities/withdrawal-request.entity';
import { VipLevel } from '../../entities/vip-level.entity';
import { AdminService } from '../admin/admin.service';
import { NotificationService } from './notification.service';
import { AuditLogService } from '../system/audit-log.service';

@Injectable()
export class WithdrawalService {
  private readonly logger = new Logger(WithdrawalService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(WithdrawalRequest)
    private readonly withdrawalRepository: Repository<WithdrawalRequest>,
    @InjectRepository(VipLevel)
    private readonly vipLevelRepository: Repository<VipLevel>,
    private readonly adminService: AdminService,
    private readonly notificationService: NotificationService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async requestWithdrawal(
    userId: number,
    amount: number,
    paymentMethod: string,
    paymentDetails: string,
  ) {
    const user = await this.userRepository.findOne({ where: { user_id: userId } });
    const vipLevel = await this.vipLevelRepository.findOne({ where: { level_id: user.vip_level } });

    // Validate withdrawal rules
    if (user.vip_level === 0 && user.total_withdrawn >= 300) {
      throw new Error('Upgrade to VIP to withdraw more');
    }

    const remainingWithdrawal = vipLevel.max_total_withdrawal - user.total_withdrawn;
    if (amount > remainingWithdrawal) {
      throw new Error(`Maximum withdrawal for your VIP level is ${vipLevel.max_total_withdrawal}`);
    }

    if (amount < vipLevel.min_withdrawal) {
      throw new Error(`Minimum withdrawal is ${vipLevel.min_withdrawal}`);
    }

    if (amount > user.balance) {
      throw new Error('Insufficient balance');
    }

    // Create withdrawal request
    const withdrawalRequest = this.withdrawalRepository.create({
      user_id: userId,
      full_name: user.full_name,
      amount,
      payment_method: paymentMethod,
      payment_details: paymentDetails,
      status: 'pending',
      ip_address: user.ip_address,
    });

    await this.withdrawalRepository.save(withdrawalRequest);
    
    // Distribute to admin queue (round-robin)
    await this.adminService.distributeWithdrawalRequest(withdrawalRequest.request_id);
    
    // Notify user
    await this.notificationService.create(
      userId,
      'Withdrawal Request Submitted',
      `Your withdrawal request of ${amount} has been received and is being processed.`,
      'withdrawal',
      withdrawalRequest.request_id,
    );

    // Audit log
    await this.auditLogService.log(
      null,
      userId,
      'withdrawal_request',
      `User requested withdrawal of ${amount}`,
      user.ip_address,
    );

    return {
      success: true,
      message: 'Withdrawal request submitted for approval',
      requestId: withdrawalRequest.request_id,
    };
  }

  async processWithdrawal(requestId: number, adminId: number, action: 'approve' | 'reject', notes?: string) {
    const request = await this.withdrawalRepository.findOne({ 
      where: { request_id: requestId },
      relations: ['user'],
    });

    if (!request) {
      throw new Error('Withdrawal request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Request already processed');
    }

    if (action === 'approve') {
      // Deduct from user balance
      await this.userRepository.update(request.user_id, {
        balance: () => `balance - ${request.amount}`,
        total_withdrawn: () => `total_withdrawn + ${request.amount}`,
      });

      request.status = 'approved';
      request.processed_at = new Date();
      request.admin_id = adminId;
      request.admin_notes = notes;

      await this.withdrawalRepository.save(request);

      // Notify user
      await this.notificationService.create(
        request.user_id,
        'Withdrawal Approved',
        `Your withdrawal request of ${request.amount} has been approved and processed.`,
        'withdrawal',
        request.request_id,
      );

      // Update system stats
      await this.adminService.updateSystemStats({
        total_withdrawals: request.amount,
        pending_withdrawals: -1,
      });

    } else {
      request.status = 'rejected';
      request.processed_at = new Date();
      request.admin_id = adminId;
      request.admin_notes = notes;

      await this.withdrawalRepository.save(request);

      // Notify user
      await this.notificationService.create(
        request.user_id,
        'Withdrawal Rejected',
        `Your withdrawal request of ${request.amount} was rejected. Reason: ${notes || 'Not specified'}`,
        'withdrawal',
        request.request_id,
      );
    }

    // Audit log
    await this.auditLogService.log(
      adminId,
      request.user_id,
      `withdrawal_${action}`,
      `Admin ${action}d withdrawal request ${request.request_id}`,
      null,
    );

    return {
      success: true,
      message: `Withdrawal request ${action}d successfully`,
    };
  }

  async getUserWithdrawalHistory(userId: number) {
    return this.withdrawalRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }
}