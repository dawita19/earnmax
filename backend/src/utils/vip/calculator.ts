import { VipLevel } from '../../models/vip.model';

const VIP_EARNINGS = {
  0: { daily: 20, perTask: 5.00 },
  1: { daily: 40, perTask: 10.00 },
  2: { daily: 100, perTask: 25.00 },
  // ... other levels
};

const REFERRAL_BONUS_RATES = [0.20, 0.10, 0.05, 0.02]; // 20%, 10%, 5%, 2%

export function calculateDailyEarnings(vipLevel: VipLevel): number {
  return VIP_EARNINGS[vipLevel]?.daily || 0;
}

export function calculateTaskEarnings(vipLevel: VipLevel): number {
  return VIP_EARNINGS[vipLevel]?.perTask || 0;
}

export function calculateReferralBonus(
  vipLevel: VipLevel,
  amount: number,
  referralLevel: number
): number {
  if (referralLevel < 1 || referralLevel > 4) return 0;
  return amount * REFERRAL_BONUS_RATES[referralLevel - 1];
}

export function calculateUpgradeDifference(
  currentLevel: VipLevel,
  newLevel: VipLevel
): number {
  const LEVEL_PRICES = [0, 1200, 3000, 6000, 12000, 21000, 33000, 60000, 120000];
  return LEVEL_PRICES[newLevel] - LEVEL_PRICES[currentLevel];
}