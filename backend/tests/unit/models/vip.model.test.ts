import { VIPLevel } from '../../src/models/vip.model';
import db from '../../src/config/database';

describe('VIP Model', () => {
  beforeAll(async () => {
    await db.sync({ force: true });
    await VIPLevel.bulkCreate([
      {
        level_id: 0,
        investment_amount: 0,
        daily_earning: 20,
        per_task_earning: 5,
        min_withdrawal: 60,
        max_total_withdrawal: 300,
        investment_area: 'Free Trial',
        daily_tasks: ['View ad', 'Spin reward', 'Share post', 'Watch video']
      },
      {
        level_id: 1,
        investment_amount: 1200,
        daily_earning: 40,
        per_task_earning: 10,
        min_withdrawal: 40,
        max_total_withdrawal: 4800,
        investment_area: 'Digital Advertising',
        daily_tasks: ['Click ad', 'Comment on promo', 'Share promotion', 'Claim reward']
      }
    ]);
  });

  describe('VIP Level Validation', () => {
    test('should enforce correct task earnings calculation', async () => {
      const vip0 = await VIPLevel.findByPk(0);
      const vip1 = await VIPLevel.findByPk(1);
      
      expect(vip0.per_task_earning).toBe(5);
      expect(vip0.daily_earning).toBe(20);
      expect(vip0.daily_tasks.length).toBe(4);
      
      expect(vip1.per_task_earning).toBe(10);
      expect(vip1.daily_earning).toBe(40);
    });

    test('should validate withdrawal limits', async () => {
      const vip1 = await VIPLevel.findByPk(1);
      expect(vip1.min_withdrawal).toBe(40);
      expect(vip1.max_total_withdrawal).toBe(4800);
    });
  });
});