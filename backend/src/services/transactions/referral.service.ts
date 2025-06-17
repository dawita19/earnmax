import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { ReferralNetwork } from '../../entities/referral-network.entity';
import { ReferralBonus } from '../../entities/referral-bonus.entity';
import { VipLevel } from '../../entities/vip-level.entity';
import { EarningsHistory } from '../../entities/earnings-history.entity';
import { NotificationService } from './notification.service';

@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ReferralNetwork)
    private readonly referralNetworkRepository: Repository<ReferralNetwork>,
    @InjectRepository(ReferralBonus)
    private readonly referralBonusRepository: Repository<ReferralBonus>,
    @InjectRepository(VipLevel)
    private readonly vipLevelRepository: Repository<VipLevel>,
    @InjectRepository(EarningsHistory)
    private readonly earningsHistoryRepository: Repository<EarningsHistory>,
    private readonly notificationService: NotificationService,
  ) {}

  async processReferralChain(inviteeId: number) {
    const invitee = await this.userRepository.findOne({ where: { user_id: inviteeId } });
    if (!invitee || !invitee.inviter_id) return;

    // Process 4-level deep referral chain
    const levels = await this.getReferralChain(invitee.inviter_id);
    
    for (const level of levels) {
      await this.updateInviterStats(level.inviter_id, level.level);
      await this.createReferralRelation(inviteeId, level.inviter_id, level.level);
    }

    // Update invitee's inviter first-level count
    await this.userRepository.update(invitee.inviter_id, {
      first_level_invites: () => 'first_level_invites + 1',
      total_invites: () => 'total_invites + 1',
    });
  }

  private async getReferralChain(inviterId: number, currentLevel = 1, maxLevel = 4) {
    if (currentLevel > maxLevel) return [];
    
    const inviter = await this.userRepository.findOne({ 
      where: { user_id: inviterId },
      select: ['user_id', 'inviter_id'],
    });
    
    if (!inviter) return [];
    
    const currentLevelData = { inviter_id: inviter.user_id, level: currentLevel };
    
    if (!inviter.inviter_id || currentLevel === maxLevel) {
      return [currentLevelData];
    }
    
    const nextLevels = await this.getReferralChain(inviter.inviter_id, currentLevel + 1, maxLevel);
    return [currentLevelData, ...nextLevels];
  }

  private async updateInviterStats(inviterId: number, level: number) {
    const fieldMap = {
      1: 'first_level_invites',
      2: 'second_level_invites',
      3: 'third_level_invites',
      4: 'fourth_level_invites',
    };

    if (fieldMap[level]) {
      await this.userRepository.update(inviterId, {
        [fieldMap[level]]: () => `${fieldMap[level]} + 1`,
        total_invites: () => 'total_invites + 1',
      });
    }
  }

  private async createReferralRelation(inviteeId: number, inviterId: number, level: number) {
    const existing = await this.referralNetworkRepository.findOne({
      where: { inviter_id: inviterId, invitee_id: inviteeId },
    });

    if (!existing) {
      await this.referralNetworkRepository.save({
        inviter_id: inviterId,
        invitee_id: inviteeId,
        level,
      });
    }
  }

  async calculateReferralBonus(source: 'purchase' | 'upgrade' | 'task', sourceId: number, amount: number) {
    let user: User;
    
    if (source === 'purchase' || source === 'upgrade') {
      const request = source === 'purchase' 
        ? await this.purchaseRepository.findOne({ where: { request_id: sourceId } })
        : await this.upgradeRepository.findOne({ where: { request_id: sourceId } });
      
      if (!request) return;
      user = await this.userRepository.findOne({ where: { user_id: request.user_id } });
    } else {
      const task = await this.taskHistoryRepository.findOne({ where: { task_id: sourceId } });
      if (!task) return;
      user = await this.userRepository.findOne({ where: { user_id: task.user_id } });
    }

    if (!user?.inviter_id) return;

    // Get 4-level referral chain
    const referralChain = await this.referralNetworkRepository.find({
      where: { invitee_id: user.user_id },
      order: { level: 'ASC' },
    });

    const bonusRates = { 1: 0.2, 2: 0.1, 3: 0.05, 4: 0.02 };
    
    for (const relation of referralChain) {
      if (relation.level > 4) break;
      
      const bonusAmount = amount * bonusRates[relation.level];
      
      // Update inviter's balance
      await this.userRepository.update(relation.inviter_id, {
        balance: () => `balance + ${bonusAmount}`,
        total_referral_bonus: () => `total_referral_bonus + ${bonusAmount}`,
        total_earnings: () => `total_earnings + ${bonusAmount}`,
      });

      // Record referral bonus
      const bonus = this.referralBonusRepository.create({
        inviter_id: relation.inviter_id,
        invitee_id: user.user_id,
        level: relation.level,
        amount: bonusAmount,
        source,
        source_id: sourceId,
      });

      await this.referralBonusRepository.save(bonus);

      // Record in earnings history
      const earning = this.earningsHistoryRepository.create({
        user_id: relation.inviter_id,
        earning_type: 'referral',
        amount: bonusAmount,
        reference_id: bonus.bonus_id,
        description: `Referral bonus from level ${relation.level}`,
      });

      await this.earningsHistoryRepository.save(earning);

      // Notify inviter
      const inviter = await this.userRepository.findOne({ where: { user_id: relation.inviter_id } });
      const invitee = await this.userRepository.findOne({ where: { user_id: user.user_id } });
      
      await this.notificationService.create(
        relation.inviter_id,
        'Referral Bonus Earned',
        `You earned ${bonusAmount} from your level ${relation.level} referral ${invitee.full_name}`,
        'referral',
        bonus.bonus_id,
      );
    }
  }

  async getReferralNetwork(userId: number, level: number = 1) {
    const referrals = await this.referralNetworkRepository.find({
      where: { inviter_id: userId, level },
      relations: ['invitee'],
    });

    return {
      level,
      count: referrals.length,
      referrals: referrals.map(r => ({
        user_id: r.invitee.user_id,
        full_name: r.invitee.full_name,
        vip_level: r.invitee.vip_level,
        join_date: r.invitee.join_date,
      })),
    };
  }

  async getWeeklyBonus(userId: number) {
    const user = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) throw new Error('User not found');

    const firstLevelCount = user.first_level_invites;
    let bonusRate = 0;

    if (firstLevelCount >= 20) bonusRate = 0.25;
    else if (firstLevelCount >= 15) bonusRate = 0.20;
    else if (firstLevelCount >= 10) bonusRate = 0.15;
    else if (firstLevelCount >= 5) bonusRate = 0.10;

    if (bonusRate > 0) {
      const bonusAmount = user.vip_amount * bonusRate;
      
      // Update user balance
      await this.userRepository.update(userId, {
        balance: () => `balance + ${bonusAmount}`,
        total_earnings: () => `total_earnings + ${bonusAmount}`,
      });

      // Record in earnings history
      const earning = this.earningsHistoryRepository.create({
        user_id: userId,
        earning_type: 'bonus',
        amount: bonusAmount,
        description: `Weekly referral bonus (${bonusRate * 100}% of VIP investment)`,
      });

      await this.earningsHistoryRepository.save(earning);

      // Notify user
      await this.notificationService.create(
        userId,
        'Weekly Bonus Earned',
        `You earned a weekly bonus of ${bonusAmount} for having ${firstLevelCount} active referrals!`,
        'bonus',
        earning.entry_id,
      );

      return {
        success: true,
        bonusAmount,
        bonusRate,
        firstLevelCount,
      };
    }

    return {
      success: false,
      message: 'Not enough referrals for weekly bonus',
      firstLevelCount,
      required: 5,
    };
  }
}