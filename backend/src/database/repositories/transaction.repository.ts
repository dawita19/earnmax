import { Op } from 'sequelize';
import PurchaseRequest from '../models/purchase-request.model';
import UpgradeRequest from '../models/upgrade-request.model';
import WithdrawalRequest from '../models/withdrawal-request.model';
import User from '../models/user.model';
import Admin from '../models/admin.model';
import { RequestStatus } from '../../enums/request-status.enum';

class TransactionRepository {
  // Purchase Requests
  async createPurchaseRequest(userId: number, vipLevel: number, amount: number, proofUrl: string): Promise<PurchaseRequest> {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    return PurchaseRequest.create({
      user_id: userId,
      full_name: user.full_name,
      inviter_id: user.inviter_id,
      vip_level: vipLevel,
      amount: amount,
      payment_proof_url: proofUrl,
      payment_method: 'bank_transfer', // Default
      status: RequestStatus.PENDING,
    });
  }

  async getPendingPurchaseRequests(): Promise<PurchaseRequest[]> {
    return PurchaseRequest.findAll({
      where: { status: RequestStatus.PENDING },
      include: [User],
    });
  }

  async processPurchaseRequest(requestId: number, adminId: number, status: RequestStatus, notes?: string): Promise<void> {
    await PurchaseRequest.update(
      { 
        status,
        admin_id: adminId,
        admin_notes: notes,
        processed_at: new Date(),
      },
      { where: { request_id: requestId } }
    );
  }

  // Upgrade Requests
  async createUpgradeRequest(
    userId: number,
    currentVipLevel: number,
    currentAmount: number,
    newVipLevel: number,
    newAmount: number,
    rechargeAmount: number,
    proofUrl: string
  ): Promise<UpgradeRequest> {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    return UpgradeRequest.create({
      user_id: userId,
      full_name: user.full_name,
      inviter_id: user.inviter_id,
      current_vip_level: currentVipLevel,
      current_amount: currentAmount,
      new_vip_level: newVipLevel,
      new_amount: newAmount,
      upgrade_difference: newAmount - currentAmount,
      recharge_amount: rechargeAmount,
      payment_proof_url: proofUrl,
      status: RequestStatus.PENDING,
    });
  }

  async processUpgradeRequest(requestId: number, adminId: number, status: RequestStatus, notes?: string): Promise<void> {
    await UpgradeRequest.update(
      { 
        status,
        admin_id: adminId,
        admin_notes: notes,
        processed_at: new Date(),
      },
      { where: { request_id: requestId } }
    );
  }

  // Withdrawal Requests
  async createWithdrawalRequest(
    userId: number,
    amount: number,
    paymentMethod: string,
    paymentDetails: string
  ): Promise<WithdrawalRequest> {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    return WithdrawalRequest.create({
      user_id: userId,
      full_name: user.full_name,
      amount: amount,
      payment_method: paymentMethod,
      payment_details: paymentDetails,
      status: RequestStatus.PENDING,
      ip_address: user.ip_address,
    });
  }

  async processWithdrawalRequest(requestId: number, adminId: number, status: RequestStatus, notes?: string): Promise<void> {
    await WithdrawalRequest.update(
      { 
        status,
        admin_id: adminId,
        admin_notes: notes,
        processed_at: new Date(),
      },
      { where: { request_id: requestId } }
    );
  }

  // Admin task distribution (round-robin)
  async distributeRequestsToAdmins(): Promise<void> {
    const admins = await Admin.findAll({ where: { is_active: true } });
    if (admins.length === 0) throw new Error('No active admins available');

    // Get pending requests counts
    const pendingCounts = {
      purchases: await PurchaseRequest.count({ where: { status: RequestStatus.PENDING } }),
      upgrades: await UpgradeRequest.count({ where: { status: RequestStatus.PENDING } }),
      withdrawals: await WithdrawalRequest.count({ where: { status: RequestStatus.PENDING } }),
    };

    // Distribute requests evenly
    for (let i = 0; i < Math.max(pendingCounts.purchases, pendingCounts.upgrades, pendingCounts.withdrawals); i++) {
      const adminIndex = i % admins.length;
      const adminId = admins[adminIndex].admin_id;

      if (i < pendingCounts.purchases) {
        await PurchaseRequest.update(
          { admin_id: adminId },
          { where: { request_id: await this.getNextPendingPurchaseRequestId() } }
        );
      }

      if (i < pendingCounts.upgrades) {
        await UpgradeRequest.update(
          { admin_id: adminId },
          { where: { request_id: await this.getNextPendingUpgradeRequestId() } }
        );
      }

      if (i < pendingCounts.withdrawals) {
        await WithdrawalRequest.update(
          { admin_id: adminId },
          { where: { request_id: await this.getNextPendingWithdrawalRequestId() } }
        );
      }
    }
  }

  private async getNextPendingPurchaseRequestId(): Promise<number> {
    const request = await PurchaseRequest.findOne({
      where: { status: RequestStatus.PENDING, admin_id: null },
      order: [['created_at', 'ASC']],
    });
    return request?.request_id || 0;
  }

  private async getNextPendingUpgradeRequestId(): Promise<number> {
    const request = await UpgradeRequest.findOne({
      where: { status: RequestStatus.PENDING, admin_id: null },
      order: [['created_at', 'ASC']],
    });
    return request?.request_id || 0;
  }

  private async getNextPendingWithdrawalRequestId(): Promise<number> {
    const request = await WithdrawalRequest.findOne({
      where: { status: RequestStatus.PENDING, admin_id: null },
      order: [['created_at', 'ASC']],
    });
    return request?.request_id || 0;
  }
}

export default new TransactionRepository();