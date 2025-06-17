import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authMiddleware } from '../middleware/auth';
import { checkUserStatus } from '../middleware/userStatus';
import { taskCompletionSchema } from '../validations/task.validation';
import { validate } from '../middleware/validator';
import { checkDailyLimit } from '../middleware/taskLimiter';

const router = Router();
const taskController = new TaskController();

// Task Routes
router.get(
  '/daily',
  authMiddleware,
  checkUserStatus,
  taskController.getDailyTasks
);

router.post(
  '/complete',
  authMiddleware,
  checkUserStatus,
  checkDailyLimit,
  validate(taskCompletionSchema),
  taskController.completeTask
);

// Weekly Bonus
router.get(
  '/weekly-bonus',
  authMiddleware,
  checkUserStatus,
  taskController.getWeeklyBonusStatus
);

router.post(
  '/claim-bonus',
  authMiddleware,
  checkUserStatus,
  taskController.claimWeeklyBonus
);

// Admin Task Management
router.post(
  '/generate',
  authMiddleware,
  taskController.generateDailyTasks
);

export default router;