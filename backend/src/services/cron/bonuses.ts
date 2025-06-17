import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma.service';
import { UserSocketGateway } from '../socket/user.socket';

@Injectable()
export class WeeklyBonusesService {
  private readonly logger = new Logger(WeeklyBonusesService.name);

  constructor(
    private prisma: PrismaService,
    private userSocket: UserSocketGateway
  ) {}

  @Cron(CronExpression.EVERY_SUNDAY_AT_MIDNIGHT)
  async handleWeeklyBonuses() {
    this.logger.log('Calculating weekly referral bonuses');
    
    // Get users eligible for bonuses (with at least 5 first-level referrals)
    const eligibleUsers = await this.prisma.user.findMany({
      where: { first_level_invites: { gte: 5 } },
      select: { user_id: true, first_level_invites: true, vip_amount: true }
    });

    for (const user of eligibleUsers) {
      const bonusPercentage = this.calculateBonusPercentage(user.first_level_invites);
      const bonusAmount = user.vip_amount * (bonusPercentage / 100);
      
      if (bonusAmount > 0) {
        await this.applyBonus(user.user_id, bonusAmount);
      }
    }
  }

  private calculateBonusPercentage(invites: number): number {
    if (invites >= 20) return 25;
    if (invites >= 15) return 20;
    if (invites >= 10) return 15;
    return 10; // 5-9 invites
  }

  private async applyBonus(userId: number, amount: number) {
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { user_id: userId },
        data: { 
          balance: { increment: amount },
          total_earnings: { increment: amount },
          weekly_bonus: { increment: amount }
        }
      }),
      this.prisma.earningsHistory.create({
        data: {
          user_id: userId,
          earning_type: 'bonus',
          amount,
          description: `Weekly referral bonus`,
          ip_address: 'system'
        }
      })
    ]);

    // Notify user
    this.userSocket.server.to(`user_${userId}`).emit('bonus_received', {
      amount,
      type: 'weekly',
      timestamp: new Date()
    });
  }
}