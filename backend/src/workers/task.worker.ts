import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { DailyTask } from '../entities/daily-task.entity';
import { TaskHistory } from '../entities/task-history.entity';
import { VipLevel } from '../entities/vip-level.entity';
import { ReferralNetwork } from '../entities/referral-network.entity';
import { EarningsHistory } from '../entities/earnings-history.entity';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class TaskWorker {
  private readonly logger = new Logger(TaskWorker.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(DailyTask)
    private readonly dailyTaskRepository: Repository<DailyTask>,
    @InjectRepository(TaskHistory)
    private readonly taskHistoryRepository: Repository<TaskHistory>,
    @InjectRepository(VipLevel)
    private readonly vipLevelRepository: Repository<VipLevel>,
    @InjectRepository(ReferralNetwork)
    private readonly referralNetworkRepository: Repository<ReferralNetwork>,
    @InjectRepository(EarningsHistory)
    private readonly earningsHistoryRepository: Repository<EarningsHistory>,
    private readonly notificationService: NotificationService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetDailyTasks() {
    this.logger.log('Resetting daily tasks for all users');
    
    const activeUsers = await this.userRepository.find({
      where: { account_status: 'active' }
    });

    for (const user of activeUsers) {
      await this.generateUserTasks(user);
    }
  }

  private async generateUserTasks(user: User) {
    // Clear existing incomplete tasks
    await this.dailyTaskRepository.delete({ 
      user_id: user.user_id, 
      is_completed: false 
    });

    // Get VIP level details
    const vipLevel = await this.vipLevelRepository.findOne({ 
      where: { level_id: user.vip_level } 
    });

    if (!vipLevel) {
      this.logger.error(`VIP level ${user.vip_level} not found for user ${user.user_id}`);
      return;
    }

    // Parse tasks from JSON
    const tasks: {type: string, description: string}[] = JSON.parse(vipLevel.daily_tasks);

    // Create new tasks
    for (const task of tasks) {
      const newTask = this.dailyTaskRepository.create({
        user_id: user.user_id,
        vip_level: user.vip_level,
        task_type: task.type,
        task_description: task.description,
        earnings: vipLevel.per_task_earning,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      });

      await this.dailyTaskRepository.save(newTask);
    }

    // Notify user
    await this.notificationService.createUserNotification(
      user.user_id,
      'New Daily Tasks Available',
      `Your ${tasks.length} new daily tasks are ready!`,
    );
  }

  async processTaskCompletion(userId: number, taskId: number) {
    const task = await this.dailyTaskRepository.findOne({ 
      where: { task_id: taskId, user_id: userId } 
    });

    if (!task) {
      throw new Error('Task not found');
    }

    if (task.is_completed) {
      throw new Error('Task already completed');
    }

    if (new Date() > task.expires_at) {
      throw new Error('Task has expired');
    }

    // Mark task as completed
    task.is_completed = true;
    task.completion_date = new Date();
    await this.dailyTaskRepository.save(task);

    // Record in history
    const history = this.taskHistoryRepository.create({
      user_id: userId,
      task_id: taskId,
      vip_level: task.vip_level,
      task_type: task.task_type,
      earnings: task.earnings,
      completed_at: new Date(),
    });
    await this.taskHistoryRepository.save(history);

    // Update user balance
    await this.userRepository.increment(
      { user_id: userId },
      'balance',
      task.earnings
    );

    // Record earnings
    await this.recordEarning(userId, 'task', task.earnings, taskId);

    // Process referral bonuses (4 levels)
    await this.processReferralBonuses(userId, task.earnings, taskId);

    return task;
  }

  private async processReferralBonuses(userId: number, amount: number, sourceId: number) {
    const referralChain = await this.referralNetworkRepository.find({
      where: { invitee_id: userId },
      relations: ['inviter']
    });

    const bonusRates = [0.2, 0.1, 0.05, 0.02]; // 20%, 10%, 5%, 2%

    for (let i = 0; i < Math.min(referralChain.length, 4); i++) {
      const relation = referralChain[i];
      const bonusAmount = amount * bonusRates[i];

      // Update inviter's balance
      await this.userRepository.increment(
        { user_id: relation.inviter_id },
        'balance',
        bonusAmount
      );

      // Update inviter's referral bonus stats
      await this.userRepository.increment(
        { user_id: relation.inviter_id },
        'total_referral_bonus',
        bonusAmount
      );

      // Record referral bonus
      await this.recordReferralBonus(
        relation.inviter_id,
        userId,
        i + 1,
        bonusAmount,
        'task',
        sourceId
      );

      // Record earning for inviter
      await this.recordEarning(
        relation.inviter_id,
        'referral',
        bonusAmount,
        sourceId
      );

      // Notify inviter
      await this.notificationService.createUserNotification(
        relation.inviter_id,
        'Referral Bonus Earned',
        `You earned ${bonusAmount} from your level ${i + 1} referral's task completion`,
        sourceId
      );
    }
  }

  private async recordEarning(userId: number, type: string, amount: number, referenceId: number) {
    const earning = this.earningsHistoryRepository.create({
      user_id: userId,
      earning_type: type,
      amount,
      reference_id: referenceId,
    });
    return this.earningsHistoryRepository.save(earning);
  }

  private async recordReferralBonus(inviterId: number, inviteeId: number, level: number, amount: number, source: string, sourceId: number) {
    const bonus = this.referralBonusRepository.create({
      inviter_id: inviterId,
      invitee_id: inviteeId,
      level,
      amount,
      source,
      source_id: sourceId,
    });
    return this.referralBonusRepository.save(bonus);
  }

  @Cron(CronExpression.EVERY_WEEK)
  async processWeeklyBonuses() {
    this.logger.log('Processing weekly referral bonuses');
    
    // Implementation for weekly bonuses based on referral counts
    // Similar structure to daily tasks but with different criteria
  }
}