import React from 'react';
import { 
  ListItem, 
  ListItemAvatar, 
  Avatar, 
  ListItemText, 
  Typography, 
  Box, 
  useTheme 
} from '@mui/material';
import { Notification } from '../../../types/notificationTypes';
import { getNotificationIcon } from '../utils/notificationUtils';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  const theme = useTheme();
  const IconComponent = getNotificationIcon(notification.type);
  const isUnread = !notification.isRead;

  return (
    <ListItem
      alignItems="flex-start"
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        backgroundColor: isUnread 
          ? theme.palette.mode === 'dark' 
            ? 'rgba(66, 165, 245, 0.08)' 
            : 'rgba(66, 165, 245, 0.04)'
          : 'inherit',
        '&:hover': {
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.08)' 
            : 'rgba(0, 0, 0, 0.04)'
        },
        borderLeft: isUnread 
          ? `4px solid ${theme.palette.primary.main}` 
          : '4px solid transparent',
        paddingLeft: '12px'
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
          <IconComponent fontSize="small" />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography 
            variant="subtitle2" 
            sx={{ fontWeight: isUnread ? 600 : 400 }}
          >
            {notification.title}
          </Typography>
        }
        secondary={
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {notification.message}
            </Typography>
            <Typography
              variant="caption"
              color="text.disabled"
              display="block"
              mt={0.5}
            >
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );
};

export default NotificationItem;