import { Document, Model, Types } from 'mongoose';

// Base document interface
interface BaseDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// User types
interface UserDocument extends BaseDocument {
  user_id: number;
  full_name: string;
  phone_number: string;
  email?: string;
  password_hash: string;
  ip_address?: string;
  inviter_id?: Types.ObjectId | UserDocument;
  invite_code: string;
  vip_level: number;
  vip_amount: number;
  balance: number;
  total_earnings: number;
  total_withdrawn: number;
  total_referral_bonus: number;
  first_level_invites: number;
  second_level_invites: number;
  third_level_invites: number;
  fourth_level_invites: number;
  payment_method?: string;
  payment_details?: string;
  account_status: 'active' | 'suspended' | 'locked';
  last_login?: Date;
  is_locked: boolean;
  two_factor_enabled: boolean;
  
  // Virtuals
  referral_network?: ReferralNetworkDocument[];
  tasks?: DailyTaskDocument[];
}

interface UserModel extends Model<UserDocument> {
  generateInviteCode(): Promise<string>;
  findByPhoneOrEmail(identifier: string): Promise<UserDocument | null>;
}

// Admin types
interface AdminDocument extends BaseDocument {
  username: string;
  email: string;
  password_hash: string;
  admin_level: 'high' | 'low';
  permissions: {
    canManageUsers: boolean;
    canProcessWithdrawals: boolean;
    canProcessPurchases: boolean;
    canProcessUpgrades: boolean;
    canManageSystem: boolean;
  };
  last_login?: Date;
  is_active: boolean;
  two_factor_enabled: boolean;
}

// VIP Level types
interface VipLevelDocument extends BaseDocument {
  level: number;
  investment: number;
  daily_earning: number;
  per_task_earning: number;
  min_withdrawal: number;
  max_total_withdrawal: number;
  investment_area: string;
  daily_tasks: {
    task_type: string;
    description: string;
    earnings: number;
  }[];
}

// Transaction types
interface PurchaseRequestDocument extends BaseDocument {
  user_id: Types.ObjectId | UserDocument;
  full_name: string;
  inviter_id?: Types.ObjectId | UserDocument;
  vip_level: number;
  amount: number;
  payment_proof_url: string;
  payment_method: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_id?: Types.ObjectId | AdminDocument;
  admin_notes?: string;
}

interface WithdrawalRequestDocument extends BaseDocument {
  user_id: Types.ObjectId | UserDocument;
  full_name: string;
  amount: number;
  payment_method: string;
  payment_details: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_id?: Types.ObjectId | AdminDocument;
  admin_notes?: string;
  ip_address: string;
}

// Activity types
interface DailyTaskDocument extends BaseDocument {
  user_id: Types.ObjectId | UserDocument;
  vip_level: number;
  task_type: string;
  task_description: string;
  earnings: number;
  is_completed: boolean;
  completion_date?: Date;
  expires_at: Date;
}

// Referral types
interface ReferralNetworkDocument extends BaseDocument {
  inviter_id: Types.ObjectId | UserDocument;
  invitee_id: Types.ObjectId | UserDocument;
  level: 1 | 2 | 3 | 4;
}

interface ReferralBonusDocument extends BaseDocument {
  inviter_id: Types.ObjectId | UserDocument;
  invitee_id: Types.ObjectId | UserDocument;
  level: 1 | 2 | 3 | 4;
  amount: number;
  source: 'purchase' | 'upgrade' | 'task';
  source_id: Types.ObjectId;
}

// System types
interface SystemStatisticsDocument extends BaseDocument {
  total_users: number;
  active_users: number;
  total_revenue: number;
  total_withdrawals: number;
  total_purchases: number;
  total_upgrades: number;
  pending_withdrawals: number;
  pending_purchases: number;
  pending_upgrades: number;
  suspended_users: number;
  vip_distribution: Record<number, number>;
}

export {
  UserDocument, UserModel,
  AdminDocument,
  VipLevelDocument,
  PurchaseRequestDocument,
  WithdrawalRequestDocument,
  DailyTaskDocument,
  ReferralNetworkDocument,
  ReferralBonusDocument,
  SystemStatisticsDocument
};