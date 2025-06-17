import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';
import { VIP_LEVEL_COLORS } from '../../../constants/vipLevels';

interface TaskProgressProps {
  progress: number;
  vipLevel: number;
  size?: number;
  thickness?: number;
  showLabel?: boolean;
}

export const TaskProgress: React.FC<TaskProgressProps> = ({
  progress,
  vipLevel,
  size = 40,
  thickness = 4,
  showLabel = true,
}) => {
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  const color = VIP_LEVEL_COLORS[vipLevel] || '#666';

  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={thickness}
        sx={{
          color: theme => theme.palette.grey[300],
          position: 'absolute',
        }}
      />
      <CircularProgress
        variant="determinate"
        value={normalizedProgress}
        size={size}
        thickness={thickness}
        sx={{
          color,
        }}
      />
      {showLabel && (
        <Box
          top={0}
          left={0}
          bottom={0}
          right={0}
          position="absolute"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography
            variant="caption"
            component="div"
            color="text.secondary"
            sx={{ fontWeight: 'bold' }}
          >
            {`${Math.round(normalizedProgress)}%`}
          </Typography>
        </Box>
      )}
    </Box>
  );
};