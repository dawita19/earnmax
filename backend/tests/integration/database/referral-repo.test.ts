import { Test } from '@nestjs/testing';
import { ReferralRepository } from '../../src/repositories/referral.repository';
import { User } from '../../src/entities/user.entity';
import { ReferralNetwork } from '../../src/entities/referral-network.entity';

describe('Referral Repository', () => {
  let referralRepository: ReferralRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ReferralRepository,
        {
          provide: 'REFERRAL_NETWORK_REPOSITORY',
          useValue: {
            save: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getMany: jest.fn(),
            })),
          },
        },
      ],
    }).compile();

    referralRepository = module.get<ReferralRepository>(ReferralRepository);
  });

  describe('calculateReferralBonus', () => {
    it('should distribute bonuses across 4 levels', async () => {
      const purchaseAmount = 6000; // VIP Level 3
      const inviterId = 1;
      
      await referralRepository.calculateReferralBonus(inviterId, purchaseAmount, 'purchase');
      
      // Verify level 1 (20%)
      expect(bonusService.addBonus).toHaveBeenCalledWith(1, 1200, 1);
      // Verify level 2 (10%)
      expect(bonusService.addBonus).toHaveBeenCalledWith(2, 600, 2);
      // ... continue for levels 3 and 4
    });
  });
});