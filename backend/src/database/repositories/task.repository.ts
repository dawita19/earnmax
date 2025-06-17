import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { DailyTask } from '../entities/daily-task.entity';
import { TaskHistory } from '../entities/task-history.entity';
import { User } from '../entities/user.entity';
import { VipLevel } from '../entities/vip-level.entity';

@Injectable()
export class TaskRepository {
  constructor(
    @InjectRepository(DailyTask)
    private readonly dailyTaskRepository: Repository<DailyTask>,
    @InjectRepository(TaskHistory)
    private readonly taskHistoryRepository: Repository<TaskHistory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(VipLevel)
    private readonly vipLevelRepository: Repository<VipLevel>,
    private readonly entityManager: EntityManager,
  ) {}

  async generateDailyTasksForUser(userId: number): Promise<DailyTask[]> {
    const user = await this.userRepository.findOne({ 
      where: { user_id: userId },
      relations: ['vipLevel']
    });

    if (!user || !user.vipLevel) return [];

    // Clear any existing tasks
    await this.dailyTaskRepository.delete({ user_id: userId });

    // Get tasks for user's VIP level
    const tasks = user.vipLevel.daily_tasks; // Assuming this is a JSON array
    const newTasks: DailyTask[] = [];

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);
    expiresAt.setHours(0, 0, 0, 0);

    for (const task of tasks) {
      const newTask = this.dailyTaskRepository.create({
        user_id: userId,
        vip_level: user.vip_level,
        task_type: task.type,
        task_description: task.description,
        earnings: task.earnings || user.vipLevel.per_task_earning,
        expires_at: expiresAt
      });
      newTasks.push(newTask);
    }

    return this.dailyTaskRepository.save(newTasks);
  }

  async completeTask(
    userId: number,
    taskId: number,
    ipAddress?: string
  ): Promise<{ success: boolean; earnings?: number; message?: string }> {
    const task = await this.dailyTaskRepository.findOne({
      where: { task_id: taskId, user_id: userId },
      relations: ['user']
    });

    if (!task) return { success: false, message: 'Task not found' };
    if (task.is_completed) return { success: false, message: 'Task already completed' };
    if (new Date() > task.expires_at) return { success: false, message: 'Task expired' };

    // Process in transaction
    let earnings = 0;
    await this.entityManager.transaction(async transactionalEntityManager => {
      // Mark task as completed
      task.is_completed = true;
      task.completion_date = new Date();
      await transactionalEntityManager.save(task);

      // Add to task history
      const history = this.taskHistoryRepository.create({
        user_id: userId,
        task_id: taskId,
        vip_level: task.vip_level,
        task_type: task.task_type,
        earnings: task.earnings,
        completed_at: new Date(),
        ip_address: ipAddress
      });
      await transactionalEntityManager.save(history);

      // Update user balance
      await transactionalEntityManager.update(
        User,
        { user_id: userId },
        {
          balance: () => `balance + ${task.earnings}`,
          total_earnings: () => `total_earnings + ${task.earnings}`
        }
      );

      earnings = task.earnings;

      // Process referral bonuses (4 levels)
      await this.processReferralBonuses(userId, task.earnings, 'task', task.task_id);
    });

    return { success: true, earnings };
  }

  private async processReferralBonuses(
    userId: number,
    amount: number,
    source: 'purchase' | 'upgrade' | 'task',
    sourceId: number
  ): Promise<void> {
    // Similar implementation as in TransactionRepository
    // ...
  }

  async getUserTasks(userId: number): Promise<DailyTask[]> {
    return this.dailyTaskRepository.find({
      where: { user_id: userId, is_completed: false },
      order: { created_at: 'ASC' }
    });
  }

  async getTaskHistory(
    userId: number,
    limit = 50
  ): Promise<TaskHistory[]> {
    return this.taskHistoryRepository.find({
      where: { user_id: userId },
      order: { completed_at: 'DESC' },
      take: limit
    });
  }

  async resetAllDailyTasks(): Promise<void> {
    // Called by a scheduled job daily
    await this.dailyTaskRepository.clear();
  }

  async calculateWeeklyBonuses(): Promise<void> {
    // Implement weekly bonus calculation logic
    // This would be called by a weekly scheduled job
  }
}