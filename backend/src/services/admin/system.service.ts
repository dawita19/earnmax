import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemStatistics } from '../../entities/system-statistics.entity';
import { User } from '../../entities/user.entity';
import { PurchaseRequest } from '../../entities/purchase-request.entity';
import { UpgradeRequest } from '../../entities/upgrade-request.entity';
import { WithdrawalRequest } from '../../entities/withdrawal-request.entity';

@Injectable()
export class SystemService {
  constructor(
    @InjectRepository(SystemStatistics)
    private statsRepo: Repository<SystemStatistics>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(PurchaseRequest)
    private purchaseRepo: Repository<PurchaseRequest>,
    @InjectRepository(UpgradeRequest)
    private upgradeRepo: Repository<UpgradeRequest>,
    @InjectRepository(WithdrawalRequest)
    private withdrawalRepo: Repository<WithdrawalRequest>
  ) {}

  async updateSystemStats() {
    const stats = await this.statsRepo.findOne({ where: { stat_id: 1 } }) || new SystemStatistics();

    // User statistics
    stats.total_users = await this.userRepo.count();
    stats.active_users = await this.userRepo.count({ where: { account_status: 'active' } });
    stats.suspended_users = await this.userRepo.count({ where: { account_status: 'suspended' } });

    // VIP distribution
    const vipCounts = await this.userRepo
      .createQueryBuilder('user')
      .select('user.vip_level', 'level')
      .addSelect('COUNT(user.user_id)', 'count')
      .groupBy('user.vip_level')
      .getRawMany();

    stats.vip_distribution = vipCounts.reduce((acc, { level, count }) => {
      acc[`vip_${level}`] = parseInt(count);
      return acc;
    }, {});

    // Financial statistics
    stats.total_purchases = await this.purchaseRepo
      .createQueryBuilder('p')
      .select('SUM(p.amount)', 'sum')
      .where('p.status = :status', { status: 'approved' })
      .getRawOne()
      .then(res => parseFloat(res.sum) || 0;

    stats.total_upgrades = await this.upgradeRepo
      .createQueryBuilder('u')
      .select('SUM(u.upgrade_amount)', 'sum')
      .where('u.status = :status', { status: 'approved' })
      .getRawOne()
      .then(res => parseFloat(res.sum) || 0;

    stats.total_withdrawals = await this.withdrawalRepo
      .createQueryBuilder('w')
      .select('SUM(w.amount)', 'sum')
      .where('w.status = :status', { status: 'approved' })
      .getRawOne()
      .then(res => parseFloat(res.sum) || 0;

    stats.total_revenue = stats.total_purchases + stats.total_upgrades - stats.total_withdrawals;

    // Pending requests
    stats.pending_purchases = await this.purchaseRepo.count({ where: { status: 'pending' } });
    stats.pending_upgrades = await this.upgradeRepo.count({ where: { status: 'pending' } });
    stats.pending_withdrawals = await this.withdrawalRepo.count({ where: { status: 'pending' } });

    stats.updated_at = new Date();
    await this.statsRepo.save(stats);

    return stats;
  }

  async resetDailyTasks() {
    // Implementation for daily task reset
    // ...
  }

  async processAutoApprovals() {
    // Implementation for automatic request approvals
    // ...
  }
}