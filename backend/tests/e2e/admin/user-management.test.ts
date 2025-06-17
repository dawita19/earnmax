// backend/tests/e2e/admin/user-management.test.ts
import { Test } from '@nestjs/testing';
import { UserManagementService } from '../../../src/admin/user-management.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { AuditService } from '../../../src/audit/audit.service';

describe('User Management Service (e2e)', () => {
  let service: UserManagementService;
  let prisma: PrismaService;
  let audit: AuditService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserManagementService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              update: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn()
            },
            suspension: {
              create: jest.fn()
            }
          }
        },
        {
          provide: AuditService,
          useValue: {
            logAction: jest.fn()
          }
        }
      ],
    }).compile();

    service = module.get<UserManagementService>(UserManagementService);
    prisma = module.get<PrismaService>(PrismaService);
    audit = module.get<AuditService>(AuditService);
  });

  describe('User Suspension', () => {
    it('should suspend user and create audit log', async () => {
      const mockUser = {
        userId: 'user123',
        accountStatus: 'active'
      };

      jest.spyOn(prisma.user, 'update').mockResolvedValue({
        ...mockUser,
        accountStatus: 'suspended'
      });

      const result = await service.suspendUser(
        'user123', 
        'admin456', 
        'Fraudulent activity'
      );

      expect(result.accountStatus).toBe('suspended');
      expect(audit.logAction).toHaveBeenCalledWith({
        adminId: 'admin456',
        userId: 'user123',
        actionType: 'SUSPEND_USER',
        description: 'Fraudulent activity'
      });
    });
  });

  describe('VIP Level Analysis', () => {
    it('should generate VIP distribution report', async () => {
      jest.spyOn(prisma.user, 'count').mockResolvedValue(10000);
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue([
        { vipLevel: 1, _count: 2000 },
        { vipLevel: 2, _count: 1500 }
      ]);

      const report = await service.generateVipDistributionReport();

      expect(report.totalUsers).toBe(10000);
      expect(report.vipLevels[1]).toBe(2000);
      expect(prisma.user.count).toHaveBeenCalled();
    });
  });
});