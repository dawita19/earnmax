import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from '../../../src/controllers/admin.controller';
import { AdminService } from '../../../src/services/admin.service';
import { UserService } from '../../../src/services/user.service';
import { VipService } from '../../../src/services/vip.service';
import { WithdrawalService } from '../../../src/services/withdrawal.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        AdminService,
        UserService,
        VipService,
        WithdrawalService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    adminService = module.get<AdminService>(AdminService);
  });

  describe('getDashboardStats', () => {
    it('should return admin dashboard statistics', async () => {
      const mockStats = {
        totalUsers: 1250,
        activeUsers: 980,
        totalRevenue: 2500000,
        totalWithdrawals: 1200000,
        pendingWithdrawals: 15,
        pendingPurchases: 8,
        vipDistribution: {
          '0': 500,
          '1': 300,
          '2': 200,
          '3': 150,
          '4': 100,
        },
      };

      jest.spyOn(adminService, 'getDashboardStats').mockResolvedValue(mockStats);

      const result = await controller.getDashboardStats({ user: { adminId: 1, adminLevel: 'high' } });
      expect(result.totalUsers).toBe(1250);
      expect(result.vipDistribution['0']).toBe(500);
    });
  });

  describe('processWithdrawal', () => {
    it('should approve withdrawal request', async () => {
      const processDto = {
        requestId: 'wd123',
        action: 'approve',
        notes: 'Verified payment',
      };

      const mockResponse = {
        success: true,
        message: 'Withdrawal approved',
      };

      jest.spyOn(adminService, 'processWithdrawal').mockResolvedValue(mockResponse);

      const result = await controller.processWithdrawal(
        { user: { adminId: 1 } },
        processDto
      );
      expect(result.success).toBe(true);
    });
  });

  describe('processVipPurchase', () => {
    it('should reject VIP purchase with invalid proof', async () => {
      const processDto = {
        requestId: 'vip123',
        action: 'reject',
        notes: 'Payment proof invalid',
      };

      const mockResponse = {
        success: false,
        message: 'Purchase rejected',
      };

      jest.spyOn(adminService, 'processVipPurchase').mockResolvedValue(mockResponse);

      const result = await controller.processVipPurchase(
        { user: { adminId: 1 } },
        processDto
      );
      expect(result.success).toBe(false);
    });
  });
});