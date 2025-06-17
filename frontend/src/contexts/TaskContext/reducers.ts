import { TaskState, TaskAction } from './types';

export const initialState: TaskState = {
  dailyTasks: [],
  taskHistory: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

export function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'FETCH_TASKS_REQUEST':
      return { ...state, isLoading: true, error: null };
    
    case 'FETCH_TASKS_SUCCESS':
      return {
        ...state,
        dailyTasks: action.payload,
        isLoading: false,
        lastUpdated: new Date(),
      };
    
    case 'FETCH_TASKS_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    
    case 'FETCH_HISTORY_SUCCESS':
      return { ...state, taskHistory: action.payload };
    
    case 'COMPLETE_TASK_REQUEST':
      return {
        ...state,
        dailyTasks: state.dailyTasks.map(task =>
          task.task_id === action.payload ? { ...task, is_completed: true } : task
        ),
      };
    
    case 'COMPLETE_TASK_SUCCESS':
      return {
        ...state,
        taskHistory: [action.payload.history, ...state.taskHistory],
      };
    
    case 'COMPLETE_TASK_FAILURE':
      return {
        ...state,
        dailyTasks: state.dailyTasks.map(task =>
          task.task_id === action.payload ? { ...task, is_completed: false } : task
        ),
        error: 'Failed to complete task',
      };
    
    case 'RESET_TASKS':
      return initialState;
    
    default:
      return state;
  }
}