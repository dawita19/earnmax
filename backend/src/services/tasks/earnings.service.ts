import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { EarningsHistory } from '../entities/earnings-history.entity';

@Injectable()
export class EarningsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(EarningsHistory)
    private readonly earningsHistoryRepository: Repository<EarningsHistory>,
  ) {}

  async calculateDailyEarnings(userId: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const earnings = await this.earningsHistoryRepository
      .createQueryBuilder('earning')
      .select('SUM(earning.amount)', 'total')
      .where('earning.user_id = :userId', { userId })
      .andWhere('earning.earning_type = :type', { type: 'task' })
      .andWhere('earning.created_at >= :today', { today })
      .getRawOne();

    return parseFloat(earnings.total) || 0;
  }

  async calculateWeeklyBonus(userId: number): Promise<number> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });

    let bonusPercentage = 0;
    if (user.first_level_invites >= 20) bonusPercentage = 0.25;
    else if (user.first_level_invites >= 15) bonusPercentage = 0.2;
    else if (user.first_level_invites >= 10) bonusPercentage = 0.15;
    else if (user.first_level_invites >= 5) bonusPercentage = 0.1;

    const bonusAmount = user.vip_amount * bonusPercentage;

    if (bonusAmount > 0) {
      await this.userService.updateUserBalance(userId, bonusAmount);
      await this.recordEarning(
        userId,
        'bonus',
        bonusAmount,
        null,
        'Weekly referral bonus',
      );
    }

    return bonusAmount;
  }

  private async recordEarning(
    userId: number,
    type: string,
    amount: number,
    referenceId: number | null,
    description: string,
  ) {
    const earning = this.earningsHistoryRepository.create({
      user_id: userId,
      earning_type: type,
      amount,
      reference_id: referenceId,
      description,
      created_at: new Date(),
    });
    await this.earningsHistoryRepository.save(earning);
  }
}