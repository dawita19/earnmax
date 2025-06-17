import { create } from 'zustand';

interface TransactionHistory {
  id: string;
  type: 'task' | 'referral' | 'bonus' | 'purchase' | 'upgrade' | 'withdrawal';
  amount: number;
  description: string;
  date: string;
  status?: 'pending' | 'completed' | 'failed';
}

interface WithdrawalRequest {
  amount: number;
  paymentMethod: string;
  paymentDetails: string;
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
}

interface TransactionState {
  vipLevels: VIPLevel[];
  currentVipLevel: number | null;
  withdrawalRequest: WithdrawalRequest | null;
  transactionHistory: TransactionHistory[];
  fetchVipLevels: () => Promise<void>;
  fetchTransactionHistory: () => Promise<void>;
  requestWithdrawal: (data: WithdrawalRequest) => Promise<void>;
  purchaseVipLevel: (level: number, paymentProof: string) => Promise<void>;
  upgradeVipLevel: (newLevel: number, rechargeAmount: number, paymentProof?: string) => Promise<void>;
  calculateUpgradeCost: (currentLevel: number, newLevel: number) => number;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  vipLevels: [],
  currentVipLevel: null,
  withdrawalRequest: null,
  transactionHistory: [],
  fetchVipLevels: async () => {
    const response = await fetch('/api/vip-levels');
    const data = await response.json();
    set({ vipLevels: data.levels });
  },
  fetchTransactionHistory: async () => {
    const response = await fetch('/api/transactions/history');
    const data = await response.json();
    set({ transactionHistory: data.history });
  },
  requestWithdrawal: async (data) => {
    const response = await fetch('/api/transactions/withdraw', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const result = await response.json();
    set({ withdrawalRequest: result.request });
    await get().fetchTransactionHistory();
  },
  purchaseVipLevel: async (level, paymentProof) => {
    const response = await fetch('/api/transactions/purchase', {
      method: 'POST',
      body: JSON.stringify({ level, paymentProof }),
    });
    const result = await response.json();
    set({ currentVipLevel: level });
    await get().fetchTransactionHistory();
  },
  upgradeVipLevel: async (newLevel, rechargeAmount, paymentProof) => {
    const response = await fetch('/api/transactions/upgrade', {
      method: 'POST',
      body: JSON.stringify({ newLevel, rechargeAmount, paymentProof }),
    });
    const result = await response.json();
    set({ currentVipLevel: newLevel });
    await get().fetchTransactionHistory();
  },
  calculateUpgradeCost: (currentLevel, newLevel) => {
    const levels = get().vipLevels;
    const current = levels.find(l => l.level === currentLevel);
    const next = levels.find(l => l.level === newLevel);
    
    if (!current || !next) return 0;
    return next.investment - current.investment;
  },
}));