import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma.service';
import { TaskSocketGateway } from '../socket/task.socket';

@Injectable()
export class TasksResetService {
  private readonly logger = new Logger(TasksResetService.name);

  constructor(
    private prisma: PrismaService,
    private taskSocket: TaskSocketGateway
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyReset() {
    this.logger.log('Resetting daily tasks for all users');
    
    // Get all active users
    const users = await this.prisma.user.findMany({
      where: { account_status: 'active' },
      select: { user_id: true, vip_level: true }
    });

    // Reset tasks for each user
    for (const user of users) {
      await this.resetUserTasks(user.user_id, user.vip_level);
    }
  }

  private async resetUserTasks(userId: number, vipLevel: number) {
    // Get tasks for user's VIP level
    const vipTasks = await this.prisma.vipLevel.findUnique({
      where: { level_id: vipLevel },
      select: { daily_tasks: true }
    });

    // Delete old tasks
    await this.prisma.dailyTask.deleteMany({
      where: { user_id: userId }
    });

    // Create new tasks
    const newTasks = vipTasks.daily_tasks.map(task => ({
      user_id: userId,
      vip_level: vipLevel,
      task_type: task.type,
      task_description: task.description,
      earnings: task.earnings,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    }));

    await this.prisma.dailyTask.createMany({
      data: newTasks
    });

    // Notify user
    this.taskSocket.server.to(`user_${userId}`).emit('tasks_reset', {
      count: newTasks.length,
      timestamp: new Date()
    });
  }
}