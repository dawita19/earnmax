import { User, Admin, VIPPurchaseRequest } from '../../src/models';
import app from '../../src/app';
import request from 'supertest';

export async function createTestUser(overrides = {}) {
  const userData = {
    full_name: 'Test User',
    phone: `+2519${Math.floor(10000000 + Math.random() * 90000000)}`,
    password: 'testPassword',
    invite_code: `TEST${Math.random().toString(36).substring(2, 8)}`,
    ...overrides
  };

  const user = await User.create(userData);
  
  if (userData.vip_level > 0) {
    await VIPPurchaseRequest.create({
      user_id: user.id,
      vip_level: userData.vip_level,
      status: 'approved'
    });
  }

  // Get auth token
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ phone: userData.phone, password: userData.password });
  
  return { ...user.toJSON(), token: loginRes.body.token };
}

export async function createAdminUser(overrides = {}) {
  const adminData = {
    username: `admin_${Math.random().toString(36).substring(2, 8)}`,
    password: 'adminPassword',
    email: `admin${Math.random().toString(36).substring(2, 8)}@earnmax.com`,
    admin_level: 'low',
    ...overrides
  };

  const admin = await Admin.create(adminData);
  return admin;
}

export async function createReferralNetwork(depth = 4) {
  const rootUser = await createTestUser();
  const level1Users = [];
  
  for (let i = 0; i < depth; i++) {
    const inviter = i === 0 ? rootUser : level1Users[i-1];
    const user = await createTestUser({ 
      inviter_id: inviter.id,
      phone: `+2519${Math.floor(10000000 + Math.random() * 90000000)}`
    });
    level1Users.push(user);
  }
  
  return { root: rootUser, level1: level1Users };
}