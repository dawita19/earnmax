import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../entities/admin.entity';
import { PurchaseRequest } from '../entities/purchase-request.entity';
import { UpgradeRequest } from '../entities/upgrade-request.entity';
import { WithdrawalRequest } from '../entities/withdrawal-request.entity';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class RequestProcessor {
  private currentAdminIndex = 0;
  private readonly BATCH_SIZE = 10;

  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(PurchaseRequest)
    private readonly purchaseRequestRepository: Repository<PurchaseRequest>,
    @InjectRepository(UpgradeRequest)
    private readonly upgradeRequestRepository: Repository<UpgradeRequest>,
    @InjectRepository(WithdrawalRequest)
    private readonly withdrawalRequestRepository: Repository<WithdrawalRequest>,
    private readonly notificationService: NotificationService
  ) {}

  async distributeNewRequest(request: PurchaseRequest | UpgradeRequest | WithdrawalRequest) {
    const activeAdmins = await this.getActiveLowLevelAdmins();
    if (activeAdmins.length === 0) {
      throw new Error('No active admins available');
    }

    // Round-robin distribution logic
    const assignedAdmin = activeAdmins[this.currentAdminIndex % activeAdmins.length];
    this.currentAdminIndex = (this.currentAdminIndex + 1) % activeAdmins.length;

    // Save request with assigned admin
    if (request instanceof PurchaseRequest) {
      request.assignedAdminId = assignedAdmin.admin_id;
      await this.purchaseRequestRepository.save(request);
    } else if (request instanceof UpgradeRequest) {
      request.assignedAdminId = assignedAdmin.admin_id;
      await this.upgradeRequestRepository.save(request);
    } else {
      request.assignedAdminId = assignedAdmin.admin_id;
      await this.withdrawalRequestRepository.save(request);
    }

    // Notify admin
    await this.notificationService.createAdminNotification(
      assignedAdmin.admin_id,
      'New Request Assigned',
      `You have a new ${request.constructor.name} to review`,
      request.request_id
    );

    return request;
  }

  private async getActiveLowLevelAdmins(): Promise<Admin[]> {
    return this.adminRepository.find({
      where: {
        admin_level: 'low',
        is_active: true
      },
      take: this.BATCH_SIZE,
      order: { last_assigned: 'ASC' }
    });
  }

  async processPendingRequests() {
    const activeAdmins = await this.getActiveLowLevelAdmins();
    if (activeAdmins.length === 0) return;

    // Process in batches to prevent overload
    const requests = await this.getPendingRequestsBatch();
    
    for (const [index, request] of requests.entries()) {
      const admin = activeAdmins[index % activeAdmins.length];
      await this.assignRequestToAdmin(request, admin);
    }
  }

  private async getPendingRequestsBatch() {
    const [purchases, upgrades, withdrawals] = await Promise.all([
      this.purchaseRequestRepository.find({ where: { status: 'pending' }, take: this.BATCH_SIZE }),
      this.upgradeRequestRepository.find({ where: { status: 'pending' }, take: this.BATCH_SIZE }),
      this.withdrawalRequestRepository.find({ where: { status: 'pending' }, take: this.BATCH_SIZE })
    ]);

    return [...purchases, ...upgrades, ...withdrawals].slice(0, this.BATCH_SIZE);
  }

  private async assignRequestToAdmin(request: any, admin: Admin) {
    // Implementation similar to distributeNewRequest
  }
}