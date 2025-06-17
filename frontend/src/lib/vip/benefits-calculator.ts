import { VipLevel } from '../../types';
import { calculateReferralBonus } from './referral-calculator';

interface VipBenefits {
  dailyEarnings: number;
  perTaskEarnings: number;
  minWithdrawal: number;
  maxTotalWithdrawal: number;
  referralBonus: number;
}

const VIP_LEVELS: Record<number, Omit<VipBenefits, 'referralBonus'>> = {
  0: { dailyEarnings: 20, perTaskEarnings: 5, minWithdrawal: 60, maxTotalWithdrawal: 300 },
  1: { dailyEarnings: 40, perTaskEarnings: 10, minWithdrawal: 40, maxTotalWithdrawal: 4800 },
  // ... up to level 8
};

export class VipBenefitsCalculator {
  static calculateDailyBenefits(
    vipLevel: number,
    inviterId?: string,
    inviteePurchaseAmount: number = 0
  ): VipBenefits {
    const baseBenefits = VIP_LEVELS[vipLevel] || VIP_LEVELS[0];
    
    return {
      ...baseBenefits,
      referralBonus: inviterId 
        ? calculateReferralBonus(vipLevel, inviteePurchaseAmount) 
        : 0
    };
  }

  static calculateUpgradeCost(
    currentLevel: number,
    targetLevel: number,
    currentBalance: number
  ): { upgradeCost: number; balanceAfter: number } {
    const levels = Object.keys(VIP_LEVELS).map(Number);
    
    if (!levels.includes(targetLevel) {
      throw new Error('Invalid target VIP level');
    }

    const cost = VIP_LEVELS[targetLevel].dailyEarnings * 30 - 
                 VIP_LEVELS[currentLevel].dailyEarnings * 30;
    
    return {
      upgradeCost: cost,
      balanceAfter: currentBalance - cost
    };
  }

  static getTaskEarnings(vipLevel: number, tasksCompleted: number): number {
    return (VIP_LEVELS[vipLevel]?.perTaskEarnings || 0) * tasksCompleted;
  }
}