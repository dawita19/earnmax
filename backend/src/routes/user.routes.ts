import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth';
import { 
  updatePasswordSchema,
  updatePaymentSchema,
  updateProfileSchema 
} from '../validations/user.validation';
import { validate } from '../middleware/validator';
import { checkUserStatus } from '../middleware/userStatus';

const router = Router();
const userController = new UserController();

// Profile Routes
router.get(
  '/profile',
  authMiddleware,
  checkUserStatus,
  userController.getProfile
);

router.patch(
  '/profile',
  authMiddleware,
  checkUserStatus,
  validate(updateProfileSchema),
  userController.updateProfile
);

// Security Routes
router.patch(
  '/password',
  authMiddleware,
  checkUserStatus,
  validate(updatePasswordSchema),
  userController.updatePassword
);

// Payment Methods
router.patch(
  '/payment-method',
  authMiddleware,
  checkUserStatus,
  validate(updatePaymentSchema),
  userController.updatePaymentMethod
);

// Team/Referral Routes
router.get(
  '/team',
  authMiddleware,
  checkUserStatus,
  userController.getTeamInfo
);

router.get(
  '/referral-stats',
  authMiddleware,
  checkUserStatus,
  userController.getReferralStats
);

// Admin User Management
router.get(
  '/:userId',
  authMiddleware,
  userController.getUserById
);

router.patch(
  '/:userId/status',
  authMiddleware,
  userController.updateUserStatus
);

export default router;