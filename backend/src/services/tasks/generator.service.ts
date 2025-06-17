import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { VipLevelsService } from '../../vip/level.service';
import { Repository } from 'typeorm';
import { DailyTask } from '../entities/daily-task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class TaskGeneratorService {
  constructor(
    @InjectRepository(DailyTask)
    private readonly taskRepository: Repository<DailyTask>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly vipLevelsService: VipLevelsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateDailyTasks() {
    const activeUsers = await this.userRepository.find({
      where: { account_status: 'active' },
    });

    for (const user of activeUsers) {
      const vipConfig = await this.vipLevelsService.getVipLevelConfig(
        user.vip_level,
      );
      const tasks = vipConfig.daily_tasks.map((task) => ({
        user_id: user.user_id,
        vip_level: user.vip_level,
        task_type: task.type,
        task_description: task.description,
        earnings: task.earnings,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      }));

      await this.taskRepository.save(tasks);
    }
  }

  async getUserTasks(userId: number): Promise<DailyTask[]> {
    return this.taskRepository.find({
      where: {
        user_id: userId,
        is_completed: false,
        expires_at: MoreThan(new Date()),
      },
    });
  }
}