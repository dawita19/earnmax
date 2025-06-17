export interface User {
  user_id: number;
  full_name: string;
  phone_number: string;
  email?: string;
  vip_level: number;
  vip_amount: number;
  balance: number;
  total_earnings: number;
  total_withdrawn: number;
  total_referral_bonus: number;
  account_status: 'active' | 'suspended' | 'locked';
  join_date: string;
  two_factor_enabled: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export type LoginCredentials = {
  identifier: string; // Can be phone or email
  password: string;
  ip_address?: string;
};

export type RegisterData = {
  full_name: string;
  phone_number: string;
  email?: string;
  password: string;
  confirm_password: string;
  inviter_id?: number;
  invite_code?: string;
  ip_address?: string;
};

export type AuthActions = {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  verifyTwoFactor: (code: string) => Promise<void>;
};

export type AuthContextType = AuthState & AuthActions;