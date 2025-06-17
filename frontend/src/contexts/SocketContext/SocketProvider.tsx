import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketContext } from './SocketContext';
import {
  AdminMetrics,
  RequestStatusUpdate,
  SocketEvent,
  UserNotification,
} from './types';

interface SocketProviderProps {
  children: React.ReactNode;
  authToken?: string;
  userId?: string;
  isAdmin?: boolean;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
  authToken,
  userId,
  isAdmin = false,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [adminMetrics, setAdminMetrics] = useState<AdminMetrics | null>(null);
  const [userNotifications, setUserNotifications] = useState<UserNotification[]>(
    []
  );
  const [latestRequestUpdate, setLatestRequestUpdate] =
    useState<RequestStatusUpdate | null>(null);

  useEffect(() => {
    if (!authToken) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { token: authToken },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 5000,
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [authToken]);

  const subscribeToEvents = () => {
    if (!socket) return;

    socket.on('connect', () => {
      setIsConnected(true);
      if (userId) {
        socket.emit('register_user', { userId, isAdmin });
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    if (isAdmin) {
      socket.on('admin_metrics_update', (data: AdminMetrics) => {
        setAdminMetrics(data);
      });
    }

    socket.on('user_notification', (notification: UserNotification) => {
      setUserNotifications((prev) => [notification, ...prev]);
    });

    socket.on('request_status_update', (update: RequestStatusUpdate) => {
      setLatestRequestUpdate(update);
    });

    socket.on('balance_update', (update: { newBalance: number }) => {
      // Handle balance updates globally if needed
    });
  };

  const unsubscribeFromEvents = () => {
    if (!socket) return;

    socket.off('connect');
    socket.off('disconnect');
    socket.off('admin_metrics_update');
    socket.off('user_notification');
    socket.off('request_status_update');
    socket.off('balance_update');
  };

  const markNotificationAsRead = (notificationId: string) => {
    setUserNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    if (socket) {
      socket.emit('mark_notification_read', { notificationId });
    }
  };

  useEffect(() => {
    subscribeToEvents();
    return () => unsubscribeFromEvents();
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        adminMetrics,
        userNotifications,
        latestRequestUpdate,
        subscribeToEvents,
        unsubscribeFromEvents,
        markNotificationAsRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};