import { Router } from 'express';
import { VipController } from '../controllers/vip.controller';
import { authMiddleware } from '../middleware/auth';
import { vipPurchaseSchema, vipUpgradeSchema } from '../validations/vip.validation';
import { validate } from '../middleware/validator';
import { checkUserStatus } from '../middleware/userStatus';

const router = Router();
const vipController = new VipController();

// VIP Level Info
router.get('/levels', vipController.getVipLevels);

// Purchase/Upgrade Routes
router.post(
  '/purchase',
  authMiddleware,
  checkUserStatus,
  validate(vipPurchaseSchema),
  vipController.initiatePurchase
);

router.post(
  '/upgrade',
  authMiddleware,
  checkUserStatus,
  validate(vipUpgradeSchema),
  vipController.initiateUpgrade
);

// Admin Approval Routes
router.patch(
  '/approve-purchase/:requestId',
  authMiddleware,
  checkUserStatus,
  vipController.approvePurchase
);

router.patch(
  '/approve-upgrade/:requestId',
  authMiddleware,
  checkUserStatus,
  vipController.approveUpgrade
);

export default router;