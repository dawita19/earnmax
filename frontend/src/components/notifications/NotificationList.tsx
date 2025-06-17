import React from 'react';
import {
  Paper,
  List,
  Divider,
  Typography,
  Button,
  Box,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import NotificationItem from './NotificationItem';
import { Notification } from '../../../types/notificationTypes';
import { useNotifications } from '../../../hooks/useNotifications';

interface NotificationListProps {
  notifications: Notification[];
  onClose: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ notifications, onClose }) => {
  const { markAllAsRead, isLoading } = useNotifications();
  
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      onClose();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <Paper elevation={3} className="max-h-[calc(100vh-200px)] overflow-hidden flex flex-col">
      <Box 
        px={2} 
        py={1.5} 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center"
        borderBottom="1px solid rgba(0, 0, 0, 0.12)"
      >
        <Typography variant="h6" fontWeight="medium">
          Notifications
        </Typography>
        <Button 
          size="small" 
          color="primary"
          onClick={handleMarkAllAsRead}
          disabled={isLoading || notifications.filter(n => !n.isRead).length === 0}
        >
          {isLoading ? <CircularProgress size={20} /> : 'Mark all as read'}
        </Button>
      </Box>
      
      <List sx={{ overflowY: 'auto', flex: 1 }}>
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <NotificationItem 
                notification={notification} 
                onClick={onClose}
              />
              {index < notifications.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))
        ) : (
          <ListItem>
            <ListItemText 
              primary={
                <Typography textAlign="center" color="text.secondary">
                  No notifications available
                </Typography>
              }
            />
          </ListItem>
        )}
      </List>
      
      <Box 
        px={2} 
        py={1.5} 
        borderTop="1px solid rgba(0, 0, 0, 0.12)"
        textAlign="center"
      >
        <Button 
          variant="text" 
          color="primary" 
          size="small"
          href="/notifications"
          onClick={onClose}
        >
          View all notifications
        </Button>
      </Box>
    </Paper>
  );
};

export default NotificationList;