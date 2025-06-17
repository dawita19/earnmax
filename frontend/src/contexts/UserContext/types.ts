interface VIPLevel {
  level: number;
  investment: number;
  dailyEarning: number;
  perTaskEarning: number;
  minWithdrawal: number;
  maxTotalWithdrawal: number;
  investmentArea: string;
  dailyTasks: string[];
}

interface ReferralNetwork {
  inviterId: string | null;
  firstLevel: string[];
  secondLevel: string[];
  thirdLevel: string[];
  fourthLevel: string[];
}

interface User {
  userId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  vipLevel: VIPLevel;
  balance: number;
  totalEarnings: number;
  totalWithdrawn: number;
  totalReferralBonus: number;
  referralNetwork: ReferralNetwork;
  paymentMethod?: string;
  accountStatus: 'active' | 'suspended' | 'locked';
  joinDate: Date;
  lastLogin?: Date;
  twoFactorEnabled: boolean;
}

interface UserState {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

type UserAction =
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'UPGRADE_VIP'; payload: { newLevel: VIPLevel; rechargeAmount: number } }
  | { type: 'UPDATE_BALANCE'; payload: number }
  | { type: 'ADD_REFERRAL'; payload: { level: 1 | 2 | 3 | 4; inviteeId: string } };

interface UserContextType {
  state: UserState;
  dispatch: React.Dispatch<UserAction>;
  login: (credentials: { phoneOrEmail: string; password: string }) => Promise<void>;
  logout: () => void;
  register: (userData: {
    fullName: string;
    phoneNumber: string;
    email: string;
    password: string;
    inviteCode?: string;
  }) => Promise<void>;
  purchaseVIP: (level: number, paymentProof: File) => Promise<void>;
  upgradeVIP: (newLevel: number, paymentProof?: File) => Promise<void>;
  requestWithdrawal: (amount: number, paymentMethod: string) => Promise<void>;
  completeDailyTask: (taskId: string) => Promise<void>;
}

export type { User, UserState, UserAction, UserContextType, VIPLevel, ReferralNetwork };