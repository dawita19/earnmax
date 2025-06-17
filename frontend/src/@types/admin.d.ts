// admin.d.ts
declare namespace Admin {
  interface DashboardMetrics {
    totalRevenue: number;
    totalUsers: number;
    activeUsers: number;
    pendingWithdrawals: number;
    withdrawalAmount: number;
    pendingPurchases: number;
    purchaseAmount: number;
    pendingUpgrades: number;
    upgradeAmount: number;
    suspendedUsers: number;
    vipDistribution: Record<number, number>;
  }

  interface UserManagement extends User.Profile {
    ipAddress?: string;
    lastLogin?: string;
    loginAttempts: number;
    isLocked: boolean;
  }

  interface Request {
    id: number;
    userId: number;
    fullName: string;
    type: 'purchase' | 'upgrade' | 'withdrawal';
    amount: number;
    currentVipLevel?: number;
    newVipLevel?: number;
    paymentMethod?: string;
    paymentDetails?: string;
    paymentProofUrl?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    processedAt?: string;
  }

  interface Suspension {
    id: number;
    userId: number;
    fullName: string;
    adminId: number;
    adminName: string;
    reason: string;
    status: 'active' | 'appealed' | 'reversed' | 'expired';
    startDate: string;
    endDate?: string;
    notes?: string;
  }

  interface LoanRecord {
    userId: number;
    fullName: string;
    phoneNumber: string;
    vipLevel: number;
    totalWithdrawn: number;
    profit: number;
    loanAmount: number;
    lastUpdated: string;
  }
}