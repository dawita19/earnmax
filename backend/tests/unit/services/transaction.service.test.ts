import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from '../../src/services/transaction.service';
import { UserService } from '../../src/services/user.service';
import { VipLevelService } from '../../src/services/vip-level.service';
import { 
  mockPurchaseRequest, 
  mockUpgradeRequest, 
  mockWithdrawalRequest 
} from '../mocks/transaction.mocks';

describe('TransactionService', () => {
  let service: TransactionService;
  let userService: UserService;
  let vipLevelService: VipLevelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: UserService,
          useValue: {
            getUserById: jest.fn().mockResolvedValue({
              userId: 1,
              vipLevel: 0,
              balance: 0,
              totalWithdrawn: 0
            }),
            updateVipLevel: jest.fn().mockResolvedValue(true),
            updateBalance: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: VipLevelService,
          useValue: {
            getVipLevelDetails: jest.fn().mockImplementation((level) => 
              Promise.resolve({
                level_id: level,
                min_withdrawal: level * 100,
                max_total_withdrawal: level * 1200
              })),
            validateWithdrawal: jest.fn().mockResolvedValue({ valid: true })
          },
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    userService = module.get<UserService>(UserService);
    vipLevelService = module.get<VipLevelService>(VipLevelService);
  });

  describe('processPurchase', () => {
    it('should process VIP purchase request', async () => {
      const result = await service.processPurchase(mockPurchaseRequest);
      expect(result.success).toBe(true);
      expect(userService.updateVipLevel).toHaveBeenCalled();
    });
  });

  describe('processUpgrade', () => {
    it('should process VIP upgrade with sufficient balance', async () => {
      jest.spyOn(userService, 'getUserById').mockResolvedValueOnce({
        userId: 1,
        vipLevel: 1,
        balance: 1800,
        totalWithdrawn: 0
      });
      
      const result = await service.processUpgrade(mockUpgradeRequest);
      expect(result.success).toBe(true);
    });

    it('should require payment proof for insufficient balance', async () => {
      const result = await service.processUpgrade(mockUpgradeRequest);
      expect(result.requiresPaymentProof).toBe(true);
    });
  });

  describe('processWithdrawal', () => {
    it('should validate withdrawal against VIP limits', async () => {
      const result = await service.processWithdrawal(mockWithdrawalRequest);
      expect(result.success).toBe(true);
    });

    it('should reject withdrawal below VIP minimum', async () => {
      jest.spyOn(vipLevelService, 'validateWithdrawal').mockResolvedValueOnce({
        valid: false,
        message: 'Below minimum'
      });
      
      const result = await service.processWithdrawal({
        ...mockWithdrawalRequest,
        amount: 10
      });
      expect(result.success).toBe(false);
    });
  });
});