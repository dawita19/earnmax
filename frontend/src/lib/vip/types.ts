export interface VipLevel {
  investment: number;
  dailyEarning: number;
  perTask: number;
  minWithdrawal: number;
  maxTotalWithdrawal: number;
  investmentArea: string;
  dailyTasks: string[];
}

export interface UpgradeCalculation {
  upgradeDifference: number;
  rechargeRequired: number;
  canUpgrade: boolean;
  balanceAfterUpgrade: number;
}

export interface ReferralBonus {
  inviterId: string;
  inviteeId: string;
  level: number;
  amount: number;
  source: 'purchase' | 'upgrade' | 'task';
  timestamp: Date;
}

export interface WeeklyBonus {
  bonus: number;
  bonusPercentage: number;
  qualified: boolean;
  invitesNeeded?: number;
}