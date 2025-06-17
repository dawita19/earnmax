import request from 'supertest';
import app from '../../../src/app';
import db from '../../../src/db';
import { 
  processUpgrade, 
  calculateUpgradeDifference 
} from '../../../src/services/vipService';

describe('VIP Upgrade System', () => {
  let userToken: string;
  let userId: number;
  let adminToken: string;

  beforeAll(async () => {
    await db.migrate.latest();
    await db.seed.run();

    // Create test user
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        phone_number: '+251911224444',
        password: 'userPass123'
      });
    userId = userRes.body.user_id;
    userToken = userRes.body.token;

    // Create admin user
    const adminRes = await request(app)
      .post('/api/auth/admin/login')
      .send({
        username: 'highlevel_admin',
        password: 'adminPass123'
      });
    adminToken = adminRes.body.token;
  });

  it('should calculate correct upgrade difference', () => {
    const currentLevel = 2; // 3,000 Birr
    const targetLevel = 4; // 12,000 Birr
    const difference = calculateUpgradeDifference(currentLevel, targetLevel);
    expect(difference).toBe(9000); // 12,000 - 3,000
  });

  it('should process direct upgrade with sufficient balance', async () => {
    // Add balance to user
    await db('users')
      .where('user_id', userId)
      .update({ balance: 10000, vip_level: 2, vip_amount: 3000 });

    const response = await request(app)
      .post('/api/vip/upgrade')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ target_level: 4 });

    expect(response.status).toBe(200);
    expect(response.body.new_vip_level).toBe(4);

    // Verify balance deduction
    const user = await db('users')
      .where('user_id', userId)
      .first();
    expect(user.balance).toBe(1000); // 10,000 - 9,000
  });

  it('should create upgrade request when insufficient balance', async () => {
    // Reset user to level 1 with low balance
    await db('users')
      .where('user_id', userId)
      .update({ balance: 500, vip_level: 1, vip_amount: 1200 });

    const response = await request(app)
      .post('/api/vip/upgrade')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        target_level: 3,
        payment_proof: 'base64_encoded_image'
      });

    expect(response.status).toBe(202);
    expect(response.body.status).toBe('pending');

    // Verify request exists in admin queue
    const adminView = await request(app)
      .get('/api/admin/upgrade-requests')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminView.body.requests.length).toBeGreaterThan(0);
  });

  it('should distribute referral bonuses on upgrade approval', async () => {
    // Setup referral network
    const inviter1 = await createUserWithVip(3); // Level 3 user
    const inviter2 = await createUserWithVip(2); // Level 2 user
    
    await db('referral_network').insert([
      { inviter_id: inviter1.id, invitee_id: userId, level: 1 },
      { inviter_id: inviter2.id, invitee_id: inviter1.id, level: 1 }
    ]);

    // Process upgrade
    await processUpgrade(userId, 1, 4);

    // Verify inviter1 got 20% of difference (1800 Birr)
    const updatedInviter1 = await db('users')
      .where('user_id', inviter1.id)
      .first();
    expect(updatedInviter1.total_referral_bonus).toBe(1800);

    // Verify inviter2 got 10% of difference (900 Birr)
    const updatedInviter2 = await db('users')
      .where('user_id', inviter2.id)
      .first();
    expect(updatedInviter2.total_referral_bonus).toBe(900);
  });

  async function createUserWithVip(level: number) {
    const [user] = await db('users')
      .insert({
        phone_number: `+251911${Math.floor(1000 + Math.random() * 9000)}`,
        password_hash: 'hashed_password',
        invite_code: `INV${Math.random().toString(36).substr(2, 8)}`,
        vip_level: level,
        vip_amount: [0, 1200, 3000, 6000, 12000][level]
      })
      .returning('*');
    return user;
  }
});