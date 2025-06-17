import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { useAuthStore } from './auth-store';
import { useVipStore } from './vip-store';

interface Task {
  id: string;
  type: string;
  description: string;
  earnings: number;
  isCompleted: boolean;
  expiresAt: Date;
}

interface TaskState {
  dailyTasks: Task[];
  taskHistory: Task[];
  completedToday: number;
  dailyEarnings: number;
  loading: boolean;
  error: string | null;
}

interface TaskActions {
  loadDailyTasks: () => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  claimDailyBonus: () => Promise<void>;
  resetDailyTasks: () => void;
}

export const useTaskStore = create<TaskState & TaskActions>()(
  immer((set, get) => ({
    dailyTasks: [],
    taskHistory: [],
    completedToday: 0,
    dailyEarnings: 0,
    loading: false,
    error: null,

    loadDailyTasks: async () => {
      set({ loading: true });
      try {
        const user = useAuthStore.getState().user;
        if (!user) throw new Error('User not authenticated');
        
        const vipLevel = user.vipLevel;
        const tasks = await mockGetDailyTasks(vipLevel);
        
        set({
          dailyTasks: tasks,
          loading: false,
          completedToday: tasks.filter(t => t.isCompleted).length,
          dailyEarnings: tasks
            .filter(t => t.isCompleted)
            .reduce((sum, task) => sum + task.earnings, 0),
        });
      } catch (err) {
        set({ error: err.message, loading: false });
      }
    },

    completeTask: async (taskId) => {
      set({ loading: true, error: null });
      try {
        const user = useAuthStore.getState().user;
        if (!user) throw new Error('User not authenticated');
        
        // Find the task
        const task = get().dailyTasks.find(t => t.id === taskId);
        if (!task) throw new Error('Task not found');
        if (task.isCompleted) throw new Error('Task already completed');
        
        // Mock API call
        await mockCompleteTask(taskId);
        
        // Calculate earnings
        const earnings = task.earnings;
        
        // Update state
        set((state) => {
          const taskIndex = state.dailyTasks.findIndex(t => t.id === taskId);
          if (taskIndex !== -1) {
            state.dailyTasks[taskIndex].isCompleted = true;
          }
          state.completedToday += 1;
          state.dailyEarnings += earnings;
          state.taskHistory.unshift({
            ...task,
            isCompleted: true,
            expiresAt: new Date(),
          });
        });
        
        // Update user balance
        useAuthStore.getState().updateUser({
          balance: (user.balance + earnings),
          totalEarnings: (user.totalEarnings + earnings),
        });
        
        // Process referral bonuses (4 levels)
        processReferralBonuses(earnings, user.userId);
        
      } catch (err) {
        set({ error: err.message, loading: false });
      } finally {
        set({ loading: false });
      }
    },

    claimDailyBonus: async () => {
      set({ loading: true });
      try {
        const user = useAuthStore.getState().user;
        if (!user) throw new Error('User not authenticated');
        
        const allCompleted = get().dailyTasks.every(t => t.isCompleted);
        if (!allCompleted) throw new Error('Complete all tasks first');
        
        const bonus = await mockClaimDailyBonus(user.userId);
        
        // Update user balance
        useAuthStore.getState().updateUser({
          balance: (user.balance + bonus),
          totalEarnings: (user.totalEarnings + bonus),
        });
        
      } catch (err) {
        set({ error: err.message });
      } finally {
        set({ loading: false });
      }
    },

    resetDailyTasks: () => {
      set({
        dailyTasks: get().dailyTasks.map(task => ({
          ...task,
          isCompleted: false,
        })),
        completedToday: 0,
        dailyEarnings: 0,
      });
    },
  }))
);

// Process 4-level referral bonuses
async function processReferralBonuses(earnings: number, userId: string) {
  // Mock: Get referral network (4 levels)
  const referralNetwork = await mockGetReferralNetwork(userId);
  
  // Calculate bonuses (20%, 10%, 5%, 2%)
  const bonuses = [
    { level: 1, percent: 0.2, amount: earnings * 0.2 },
    { level: 2, percent: 0.1, amount: earnings * 0.1 },
    { level: 3, percent: 0.05, amount: earnings * 0.05 },
    { level: 4, percent: 0.02, amount: earnings * 0.02 },
  ];
  
  // Update each referrer's balance
  for (let i = 0; i < Math.min(referralNetwork.length, 4); i++) {
    const referrerId = referralNetwork[i];
    const bonus = bonuses[i];
    
    // In a real app, this would be an API call
    console.log(`Adding ${bonus.amount} to referrer ${referrerId} (level ${bonus.level})`);
    
    // Mock: Update referrer's data
    // You would typically have an API endpoint for this
  }
}

// Mock functions
async function mockGetDailyTasks(vipLevel: number): Promise<Task[]> {
  const tasks = [
    {
      id: 'task1',
      type: 'view_ad',
      description: 'View advertisement for 30 seconds',
      earnings: 5,
      isCompleted: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    {
      id: 'task2',
      type: 'spin_reward',
      description: 'Spin the daily reward wheel',
      earnings: 5,
      isCompleted: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    // Add more tasks based on VIP level...
  ];
  
  // Adjust tasks based on VIP level
  if (vipLevel > 0) {
    tasks.push({
      id: 'task3',
      type: 'click_ad',
      description: 'Click on promotional advertisement',
      earnings: 10,
      isCompleted: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  }
  
  return tasks;
}

async function mockCompleteTask(taskId: string) {
  return new Promise((resolve) => setTimeout(resolve, 500));
}

async function mockClaimDailyBonus(userId: string) {
  return 50; // Mock bonus amount
}

async function mockGetReferralNetwork(userId: string): Promise<string[]> {
  // Mock referral network (4 levels)
  return [
    'referrer1', // Level 1
    'referrer2', // Level 2
    'referrer3', // Level 3
    'referrer4', // Level 4
  ];
}