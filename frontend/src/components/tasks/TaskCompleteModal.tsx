import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Slide,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { CheckCircle, Celebration } from '@mui/icons-material';
import { formatCurrency } from '../../../utils/formatting';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface TaskCompleteModalProps {
  open: boolean;
  onClose: () => void;
  reward: number;
  taskType: string;
}

export const TaskCompleteModal: React.FC<TaskCompleteModalProps> = ({
  open,
  onClose,
  reward,
  taskType,
}) => {
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      aria-labelledby="task-complete-dialog"
      maxWidth="xs"
      fullWidth
    >
      <Box
        sx={{
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          textAlign: 'center',
          py: 3,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Celebration
          sx={{
            position: 'absolute',
            fontSize: 120,
            opacity: 0.1,
            top: -20,
            right: -20,
            transform: 'rotate(30deg)',
          }}
        />
        <Avatar
          sx={{
            backgroundColor: 'success.main',
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 2,
          }}
        >
          <CheckCircle sx={{ fontSize: 60 }} />
        </Avatar>
        <DialogTitle id="task-complete-dialog" sx={{ color: 'inherit' }}>
          Task Completed!
        </DialogTitle>
      </Box>

      <DialogContent>
        <Box textAlign="center" py={2}>
          <Typography variant="h5" gutterBottom>
            +{formatCurrency(reward)}
          </Typography>
          <DialogContentText>
            You've successfully completed the {taskType} task and earned{' '}
            {formatCurrency(reward)}.
          </DialogContentText>
        </Box>

        <Box
          sx={{
            background: theme => theme.palette.grey[100],
            borderRadius: 1,
            p: 2,
            mt: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Your referral network may have also earned bonuses from your activity.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          size="large"
          sx={{ px: 5 }}
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};