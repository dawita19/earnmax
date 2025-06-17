import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';
import { authMiddleware } from '../middleware/auth';
import { withdrawalSchema } from '../validations/transaction.validation';
import { validate } from '../middleware/validator';
import { checkUserStatus } from '../middleware/userStatus';
import { auditLog } from '../middleware/audit';

const router = Router();
const transactionController = new TransactionController();

// Withdrawal Routes
router.post(
  '/withdraw',
  authMiddleware,
  checkUserStatus,
  validate(withdrawalSchema),
  auditLog('Withdrawal initiated'),
  transactionController.initiateWithdrawal
);

// Admin Processing Routes
router.get(
  '/pending',
  authMiddleware,
  transactionController.getPendingTransactions
);

router.patch(
  '/approve-withdrawal/:requestId',
  authMiddleware,
  auditLog('Withdrawal approved'),
  transactionController.approveWithdrawal
);

// History Routes
router.get(
  '/history',
  authMiddleware,
  transactionController.getTransactionHistory
);

// Referral Earnings
router.get(
  '/referral-earnings',
  authMiddleware,
  transactionController.getReferralEarnings
);

export default router;