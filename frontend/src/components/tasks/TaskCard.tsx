import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { TaskBadge } from './TaskBadge';
import { TaskCompleteModal } from './TaskCompleteModal';
import { useCompleteTaskMutation } from '../../../api/taskApi';
import { Task } from '../../../types/taskTypes';
import { formatCurrency } from '../../../utils/formatting';

interface TaskCardProps {
  task: Task;
  dailyProgress: number;
  refreshTasks: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, dailyProgress, refreshTasks }) => {
  const [openModal, setOpenModal] = useState(false);
  const [completeTask, { isLoading }] = useCompleteTaskMutation();

  const handleCompleteTask = async () => {
    try {
      await completeTask(task.id).unwrap();
      setOpenModal(true);
      refreshTasks();
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  return (
    <>
      <Card
        sx={{
          position: 'relative',
          minWidth: 280,
          maxWidth: 320,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: 6,
          },
        }}
      >
        <TaskBadge vipLevel={task.vipLevel} isCompleted={task.completed}>
          <CardMedia
            component="img"
            height="140"
            image={`/assets/tasks/${task.type}.jpg`}
            alt={task.type}
            sx={{
              filter: task.completed ? 'grayscale(80%)' : 'none',
              opacity: task.completed ? 0.7 : 1,
            }}
          />
        </TaskBadge>

        <CardContent sx={{ flexGrow: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6" component="div">
              {task.title}
            </Typography>
            <Chip
              label={formatCurrency(task.reward)}
              color={task.completed ? 'default' : 'primary'}
              size="small"
            />
          </Box>

          <Typography variant="body2" color="text.secondary" mb={2}>
            {task.description}
          </Typography>

          <Box display="flex" alignItems="center" justifyContent="space-between" mt="auto">
            <TaskProgress 
              progress={dailyProgress}
              vipLevel={task.vipLevel}
              size={40}
            />

            <Tooltip 
              title={task.completed ? "Task already completed today" : ""}
              placement="top"
            >
              <span>
                <Button
                  variant="contained"
                  color={task.completed ? "success" : "primary"}
                  onClick={handleCompleteTask}
                  disabled={task.completed || isLoading}
                  endIcon={isLoading && <CircularProgress size={20} />}
                  sx={{
                    minWidth: 120,
                    '&.Mui-disabled': {
                      backgroundColor: theme => theme.palette.success.light,
                      color: 'white',
                    },
                  }}
                >
                  {task.completed ? "Completed" : "Start Task"}
                </Button>
              </span>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      <TaskCompleteModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        reward={task.reward}
        taskType={task.type}
      />
    </>
  );
};