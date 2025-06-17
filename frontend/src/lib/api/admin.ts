import axios from 'axios';
import { AdminTask, PurchaseRequest, UpgradeRequest, WithdrawalRequest } from '../../types';

const ADMIN_API_BASE = process.env.NEXT_PUBLIC_ADMIN_API_URL || '/api/admin';

export const AdminApi = {
  // Authentication
  login: async (credentials: { username: string; password: string }) => {
    return axios.post(`${ADMIN_API_BASE}/auth/login`, credentials);
  },

  // Dashboard Metrics
  getDashboardMetrics: async (): Promise<{
    totalRevenue: number;
    totalUsers: number;
    pendingWithdrawals: number;
    pendingUpgrades: number;
    suspendedUsers: number;
  }> => {
    const { data } = await axios.get(`${ADMIN_API_BASE}/metrics/dashboard`);
    return data;
  },

  // Request Management
  getPendingRequests: async (): Promise<{
    purchases: PurchaseRequest[];
    upgrades: UpgradeRequest[];
    withdrawals: WithdrawalRequest[];
  }> => {
    const { data } = await axios.get(`${ADMIN_API_BASE}/requests/pending`);
    return data;
  },

  approvePurchase: async (requestId: number, adminNotes?: string) => {
    return axios.patch(`${ADMIN_API_BASE}/requests/purchase/${requestId}/approve`, { adminNotes });
  },

  rejectRequest: async (type: 'purchase' | 'upgrade' | 'withdrawal', requestId: number, reason: string) => {
    return axios.patch(`${ADMIN_API_BASE}/requests/${type}/${requestId}/reject`, { reason });
  },

  // User Management
  suspendUser: async (userId: number, reason: string, durationDays?: number) => {
    return axios.post(`${ADMIN_API_BASE}/users/${userId}/suspend`, { reason, durationDays });
  },

  // System Management
  updateVipLevels: async (levels: any[]) => {
    return axios.put(`${ADMIN_API_BASE}/system/vip-levels`, { levels });
  },

  // Audit Logs
  getAuditLogs: async (page = 1, limit = 20) => {
    return axios.get(`${ADMIN_API_BASE}/audit-logs?page=${page}&limit=${limit}`);
  }
};