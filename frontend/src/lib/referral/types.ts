export type UserRole = 'user' | 'admin' | 'super_admin';

export interface User {
  userId: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  vipLevel: number;
  vipAmount: number;
  balance: number;
  totalEarnings: number;
  totalWithdrawn: number;
  totalReferralBonus: number;
  firstLevelInvites: number;
  secondLevelInvites: number;
  thirdLevelInvites: number;
  fourthLevelInvites: number;
  totalInvites: number;
  paymentMethod?: string;
  paymentDetails?: string;
  accountStatus: 'active' | 'suspended' | 'pending';
  joinDate: Date;
  lastLogin?: Date;
  inviteCode: string;
  inviterId?: string;
}

export interface ReferralRelation {
  inviterId: string;
  inviteeId: string;
  level: 1 | 2 | 3 | 4;
  createdAt: Date;
}

export interface VipLevel {
  level: number;
  investment: number;
  dailyEarning: number;
  perTaskEarning: number;
  minWithdrawal: number;
  maxTotalWithdrawal: number;
  investmentArea: string;
  dailyTasks: string[];
}

export interface Admin {
  adminId: string;
  username: string;
  email: string;
  adminLevel: 'high' | 'low';
  permissions: string[];
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
}