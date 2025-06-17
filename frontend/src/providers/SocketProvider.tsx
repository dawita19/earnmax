import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthProvider';
import { Notification, RealTimeUpdate } from '@/types/socket';

type SocketContextType = {
  socket: Socket | null;
  notifications: Notification[];
  realTimeUpdates: RealTimeUpdate[];
  isConnected: boolean;
  sendMessage: (event: string, data: any) => void;
  clearNotifications: () => void;
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [realTimeUpdates, setRealTimeUpdates] = useState<RealTimeUpdate[]>([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { token: user.accessToken },
      reconnectionAttempts: 5,
      reconnectionDelay: 5000,
      autoConnect: true,
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('notification', (notification: Notification) => {
      setNotifications(prev => [...prev, notification]);
    });

    socketInstance.on('update', (update: RealTimeUpdate) => {
      setRealTimeUpdates(prev => [...prev, update]);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated, user]);

  const sendMessage = (event: string, data: any) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = useMemo(() => ({
    socket,
    notifications,
    realTimeUpdates,
    isConnected,
    sendMessage,
    clearNotifications
  }), [socket, notifications, realTimeUpdates, isConnected]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};