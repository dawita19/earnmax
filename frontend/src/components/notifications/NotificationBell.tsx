import React, { useState, useEffect, useRef } from 'react';
import { Badge, IconButton, Skeleton } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationList from './NotificationList';
import { useNotifications } from '../../../hooks/useNotifications';
import { Notification } from '../../../types/notificationTypes';

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const bellRef = useRef<HTMLButtonElement>(null);
  const { fetchNotifications, markAsRead } = useNotifications();

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await fetchNotifications();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleToggle = () => {
    if (!isOpen && unreadCount > 0) {
      markAsRead(notifications.filter(n => !n.isRead).map(n => n.id);
      setUnreadCount(0);
    }
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <IconButton
        ref={bellRef}
        color="inherit"
        onClick={handleToggle}
        aria-label="notifications"
        className="relative"
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <NotificationsIcon className="text-white hover:text-primary-200" />
        </Badge>
      </IconButton>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 z-50">
          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={60} className="mb-2 rounded" />
              ))}
            </div>
          ) : (
            <NotificationList 
              notifications={notifications} 
              onClose={() => setIsOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;