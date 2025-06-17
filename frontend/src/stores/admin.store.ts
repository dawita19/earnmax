import { create } from 'zustand';

interface WithdrawalRequest {
  requestId: string;
  userId: string;
  fullName: string;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface PurchaseRequest {
  requestId: string;
  userId: string;
  fullName: string;
  inviterId: string;
  vipLevel: number;
  amount: number;
  paymentProofUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface UpgradeRequest extends PurchaseRequest {
  currentVipLevel: number;
  rechargeAmount: number;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  totalWithdrawals: number;
  totalPurchases: number;
  totalUpgrades: number;
  pendingWithdrawals: number;
  pendingPurchases: number;
  pendingUpgrades: number;
  suspendedUsers: number;
  vipDistribution: Record<number, number>;
}

interface AdminState {
  stats: SystemStats;
  withdrawalRequests: WithdrawalRequest[];
  purchaseRequests: PurchaseRequest[];
  upgradeRequests: UpgradeRequest[];
  suspensions: any[];
  fetchStats: () => Promise<void>;
  fetchWithdrawalRequests: () => Promise<void>;
  fetchPurchaseRequests: () => Promise<void>;
  fetchUpgradeRequests: () => Promise<void>;
  approveWithdrawal: (requestId: string) => Promise<void>;
  rejectWithdrawal: (requestId: string, reason: string) => Promise<void>;
  approvePurchase: (requestId: string) => Promise<void>;
  rejectPurchase: (requestId: string, reason: string) => Promise<void>;
  approveUpgrade: (requestId: string) => Promise<void>;
  rejectUpgrade: (requestId: string, reason: string) => Promise<void>;
  assignRequest: (requestId: string, type: 'withdrawal' | 'purchase' | 'upgrade') => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  stats: {
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    totalWithdrawals: 0,
    totalPurchases: 0,
    totalUpgrades: 0,
    pendingWithdrawals: 0,
    pendingPurchases: 0,
    pendingUpgrades: 0,
    suspendedUsers: 0,
    vipDistribution: {},
  },
  withdrawalRequests: [],
  purchaseRequests: [],
  upgradeRequests: [],
  suspensions: [],
  fetchStats: async () => {
    const response = await fetch('/api/admin/stats');
    const data = await response.json();
    set({ stats: data });
  },
  fetchWithdrawalRequests: async () => {
    const response = await fetch('/api/admin/withdrawals');
    const data = await response.json();
    set({ withdrawalRequests: data.requests });
  },
  fetchPurchaseRequests: async () => {
    const response = await fetch('/api/admin/purchases');
    const data = await response.json();
    set({ purchaseRequests: data.requests });
  },
  fetchUpgradeRequests: async () => {
    const response = await fetch('/api/admin/upgrades');
    const data = await response.json();
    set({ upgradeRequests: data.requests });
  },
  approveWithdrawal: async (requestId) => {
    await fetch(`/api/admin/withdrawals/${requestId}/approve`, { method: 'POST' });
    await get().fetchWithdrawalRequests();
    await get().fetchStats();
  },
  rejectWithdrawal: async (requestId, reason) => {
    await fetch(`/api/admin/withdrawals/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    await get().fetchWithdrawalRequests();
  },
  approvePurchase: async (requestId) => {
    await fetch(`/api/admin/purchases/${requestId}/approve`, { method: 'POST' });
    await get().fetchPurchaseRequests();
    await get().fetchStats();
  },
  rejectPurchase: async (requestId, reason) => {
    await fetch(`/api/admin/purchases/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    await get().fetchPurchaseRequests();
  },
  approveUpgrade: async (requestId) => {
    await fetch(`/api/admin/upgrades/${requestId}/approve`, { method: 'POST' });
    await get().fetchUpgradeRequests();
    await get().fetchStats();
  },
  rejectUpgrade: async (requestId, reason) => {
    await fetch(`/api/admin/upgrades/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    await get().fetchUpgradeRequests();
  },
  assignRequest: async (requestId, type) => {
    // Round-robin assignment logic
    await fetch(`/api/admin/requests/assign`, {
      method: 'POST',
      body: JSON.stringify({ requestId, type }),
    });
    // Refresh the appropriate requests list
    if (type === 'withdrawal') await get().fetchWithdrawalRequests();
    if (type === 'purchase') await get().fetchPurchaseRequests();
    if (type === 'upgrade') await get().fetchUpgradeRequests();
  },
}));