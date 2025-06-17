import { VipLevel } from '../../models/vip.model';
import { User } from '../../models/user.model';

export class FinanceCalculator {
  /**
   * Calculate daily earnings based on VIP level
   */
  static calculateDailyEarnings(vipLevel: VipLevel, tasksCompleted: number): number {
    return vipLevel.perTaskEarning * tasksCompleted;
  }

  /**
   * Calculate referral bonuses for 4-level hierarchy
   */
  static calculateReferralBonus(amount: number, level: number): number {
    const percentages = [0.2, 0.1, 0.05, 0.02]; // Level 1-4 percentages
    if (level < 1 || level > 4) return 0;
    return parseFloat((amount * percentages[level - 1]).toFixed(2));
  }

  /**
   * Calculate weekly bonus based on first-level invites
   */
  static calculateWeeklyBonus(user: User): number {
    const firstLevelInvites = user.firstLevelInvites;
    let bonusPercentage = 0;

    if (firstLevelInvites >= 20) bonusPercentage = 0.25;
    else if (firstLevelInvites >= 15) bonusPercentage = 0.20;
    else if (firstLevelInvites >= 10) bonusPercentage = 0.15;
    else if (firstLevelInvites >= 5) bonusPercentage = 0.10;

    return parseFloat((user.vipAmount * bonusPercentage).toFixed(2));
  }

  /**
   * Calculate upgrade amount difference
   */
  static calculateUpgradeDifference(currentVip: VipLevel, newVip: VipLevel): number {
    return newVip.investmentAmount - currentVip.investmentAmount;
  }
}