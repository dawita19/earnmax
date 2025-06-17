import { Test, TestingModule } from '@nestjs/testing';
import { VipController } from '../../../src/controllers/vip.controller';
import { VipService } from '../../../src/services/vip.service';
import { UserService } from '../../../src/services/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VipLevel } from '../../../src/entities/vip-level.entity';
import { User } from '../../../src/entities/user.entity';

describe('VipController', () => {
  let controller: VipController;
  let vipService: VipService;

  const mockVipRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VipController],
      providers: [
        VipService,
        UserService,
        {
          provide: getRepositoryToken(VipLevel),
          useValue: mockVipRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    controller = module.get<VipController>(VipController);
    vipService = module.get<VipService>(VipService);
  });

  describe('getAllVipLevels', () => {
    it('should return all VIP levels', async () => {
      const mockLevels = [
        {
          levelId: 1,
          investmentAmount: 1200,
          dailyEarning: 40,
          perTaskEarning: 10,
        },
        {
          levelId: 2,
          investmentAmount: 3000,
          dailyEarning: 100,
          perTaskEarning: 25,
        },
      ];

      jest.spyOn(vipService, 'getAllLevels').mockResolvedValue(mockLevels);

      const result = await controller.getAllVipLevels();
      expect(result).toEqual(mockLevels);
      expect(result.length).toBe(2);
    });
  });

  describe('purchaseVip', () => {
    it('should process VIP purchase request', async () => {
      const purchaseDto = {
        levelId: 2,
        paymentMethod: 'telebirr',
        paymentProof: 'base64encodedimage',
      };

      const mockRequest = {
        requestId: 'req123',
        status: 'pending',
      };

      jest.spyOn(vipService, 'purchaseVip').mockResolvedValue(mockRequest);

      const result = await controller.purchaseVip(
        { user: { userId: 1 } },
        purchaseDto
      );
      expect(result).toEqual(mockRequest);
    });
  });

  describe('upgradeVip', () => {
    it('should process VIP upgrade with sufficient balance', async () => {
      const upgradeDto = {
        newLevelId: 3,
        paymentMethod: 'telebirr',
        paymentProof: null, // No proof needed when using balance
      };

      const mockResponse = {
        success: true,
        message: 'VIP level upgraded using account balance',
      };

      jest.spyOn(vipService, 'upgradeVip').mockResolvedValue(mockResponse);

      const result = await controller.upgradeVip(
        { user: { userId: 1 } },
        upgradeDto
      );
      expect(result).toEqual(mockResponse);
    });
  });
});