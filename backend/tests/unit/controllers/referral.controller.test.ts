import { Test, TestingModule } from '@nestjs/testing';
import { ReferralController } from '../../../src/controllers/referral.controller';
import { ReferralService } from '../../../src/services/referral.service';
import { UserService } from '../../../src/services/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReferralNetwork } from '../../../src/entities/referral-network.entity';
import { ReferralBonus } from '../../../src/entities/referral-bonus.entity';

describe('ReferralController', () => {
  let controller: ReferralController;
  let referralService: ReferralService;

  const mockReferralNetworkRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockReferralBonusRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReferralController],
      providers: [
        ReferralService,
        UserService,
        {
          provide: getRepositoryToken(ReferralNetwork),
          useValue: mockReferralNetworkRepository,
        },
        {
          provide: getRepositoryToken(ReferralBonus),
          useValue: mockReferralBonusRepository,
        },
      ],
    }).compile();

    controller = module.get<ReferralController>(ReferralController);
    referralService = module.get<ReferralService>(ReferralService);
  });

  describe('getReferralInfo', () => {
    it('should return referral information', async () => {
      const mockReferralInfo = {
        inviteCode: 'INV123',
        totalInvites: 5,
        firstLevelInvites: 3,
        totalReferralBonus: 1500,
      };

      jest.spyOn(referralService, 'getReferralInfo').mockResolvedValue(mockReferralInfo);

      const result = await controller.getReferralInfo({ user: { userId: 1 } });
      expect(result).toEqual(mockReferralInfo);
    });
  });

  describe('getReferralNetwork', () => {
    it('should return multi-level referral network', async () => {
      const mockNetwork = {
        level1: [
          { userId: 2, fullName: 'Ref1', joinDate: '2023-01-01', vipLevel: 1 },
        ],
        level2: [
          { userId: 3, fullName: 'Ref2', joinDate: '2023-01-05', vipLevel: 0 },
        ],
        level3: [],
        level4: [],
      };

      jest.spyOn(referralService, 'getNetwork').mockResolvedValue(mockNetwork);

      const result = await controller.getReferralNetwork({ user: { userId: 1 } });
      expect(result).toHaveProperty('level1');
      expect(result.level1.length).toBe(1);
    });
  });

  describe('calculateReferralBonus', () => {
    it('should correctly calculate 4-level bonuses', async () => {
      const mockTransaction = {
        userId: 10,
        amount: 6000,
        type: 'purchase',
      };

      const mockBonuses = [
        { level: 1, inviterId: 1, amount: 1200 },
        { level: 2, inviterId: 5, amount: 600 },
        { level: 3, inviterId: 8, amount: 300 },
        { level: 4, inviterId: 12, amount: 120 },
      ];

      jest.spyOn(referralService, 'calculateBonuses').mockResolvedValue(mockBonuses);

      const result = await controller.calculateReferralBonuses(mockTransaction);
      expect(result.length).toBe(4);
      expect(result[0].amount).toBe(1200); // 20% of 6000
      expect(result[3].amount).toBe(120); // 2% of 6000
    });
  });
});