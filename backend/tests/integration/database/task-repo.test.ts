import { Test } from '@nestjs/testing';
import { TaskRepository } from '../../src/repositories/task.repository';
import { DailyTask } from '../../src/entities/daily-task.entity';
import { TaskHistory } from '../../src/entities/task-history.entity';

describe('Task Repository', () => {
  let taskRepo: TaskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TaskRepository,
        {
          provide: 'DAILY_TASK_REPOSITORY',
          useValue: {
            find: jest.fn().mockResolvedValue([
              { task_id: 1, vip_level: 3, earnings: 50 }
            ]),
            save: jest.fn(),
          },
        },
        {
          provide: 'TASK_HISTORY_REPOSITORY',
          // ... mock
        },
      ],
    }).compile();

    taskRepo = module.get<TaskRepository>(TaskRepository);
  });

  describe('resetDailyTasks', () => {
    it('should generate 4 tasks per VIP level', async () => {
      await taskRepo.resetDailyTasks();
      expect(mockDailyTaskRepo.save).toHaveBeenCalledTimes(36); // 9 levels * 4 tasks
    });
  });

  describe('completeTask', () => {
    it('should award earnings and referral bonuses', async () => {
      const task = { task_id: 1, vip_level: 3, earnings: 50 };
      const user = { user_id: 1, inviter_id: 2 };
      
      await taskRepo.completeTask(user, task);
      
      // Verify user earnings
      expect(userService.addEarnings).toHaveBeenCalledWith(1, 50);
      
      // Verify 4-level referral bonuses (20%, 10%, 5%, 2%)
      expect(referralService.addBonus).toHaveBeenCalledWith(2, 10, 1);
      // ... continue for other levels
    });
  });
});