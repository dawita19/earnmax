import { useState, useEffect, useCallback } from 'react';
import {
  getDailyTasks,
  completeTask,
  getTaskHistory,
  getEarningsHistory,
  claimWeeklyBonus,
} from '../services/taskService';
import { useAuth } from './useAuth';
import { useRealTime } from './useRealTime';
import { DailyTask, TaskHistory, EarningHistory } from '../types';

export const useTasks = () => {
  const { user } = useAuth();
  const { socket } = useRealTime();
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [taskHistory, setTaskHistory] = useState<TaskHistory[]>([]);
  const [earningsHistory, setEarningsHistory] = useState<EarningHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [tasks, history, earnings] = await Promise.all([
        getDailyTasks(),
        getTaskHistory(),
        getEarningsHistory(),
      ]);
      setDailyTasks(tasks);
      setTaskHistory(history);
      setEarningsHistory(earnings);
    } catch (err) {
      setError('Failed to fetch tasks and history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();

    if (socket) {
      socket.on('taskUpdate', fetchTasks);
      return () => {
        socket.off('taskUpdate', fetchTasks);
      };
    }
  }, [socket, fetchTasks]);

  const completeDailyTask = async (taskId: number) => {
    if (!user) throw new Error('Not authenticated');
    
    try {
      const result = await completeTask(taskId);
      if (socket) {
        socket.emit('taskCompleted', { taskId, userId: user.user_id });
      }
      return result;
    } catch (err) {
      throw new Error('Failed to complete task');
    }
  };

  const handleClaimWeeklyBonus = async () => {
    if (!user) throw new Error('Not authenticated');
    
    try {
      const result = await claimWeeklyBonus();
      if (socket) {
        socket.emit('weeklyBonusClaimed', { userId: user.user_id });
      }
      return result;
    } catch (err) {
      throw new Error('Failed to claim weekly bonus');
    }
  };

  const calculateReferralBonus = useCallback((level: number, amount: number) => {
    const rates = [0.2, 0.1, 0.05, 0.02]; // 20%, 10%, 5%, 2%
    return level <= rates.length ? amount * rates[level - 1] : 0;
  }, []);

  return {
    dailyTasks,
    taskHistory,
    earningsHistory,
    loading,
    error,
    completeDailyTask,
    claimWeeklyBonus: handleClaimWeeklyBonus,
    calculateReferralBonus,
    refetchTasks: fetchTasks,
  };
};