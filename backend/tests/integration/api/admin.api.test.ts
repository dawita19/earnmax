import request from 'supertest';
import app from '../../src/app';
import { createAdminUser, createTestUser } from '../helpers';

describe('Admin API Tests', () => {
  let adminToken: string;
  let highLevelToken: string;
  let testUserId: number;

  beforeAll(async () => {
    const admin = await createAdminUser({ level: 'low' });
    const loginRes = await request(app)
      .post('/api/auth/admin/login')
      .send({ username: admin.username, password: 'adminPassword' });
    adminToken = loginRes.body.token;

    const highAdmin = await createAdminUser({ level: 'high' });
    const highLogin = await request(app)
      .post('/api/auth/admin/login')
      .send({ username: highAdmin.username, password: 'adminPassword' });
    highLevelToken = highLogin.body.token;

    const user = await createTestUser();
    testUserId = user.id;
  });

  describe('Admin Permissions', () => {
    it('should restrict low-level admin from sensitive actions', async () => {
      const res = await request(app)
        .post('/api/admin/system/update-settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ withdrawal_fee: 5 });
      
      expect(res.status).toBe(403);
    });

    it('should allow high-level admin system changes', async () => {
      const res = await request(app)
        .post('/api/admin/system/update-settings')
        .set('Authorization', `Bearer ${highLevelToken}`)
        .send({ withdrawal_fee: 5 });
      
      expect(res.status).toBe(200);
    });
  });

  describe('Request Distribution', () => {
    it('should distribute requests round-robin to admins', async () => {
      // Create multiple test requests
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/withdrawals')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            user_id: testUserId,
            amount: 100 + (i * 50),
            payment_method: 'bank'
          });
      }
      
      // Check distribution
      const res = await request(app)
        .get('/api/admin/requests/assigned')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.body.data).toHaveLength(1); // This admin should get 1 of 3
    });
  });

  describe('User Management', () => {
    it('should suspend users with audit trail', async () => {
      const res = await request(app)
        .post(`/api/admin/users/${testUserId}/suspend`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Test suspension' });
      
      expect(res.status).toBe(200);
      
      // Verify audit log
      const auditRes = await request(app)
        .get('/api/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ user_id: testUserId });
      
      expect(auditRes.body.data.some((log: any) => 
        log.action_type === 'user_suspension')).toBeTruthy();
    });
  });
});