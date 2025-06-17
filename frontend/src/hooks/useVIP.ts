import { useState, useEffect, useCallback } from 'react';
import { getVIPLevels, calculateUpgradeCost } from '../services/vipService';
import { useAuth } from './useAuth';
import { useRealTime } from './useRealTime';
import { VIPLevel, UpgradeCalculation } from '../types';

export const useVIP = () => {
  const { user } = useAuth();
  const { vipLevels: realtimeLevels } = useRealTime();
  const [vipLevels, setVipLevels] = useState<VIPLevel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVIPLevels = useCallback(async () => {
    try {
      setLoading(true);
      const levels = await getVIPLevels();
      setVipLevels(levels);
    } catch (err) {
      setError('Failed to fetch VIP levels');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (realtimeLevels && realtimeLevels.length > 0) {
      setVipLevels(realtimeLevels);
    } else {
      fetchVIPLevels();
    }
  }, [realtimeLevels, fetchVIPLevels]);

  const calculateUpgrade = useCallback(
    async (currentLevel: number, targetLevel: number, currentBalance: number) => {
      if (currentLevel >= targetLevel) {
        throw new Error('Target level must be higher than current level');
      }
      
      try {
        const calculation: UpgradeCalculation = await calculateUpgradeCost(
          currentLevel,
          targetLevel,
          currentBalance
        );
        
        return calculation;
      } catch (err) {
        throw new Error('Failed to calculate upgrade cost');
      }
    },
    []
  );

  const getCurrentVIPInfo = useCallback(() => {
    if (!user) return null;
    return vipLevels.find(level => level.level_id === user.vip_level) || null;
  }, [user, vipLevels]);

  const getNextVIPInfo = useCallback(() => {
    if (!user) return null;
    return vipLevels.find(level => level.level_id === user.vip_level + 1) || null;
  }, [user, vipLevels]);

  const canWithdraw = useCallback(
    (amount: number) => {
      if (!user) return false;
      
      const vipInfo = getCurrentVIPInfo();
      if (!vipInfo) return false;
      
      const remainingWithdrawal = vipInfo.max_total_withdrawal - user.total_withdrawn;
      
      return (
        amount >= vipInfo.min_withdrawal &&
        amount <= remainingWithdrawal &&
        amount <= user.balance
      );
    },
    [user, getCurrentVIPInfo]
  );

  return {
    vipLevels,
    loading,
    error,
    calculateUpgrade,
    getCurrentVIPInfo,
    getNextVIPInfo,
    canWithdraw,
    refetchVIPLevels: fetchVIPLevels,
  };
};