import { createContext } from 'react';
import { SocketContextType } from './types';

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  adminMetrics: null,
  userNotifications: [],
  latestRequestUpdate: null,
  subscribeToEvents: () => {},
  unsubscribeFromEvents: () => {},
  markNotificationAsRead: () => {},
});