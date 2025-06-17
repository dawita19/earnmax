// user.d.ts
declare namespace User {
  interface Profile {
    userId: number;
    fullName: string;
    phoneNumber: string;
    email?: string;
    inviteCode: string;
    vipLevel: number;
    vipAmount: number;
    balance: number;
    totalEarnings: number;
    totalWithdrawn: number;
    totalReferralBonus: number;
    referralStats: {
      firstLevel: number;
      secondLevel: number;
      thirdLevel: number;
      fourthLevel: number;
      total: number;
    };
    paymentMethod?: string;
    paymentDetails?: string;
    joinDate: string;
  }

  interface VIPLevel {
    level: number;
    investment: number;
    dailyEarning: number;
    perTaskEarning: number;
    minWithdrawal: number;
    maxTotalWithdrawal: number;
    investmentArea: string;
    dailyTasks: string[];
    isCurrent?: boolean;
    isUpgradeable?: boolean;
  }

  interface Transaction {
    id: number;
    type: 'purchase' | 'upgrade' | 'withdrawal' | 'bonus';
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    date: string;
    details?: string;
  }

  interface TeamMember {
    level: number;
    userId: number;
    fullName: string;
    vipLevel: number;
    joinDate: string;
    lastActive?: string;
  }
}