import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DailyTask } from '../entities/daily-task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../../user/user.service';
import { ReferralService } from '../../referral/referral.service';
import { TaskHistory } from '../entities/task-history.entity';
import { EarningsHistory } from '../entities/earnings-history.entity';

@Injectable()
export class TaskCompletionService {
  constructor(
    @InjectRepository(DailyTask)
    private readonly taskRepository: Repository<DailyTask>,
    @InjectRepository(TaskHistory)
    private readonly taskHistoryRepository: Repository<TaskHistory>,
    @InjectRepository(EarningsHistory)
    private readonly earningsHistoryRepository: Repository<EarningsHistory>,
    private readonly userService: UserService,
    private readonly referralService: ReferralService,
  ) {}

  async completeTask(userId: number, taskId: number, ipAddress: string) {
    const task = await this.taskRepository.findOne({
      where: { task_id: taskId, user_id: userId },
    });

    if (!task || task.is_completed) {
      throw new Error('Task not found or already completed');
    }

    // Update task status
    task.is_completed = true;
    task.completion_date = new Date();
    await this.taskRepository.save(task);

    // Record in history
    const taskHistory = this.taskHistoryRepository.create({
      user_id: userId,
      task_id: taskId,
      vip_level: task.vip_level,
      task_type: task.task_type,
      earnings: task.earnings,
      completed_at: new Date(),
      ip_address: ipAddress,
    });
    await this.taskHistoryRepository.save(taskHistory);

    // Update user earnings
    const earningRecord = this.earningsHistoryRepository.create({
      user_id: userId,
      earning_type: 'task',
      amount: task.earnings,
      reference_id: taskId,
      description: `Completed task: ${task.task_type}`,
      ip_address: ipAddress,
    });
    await this.earningsHistoryRepository.save(earningRecord);

    await this.userService.updateUserBalance(userId, task.earnings);

    // Process referral bonuses
    await this.referralService.distributeTaskEarnings(userId, task.earnings);

    return { success: true, earnings: task.earnings };
  }
}