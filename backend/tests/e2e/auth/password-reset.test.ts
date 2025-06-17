// backend/tests/integration/auth/password-reset.test.ts
import request from 'supertest';
import { app } from '../../../src/app';
import { createTestUser } from '../../test-utils';
import { User } from '../../../src/models/User';
import { redisClient } from '../../../src/config/redis';

describe('Password Reset Flow', () => {
  let testUser: User;

  beforeAll(async () => {
    testUser = await createTestUser({
      phone_number: '+251911223355',
      email: 'testreset@example.com',
      password: 'originalPassword'
    });
  });

  afterAll(async () => {
    await testUser.destroy();
    await redisClient.quit();
  });

  describe('POST /api/v1/auth/password/reset-request', () => {
    it('should initiate password reset via phone', async () => {
      const response = await request(app)
        .post('/api/v1/auth/password/reset-request')
        .send({ identifier: '+251911223355' })
        .expect(200);

      expect(response.body.message).toBe('Reset code sent');
    });

    it('should initiate password reset via email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/password/reset-request')
        .send({ identifier: 'testreset@example.com' })
        .expect(200);

      expect(response.body.message).toBe('Reset code sent');
    });
  });

  describe('POST /api/v1/auth/password/reset-confirm', () => {
    it('should successfully reset password with valid code', async () => {
      // Mock the reset code in Redis
      await redisClient.set(`pwd_reset:${testUser.user_id}`, '123456');

      const response = await request(app)
        .post('/api/v1/auth/password/reset-confirm')
        .send({
          user_id: testUser.user_id,
          code: '123456',
          new_password: 'newSecurePassword123'
        })
        .expect(200);

      expect(response.body.message).toBe('Password updated successfully');
    });

    it('should fail with invalid reset code', async () => {
      const response = await request(app)
        .post('/api/v1/auth/password/reset-confirm')
        .send({
          user_id: testUser.user_id,
          code: 'wrongcode',
          new_password: 'newSecurePassword123'
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid reset code');
    });
  });
});