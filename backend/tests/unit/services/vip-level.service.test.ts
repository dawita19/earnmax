import { Test, TestingModule } from '@nestjs/testing';
import { VipLevelService } from '../../src/services/vip-level.service';
import { VipLevel } from '../../src/entities/vip-level.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockVipLevels } from '../mocks/vip-level.mocks';

describe('VipLevelService', () => {
  let service: VipLevelService;

  const mockVipLevelRepository = {
    find: jest.fn().mockResolvedValue(mockVipLevels),
    findOne: jest.fn().mockImplementation(({ where: { level_id } }) => 
      Promise.resolve(mockVipLevels.find(l => l.level_id === level_id))
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VipLevelService,
        {
          provide: getRepositoryToken(VipLevel),
          useValue: mockVipLevelRepository,
        },
      ],
    }).compile();

    service = module.get<VipLevelService>(VipLevelService);
  });

  describe('getAllVipLevels', () => {
    it('should return all VIP levels', async () => {
      const result = await service.getAllVipLevels();
      expect(result).toEqual(mockVipLevels);
      expect(result.length).toBe(9);
    });
  });

  describe('getVipLevelDetails', () => {
    it('should return specific VIP level details', async () => {
      const result = await service.getVipLevelDetails(3);
      expect(result).toEqual(mockVipLevels[2]);
      expect(result.investment_amount).toBe(6000);
    });
  });

  describe('validateWithdrawal', () => {
    it('should validate withdrawal against VIP limits', async () => {
      const result = await service.validateWithdrawal(3, 200, 0);
      expect(result.valid).toBe(true);
      
      const invalidResult = await service.validateWithdrawal(3, 50, 0);
      expect(invalidResult.valid).toBe(false);
    });
  });
});