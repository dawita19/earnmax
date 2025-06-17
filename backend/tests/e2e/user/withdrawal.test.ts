import request from 'supertest';
import app from '../../../src/app';
import db from '../../../src/db';
import {
  processWithdrawal,
  checkWithdrawalLimits
} from '../../../src/services/withdrawalService';

describe('Withdrawal System', () => {
  let userToken: string;
  let userId: number;
  let adminToken: string;

  beforeAll(async () => {
    await db.migrate.latest();
    await db.seed.run();

    // Create test user with VIP level 3
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        phone_number: '+251911225555',
        password: 'withdrawalPass'
      });
    
    userId = userRes.body.user_id;
    userToken = userRes.body.token;

    await db('users')
      .where('user_id', userId)
      .update({
        vip_level: 3,
        vip_amount: 6000,
        balance: 5000
      });

    // Admin login
    const adminRes = await request(app)
      .post('/api/auth/admin/login')
      .send({
        username: 'lowlevel_admin',
        password: 'adminPass123'
      });
    adminToken = adminRes.body.token;
  });

  it('should enforce VIP withdrawal limits', () => {
    const user = {
      vip_level: 3,
      total_withdrawn: 15000,
      balance: 10000
    };

    // VIP 3 limits: min 200, max 24000 total
    const validWithdrawal = checkWithdrawalLimits(user, 1000);
    expect(validWithdrawal.valid).toBe(true);

    const belowMin = checkWithdrawalLimits(user, 150);
    expect(belowMin.valid).toBe(false);
    expect(belowMin.message).toMatch(/minimum withdrawal/i);

    const aboveMax = checkWithdrawalLimits(user, 10000);
    expect(aboveMax.valid).toBe(false);
    expect(aboveMax.message).toMatch(/maximum total withdrawal/i);
  });

  it('should create withdrawal request', async () => {
    const response = await request(app)
      .post('/api/withdrawals')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        amount: 2000,
        payment_method: 'telebirr',
        payment_details: '0911225555'
      });

    expect(response.status).toBe(202);
    expect(response.body.status).toBe('pending');

    // Verify request appears in admin queue
    const adminView = await request(app)
      .get('/api/admin/withdrawal-requests')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminView.body.requests.some(
      (r: any) => r.user_id === userId
    )).toBe(true);
  });

  it('should process approved withdrawal', async () => {
    // Create pending request
    const [requestId] = await db('withdrawal_requests')
      .insert({
        user_id: userId,
        amount: 1000,
        payment_method: 'telebirr',
        payment_details: '0911225555',
        status: 'pending'
      })
      .returning('request_id');

    // Admin approves
    const approveRes = await request(app)
      .patch(`/api/admin/withdrawal-requests/${requestId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'approved' });

    expect(approveRes.status).toBe(200);

    // Verify user balance updated
    const user = await db('users')
      .where('user_id', userId)
      .first();
    expect(user.balance).toBe(4000); // Initial 5000 - 1000
    expect(user.total_withdrawn).toBe(1000);

    // Verify request marked as approved
    const request = await db('withdrawal_requests')
      .where('request_id', requestId)
      .first();
    expect(request.status).toBe('approved');
  });

  it('should require VIP upgrade when limits reached', async () => {
    // Set user at withdrawal limit
    await db('users')
      .where('user_id', userId)
      .update({ total_withdrawn: 23000 }); // Near VIP3 max of 24000

    const response = await request(app)
      .post('/api/withdrawals')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        amount: 2000,
        payment_method: 'telebirr'
      });

    expect(response.status).toBe(403);
    expect(response.body.error).toMatch(/upgrade required/i);
    expect(response.body.suggestedLevel).toBe(4); // Next VIP level
  });

  it('should prevent withdrawals when balance insufficient', async () => {
    const response = await request(app)
      .post('/api/withdrawals')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        amount: 6000, // User has 4000 after previous tests
        payment_method: 'telebirr'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/insufficient balance/i);
  });
});