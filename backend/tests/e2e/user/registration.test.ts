import request from 'supertest';
import app from '../../../src/app';
import db from '../../../src/db';
import { 
  generateInviteCode, 
  hashPassword 
} from '../../../src/services/userService';

describe('User Registration', () => {
  beforeAll(async () => {
    await db.migrate.latest();
    await db.seed.run();
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should register new user with valid invitation code', async () => {
    const inviter = await db('users')
      .insert({
        phone_number: '+251911223344',
        password_hash: await hashPassword('validPass123'),
        invite_code: generateInviteCode()
      })
      .returning('*');

    const response = await request(app)
      .post('/api/users/register')
      .send({
        full_name: 'Test User',
        phone_number: '+251911223355',
        email: 'test@earnmax.com',
        password: 'securePassword123',
        inviter_code: inviter[0].invite_code,
        ip_address: '192.168.1.1'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('user_id');
    
    // Verify referral network was created
    const referral = await db('referral_network')
      .where('invitee_id', response.body.user_id)
      .first();
    expect(referral).toBeTruthy();
    expect(referral.level).toBe(1);
  });

  it('should prevent duplicate phone/email registration', async () => {
    const existingUser = {
      phone_number: '+251911223366',
      email: 'existing@earnmax.com',
      password_hash: await hashPassword('existingPass'),
      invite_code: generateInviteCode()
    };
    
    await db('users').insert(existingUser);

    const response = await request(app)
      .post('/api/users/register')
      .send({
        full_name: 'Duplicate User',
        phone_number: existingUser.phone_number,
        email: existingUser.email,
        password: 'newPassword123',
        inviter_code: 'INV12345'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/already registered/i);
  });

  it('should prevent registration from same IP for VIP0', async () => {
    const firstUser = await request(app)
      .post('/api/users/register')
      .send({
        full_name: 'First User',
        phone_number: '+251911223377',
        password: 'firstPass123',
        ip_address: '192.168.1.100'
      });

    const secondUser = await request(app)
      .post('/api/users/register')
      .send({
        full_name: 'Second User',
        phone_number: '+251911223388',
        password: 'secondPass123',
        ip_address: '192.168.1.100'
      });

    expect(secondUser.status).toBe(403);
    expect(secondUser.body.error).toMatch(/multiple VIP0 accounts/i);
  });
});