import { Test, TestingModule } from '@nestjs/testing';
import { BonusCalculationService } from '../../src/services/bonus-calculation.service';
import { ReferralNetworkService } from '../../src/services/referral-network.service';
import { mockReferralTree } from '../mocks/bonus.mocks';

describe('BonusCalculationService', () => {
  let service: BonusCalculationService;
  let referralNetworkService: ReferralNetworkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BonusCalculationService,
        {
          provide: ReferralNetworkService,
          useValue: {
            getFullReferralTree: jest.fn().mockResolvedValue(mockReferralTree),
          },
        },
      ],
    }).compile();

    service = module.get<BonusCalculationService>(BonusCalculationService);
    referralNetworkService = module.get<ReferralNetworkService>(ReferralNetworkService);
  });

  describe('calculateReferralBonus', () => {
    it('should calculate multi-level bonuses correctly', async () => {
      const result = await service.calculateReferralBonus(1000);
      
      expect(result.level1).toBe(200); // 20%
      expect(result.level2).toBe(100); // 10%
      expect(result.level3).toBe(50);  // 5%
      expect(result.level4).toBe(20);  // 2%
    });
  });

  describe('calculateWeeklyBonus', () => {
    it('should apply correct bonus tiers', async () => {
      const tier1 = await service.calculateWeeklyBonus(7, 1000);
      expect(tier1).toBe(100); // 10%
      
      const tier2 = await service.calculateWeeklyBonus(12, 1000);
      expect(tier2).toBe(150); // 15%
      
      const tier3 = await service.calculateWeeklyBonus(17, 1000);
      expect(tier3).toBe(200); // 20%
      
      const tier4 = await service.calculateWeeklyBonus(25, 1000);
      expect(tier4).toBe(250); // 25%
    });
  });

  describe('calculateTaskBonus', () => {
    it('should distribute task earnings to referrers', async () => {
      const result = await service.calculateTaskBonus(50);
      
      expect(result.level1).toBe(10); // 20%
      expect(result.level2).toBe(5);  // 10%
      expect(result.level3).toBe(2.5); // 5%
      expect(result.level4).toBe(1);   // 2%
    });
  });
});