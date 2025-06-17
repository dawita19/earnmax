import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class SystemCleanupService {
  private readonly logger = new Logger(SystemCleanupService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleDailyCleanup() {
    this.logger.log('Running daily system cleanup');
    
    await this.cleanupExpiredTasks();
    await this.cleanupOldSessions();
    await this.updateSystemStatistics();
  }

  private async cleanupExpiredTasks() {
    const result = await this.prisma.dailyTask.deleteMany({
      where: { 
        expires_at: { lt: new Date() },
        is_completed: false 
      }
    });
    this.logger.log(`Cleaned up ${result.count} expired tasks`);
  }

  private async cleanupOldSessions() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await this.prisma.session.deleteMany({
      where: { last_activity: { lt: thirtyDaysAgo } }
    });
    this.logger.log(`Cleaned up ${result.count} old sessions`);
  }

  private async updateSystemStatistics() {
    const stats = await this.prisma.$transaction([
      this.prisma.user.aggregate({ _count: { user_id: true } }),
      this.prisma.user.aggregate({ 
        _count: { user_id: true },
        where: { last_login: { gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
      }),
      this.prisma.purchaseRequest.aggregate({
        _sum: { amount: true },
        where: { status: 'approved', created_at: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
      }),
      this.prisma.withdrawalRequest.aggregate({
        _sum: { amount: true },
        where: { status: 'approved' }
      })
    ]);

    await this.prisma.systemStatistics.create({
      data: {
        total_users: stats[0]._count.user_id,
        active_users: stats[1]._count.user_id,
        daily_revenue: stats[2]._sum.amount || 0,
        total_withdrawals: stats[3]._sum.amount || 0,
        updated_at: new Date()
      }
    });
  }
}