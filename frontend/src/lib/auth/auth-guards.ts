import { UserRole } from '../../types';
import { isAuthenticated, getCurrentUserRole } from './auth';

export const authGuard = (): boolean => {
  return isAuthenticated();
};

export const adminGuard = (level: 'high' | 'low' = 'low'): boolean => {
  if (!isAuthenticated()) return false;
  
  const role = getCurrentUserRole();
  if (role !== 'admin') return false;
  
  // In a real implementation, you would check admin level from decoded token
  return true;
};

export const vipLevelGuard = (requiredLevel: number): boolean => {
  if (!isAuthenticated()) return false;
  
  const currentLevel = getCurrentVipLevel();
  return currentLevel !== null && currentLevel >= requiredLevel;
};