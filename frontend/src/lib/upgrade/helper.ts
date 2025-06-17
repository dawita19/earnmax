import { VipBenefitsCalculator } from './benefits-calculator';

interface UpgradeEligibility {
  canUpgrade: boolean;
  requiredPayment?: number;
  currentLevel: number;
  targetLevel: number;
  benefitsDifference: {
    dailyEarnings: number;
    perTaskEarnings: number;
    withdrawalLimits: {
      min: number;
      max: number;
    };
  };
}

export class VipUpgradeHelper {
  static checkEligibility(
    currentLevel: number,
    targetLevel: number,
    currentBalance: number
  ): UpgradeEligibility {
    if (targetLevel <= currentLevel) {
      return {
        canUpgrade: false,
        currentLevel,
        targetLevel,
        benefitsDifference: {
          dailyEarnings: 0,
          perTaskEarnings: 0,
          withdrawalLimits: { min: 0, max: 0 }
        }
      };
    }

    const { upgradeCost, balanceAfter } = 
      VipBenefitsCalculator.calculateUpgradeCost(currentLevel, targetLevel, currentBalance);
    
    const currentBenefits = VipBenefitsCalculator.calculateDailyBenefits(currentLevel);
    const targetBenefits = VipBenefitsCalculator.calculateDailyBenefits(targetLevel);

    return {
      canUpgrade: balanceAfter >= 0,
      requiredPayment: balanceAfter < 0 ? Math.abs(balanceAfter) : 0,
      currentLevel,
      targetLevel,
      benefitsDifference: {
        dailyEarnings: targetBenefits.dailyEarnings - currentBenefits.dailyEarnings,
        perTaskEarnings: targetBenefits.perTaskEarnings - currentBenefits.perTaskEarnings,
        withdrawalLimits: {
          min: targetBenefits.minWithdrawal - currentBenefits.minWithdrawal,
          max: targetBenefits.maxTotalWithdrawal - currentBenefits.maxTotalWithdrawal
        }
      }
    };
  }
}