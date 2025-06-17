export interface DailyTask {
  task_id: string;
  task_type: string;
  task_description: string;
  earnings: number;
  is_completed: boolean;
  completion_date: Date | null;
  expires_at: Date;
  vip_level: number;
}

export interface TaskHistory {
  history_id: string;
  task_id: string;
  vip_level: number;
  task_type: string;
  earnings: number;
  completed_at: Date;
}

export interface TaskState {
  dailyTasks: DailyTask[];
  taskHistory: TaskHistory[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export type TaskAction =
  | { type: 'FETCH_TASKS_REQUEST' }
  | { type: 'FETCH_TASKS_SUCCESS'; payload: DailyTask[] }
  | { type: 'FETCH_TASKS_FAILURE'; payload: string }
  | { type: 'FETCH_HISTORY_SUCCESS'; payload: TaskHistory[] }
  | { type: 'COMPLETE_TASK_REQUEST'; payload: string }
  | { type: 'COMPLETE_TASK_SUCCESS'; payload: { taskId: string; history: TaskHistory } }
  | { type: 'COMPLETE_TASK_FAILURE'; payload: string }
  | { type: 'RESET_TASKS' };

export interface TaskContextType {
  state: TaskState;
  fetchDailyTasks: () => Promise<void>;
  fetchTaskHistory: () => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  resetTasks: () => void;
}