import { Router } from 'express';
import { PaymentAccountController } from '../../controllers/admin/payment-account.controller';
import { adminAuth } from '../../middlewares/adminAuth';

const router = Router();

router.post('/', adminAuth('high'), PaymentAccountController.create);
router.put('/:id', adminAuth('high'), PaymentAccountController.update);
router.get('/', adminAuth('high'), PaymentAccountController.list);
router.delete('/:id', adminAuth('high'), PaymentAccountController.delete);

export default router;