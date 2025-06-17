import { User } from '../../types';

export const calculateReferralBonus = (
  amount: number,
  level: 1 | 2 | 3 | 4
): number => {
  const rates = {
    1: 0.2,  // 20% for level 1
    2: 0.1,  // 10% for level 2
    3: 0.05, // 5% for level 3
    4: 0.02  // 2% for level 4
  };
  
  return amount * rates[level];
};

export const calculateWeeklyBonus = (user: User): number => {
  const firstLevelInvites = user.firstLevelInvites;
  const investmentAmount = user.vipAmount;
  
  if (firstLevelInvites >= 20) return investmentAmount * 0.25;
  if (firstLevelInvites >= 15) return investmentAmount * 0.20;
  if (firstLevelInvites >= 10) return investmentAmount * 0.15;
  if (firstLevelInvites >= 5) return investmentAmount * 0.10;
  
  return 0;
};

export const calculateTaskEarnings = (
  vipLevel: number,
  completedTasks: number
): number => {
  const earningsPerTask = [
    5.00,   // VIP 0
    10.00,  // VIP 1
    25.00,  // VIP 2
    50.00,  // VIP 3
    100.00, // VIP 4
    175.00, // VIP 5
    275.00, // VIP 6
    500.00, // VIP 7
    1000.00 // VIP 8
  ];
  
  return completedTasks * earningsPerTask[vipLevel];
};