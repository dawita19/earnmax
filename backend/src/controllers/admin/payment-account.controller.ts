import { Request, Response } from 'express';
import { PaymentAccountService } from '../../services/admin/payment-account.service';
import { adminAuth } from '../../middlewares/adminAuth';

export class PaymentAccountController {
  static async create(req: Request, res: Response) {
    try {
      const account = await PaymentAccountService.createAccount(req.body);
      res.status(201).json(account);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const account = await PaymentAccountService.updateAccount(Number(req.params.id), req.body);
      res.json(account);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const accounts = await PaymentAccountService.listAccounts();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await PaymentAccountService.deleteAccount(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}