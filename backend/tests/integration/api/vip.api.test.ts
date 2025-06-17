import request from 'supertest';
import app from '../../src/app';
import { createTestUser, createAdminUser } from '../helpers';
import { VIP_LEVELS } from '../../src/constants';

describe('VIP API Tests', () => {
  let userToken: string;
  let adminToken: string;
  let userId: number;

  beforeAll(async () => {
    const user = await createTestUser({ vip_level: 0, balance: 5000 });
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

  describe('VIP Purchase Flow', () => {
    it('should submit VIP purchase request', async () => {
      const res = await request(app)
        .post('/api/vip/purchase')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          vip_level: 1,
          payment_proof: 'test_proof.jpg'
        });
      
      expect(res.status).toBe(202);
      expect(res.body.data).toHaveProperty('request_id');
    });

    it('should process VIP upgrade (admin)', async () => {
      // First approve the purchase
      const purchaseRes = await request(app)
        .post('/api/vip/approve')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          user_id: userId,
          vip_level: 1
        });
      
      expect(purchaseRes.status).toBe(200);
      
      // Verify upgrade
      const userRes = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(userRes.body.data.vip_level).toBe(1);
    });
  });

  describe('VIP Level Constraints', () => {
    it('should enforce minimum balance for upgrades', async () => {
      const res = await request(app)
        .post('/api/vip/upgrade')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          new_level: 2 // Requires 3,000 but user only has 5,000 - 1,200 = 3,800
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/insufficient balance/i);
    });
  });
});