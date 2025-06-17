import { Test, TestingModule } from '@nestjs/testing';
import { TaskDistributionService } from '../../src/services/task-distribution.service';
import { VipLevelService } from '../../src/services/vip-level.service';
import { UserService } from '../../src/services/user.service';
import { mockVipLevelTasks } from '../mocks/task.mocks';

describe('TaskDistributionService', () => {
  let service: TaskDistributionService;
  let vipLevelService: VipLevelService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskDistributionService,
        {
          provide: VipLevelService,
          useValue: {
            getVipLevelDetails: jest.fn().mockImplementation((level) => 
              Promise.resolve(mockVipLevelTasks[level]))
          },
        },
        {
          provide: UserService,
          useValue: {
            getUserById: jest.fn().mockResolvedValue({
              userId: 1,
              vipLevel: 3
            }),
            recordTaskCompletion: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<TaskDistributionService>(TaskDistributionService);
    vipLevelService = module.get<VipLevelService>(VipLevelService);
    userService = module.get<UserService>(UserService);
  });

  describe('getDailyTasks', () => {
    it('should return VIP-level specific tasks', async () => {
      const result = await service.getDailyTasks(1);
      expect(result.tasks.length).toBe(4);
      expect(result.tasks[0].earnings).toBe(10.00);
    });
  });

  describe('completeTask', () => {
    it('should credit earnings and update referral network', async () => {
      const result = await service.completeTask(1, 'click_ad');
      expect(result.success).toBe(true);
      expect(userService.recordTaskCompletion).toHaveBeenCalled();
    });

    it('should prevent duplicate task completion', async () => {
      jest.spyOn(userService, 'getUserById').mockResolvedValueOnce({
        userId: 1,
        vipLevel: 3,
        completedTasks: ['click_ad']
      });
      
      await expect(service.completeTask(1, 'click_ad')).rejects.toThrow();
    });
  });

  describe('resetDailyTasks', () => {
    it('should clear completed tasks at midnight', async () => {
      const result = await service.resetDailyTasks();
      expect(result.resetCount).toBeGreaterThan(0);
    });
  });
});