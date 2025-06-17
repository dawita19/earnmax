import axios from 'axios';
import { DailyTask, TaskCompletion, TaskHistory } from '../../types';

const TASKS_API_BASE = process.env.NEXT_PUBLIC_TASKS_API_URL || '/api/tasks';

export const TasksApi = {
  // Task Management
  getDailyTasks: async (): Promise<DailyTask[]> => {
    const { data } = await axios.get(`${TASKS_API_BASE}/daily`);
    return data;
  },

  completeTask: async (taskId: number): Promise<TaskCompletion> => {
    const { data } = await axios.post(`${TASKS_API_BASE}/complete/${taskId}`);
    return data;
  },

  // History
  getTaskHistory: async (page = 1, limit = 10): Promise<TaskHistory[]> => {
    const { data } = await axios.get(`${TASKS_API_BASE}/history?page=${page}&limit=${limit}`);
    return data;
  },

  // VIP Task Configuration
  getVipTaskConfig: async (vipLevel: number) => {
    const { data } = await axios.get(`${TASKS_API_BASE}/config/${vipLevel}`);
    return data;
  },

  // Bonus Earnings
  claimWeeklyBonus: async () => {
    const { data } = await axios.post(`${TASKS_API_BASE}/bonus/weekly`);
    return data;
  },

  getReferralEarnings: async () => {
    const { data } = await axios.get(`${TASKS_API_BASE}/earnings/referral`);
    return data;
  }
};