import React from 'react';
import { Badge } from '@mui/material';
import { styled } from '@mui/system';
import { VIP_LEVEL_COLORS } from '../../../constants/vipLevels';

interface TaskBadgeProps {
  vipLevel: number;
  isCompleted?: boolean;
  children: React.ReactNode;
}

const StyledBadge = styled(Badge)(({ theme, vipLevel }: { theme?: any; vipLevel: number }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: VIP_LEVEL_COLORS[vipLevel] || '#666',
    color: 'white',
    fontWeight: 'bold',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      border: '1px solid currentColor',
      content: '""',
    },
  },
}));

export const TaskBadge: React.FC<TaskBadgeProps> = ({ vipLevel, isCompleted, children }) => {
  return (
    <StyledBadge
      vipLevel={vipLevel}
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      badgeContent={vipLevel}
      invisible={isCompleted}
    >
      {children}
    </StyledBadge>
  );
};