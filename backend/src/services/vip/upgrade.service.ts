import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpgradeRequest } from '../entities/upgrade-request.entity';
import { UserService } from '../../user/user.service';
import { VipLevelsService } from './level.service';
import { AdminService } from '../../admin/admin.service';
import { User } from '../entities/user.entity';

@Injectable()
export class VipUpgradeService {
  constructor(
    @InjectRepository(UpgradeRequest)
    private readonly upgradeRepository: Repository<UpgradeRequest>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly vipLevelsService: VipLevelsService,
    private readonly adminService: AdminService,
  ) {}

  async createUpgradeRequest(
    userId: number,
    newLevel: number,
    paymentProofUrl: string | null,
  ) {
    const user = await this.userService.getUserById(userId);
    
    if (user.vip_level >= newLevel) {
      throw new Error('New VIP level must be higher than current level');
    }

    const requirements = await this.vipLevelsService.getUpgradeRequirements(
      user.vip_level,
      newLevel,
    );

    // Check if balance covers the upgrade
    const balanceCoverage = user.balance - requirements.amountNeeded;
    const requiresRecharge = balanceCoverage < 0;
    const rechargeAmount = requiresRecharge ? Math.abs(balanceCoverage) : 0;

    if (requiresRecharge && !paymentProofUrl) {
      throw new Error('Payment proof required for upgrade recharge');
    }

    const upgradeRequest = this.upgradeRepository.create({
      user_id: userId,
      full_name: user.full_name,
      inviter_id: user.inviter_id,
      current_vip_level: user.vip_level,
      current_vip_amount: user.vip_amount,
      new_vip_level: newLevel,
      new_vip_amount: requirements.amountNeeded + user.vip_amount,
      upgrade_difference: requirements.amountNeeded,
      recharge_amount: rechargeAmount,
      payment_proof_url: paymentProofUrl,
      status: 'pending',
      created_at: new Date(),
    });

    const savedRequest = await this.upgradeRepository.save(upgradeRequest);

    if (requiresRecharge) {
      // Distribute to admins for approval
      await this.adminService.distributeRequestToAdmins(
        'upgrade',
        savedRequest.request_id,
      );
    } else {
      // Auto-approve if no recharge needed
      await this.approveUpgrade(savedRequest.request_id, 0, 'Auto-approved');
    }

    return savedRequest;
  }

  async approveUpgrade(requestId: number, adminId: number, notes?: string) {
    const request = await this.upgradeRepository.findOne({
      where: { request_id: requestId },
      relations: ['user'],
    });

    if (!request) {
      throw new Error('Upgrade request not found');
    }

    // Update user VIP status
    const vipConfig = await this.vipLevelsService.getVipLevelConfig(
      request.new_vip_level,
    );
    const dailyEarning = vipConfig.daily_earning;

    await this.userRepository.update(request.user_id, {
      vip_level: request.new_vip_level,
      vip_amount: request.new_vip_amount,
      daily_earning: dailyEarning,
      balance: request.recharge_amount > 0 ? 0 : user.balance - request.upgrade_difference,
    });

    // Update loan
    await this.userService.updateUserLoan(
      request.user_id,
      request.new_vip_amount,
    );

    // Update request status
    request.status = 'approved';
    request.admin_id = adminId;
    request.admin_notes = notes;
    request.processed_at = new Date();
    await this.upgradeRepository.save(request);

    return { success: true };
  }

  async rejectUpgrade(requestId: number, adminId: number, notes: string) {
    const request = await this.upgradeRepository.findOne({
      where: { request_id: requestId },
    });

    if (!request) {
      throw new Error('Upgrade request not found');
    }

    request.status = 'rejected';
    request.admin_id = adminId;
    request.admin_notes = notes;
    request.processed_at = new Date();
    await this.upgradeRepository.save(request);

    return { success: true };
  }
}