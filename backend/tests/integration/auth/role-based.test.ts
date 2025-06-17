import request from 'supertest';
import { app } from '../../../src/app';
import { PrismaClient } from '@prisma/client';
import { hash } from 'argon2';

const prisma = new PrismaClient();

describe('Role-Based Access Control', () => {
  let highLevelAdminToken: string;
  let lowLevelAdminToken: string;
  let userToken: string;

  beforeAll(async () => {
    // Setup test data
    await prisma.admin.createMany({
      data: [
        {
          username: 'high_admin',
          password_hash: await hash('HighPass123!'),
          email: 'high@earnmax.com',
          admin_level: 'high',
          permissions: { all: ['full'] }
        },
        {
          username: 'low_admin',
          password_hash: await hash('LowPass123!'),
          email: 'low@earnmax.com',
          admin_level: 'low',
          permissions: { requests: ['approve'] }
        }
      ]
    });

    await prisma.user.create({
      data: {
        phone_number: '+251911223377',
        password_hash: await hash('UserPass123!'),
        invite_code: 'USER123',
        full_name: 'Test User'
      }
    });

    // Get tokens
    highLevelAdminToken = (await request(app)
      .post('/api/v1/auth/admin/login')
      .send({ username: 'high_admin', password: 'HighPass123!' })).body.token;

    lowLevelAdminToken = (await request(app)
      .post('/api/v1/auth/admin/login')
      .send({ username: 'low_admin', password: 'LowPass123!' })).body.token;

    userToken = (await request(app)
      .post('/api/v1/auth/user/login')
      .send({ identifier: '+251911223377', password: 'UserPass123!' })).body.token;
  });

  afterAll(async () => {
    await prisma.admin.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('Admin Level Restrictions', () => {
    it('should allow high-level admin to access system settings', async () => {
      const response = await request(app)
        .get('/api/v1/admin/system-settings')
        .set('Authorization', `Bearer ${highLevelAdminToken}`);

      expect(response.status).toBe(200);
    });

    it('should prevent low-level admin from accessing system settings', async () => {
      const response = await request(app)
        .get('/api/v1/admin/system-settings')
        .set('Authorization', `Bearer ${lowLevelAdminToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('User Role Restrictions', () => {
    it('should prevent users from accessing admin routes', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });

    it('should prevent admins from accessing user VIP routes', async () => {
      const response = await request(app)
        .post('/api/v1/user/vip/purchase')
        .set('Authorization', `Bearer ${highLevelAdminToken}`)
        .send({ level: 1 });

      expect(response.status).toBe(403);
    });
  });

  describe('Round-Robin Request Distribution', () => {
    it('should distribute withdrawal requests evenly among low-level admins', async () => {
      // Create test withdrawal requests
      for (let i = 0; i < 5; i++) {
        await prisma.withdrawal_requests.create({
          data: {
            user_id: 1,
            amount: 100 + i,
            payment_method: 'bank',
            status: 'pending'
          }
        });
      }

      // Simulate admin processing
      const assignments = new Set();
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .get('/api/v1/admin/withdrawals/next')
          .set('Authorization', `Bearer ${lowLevelAdminToken}`);
        
        assignments.add(response.body.assigned_admin_id);
      }

      // Verify requests were distributed to multiple admins
      expect(assignments.size).toBeGreaterThan(1);
    });
  });
});