import request from 'supertest';
import app from '../../../src/app';
import db from '../../../src/db';
import {
  generateDailyTasks,
  completeTask,
  calculateTaskEarnings
} from '../../../src/services/taskService';

describe('Daily Task System', () => {
  let userToken: string;
  let userId: number;

  beforeAll(async () => {
    await db.migrate.latest();
    await db.seed.run();

    // Create test user with VIP level 2
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        phone_number: '+251911226666',
        password: 'taskPass123'
      });
    
    userId = userRes.body.user_id;
    userToken = userRes.body.token;

    await db('users')
      .where('user_id', userId)
      .update({
        vip_level: 2,
        vip_amount: 3000
      });
  });

  it('should generate VIP-level appropriate tasks', async () => {
    const tasks = await generateDailyTasks(userId);
    
    expect(tasks.length).toBe(4);
    expect(tasks[0]).toMatchObject({
      vip_level: 2,
      earnings: 25.00 // VIP2 per-task earnings
    });
    
    // Verify tasks saved to database
    const dbTasks = await db('daily_tasks')
      .where('user_id', userId);
    expect(dbTasks.length).toBe(4);
  });

  it('should reward task completion correctly', async () => {
    // Generate tasks first
    const [task] = await db('daily_tasks')
      .insert({
        user_id: userId,
        vip_level: 2,
        task_type: 'view_product',
        task_description: 'View product details for 30 seconds',
        earnings: 25.00,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
      })
      .returning('*');

    const beforeUser = await db('users')
      .where('user_id', userId)
      .first();

    const response = await request(app)
      .post(`/api/tasks/${task.task_id}/complete`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.earnings).toBe(25.00);

    // Verify user balance updated
    const afterUser = await db('users')
      .where('user_id', userId)
      .first();
    expect(afterUser.balance).toBe(beforeUser.balance + 25.00);
    expect(afterUser.total_earnings).toBe(beforeUser.total_earnings + 25.00);

    // Verify task marked complete
    const completedTask = await db('daily_tasks')
      .where('task_id', task.task_id)
      .first();
    expect(completedTask.is_completed).toBe(true);
  });

  it('should distribute referral bonuses on task completion', async () => {
    // Setup referral network
    const inviter1 = await createUser(4); // VIP4
    const inviter2 = await createUser(3); // VIP3
    
    await db('referral_network').insert([
      { inviter_id: inviter1.user_id, invitee_id: userId, level: 1 },
      { inviter_id: inviter2.user_id, invitee_id: inviter1.user_id, level: 1 }
    ]);

    // Create task
    const [task] = await db('daily_tasks')
      .insert({
        user_id: userId,
        vip_level: 2,
        task_type: 'simulate_order',
        earnings: 25.00,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
      })
      .returning('*');

    // Complete task
    await completeTask(userId, task.task_id);

    // Verify inviter1 got 20% (5.00 Birr)
    const updatedInviter1 = await db('users')
      .where('user_id', inviter1.user_id)
      .first();
    expect(updatedInviter1.balance).toBe(5.00);

    // Verify inviter2 got 10% (2.50 Birr)
    const updatedInviter2 = await db('users')
      .where('user_id', inviter2.user_id)
      .first();
    expect(updatedInviter2.balance).toBe(2.50);
  });

  it('should prevent duplicate task completion', async () => {
    const [task] = await db('daily_tasks')
      .insert({
        user_id: userId,
        vip_level: 2,
        task_type: 'rate_item',
        earnings: 25.00,
        is_completed: true, // Already completed
        completion_date: new Date()
      })
      .returning('*');

    const response = await request(app)
      .post(`/api/tasks/${task.task_id}/complete`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/already completed/i);
  });

  async function createUser(vipLevel: number) {
    const [user] = await db('users')
      .insert({
        phone_number: `+251911${Math.floor(1000 + Math.random() * 9000)}`,
        password_hash: 'hashed_password',
        invite_code: `INV${Math.random().toString(36).substr(2, 8)}`,
        vip_level: vipLevel,
        vip_amount: [0, 1200, 3000, 6000, 12000][vipLevel]
      })
      .returning('*');
    return user;
  }
});