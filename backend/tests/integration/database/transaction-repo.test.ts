import { Test } from '@nestjs/testing';
import { TransactionRepository } from '../../src/repositories/transaction.repository';
import { PurchaseRequest } from '../../src/entities/purchase-request.entity';
import { WithdrawalRequest } from '../../src/entities/withdrawal-request.entity';

describe('Transaction Repository', () => {
  let transactionRepo: TransactionRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TransactionRepository,
        {
          provide: 'PURCHASE_REQUEST_REPOSITORY',
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: 'WITHDRAWAL_REQUEST_REPOSITORY',
          // ... similar mock
        },
        RoundRobinService, // For admin distribution
      ],
    }).compile();

    transactionRepo = module.get<TransactionRepository>(TransactionRepository);
  });

  describe('processWithdrawal', () => {
    it('should enforce VIP-level withdrawal limits', async () => {
      const user = {
        user_id: 1,
        vip_level: 2,
        balance: 5000,
        total_withdrawn: 11000,
      };
      
      await expect(
        transactionRepo.processWithdrawal(user, 1000)
      ).rejects.toThrow('Maximum withdrawal limit reached');
    });

    it('should distribute requests round-robin to admins', async () => {
      // Test admin distribution logic
    });
  });
});