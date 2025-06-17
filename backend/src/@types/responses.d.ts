interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

interface UserProfileResponse {
  user_id: number;
  full_name: string;
  email?: string;
  phone_number: string;
  vip_level: number;
  balance: number;
  total_earnings: number;
  total_withdrawn: number;
  total_referral_bonus: number;
  referral_code: string;
  account_status: string;
  join_date: string;
}

interface VipLevelResponse {
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

interface ReferralNetworkResponse {
  level: number;
  count: number;
  users: {
    user_id: number;
    full_name: string;
    join_date: string;
    vip_level: number;
    total_earnings: number;
  }[];
}

interface TaskResponse {
  task_id: string;
  task_type: string;
  description: string;
  earnings: number;
  expires_at: string;
  is_completed: boolean;
}

interface AdminDashboardResponse {
  total_users: number;
  active_users: number;
  total_revenue: number;
  total_withdrawals: number;
  pending_requests: {
    withdrawals: number;
    purchases: number;
    upgrades: number;
  };
  vip_distribution: Record<number, number>;
}

export {
  ApiResponse,
  UserProfileResponse,
  VipLevelResponse,
  ReferralNetworkResponse,
  TaskResponse,
  AdminDashboardResponse
};