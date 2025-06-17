import { Test, TestingModule } from '@nestjs/testing';
import { ReferralService } from '../../src/services/referral.service';
import { UserService } from '../../src/services/user.service';
import { ReferralNetworkService } from '../../src/services/referral-network.service';
import { 
  mockUser, 
  mockInviterChain, 
  mockReferralBonusDto 
} from '../mocks/referral.mocks';

describe('ReferralService', () => {
  let service: ReferralService;
  let userService: UserService;
  let referralNetworkService: ReferralNetworkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferralService,
        {
          provide: UserService,
          useValue: {
            getUserById: jest.fn().mockImplementation((id) => 
              Promise.resolve(id === 1 ? mockUser : mockInviterChain[id])),
            updateUserBalance: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: ReferralNetworkService,
          useValue: {
            getInviterChain: jest.fn().mockResolvedValue(mockInviterChain),
            recordReferral: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<ReferralService>(ReferralService);
    userService = module.get<UserService>(UserService);
    referralNetworkService = module.get<ReferralNetworkService>(ReferralNetworkService);
  });

  describe('processReferralBonus', () => {
    it('should distribute 4-level referral bonuses correctly', async () => {
      await service.processReferralBonus(mockReferralBonusDto);
      
      expect(userService.updateUserBalance).toHaveBeenCalledTimes(4);
      expect(userService.updateUserBalance).toHaveBeenCalledWith(2, 240); // 20% of 1200
      expect(userService.updateUserBalance).toHaveBeenCalledWith(3, 120); // 10% of 1200
      expect(userService.updateUserBalance).toHaveBeenCalledWith(4, 60);  // 5% of 1200
      expect(userService.updateUserBalance).toHaveBeenCalledWith(5, 24);  // 2% of 1200
    });
  });

  describe('calculateWeeklyBonus', () => {
    it('should calculate correct weekly bonus tiers', async () => {
      const tier1 = await service.calculateWeeklyBonus(7, 1200);
      expect(tier1).toBe(120); // 10% of 1200
      
      const tier3 = await service.calculateWeeklyBonus(18, 6000);
      expect(tier3).toBe(1200); // 20% of 6000
    });
  });
});