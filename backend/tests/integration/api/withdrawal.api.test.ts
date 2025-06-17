import request from 'supertest';
import app from '../../src/app';
import { createTestUser, createAdminUser } from '../helpers';

describe('Withdrawal API Tests', () => {
  let userToken: string;
  let adminToken: string;
  let userId: number;

  beforeAll(async () => {
    const user = await createTestUser({ 
      vip_level: 1, 
      balance: 2000,
      vip_amount: 1200
    });
    userId = user.id;
    
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ phone: user.phone, password: 'testPassword' });
    userToken = loginRes.body.token;

    const admin = await createAdminUser();
    const adminLogin = await request(app)
      .post('/api/auth/admin/login')
      .send({ username: admin.username, password: 'adminPassword' });
    adminToken = adminLogin.body.token;
  });

  describe('Withdrawal Validation', () => {
    it('should enforce VIP minimum withdrawal', async () => {
      const res = await request(app)
        .post('/api/withdrawals')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          amount: 30, // Below VIP1 minimum of 40
          payment_method: 'bank'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/minimum withdrawal/i);
    });

    it('should prevent exceeding withdrawal limit', async () => {
      // First successful withdrawal
      await request(app)
        .post('/api/withdrawals')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          amount: 4000, // VIP1 max is 4800
          payment_method: 'bank'
        });
      
      // Second withdrawal should fail
      const res = await request(app)
        .post('/api/withdrawals')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          amount: 1000, // Would exceed limit
          payment_method: 'bank'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/upgrade required/i);
    });
  });

  describe('Admin Approval Flow', () => {
    let withdrawalId: string;

    it('should submit withdrawal request', async () => {
      const res = await request(app)
        .post('/api/withdrawals')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          amount: 100,
          payment_method: 'bank'
        });
      
      expect(res.status).toBe(202);
      withdrawalId = res.body.data.request_id;
    });

    it('should process withdrawal (admin)', async () => {
      const res = await request(app)
        .post(`/api/admin/withdrawals/${withdrawalId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      
      // Verify user balance was deducted
      const userRes = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(userRes.body.data.balance).toBe(1900); // 2000 - 100
    });
  });
});