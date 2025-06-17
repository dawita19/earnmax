import request from 'supertest';
import app from '../../src/app';
import { createTestUser, deleteTestUser } from '../helpers';
import { User } from '../../src/models';

describe('User API Tests', () => {
  let testUser: User;
  let authToken: string;

  beforeAll(async () => {
    testUser = await createTestUser();
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ phone: testUser.phone, password: 'testPassword' });
    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    await deleteTestUser(testUser.id);
  });

  describe('GET /api/users/profile', () => {
    it('should fetch user profile with referral stats', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toMatchObject({
        user_id: testUser.id,
        vip_level: 0,
        total_earnings: 0,
        first_level_invites: 0
      });
    });
  });

  describe('POST /api/users/register', () => {
    it('should register new user with referral tracking', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          full_name: 'Referral Test',
          phone: '+251911223344',
          password: 'test123',
          invite_code: testUser.invite_code
        });
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('data.inviter_id', testUser.id);
      
      // Verify referral network was created
      const networkRes = await request(app)
        .get('/api/referrals/network')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(networkRes.body.data.some((invitee: any) => 
        invitee.phone === '+251911223344')).toBeTruthy();
    });
  });

  describe('Security Tests', () => {
    it('should prevent duplicate phone registrations', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          full_name: 'Duplicate User',
          phone: testUser.phone,
          password: 'test123'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/already registered/i);
    });
  });
});