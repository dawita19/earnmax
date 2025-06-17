import { Transaction, User, VIPLevel } from '../../src/models';
import db from '../../src/config/database';

describe('Transaction Model', () => {
  beforeAll(async () => {
    await db.sync({ force: true });
    await VIPLevel.create({
      level_id: 1,
      investment_amount: 1200,
      daily_earning: 40,
      per_task_earning: 10,
      min_withdrawal: 40,
      max_total_withdrawal: 4800,
      investment_area: 'Digital Advertising',
      daily_tasks: ['Click ad', 'Comment on promo', 'Share promotion', 'Claim reward']
    });
  });

  describe('Purchase Transactions', () => {
    test('should correctly process VIP purchases', async () => {
      const user = await User.create({
        full_name: 'Buyer',
        phone_number: '+1231231234',
        password_hash: 'hash123',
        invite_code: 'BUYER1'
      });

      const transaction = await Transaction.createPurchase({
        user_id: user.user_id,
        vip_level: 1,
        amount: 1200,
        payment_method: 'Bank Transfer',
        payment_proof_url: 'http://proof.com/1'
      });

      expect(transaction.status).toBe('pending');
      expect(transaction.amount).toBe(1200);
      expect(transaction.vip_level).toBe(1);
    });
  });

  describe('Withdrawal Validation', () => {
    test('should enforce VIP withdrawal limits', async () => {
      const user = await User.create({
        full_name: 'Withdrawer',
        phone_number: '+4564564567',
        password_hash: 'hash456',
        invite_code: 'WDR456',
        vip_level: 1,
        vip_amount: 1200,
        balance: 5000
      });

      // Should reject below minimum
      await expect(Transaction.createWithdrawal({
        user_id: user.user_id,
        amount: 30,
        payment_method: 'Bank Transfer'
      })).rejects.toThrow('Below minimum withdrawal');

      // Should reject above maximum remaining
      await expect(Transaction.createWithdrawal({
        user_id: user.user_id,
        amount: 5000,
        payment_method: 'Bank Transfer'
      })).rejects.toThrow('Exceeds maximum withdrawal');
    });
  });
});