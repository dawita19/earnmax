import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from '../../../src/controllers/task.controller';
import { TaskService } from '../../../src/services/task.service';
import { ReferralService } from '../../../src/services/referral.service';
import { UserService } from '../../../src/services/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DailyTask } from '../../../src/entities/daily-task.entity';
import { TaskHistory } from '../../../src/entities/task-history.entity';

describe('TaskController', () => {
  let controller: TaskController;
  let taskService: TaskService;

  const mockTaskRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockHistoryRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        TaskService,
        ReferralService,
        UserService,
        {
          provide: getRepositoryToken(DailyTask),
          useValue: mockTaskRepository,
        },
        {
          provide: getRepositoryToken(TaskHistory),
          useValue: mockHistoryRepository,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    taskService = module.get<TaskService>(TaskService);
  });

  describe('getDailyTasks', () => {
    it('should return VIP-level appropriate tasks', async () => {
      const mockTasks = [
        {
          taskId: 1,
          taskType: 'view_ad',
          description: 'View promotional video',
          earnings: 10,
        },
        {
          taskId: 2,
          taskType: 'share_post',
          description: 'Share on social media',
          earnings: 10,
        },
      ];

      jest.spyOn(taskService, 'getDailyTasks').mockResolvedValue(mockTasks);

      const result = await controller.getDailyTasks({ user: { userId: 1, vipLevel: 1 } });
      expect(result.length).toBe(2);
      expect(result[0].earnings).toBe(10);
    });
  });

  describe('completeTask', () => {
    it('should credit earnings for completed task', async () => {
      const completeDto = { taskId: 1 };

      const mockResult = {
        success: true,
        earnings: 10,
        newBalance: 1010,
      };

      jest.spyOn(taskService, 'completeTask').mockResolvedValue(mockResult);

      const result = await controller.completeTask(
        { user: { userId: 1, vipLevel: 1 } },
        completeDto
      );
      expect(result.earnings).toBe(10);
      expect(result.newBalance).toBe(1010);
    });

    it('should prevent duplicate task completion', async () => {
      const completeDto = { taskId: 1 };

      jest.spyOn(taskService, 'completeTask').mockRejectedValue(
        new Error('Task already completed today')
      );

      await expect(
        controller.completeTask({ user: { userId: 1 } }, completeDto)
      ).rejects.toThrow('Task already completed today');
    });
  });

  describe('getTaskHistory', () => {
    it('should return 30-day task history', async () => {
      const mockHistory = [
        {
          date: '2023-01-01',
          tasksCompleted: 4,
          totalEarnings: 40,
        },
        {
          date: '2023-01-02',
          tasksCompleted: 3,
          totalEarnings: 30,
        },
      ];

      jest.spyOn(taskService, 'getTaskHistory').mockResolvedValue(mockHistory);

      const result = await controller.getTaskHistory({ user: { userId: 1 } }, 30);
      expect(result.length).toBe(2);
      expect(result[0].totalEarnings).toBe(40);
    });
  });
});