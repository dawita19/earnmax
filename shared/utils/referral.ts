// shared/utils/referral.ts
export const generateInviteCode = (userId: number): string => {
  const base36 = userId.toString(36).toUpperCase();
  return base36.padStart(6, '0').slice(-6);
};

// shared/utils/transactions.ts
export const calculateUpgradeAmount = (
  currentLevel: number,
  newLevel: number,
  currentBalance: number
): { upgradeDifference: number; rechargeAmount: number } => {
  const currentInvestment = VIP_LEVELS[currentLevel].investment;
  const newInvestment = VIP_LEVELS[newLevel].investment;
  const difference = newInvestment - currentInvestment;
  
  return {
    upgradeDifference: difference,
    rechargeAmount: difference - currentBalance
  };
};