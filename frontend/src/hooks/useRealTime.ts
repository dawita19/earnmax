import { useState, useEffect, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import { VIPLevel, SystemStats, Notification } from '../types';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const useRealTime = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [vipLevels, setVipLevels] = useState<VIPLevel[]>([]);

  const connectSocket = useCallback(() => {
    if (!user) return;

    const newSocket = io(SOCKET_URL, {
      query: { userId: user.user_id, isAdmin: user.admin_level !== undefined },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
    });

    newSocket.on('statsUpdate', (data: SystemStats) => {
      setStats(data);
    });

    newSocket.on('vipLevelsUpdate', (levels: VIPLevel[]) => {
      setVipLevels(levels);
    });

    newSocket.on('newNotification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      const cleanup = connectSocket();
      return cleanup;
    }
  }, [user, connectSocket]);

  const markNotificationAsRead = useCallback(
    (notificationId: number) => {
      if (socket) {
        socket.emit('markNotificationRead', notificationId);
        setNotifications(prev =>
          prev.map(n => (n.notification_id === notificationId ? { ...n, is_read: true } : n))
        );
      }
    },
    [socket]
  );

  return {
    socket,
    stats,
    vipLevels,
    notifications,
    markNotificationAsRead,
    addNotification: (notification: Omit<Notification, 'notification_id' | 'created_at'>) => {
      if (socket) {
        socket.emit('createNotification', notification);
      }
    },
  };
};