import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VipLevel } from '../entities/vip-level.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class VipRepository {
  constructor(
    @InjectRepository(VipLevel)
    private readonly vipLevelRepository: Repository<VipLevel>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAllVipLevels(): Promise<VipLevel[]> {
    return this.vipLevelRepository.find({ order: { level_id: 'ASC' } });
  }

  async getVipLevelDetails(levelId: number): Promise<VipLevel | undefined> {
    return this.vipLevelRepository.findOne({ 
      where: { level_id: levelId },
      relations: ['dailyTasks']
    });
  }

  async upgradeUserVip(
    userId: number, 
    newLevelId: number,
    paymentProofUrl?: string
  ): Promise<{ success: boolean; message?: string }> {
    const user = await this.userRepository.findOne({ 
      where: { user_id: userId },
      relations: ['vipLevel']
    });
    
    if (!user) return { success: false, message: 'User not found' };

    const newLevel = await this.vipLevelRepository.findOne({ 
      where: { level_id: newLevelId }
    });

    if (!newLevel) return { success: false, message: 'VIP level not found' };

    // Calculate upgrade cost
    const currentInvestment = user.vipLevel?.investment_amount || 0;
    const upgradeCost = newLevel.investment_amount - currentInvestment;

    // Check if user has sufficient balance
    if (user.balance < upgradeCost) {
      return { 
        success: false, 
        message: `Insufficient balance. Need additional ${upgradeCost - user.balance}`
      };
    }

    // Process upgrade
    await this.userRepository.update(userId, {
      vip_level: newLevelId,
      vip_amount: newLevel.investment_amount,
      balance: user.balance - upgradeCost
    });

    return { success: true };
  }

  async calculateDailyEarnings(userId: number): Promise<number> {
    const user = await this.userRepository.findOne({ 
      where: { user_id: userId },
      relations: ['vipLevel']
    });

    if (!user || !user.vipLevel) return 0;

    return user.vipLevel.daily_earning;
  }

  async getVipDistribution(): Promise<{level: number; count: number}[]> {
    const result = await this.userRepository
      .createQueryBuilder('user')
      .select('user.vip_level', 'level')
      .addSelect('COUNT(user.user_id)', 'count')
      .groupBy('user.vip_level')
      .getRawMany();

    return result.map(item => ({
      level: item.level,
      count: parseInt(item.count)
    }));
  }
}