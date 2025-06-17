import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { taskReducer, initialState } from './reducers';
import * as actions from './actions';
import { TaskContextType, DailyTask } from './types';
import { useAuth } from '../AuthContext';
import { useVIP } from '../VIPContext';

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const { user } = useAuth();
  const { vipLevel } = useVIP();

  const fetchDailyTasks = async () => {
    if (!vipLevel) return;
    
    try {
      dispatch({ type: 'FETCH_TASKS_REQUEST' });
      const tasks = await actions.fetchDailyTasks(vipLevel);
      dispatch({ type: 'FETCH_TASKS_SUCCESS', payload: tasks });
    } catch (error) {
      dispatch({ type: 'FETCH_TASKS_FAILURE', payload: error.message });
    }
  };

  const fetchTaskHistory = async () => {
    if (!user?.id) return;
    
    try {
      const history = await actions.fetchTaskHistory(user.id);
      dispatch({ type: 'FETCH_HISTORY_SUCCESS', payload: history });
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const completeTask = async (taskId: string) => {
    if (!user?.id) return;
    
    try {
      dispatch({ type: 'COMPLETE_TASK_REQUEST', payload: taskId });
      const result = await actions.completeTask(taskId, user.id);
      dispatch({ type: 'COMPLETE_TASK_SUCCESS', payload: result });
      
      // Refresh tasks after completion
      await fetchDailyTasks();
    } catch (error) {
      dispatch({ type: 'COMPLETE_TASK_FAILURE', payload: taskId });
    }
  };

  const resetTasks = () => {
    dispatch({ type: 'RESET_TASKS' });
  };

  useEffect(() => {
    if (vipLevel && user?.id) {
      fetchDailyTasks();
      fetchTaskHistory();
    }
  }, [vipLevel, user?.id]);

  return (
    <TaskContext.Provider
      value={{
        state,
        fetchDailyTasks,
        fetchTaskHistory,
        completeTask,
        resetTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};