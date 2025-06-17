import { Test, TestingModule } from '@nestjs/testing';
import { WithdrawalController } from '../../../src/controllers/withdrawal.controller';
import { WithdrawalService } from '../../../src/services/withdrawal.service';
import { UserService } from '../../../src/services/user.service';
import { VipService } from '../../../src/services/vip.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WithdrawalRequest } from '../../../src/entities/withdrawal-request.entity';

describe('WithdrawalController', () => {
  let controller: WithdrawalController;
  let withdrawalService: WithdrawalService;

  const mockWithdrawalRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WithdrawalController],
      providers: [
        WithdrawalService,
        UserService,
        VipService,
        {
          provide: getRepositoryToken(WithdrawalRequest),
          useValue: mockWithdrawalRepository,
        },
      ],
    }).compile();

    controller = module.get<WithdrawalController>(WithdrawalController);
    withdrawalService = module.get<WithdrawalService>(WithdrawalService);
  });

  describe('requestWithdrawal', () => {
    it('should create withdrawal request for valid amount', async () => {
      const withdrawalDto = {
        amount: 500,
        paymentMethod: 'telebirr',
        paymentDetails: '251911223344',
      };

      const mockResponse = {
        requestId: 'wd123',
        status: 'pending',
        amount: 500,
      };

      jest.spyOn(withdrawalService, 'requestWithdrawal').mockResolvedValue(mockResponse);

      const result = await controller.requestWithdrawal(
        { user: { userId: 1 } },
        withdrawalDto
      );
      expect(result.amount).toBe(500);
      expect(result.status).toBe('pending');
    });

    it('should reject withdrawal below VIP minimum', async () => {
      const withdrawalDto = {
        amount: 30,
        paymentMethod: 'telebirr',
        paymentDetails: '251911223344',
      };

      jest.spyOn(withdrawalService, 'requestWithdrawal').mockRejectedValue(
        new Error('Withdrawal amount below VIP level minimum')
      );

      await expect(
        controller.requestWithdrawal({ user: { userId: 1 } }, withdrawalDto)
      ).rejects.toThrow('Withdrawal amount below VIP level minimum');
    });
  });

  describe('getWithdrawal