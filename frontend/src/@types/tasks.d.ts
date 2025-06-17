// tasks.d.ts
declare namespace Tasks {
  interface DailyTask {
    id: string;
    type: string;
    description: string;
    earnings: number;
    vipLevel: number;
    isCompleted: boolean;
    expiresAt: string;
    actionUrl?: string;
  }

  interface TaskCompletion {
    taskId: string;
    userId: number;
    earnings: number;
    completedAt: string;
    ipAddress?: string;
  }

  interface WeeklyBonus {
    levelRequirement: number;
    percentage: number;
    qualified: boolean;
    amountEarned?: number;
    dateEarned?: string;
  }

  interface EarningHistory {
    id: number;
    type: 'task' | 'referral' | 'bonus' | 'purchase' | 'upgrade';
    amount: number;
    description: string;
    date: string;
    referenceId?: number;
  }
}