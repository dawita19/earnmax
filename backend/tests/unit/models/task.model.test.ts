import { DailyTask, User, VIPLevel } from '../../src/models';
import db from '../../src/config/database';

describe('Task Model', () => {
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

  describe('Task Assignment', () => {
    test('should assign correct tasks based on VIP level', async () => {
      const user = await User.create({
        full_name: 'Task User',
        phone_number: '+7897897890',
        password_hash: 'hash789',
        invite_code: 'TASK789',
        vip_level: 1
      });

      const tasks = await DailyTask.assignDailyTasks(user.user_id);
      expect(tasks).toHaveLength(4);
      expect(tasks[0].task_type).toBe('Click ad');
      expect(tasks[0].earnings).toBe(10);
    });
  });

  describe('Task Completion', () => {
    test('should distribute earnings and referral bonuses', async () => {
      const [inviter, user] = await Promise.all([
        User.create({
          full_name: 'Inviter',
          phone_number: '+3213213210',
          password_hash: 'hash321',
          invite_code: 'INV321'
        }),
        User.create({
          full_name: 'Task Completer',
          phone_number: '+6546546540',
          password_hash: 'hash654',
          invite_code: 'TASK654',
          vip_level: 1,
          inviter_id: 1
        })
      ]);

      const task = await DailyTask.create({
        user_id: user.user_id,
        vip_level: 1,
        task_type: 'Click ad',
        task_description: 'Click on advertisement',
        earnings: 10,
        expires_at: new Date(Date.now() + 86400000)
      });

      await task.complete();

      // Verify user earnings
      await user.reload();
      expect(user.balance).toBe(10);
      expect(user.total_earnings).toBe(10);

      // Verify referral bonuses
      await inviter.reload();
      expect(inviter.balance).toBe(2); // 20% of 10
      expect(inviter.total_referral_bonus).toBe(2);
    });
  });
});