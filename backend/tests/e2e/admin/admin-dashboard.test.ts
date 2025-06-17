// backend/tests/e2e/admin/admin-dashboard.test.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AdminDashboardController } from '../../../src/admin/admin-dashboard.controller';
import { AdminDashboardService } from '../../../src/admin/admin-dashboard.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { RedisService } from '../../../src/redis/redis.service';
import { SocketCluster } from '../../../src/websockets/socket-cluster';

describe('Admin Dashboard Controller (e2e)', () => {
  let controller: AdminDashboardController;
  let prisma: PrismaService;
  let redis: RedisService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminDashboardController],
      providers: [
        AdminDashboardService,
        PrismaService,
        RedisService,
        {
          provide: SocketCluster,
          useValue: { emitToAdmins: jest.fn() }
        }
      ],
    }).compile();

    controller = module.get<AdminDashboardController>(AdminDashboardController);
    prisma = module.get<PrismaService>(PrismaService);
    redis = module.get<RedisService>(RedisService);
  });

  describe('GET /admin/metrics', () => {
    it('should return real-time system metrics', async () => {
      // Mock data setup
      jest.spyOn(prisma.user, 'count').mockResolvedValue(12500);
      jest.spyOn(prisma.withdrawalRequest, 'aggregate').mockResolvedValue({
        _sum: { amount: 450000 },
        _count: 42
      } as any);
      jest.spyOn(redis, 'getCached').mockResolvedValue(JSON.stringify({
        vipDistribution: { '0': 8000, '1': 2000, '2': 1500 }
      }));

      const result = await controller.getSystemMetrics();

      expect(result).toEqual({
        totalUsers: 12500,
        totalWithdrawalAmount: 450000,
        pendingWithdrawals: 42,
        vipDistribution: expect.any(Object)
      });
      expect(prisma.user.count).toHaveBeenCalled();
    });
  });

  describe('WebSocket Updates', () => {
    it('should push real-time updates to admin dashboards', async () => {
      const emitSpy = jest.spyOn(SocketCluster.prototype, 'emitToAdmins');
      
      // Simulate a purchase approval event
      await controller.handlePurchaseApproval({
        userId: 'user123',
        amount: 1200,
        vipLevel: 1
      });

      expect(emitSpy).toHaveBeenCalledWith('metrics_update', expect.objectContaining({
        event: 'purchase_approved',
        amount: 1200
      }));
    });
  });
});