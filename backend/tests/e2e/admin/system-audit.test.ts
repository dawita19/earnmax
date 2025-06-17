// backend/tests/e2e/admin/system-audit.test.ts
import { Test } from '@nestjs/testing';
import { SystemAuditService } from '../../../src/admin/system-audit.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { RedisService } from '../../../src/redis/redis.service';

describe('System Audit Service (e2e)', () => {
  let service: SystemAuditService;
  let prisma: PrismaService;
  let redis: RedisService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SystemAuditService,
        {
          provide: PrismaService,
          useValue: {
            auditLog: {
              findMany: jest.fn(),
              create: jest.fn()
            },
            $queryRaw: jest.fn()
          }
        },
        {
          provide: RedisService,
          useValue: {
            getCached: jest.fn(),
            setCached: jest.fn()
          }
        }
      ],
    }).compile();

    service = module.get<SystemAuditService>(SystemAuditService);
    prisma = module.get<PrismaService>(PrismaService);
    redis = module.get<RedisService>(RedisService);
  });

  describe('Financial Reconciliation', () => {
    it('should verify system financial integrity', async () => {
      // Mock complex SQL query results
      jest.spyOn(prisma, '$queryRaw').mockResolvedValue([
        { type: 'purchases', sum: 2500000 },
        { type: 'withdrawals', sum: 1200000 },
        { type: 'referral_bonuses', sum: 300000 }
      ]);

      const result = await service.verifyFinancialIntegrity();

      expect(result.discrepancy).toBe(false);
      expect(prisma.$queryRaw).toHaveBeenCalledWith(
        expect.stringContaining('SELECT type, SUM(amount)')
      );
    });
  });

  describe('Audit Log Analysis', () => {
    it('should detect suspicious admin activities', async () => {
      jest.spyOn(prisma.auditLog, 'findMany').mockResolvedValue([
        { actionType: 'APPROVE_WITHDRAWAL', adminId: 'admin1', count: 15 },
        { actionType: 'APPROVE_WITHDRAWAL', adminId: 'admin2', count: 150 }
      ]);

      const anomalies = await service.detectAdminAnomalies();
      
      expect(anomalies).toContainEqual(
        expect.objectContaining({ adminId: 'admin2', count: 150 })
      );
    });
  });
});