// backend/tests/e2e/admin/request-approval.test.ts
import { Test } from '@nestjs/testing';
import { RequestApprovalService } from '../../../src/admin/request-approval.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { RoundRobinService } from '../../../src/admin/round-robin.service';
import { ReferralService } from '../../../src/referral/referral.service';

describe('Request Approval Service (e2e)', () => {
  let service: RequestApprovalService;
  let prisma: PrismaService;
  let roundRobin: RoundRobinService;
  let referralService: ReferralService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RequestApprovalService,
        {
          provide: PrismaService,
          useValue: {
            purchaseRequest: {
              update: jest.fn(),
              findUnique: jest.fn()
            },
            user: {
              update: jest.fn(),
              findUnique: jest.fn()
            },
            $transaction: jest.fn()
          }
        },
        {
          provide: RoundRobinService,
          useValue: {
            distributeRequest: jest.fn().mockResolvedValue([1, 2, 3]) // admin IDs
          }
        },
        {
          provide: ReferralService,
          useValue: {
            calculateReferralBonuses: jest.fn()
          }
        }
      ],
    }).compile();

    service = module.get<RequestApprovalService>(RequestApprovalService);
    prisma = module.get<PrismaService>(PrismaService);
    roundRobin = module.get<RoundRobinService>(RoundRobinService);
    referralService = module.get<ReferralService>(ReferralService);
  });

  describe('VIP Purchase Approval', () => {
    it('should process purchase and distribute referral bonuses', async () => {
      const mockRequest = {
        requestId: 'req123',
        userId: 'user456',
        vipLevel: 2,
        amount: 3000,
        status: 'pending',
        paymentProof: 'proof.jpg'
      };

      jest.spyOn(prisma.purchaseRequest, 'findUnique').mockResolvedValue(mockRequest);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        userId: 'user456',
        inviterId: 'user123',
        vipLevel: 0
      });

      await service.approvePurchaseRequest('req123', 'admin789');

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(referralService.calculateReferralBonuses).toHaveBeenCalledWith(
        'user456',
        3000,
        'purchase'
      );
    });

    it('should implement round-robin distribution to admins', async () => {
      await service.distributeNewRequests();
      expect(roundRobin.distributeRequest).toHaveBeenCalled();
      expect(roundRobin.distributeRequest.mock.results[0].value).toEqual([1, 2, 3]);
    });
  });
});