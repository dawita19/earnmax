import { User } from '../../models/user.model';
import { VipLevel } from '../../models/vip.model';
import { FinanceCalculator } from '../finance/calculator';

export class RequestValidator {
  /**
   * Validate purchase request
   */
  static validatePurchase(user: User, vipLevel: VipLevel): { valid: boolean; message?: string } {
    if (user.vipLevel !== 0) {
      return { valid: false, message: 'Existing members should use upgrade' };
    }

    if (user.accountStatus !== 'active') {
      return { valid: false, message: 'Account is not active' };
    }

    return { valid: true };
  }

  /**
   * Validate upgrade request
   */
  static validateUpgrade(user: User, currentVip: VipLevel, newVip: VipLevel): { 
    valid: boolean; 
    amountDue?: number;
    message?: string 
  } {
    if (user.vipLevel === 0) {
      return { valid: false, message: 'New members should use purchase' };
    }

    if (newVip.levelId <= currentVip.levelId) {
      return { valid: false, message: 'Can only upgrade to higher VIP levels' };
    }

    const amountDue = FinanceCalculator.calculateUpgradeDifference(currentVip, newVip);
    const balanceAfter = user.balance - amountDue;

    if (balanceAfter < 0) {
      return { 
        valid: false, 
        amountDue: Math.abs(balanceAfter),
        message: `Additional ${Math.abs(balanceAfter)} required for upgrade` 
      };
    }

    return { valid: true, amountDue };
  }

  /**
   * Validate withdrawal request
   */
  static validateWithdrawal(user: User, amount: number, vipLevel: VipLevel): { 
    valid: boolean; 
    message?: string 
  } {
    // Check minimum withdrawal amount
    if (amount < vipLevel.minWithdrawal) {
      return { 
        valid: false, 
        message: `Minimum withdrawal is ${vipLevel.minWithdrawal}` 
      };
    }

    // Check available balance
    if (amount > user.balance) {
      return { valid: false, message: 'Insufficient balance' };
    }

    // Check VIP 0 max withdrawal
    if (user.vipLevel === 0 && (user.totalWithdrawn + amount) > vipLevel.maxTotalWithdrawal) {
      return { 
        valid: false, 
        message: 'Max withdrawal reached. Upgrade VIP to withdraw more' 
      };
    }

    return { valid: true };
  }
}