import { DailyTask, TaskHistory } from './types';
import api from '../../services/api';

export const fetchDailyTasks = async (vipLevel: number): Promise<DailyTask[]> => {
  try {
    const response = await api.get(`/tasks/daily?level=${vipLevel}`);
    return response.data.map((task: any) => ({
      ...task,
      expires_at: new Date(task.expires_at),
      completion_date: task.completion_date ? new Date(task.completion_date) : null,
    }));
  } catch (error) {
    throw new Error('Failed to fetch daily tasks');
  }
};

export const fetchTaskHistory = async (userId: string): Promise<TaskHistory[]> => {
  try {
    const response = await api.get(`/tasks/history/${userId}`);
    return response.data.map((history: any) => ({
      ...history,
      completed_at: new Date(history.completed_at),
    }));
  } catch (error) {
    throw new Error('Failed to fetch task history');
  }
};

export const completeTask = async (
  taskId: string,
  userId: string
): Promise<{ taskId: string; history: TaskHistory }> => {
  try {
    const response = await api.post(`/tasks/complete`, { taskId, userId });
    return {
      taskId,
      history: {
        ...response.data,
        completed_at: new Date(response.data.completed_at),
      },
    };
  } catch (error) {
    throw new Error('Failed to complete task');
  }
};