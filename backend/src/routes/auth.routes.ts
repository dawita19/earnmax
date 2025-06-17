import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { rateLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validator';
import { loginSchema, registerSchema } from '../validations/auth.validation';
import { ipBasedPrevention } from '../middleware/fraudPrevention';

const router = Router();
const authController = new AuthController();

// Public routes
router.post(
  '/register',
  rateLimiter(10, 60), // 10 requests per minute
  ipBasedPrevention,
  validate(registerSchema),
  authController.register
);

router.post(
  '/login',
  rateLimiter(15, 60),
  validate(loginSchema),
  authController.login
);

// Password reset routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Admin auth routes
router.post(
  '/admin/login',
  rateLimiter(5, 60),
  validate(loginSchema),
  authController.adminLogin
);

export default router;