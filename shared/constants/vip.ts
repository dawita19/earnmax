// shared/constants/vip.ts
export const VIP_LEVELS = [
  {
    level: 0,
    investment: 0,
    dailyEarning: 20,
    minWithdrawal: 60,
    maxTotalWithdrawal: 300
  },
  // ... other levels
] as const;

// shared/constants/referrals.ts
export const REFERRAL_BONUSES = {
  LEVEL_1: 0.2,
  LEVEL_2: 0.1,
  LEVEL_3: 0.05,
  LEVEL_4: 0.02
};