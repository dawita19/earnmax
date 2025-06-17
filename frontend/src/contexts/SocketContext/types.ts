export type SocketEvent =
  | 'admin_metrics_update'
  | 'user_notification'
  | 'request_status_update'
  | 'balance_update'
  | 'task_update'
  | 'vip_level_change';

export interface AdminMetrics {
  totalRevenue: number;
  totalUsers: number;
  pendingWithdrawals: number;
  pendingPurchases: number;
  pendingUpgrades: number;
  suspendedUsers: number;
  vipDistribution: Record<number, number>;
}

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  createdAt: Date;
  read: boolean;
}

export interface RequestStatusUpdate {
  requestId: string;
  requestType: 'withdrawal' | 'purchase' | 'upgrade';
  newStatus: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
}

export interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  adminMetrics: AdminMetrics | null;
  userNotifications: UserNotification[];
  latestRequestUpdate: RequestStatusUpdate | null;
  subscribeToEvents: () => void;
  unsubscribeFromEvents: () => void;
  markNotificationAsRead: (notificationId: string) => void;
}