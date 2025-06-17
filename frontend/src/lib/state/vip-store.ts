import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { useAuthStore } from './auth-store';

interface VipLevel {
  level: number;
  investment: number;
  dailyEarning: number;
  perTaskEarning: number;
  minWithdrawal: number;
  maxTotalWithdrawal: number;
  investmentArea: string;
  tasks: string[];
  color: string;
}

interface VipState {
  levels: VipLevel[];
  currentLevel: number;
  purchaseLoading: boolean;
  upgradeLoading: boolean;
  error: string | null;
}

interface VipActions {
  purchaseVip: (level: number, paymentProof: string) => Promise<void>;
  upgradeVip: (newLevel: number, paymentProof?: string) => Promise<void>;
  loadVipLevels: () => Promise<void>;
}

export const useVipStore = create<VipState & VipActions>()(
  immer((set, get) => ({
    levels: [],
    currentLevel: 0,
    purchaseLoading: false,
    upgradeLoading: false,
    error: null,

    purchaseVip: async (level, paymentProof) => {
      set({ purchaseLoading: true, error: null });
      try {
        // Mock API call
        await mockPurchaseVip(level, paymentProof);
        
        // Update user in auth store
        useAuthStore.getState().updateUser({
          vipLevel: level,
          balance: get().levels[level].investment,
        });
        
        set({ currentLevel: level, purchaseLoading: false });
      } catch (err) {
        set({ error: err.message, purchaseLoading: false });
      }
    },

    upgradeVip: async (newLevel, paymentProof) => {
      set({ upgradeLoading: true, error: null });
      try {
        const currentLevel = get().currentLevel;
        const levels = get().levels;
        
        if (newLevel <= currentLevel) {
          throw new Error('Cannot upgrade to same or lower level');
        }

        // Calculate upgrade cost
        const upgradeCost = levels[newLevel].investment - levels[currentLevel].investment;
        
        // Mock API call
        await mockUpgradeVip(newLevel, upgradeCost, paymentProof);
        
        // Update user in auth store
        useAuthStore.getState().updateUser({
          vipLevel: newLevel,
          balance: (useAuthStore.getState().user?.balance || 0) - upgradeCost,
        });
        
        set({ currentLevel: newLevel, upgradeLoading: false });
      } catch (err) {
        set({ error: err.message, upgradeLoading: false });
      }
    },

    loadVipLevels: async () => {
      try {
        const levels = await mockGetVipLevels();
        set({ levels });
        
        // Set current level from auth store
        const user = useAuthStore.getState().user;
        if (user) {
          set({ currentLevel: user.vipLevel });
        }
      } catch (err) {
        console.error('Failed to load VIP levels:', err);
      }
    },
  }))
);

// Mock VIP levels data
async function mockGetVipLevels(): Promise<VipLevel[]> {
  return [
    {
      level: 0,
      investment: 0,
      dailyEarning: 20,
      perTaskEarning: 5,
      minWithdrawal: 60,
      maxTotalWithdrawal: 300,
      investmentArea: 'Free Trial',
      tasks: ['View ad', 'Spin reward', 'Share post', 'Watch video'],
      color: '#6B7280',
    },
    {
      level: 1,
      investment: 1200,
      dailyEarning: 40,
      perTaskEarning: 10,
      minWithdrawal: 40,
      maxTotalWithdrawal: 4800,
      investmentArea: 'Digital Advertising',
      tasks: ['Click ad', 'Comment on promo', 'Share promotion', 'Claim reward'],
      color: '#10B981',
    },
    // Add all VIP levels up to 8...
  ];
}

async function mockPurchaseVip(level: number, paymentProof: string) {
  console.log(`Purchasing VIP ${level} with proof:`, paymentProof);
  return new Promise((resolve) => setTimeout(resolve, 1000));
}

async function mockUpgradeVip(newLevel: number, cost: number, paymentProof?: string) {
  console.log(`Upgrading to VIP ${newLevel} for ${cost} with proof:`, paymentProof);
  return new Promise((resolve) => setTimeout(resolve, 1000));
}