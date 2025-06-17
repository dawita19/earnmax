import { create } from 'zustand';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  referenceId?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  pushNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  fetchNotifications: async () => {
    const response = await fetch('/api/notifications');
    const data = await response.json();
    set({ 
      notifications: data.notifications,
      unreadCount: data.unreadCount,
    });
  },
  markAsRead: async (id) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    set((state) => ({
      notifications: state.notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: state.unreadCount - 1,
    }));
  },
  markAllAsRead: async () => {
    await fetch('/api/notifications/read-all', { method: 'POST' });
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },
  pushNotification: (notification) => {
    const newNotification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));