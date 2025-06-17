import { BenefitsCalculator } from './benefits-calculator';

export class UpgradeHelper {
  static calculateUpgradeCost(
    currentLevel: number,
    targetLevel: number,
    currentBalance: number
  ): {
    upgradeDifference: number;
    rechargeRequired: number;
    canUpgrade: boolean;
    balanceAfterUpgrade: number;
  } {
    const currentInvestment = BenefitsCalculator.getInvestmentAmount(currentLevel);
    const targetInvestment = BenefitsCalculator.getInvestmentAmount(targetLevel);
    
    const upgradeDifference = targetInvestment - currentInvestment;
    const rechargeRequired = Math.max(0, upgradeDifference - currentBalance);
    
    return {
      upgradeDifference,
      rechargeRequired,
      canUpgrade: rechargeRequired === 0,
      balanceAfterUpgrade: currentBalance - upgradeDifference
    };
  }

  static getUpgradeSteps(currentLevel: number): number[] {
    const allLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    return allLevels.filter(level => level > currentLevel);
  }

  static validateUpgrade(
    currentLevel: number,
    targetLevel: number,
    userBalance: number
  ): { valid: boolean; message?: string } {
    if (targetLevel <= currentLevel) {
      return { valid: false, message: 'Target level must be higher than current level' };
    }
    
    const { rechargeRequired } = this.calculateUpgradeCost(currentLevel, targetLevel, userBalance);
    
    if (rechargeRequired > 0) {
      return { 
        valid: false, 
        message: `Additional ${rechargeRequired} required for upgrade` 
      };
    }
    
    return { valid: true };
  }
}