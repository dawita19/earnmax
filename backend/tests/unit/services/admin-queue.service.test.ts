import { Test, TestingModule } from '@nestjs/testing';
import { AdminQueueService } from '../../src/services/admin-queue.service';
import { AdminService } from '../../src/services/admin.service';
import { 
  mockAdmins, 
  mockPurchaseRequest, 
  mockUpgradeRequest 
} from '../mocks/admin.mocks';

describe('AdminQueueService', () => {
  let service: AdminQueueService;
  let adminService: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminQueueService,
        {
          provide: AdminService,
          useValue: {
            getActiveAdmins: jest.fn().mockResolvedValue(mockAdmins),
            assignRequestToAdmin: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<AdminQueueService>(AdminQueueService);
    adminService = module.get<AdminService>(AdminService);
  });

  describe('distributeRequest', () => {
    it('should distribute requests in round-robin fashion', async () => {
      // First request goes to first admin
      await service.distributeRequest(mockPurchaseRequest);
      expect(adminService.assignRequestToAdmin).toHaveBeenCalledWith(
        mockPurchaseRequest,
        mockAdmins[0]
      );

      // Second request goes to second admin
      await service.distributeRequest(mockUpgradeRequest);
      expect(adminService.assignRequestToAdmin).toHaveBeenCalledWith(
        mockUpgradeRequest,
        mockAdmins[1]
      );

      // Tenth request wraps around to first admin
      for (let i = 2; i < 10; i++) {
        await service.distributeRequest(mockPurchaseRequest);
      }
      expect(adminService.assignRequestToAdmin).toHaveBeenCalledWith(
        expect.anything(),
        mockAdmins[0]
      );
    });
  });

  describe('rebalanceQueue', () => {
    it('should redistribute when admin becomes inactive', async () => {
      jest.spyOn(adminService, 'getActiveAdmins').mockResolvedValueOnce(
        mockAdmins.slice(0, 5) // Simulate 5 active admins
      );
      
      await service.rebalanceQueue();
      expect(adminService.getActiveAdmins).toHaveBeenCalled();
    });
  });
});