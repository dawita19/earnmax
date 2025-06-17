import request from 'supertest';
import app from '../../src/app';
import { createTestUser, createReferralNetwork } from '../helpers';

describe('Referral API Tests', () => {
  let rootUser: any;
  let level1Users: any[] = [];
  let authToken: string;

  beforeAll(async () => {
    // Create 4-level deep referral network
    const { root, level1 } = await createReferralNetwork(4);
    rootUser = root;
    level1Users = level1;
    
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ phone: rootUser.phone, password: 'testPassword' });
    authToken = loginRes.body.token;
  });

  describe('Referral Network', () => {
    it('should fetch complete referral tree', async () => {
      const res = await request(app)
        .get('/api/referrals/network')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(4); // 4 levels
      expect(res.body.data[0].invitees).toHaveLength(level1Users.length);
    });
  });

  describe('Referral Bonuses', () => {
    it('should calculate bonuses on VIP purchase', async () => {
      // Simulate VIP purchase by level 1 user
      const purchaseRes = await request(app)
        .post('/api/vip/purchase')
        .set('Authorization', `Bearer ${level1Users[0].token}`)
        .send({
          vip_level: 1,
          payment_proof: 'test_proof.jpg'
        });
      
      // Check root user's bonus
      const bonusRes = await request(app)
        .get('/api/referrals/bonuses')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(bonusRes.body.data.some((b: any) => 
        b.amount === 240 && b.source === 'purchase')).toBeTruthy(); // 20% of 1200
    });
  });

  describe('Weekly Bonus Calculation', () => {
    it('should award weekly bonus for active referrers', async () => {
      // Create 5 level-1 referrals to qualify for bonus
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/users/register')
          .send({
            full_name: `Bonus Test ${i}`,
            phone: `+251911000${i}`,
            password: 'test123',
            invite_code: rootUser.invite_code
          });
      }
      
      // Trigger weekly bonus job
      const res = await request(app)
        .post('/api/referrals/process-bonuses')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('bonus_payments');
    });
  });
});