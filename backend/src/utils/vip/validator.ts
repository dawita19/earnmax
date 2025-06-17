import { User } from '../../models/user.model';

export function validateVipUpgrade(
  user: User,
  targetLevel: number
): { valid: boolean; difference?: number; reason?: string } {
  // Check if already at or above target level
  if (user.vip_level >= targetLevel) {
    return { valid: false, reason: 'Already at or above this VIP level' };
  }

  // Check if valid VIP level progression
  if (targetLevel !== user.vip_level + 1) {
    return { valid: false, reason: 'Can only upgrade one level at a time' };
  }

  const difference = calculateUpgradeDifference(user.vip_level, targetLevel);
  
  // For free to VIP1, no balance check needed
  if (user.vip_level === 0) {
    return { valid: true, difference };
  }

  // Check if user has sufficient balance
  if (user.balance < difference) {
    return { 
      valid: false, 
      difference,
      reason: `Insufficient balance. Need ${difference - user.balance} more` 
    };
  }

  return { valid: true, difference };
}