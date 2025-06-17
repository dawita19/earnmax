export class ReferralCalculator {
  private static readonly REFERRAL_RATES = {
    level1: 0.2,   // 20% for direct referrals
    level2: 0.1,   // 10% for second level
    level3: 0.05,  // 5% for third level
    level4: 0.02   // 2% for fourth level
  };

  static calculateReferralBonus(
    sourceAmount: number,
    referralLevel: 1 | 2 | 3 | 4
  ): number {
    const rate = this.getRateForLevel(referralLevel);
    return parseFloat((sourceAmount * rate).toFixed(2));
  }

  static calculateWeeklyBonus(
    purchaseAmount: number,
    firstLevelInvites: number
  ): { bonus: number; bonusPercentage: number } {
    let percentage = 0;
    
    if (firstLevelInvites >= 20) percentage = 0.25;
    else if (firstLevelInvites >= 15) percentage = 0.20;
    else if (firstLevelInvites >= 10) percentage = 0.15;
    else if (firstLevelInvites >= 5) percentage = 0.10;

    return {
      bonus: parseFloat((purchaseAmount * percentage).toFixed(2)),
      bonusPercentage: percentage * 100
    };
  }

  private static getRateForLevel(level: number): number {
    switch(level) {
      case 1: return this.REFERRAL_RATES.level1;
      case 2: return this.REFERRAL_RATES.level2;
      case 3: return this.REFERRAL_RATES.level3;
      case 4: return this.REFERRAL_RATES.level4;
      default: return 0;
    }
  }
}