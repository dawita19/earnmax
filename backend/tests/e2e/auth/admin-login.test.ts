// backend/tests/integration/auth/admin-login.test.ts
import request from 'supertest';
import { app } from '../../../src/app';
import { createTestAdmin } from '../../test-utils';
import { Admin } from '../../../src/models/Admin';

describe('Admin Authentication Flow', () => {
  let testAdmin: Admin;

  beforeAll(async () => {
    testAdmin = await createTestAdmin({
      username: 'testadmin',
      password: 'adminSecurePass123',
      admin_level: 'high'
    });
  });

  afterAll(async () => {
    await testAdmin.destroy();
  });

  describe('POST /api/v1/admin/auth/login', () => {
    it('should authenticate high-level admin with correct credentials', async () => {
      const response = await request(app)
        .post('/api/v1/admin/auth/login')
        .send({
          username: 'testadmin',
          password: 'adminSecurePass123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.admin).toMatchObject({
        username: 'testadmin',
        admin_level: 'high'
      });
    });

    it('should fail for non-existent admin', async () => {
      const response = await request(app)
        .post('/api/v1/admin/auth/login')
        .send({
          username: 'nonexistent',
          password: 'anypassword'
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should enforce IP whitelist for high-level admins', async () => {
      // Mock IP address
      process.env.HIGH_ADMIN_IP_WHITELIST = '192.168.1.1';

      const response = await request(app)
        .post('/api/v1/admin/auth/login')
        .set('X-Forwarded-For', '192.168.1.2')
        .send({
          username: 'testadmin',
          password: 'adminSecurePass123'
        })
        .expect(403);

      expect(response.body.error).toBe('Access restricted from this IP');
    });
  });
});