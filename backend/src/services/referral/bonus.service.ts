import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReferralBonus } from '../entities/referral-bonus.entity';
import { UsersService } from '../../users/users.service';
import { TransactionService } from '../../transactions/transaction.service';
import { VipLevelsService } from '../../vip/vip-levels.service';

@Injectable()
export class BonusService {
  constructor(
    @InjectRepository(ReferralBonus)
    private readonly bonusRepo: Repository<ReferralBonus>,
    private readonly usersService: UsersService,
    private readonly transactionService: TransactionService,
    private readonly vipLevelsService: VipLevelsService,
  ) {}

  async calculatePurchaseBonus(purchaseId: number) {
    const purchase = await this.transactionService.getPurchaseRequest(purchaseId);
    const user = await this.usersService.findById(purchase.user_id);
    
    if (!user.inviter_id) return;

    // Get referral network for this user
    const network = await this.getReferralNetwork(user.user_id);
    
    // Calculate bonuses for each level
    for (const relation of network) {
      const bonusRate = this.getBonusRate(relation.level);
      const bonusAmount = purchase.amount * bonusRate;
      
      if (bonusAmount > 0) {
        await this.createBonus(
          relation.inviter_id,
          user.user_id,
          relation.level,
          bonusAmount,
          'purchase',
          purchase.request_id
        );
        
        // Update inviter's balance
        await this.usersService.updateBalance(
          relation.inviter_id,
          bonusAmount,
          'referral_bonus'
        );
      }
    }
  }

  async calculateTaskBonus(taskId: number, userId: number, amount: number) {
    const user = await this.usersService.findById(userId);
    if (!user.inviter_id) return;

    const network = await this.getReferralNetwork(user.user_id);
    
    for (const relation of network) {
      const bonusRate = this.getTaskBonusRate(relation.level);
      const bonusAmount = amount * bonusRate;
      
      if (bonusAmount > 0) {
        await this.createBonus(
          relation.inviter_id,
          user.user_id,
          relation.level,
          bonusAmount,
          'task',
          taskId
        );
        
        await this.usersService.updateBalance(
          relation.inviter_id,
          bonusAmount,
          'task_bonus'
        );
      }
    }
  }

  async calculateWeeklyBonus(userId: number) {
    const user = await this.usersService.findById(userId);
    const firstLevelCount = user.first_level_invites;
    
    let bonusRate = 0;
    if (firstLevelCount >= 20) bonusRate = 0.25;
    else if (firstLevelCount >= 15) bonusRate = 0.20;
    else if (firstLevelCount >= 10) bonusRate = 0.15;
    else if (firstLevelCount >= 5) bonusRate = 0.10;
    
    if (bonusRate > 0) {
      const vipLevel = await this.vipLevelsService.getLevel(user.vip_level);
      const bonusAmount = vipLevel.investment_amount * bonusRate;
      
      await this.usersService.updateBalance(
        userId,
        bonusAmount,
        'weekly_bonus'
      );
      
      await this.transactionService.createEarningRecord({
        user_id: userId,
        amount: bonusAmount,
        earning_type: 'weekly_bonus',
        description: `Weekly bonus for ${firstLevelCount} direct referrals`,
      });
    }
  }

  private async getReferralNetwork(userId: number) {
    return this.bonusRepo
      .createQueryBuilder('rn')
      .select(['rn.inviter_id', 'rn.level'])
      .where('rn.invitee_id = :userId AND rn.level <= 4', { userId })
      .getMany();
  }

  private getBonusRate(level: number): number {
    switch (level) {
      case 1: return 0.20;
      case 2: return 0.10;
      case 3: return 0.05;
      case 4: return 0.02;
      default: return 0;
    }
  }

  private getTaskBonusRate(level: number): number {
    switch (level) {
      case 1: return 0.20;
      case 2: return 0.10;
      case 3: return 0.05;
      case 4: return 0.02;
      default: return 0;
    }
  }

  private async createBonus(
    inviterId: number,
    inviteeId: number,
    level: number,
    amount: number,
    source: string,
    sourceId: number
  ) {
    await this.bonusRepo.save({
      inviter_id: inviterId,
      invitee_id: inviteeId,
      level,
      amount,
      source,
      source_id: sourceId,
    });
  }
}