// backend/tests/integration/auth/user-login.test.ts
import request from 'supertest';
import { app } from '../../../src/app';
import { createTestUser, deleteTestUser } from '../../test-utils';
import { User } from '../../../src/models/User';

describe('User Authentication Flow', () => {
  let testUser: User;

  beforeAll(async () => {
    testUser = await createTestUser({
      phone_number: '+251911223344',
      password: 'securePassword123',
      vip_level: 0
    });
  });

  afterAll(async () => {
    await deleteTestUser(testUser.user_id);
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid phone and password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          identifier: '+251911223344',
          password: 'securePassword123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toMatchObject({
        phone_number: '+251911223344',
        vip_level: 0
      });
    });

    it('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          identifier: '+251911223344',
          password: 'wrongPassword'
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should lock account after 5 failed attempts', async () => {
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/v1/auth/login')
          .send({
            identifier: '+251911223344',
            password: 'wrongPassword'
          });
      }

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          identifier: '+251911223344',
          password: 'securePassword123'
        })
        .expect(403);

      expect(response.body.error).toBe('Account locked');
    });
  });

  describe('POST /api/v1/auth/2fa/verify', () => {
    it('should verify 2FA code for enabled users', async () => {
      // Setup 2FA for test user first
      await testUser.update({ two_factor_enabled: true, two_factor_secret: 'test-secret' });

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          identifier: '+251911223344',
          password: 'securePassword123'
        })
        .expect(202); // 2FA required

      const verifyResponse = await request(app)
        .post('/api/v1/auth/2fa/verify')
        .set('Authorization', `Bearer ${login.body.tempToken}`)
        .send({ code: '123456' }) // Mocked in your 2FA service
        .expect(200);

      expect(verifyResponse.body).toHaveProperty('token');
    });
  });
});