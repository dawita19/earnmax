import { Test } from '@nestjs/testing';
import { VipRepository } from '../../src/repositories/vip.repository';
import { VipLevel } from '../../src/entities/vip-level.entity';

describe('VIP Repository', () => {
  let vipRepository: VipRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        VipRepository,
        {
          provide: 'VIP_REPOSITORY',
          useValue: {
            find: jest.fn().mockResolvedValue([
              { level_id: 1, investment_amount: 1200 },
              { level_id: 2, investment_amount: 3000 },
            ]),
            findOne: jest.fn().mockImplementation((id) => 
              Promise.resolve({ level_id: id, investment_amount: id * 1200 })
            ),
          },
        },
      ],
    }).compile();

    vipRepository = module.get<VipRepository>(VipRepository);
  });

  describe('getAllLevels', () => {
    it('should return all 9 VIP levels', async () => {
      const levels = await vipRepository.getAllLevels();
      expect(levels).toHaveLength(9);
      expect(levels[0]).toHaveProperty('daily_tasks');
    });
  });
});