import { VipLevel } from '../models';
import { Decimal } from 'decimal.js';

interface VipTask {
  id: string;
  name: string;
  description: string;
  earnings: Decimal;
}

interface VipConfig {
  level: number;
  investment: Decimal;
  dailyEarning: Decimal;
  perTaskEarning: Decimal;
  minWithdrawal: Decimal;
  maxTotalWithdrawal: Decimal;
  investmentArea: string;
  dailyTasks: VipTask[];
}

const vipLevelsConfig: VipConfig[] = [
  {
    level: 0,
    investment: new Decimal(0),
    dailyEarning: new Decimal(20),
    perTaskEarning: new Decimal(5),
    minWithdrawal: new Decimal(60),
    maxTotalWithdrawal: new Decimal(300),
    investmentArea: 'Free Trial',
    dailyTasks: [
      {
        id: 'task_0_1',
        name: 'View Ad',
        description: 'View advertisement for 30 seconds',
        earnings: new Decimal(5)
      },
      // ... other 3 tasks for level 0
    ]
  },
  // ... configurations for levels 1-8
];

export const getVipConfig = (level: number): VipConfig => {
  const config = vipLevelsConfig.find(c => c.level === level);
  if (!config) throw new Error(`VIP level ${level} not configured`);
  return config;
};

export const calculateReferralBonus = (
  amount: Decimal,
  level: number
): Decimal => {
  const percentages = [0.2, 0.1, 0.05, 0.02]; // 1st-4th level percentages
  return amount.times(percentages[level - 1]);
};

export const getUpgradeDifference = (
  currentLevel: number,
  newLevel: number
): { amount: Decimal; dailyDifference: Decimal } => {
  const current = getVipConfig(currentLevel);
  const next = getVipConfig(newLevel);
  
  return {
    amount: next.investment.minus(current.investment),
    dailyDifference: next.dailyEarning.minus(current.dailyEarning)
  };
};