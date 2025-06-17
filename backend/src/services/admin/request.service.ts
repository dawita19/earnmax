import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../../entities/admin.entity';
import { PurchaseRequest } from '../../entities/purchase-request.entity';
import { UpgradeRequest } from '../../entities/upgrade-request.entity';
import { WithdrawalRequest } from '../../entities/withdrawal-request.entity';

@Injectable()
export class RequestService {
  private activeAdmins: Admin[] = [];
  private currentIndex = 0;

  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(PurchaseRequest)
    private purchaseRepo: Repository<PurchaseRequest>,
    @InjectRepository(UpgradeRequest)
    private upgradeRepo: Repository<UpgradeRequest>,
    @InjectRepository(WithdrawalRequest)
    private withdrawalRepo: Repository<WithdrawalRequest>
  ) {
    this.loadActiveAdmins();
    setInterval(() => this.loadActiveAdmins(), 300000); // Refresh every 5 minutes
  }

  private async loadActiveAdmins() {
    this.activeAdmins = await this.adminRepository.find({ 
      where: { 
        is_active: true,
        admin_level: 'low' 
      },
      order: { admin_id: 'ASC' }
    });
  }

  private getNextAdmin(): Admin | null {
    if (this.activeAdmins.length === 0) return null;
    
    this.currentIndex = (this.currentIndex + 1) % this.activeAdmins.length;
    return this.activeAdmins[this.currentIndex];
  }

  async distributePurchaseRequest(requestData: Partial<PurchaseRequest>) {
    const admin = this.getNextAdmin();
    if (!admin) throw new Error('No active admins available');

    const request = this.purchaseRepo.create({
      ...requestData,
      assigned_admin_id: admin.admin_id,
      status: 'pending'
    });

    await this.purchaseRepo.save(request);
    return request;
  }

  async distributeUpgradeRequest(requestData: Partial<UpgradeRequest>) {
    const admin = this.getNextAdmin();
    if (!admin) throw new Error('No active admins available');

    const request = this.upgradeRepo.create({
      ...requestData,
      assigned_admin_id: admin.admin_id,
      status: 'pending'
    });

    await this.upgradeRepo.save(request);
    return request;
  }

  async distributeWithdrawalRequest(requestData: Partial<WithdrawalRequest>) {
    const admin = this.getNextAdmin();
    if (!admin) throw new Error('No active admins available');

    const request = this.withdrawalRepo.create({
      ...requestData,
      assigned_admin_id: admin.admin_id,
      status: 'pending'
    });

    await this.withdrawalRepo.save(request);
    return request;
  }
}