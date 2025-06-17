export const REFERRAL_LEVELS = {
  FIRST: 1,
  SECOND: 2,
  THIRD: 3,
  FOURTH: 4,
  MAX: 4
} as const;

export const REFERRAL_BONUS_RATES = {
  [REFERRAL_LEVELS.FIRST]: 0.2,  // 20%
  [REFERRAL_LEVELS.SECOND]: 0.1, // 10%
  [REFERRAL_LEVELS.THIRD]: 0.05, // 5%
  [REFERRAL_LEVELS.FOURTH]: 0.02 // 2%
} as const;

export const WEEKLY_BONUS_THRESHOLDS = [
  { min: 5, max: 10, rate: 0.10 },  // 10% for 5-10 referrals
  { min: 10, max: 15, rate: 0.15 }, // 15% for 10-15
  { min: 15, max: 20, rate: 0.20 }, // 20% for 15-20
  { min: 20, max: Infinity, rate: 0.25 } // 25% for 20+
] as const;

export const REFERRAL_SOURCES = {
  PURCHASE: 'purchase',
  UPGRADE: 'upgrade',
  TASK: 'task'
} as const;