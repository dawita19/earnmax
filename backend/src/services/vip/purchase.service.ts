import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PurchaseRequest } from '../entities/purchase-request.entity';
import { UserService } from '../../user/user.service';
import { VipLevelsService } from './level.service';
import { ReferralService } from '../../referral/referral.service';
import { AdminService } from '../../admin/admin.service';
import { User } from '../entities/user.entity';

@Injectable()
export class VipPurchaseService {
  constructor(
    @InjectRepository(PurchaseRequest)
    private readonly purchaseRepository: Repository<PurchaseRequest>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly vipLevelsService: VipLevelsService,
    private readonly referralService: ReferralService,
    private readonly adminService: AdminService,
  ) {}

  async createPurchaseRequest(
    userId: number,
    level: number,
    paymentProofUrl: string,
    paymentMethod: string,
  ) {
    const user = await this.userService.getUserById(userId);
    if (user.vip_level > 0) {
      throw new Error('Existing VIP members must use upgrade instead of purchase');
    }

    const vipConfig = await this.vipLevelsService.getVipLevelConfig(level);
    
    const purchaseRequest = this.purchaseRepository.create({
      user_id: userId,
      full_name: user.full_name,
      inviter_id: user.inviter_id,
      vip_level: level,
      amount: vipConfig.investment_amount,
      payment_proof_url: paymentProofUrl,
      payment_method: paymentMethod,
      status: 'pending',
      created_at: new Date(),
    });

    const savedRequest = await this.purchaseRepository.save(purchaseRequest);
    
    // Distribute to admins using round-robin
    await this.adminService.distributeRequestToAdmins(
      'purchase',
      savedRequest.request_id,
    );

    return savedRequest;
  }

  async approvePurchase(requestId: number, adminId: number, notes?: string) {
    const request = await this.purchaseRepository.findOne({
      where: { request_id: requestId },
      relations: ['user'],
    });

    if (!request) {
      throw new Error('Purchase request not found');
    }

    // Update user VIP status
    const vipConfig = await this.vipLevelsService.getVipLevelConfig(
      request.vip_level,
    );
    const dailyEarning = vipConfig.daily_earning;

    await this.userRepository.update(request.user_id, {
      vip_level: request.vip_level,
      vip_amount: request.amount,
      daily_earning: dailyEarning,
      ip_address: null, // Clear IP for VIP users
    });

    // Record loan
    await this.userService.createUserLoan(
      request.user_id,
      request.amount,
      request.amount, // Initial loan balance same as amount
    );

    // Process referral bonuses
    await this.referralService.distributePurchaseBonus(
      request.user_id,
      request.inviter_id,
      request.amount,
    );

    // Update request status
    request.status = 'approved';
    request.admin_id = adminId;
    request.admin_notes = notes;
    request.processed_at = new Date();
    await this.purchaseRepository.save(request);

    return { success: true };
  }

  async rejectPurchase(requestId: number, adminId: number, notes: string) {
    const request = await this.purchaseRepository.findOne({
      where: { request_id: requestId },
    });

    if (!request) {
      throw new Error('Purchase request not found');
    }

    request.status = 'rejected';
    request.admin_id = adminId;
    request.admin_notes = notes;
    request.processed_at = new Date();
    await this.purchaseRepository.save(request);

    return { success: true };
  }
}