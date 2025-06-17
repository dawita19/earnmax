import { create } from 'zustand';

interface DailyTask {
  taskId: string;
  type: string;
  description: string;
  earnings: number;
  isCompleted: boolean;
  expiresAt: string;
}

interface TaskState {
  dailyTasks: DailyTask[];
  completedTasks: DailyTask[];
  dailyEarnings: number;
  fetchDailyTasks: () => Promise<void>;
  fetchCompletedTasks: () => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  calculateDailyEarnings: () => number;
  resetDailyTasks: () => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  dailyTasks: [],
  completedTasks: [],
  dailyEarnings: 0,
  fetchDailyTasks: async () => {
    const response = await fetch('/api/tasks/daily');
    const data = await response.json();
    set({ dailyTasks: data.tasks });
  },
  fetchCompletedTasks: async () => {
    const response = await fetch('/api/tasks/completed');
    const data = await response.json();
    set({ completedTasks: data.tasks });
  },
  completeTask: async (taskId) => {
    const response = await fetch(`/api/tasks/${taskId}/complete`, {
      method: 'POST',
    });
    const data = await response.json();
    
    // Update tasks and earnings
    set((state) => ({
      dailyTasks: state.dailyTasks.map(task => 
        task.taskId === taskId ? { ...task, isCompleted: true } : task
      ),
      dailyEarnings: state.dailyEarnings + data.earned,
      completedTasks: [...state.completedTasks, data.completedTask],
    }));
    
    // Update user balance in user store
    // (Assuming you have a way to access user store here)
  },
  calculateDailyEarnings: () => {
    return get().dailyTasks
      .filter(task => task.isCompleted)
      .reduce((sum, task) => sum + task.earnings, 0);
  },
  resetDailyTasks: async () => {
    // Typically called by a background process, but available if needed
    await fetch('/api/tasks/reset', { method: 'POST' });
    await get().fetchDailyTasks();
    set({ dailyEarnings: 0 });
  },
}));