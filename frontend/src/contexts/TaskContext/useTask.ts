import { useContext } from 'react';
import { TaskContextType } from './types';
import { TaskContext } from './TaskContext';

export const useTask = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};