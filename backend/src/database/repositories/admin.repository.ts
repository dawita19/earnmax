import { EntityRepository, Repository } from 'typeorm';
import { Admin } from '../entities/admin.entity';
import { 
  AdminLevel, 
  RequestStatus, 
  RequestType 
} from '../enums';
import { 
  PurchaseRequest, 
  UpgradeRequest, 
  WithdrawalRequest 
} from '../entities';

@EntityRepository(Admin)
export class AdminRepository extends Repository<Admin> {
  private readonly REQUEST_LIMIT = 10;

  async assignRequestToAdmin(
    requestType: RequestType,
    requestId: number
  ): Promise<Admin | null> {
    const queryRunner = this.manager.connection.createQueryRunner();
    await queryRunner.connect();
    
    try {
      // Get admin with least pending requests
      const admin = await queryRunner.manager
        .createQueryBuilder(Admin, 'admin')
        .leftJoin(
          `admin.${requestType.toLowerCase()}Requests`,
          'request',
          'request.status = :status',
          { status: RequestStatus.PENDING }
        )
        .groupBy('admin.admin_id')
        .orderBy('COUNT(request.request_id)', 'ASC')
        .where('admin.is_active = true')
        .andWhere('admin.admin_level = :level', { level: AdminLevel.LOW })
        .limit(1)
        .getOne();

      if (!admin) return null;

      // Assign request
      const requestRepository = this.getRequestRepository(requestType);
      await requestRepository
        .createQueryBuilder()
        .update()
        .set({ 
          admin_id: admin.admin_id,
          status: RequestStatus.UNDER_REVIEW
        })
        .where('request_id = :id', { id: requestId })
        .execute();

      return admin;
    } finally {
      await queryRunner.release();
    }
  }

  private getRequestRepository(requestType: RequestType) {
    const entityMap = {
      [RequestType.PURCHASE]: PurchaseRequest,
      [RequestType.UPGRADE]: UpgradeRequest,
      [RequestType.WITHDRAWAL]: WithdrawalRequest
    };

    return this.manager.getRepository(entityMap[requestType]);
  }

  async getAdminDashboardMetrics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    pendingRequests: Record<RequestType, number>;
    revenueStats: {
      totalRevenue: number;
      totalWithdrawals: number;
      pendingWithdrawals: number;
    };
  }> {
    // Implementation of complex dashboard metrics
  }
}