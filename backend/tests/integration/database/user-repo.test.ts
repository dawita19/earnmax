import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../src/entities/user.entity';
import { UserRepository } from '../../src/repositories/user.repository';
import { Repository } from 'typeorm';

describe('User Repository', () => {
  let userRepository: UserRepository;
  let mockRepo: Partial<Repository<User>>;

  beforeEach(async () => {
    mockRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      })),
    };

    const module = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepo,
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
  });

  describe('updateVipStatus', () => {
    it('should correctly calculate daily earnings', async () => {
      const vipLevel = {
        level_id: 3,
        investment_amount: 6000,
        daily_earning: 200,
      };
      
      await userRepository.updateVipStatus(1, vipLevel);
      
      expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({
        vip_level: 3,
        vip_amount: 6000,
        daily_income: 200,
      }));
    });

    it('should clear IP for new VIP users', async () => {
      // Test IP clearing logic
    });
  });
});