import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { ReferralNetwork } from '../../entities/referral-network.entity';
import { ReferralBonus } from '../../entities/referral-bonus.entity';
import { VipLevels } from '../../entities/vip-levels.entity';
import { EarningsHistory } from '../../entities/earnings-history.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(ReferralNetwork)
    private referralRepo: Repository<ReferralNetwork>,
    @InjectRepository(ReferralBonus)
    private bonusRepo: Repository<ReferralBonus>,
    @InjectRepository(VipLevels)
    private vipRepo: Repository<VipLevels>,
    @InjectRepository(EarningsHistory)
    private earningsRepo: Repository<EarningsHistory>
  ) {}

  async processVipPurchase(userId: number, vipLevel: number) {
    const user = await this.userRepo.findOne({ where: { user_id: userId } });
    const vipInfo = await this.vipRepo.findOne({ where: { level_id: vipLevel } });

    if (!user || !vipInfo) throw new Error('Invalid user or VIP level');

    // Update user VIP status
    user.vip_level = vipLevel;
    user.vip_amount = vipInfo.investment_amount;
    user.balance = user.balance + (vipInfo.daily_earning * 30); // Initial bonus

    // Process referral bonuses (4 levels)
    await this.processReferralBonuses(user, vipInfo.investment_amount, 'purchase');

    // Record earnings
    await this.recordEarning(
      user.user_id,
      'purchase',
      vipInfo.investment_amount,
      `VIP ${vipLevel} purchase`
    );

    await user.save();
    return user;
  }

  private async processReferralBonuses(user: User, amount: number, source: 'purchase' | 'upgrade' | 'task') {
    const referrals = await this.referralRepo.find({ 
      where: { invitee_id: user.user_id },
      relations: ['inviter']
    });

    const bonusRates = [0.2, 0.1, 0.05, 0.02]; // 20%, 10%, 5%, 2%

    for (let i = 0; i < Math.min(referrals.length, 4); i++) {
      const referral = referrals[i];
      const bonusAmount = amount * bonusRates[i];
      
      // Update inviter's stats
      const inviter = referral.inviter;
      inviter.balance += bonusAmount;
      inviter.total_referral_bonus += bonusAmount;
      inviter.total_earnings += bonusAmount;

      // Update invite counts based on level
      if (i === 0) inviter.first_level_invites += 1;
      if (i === 1) inviter.second_level_invites += 1;
      if (i === 2) inviter.third_level_invites += 1;
      if (i === 3) inviter.fourth_level_invites += 1;
      
      inviter.total_invites += 1;
      await inviter.save();

      // Record referral bonus
      await this.bonusRepo.save({
        inviter_id: inviter.user_id,
        invitee_id: user.user_id,
        level: i + 1,
        amount: bonusAmount,
        source,
        source_id: user.user_id
      });

      // Record earning for inviter
      await this.recordEarning(
        inviter.user_id,
        'referral',
        bonusAmount,
        `Referral bonus from ${user.full_name} (Level ${i + 1})`
      );
    }
  }

  async recordEarning(userId: number, type: string, amount: number, description: string) {
    await this.earningsRepo.save({
      user_id: userId,
      earning_type: type,
      amount,
      description,
      created_at: new Date()
    });
  }

  async calculateWeeklyBonuses() {
    // Implementation for weekly bonus calculation
    // ...
  }
}