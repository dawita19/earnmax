import request from 'supertest';
import app from '../../../src/app';
import db from '../../../src/db';
import {
  calculateReferralBonus,
  updateReferralNetwork
} from '../../../src/services/referralService';

describe('Referral System', () => {
  let inviter: any;
  let level1Invitee: any;
  let level2Invitee: any;

  beforeAll(async () => {
    await db.migrate.latest();
    
    // Create test users
    inviter = await createUser(5); // VIP level 5
    level1Invitee = await createUser(3, inviter.user_id);
    level2Invitee = await createUser(2, level1Invitee.user_id);
  });

  it('should calculate correct referral bonuses', () => {
    const purchaseAmount = 21000; // VIP level 5 purchase
    
    // Level 1 (20%)
    expect(calculateReferralBonus(1, purchaseAmount)).toBe(4200);
    
    // Level 2 (10%)
    expect(calculateReferralBonus(2, purchaseAmount)).toBe(2100);
    
    // Level 3 (5%)
    expect(calculateReferralBonus(3, purchaseAmount)).toBe(1050);
    
    // Level 4 (2%)
    expect(calculateReferralBonus(4, purchaseAmount)).toBe(420);
  });

  it('should build 4-level referral network', async () => {
    const newUser = await createUser(0, level2Invitee.user_id);
    
    await updateReferralNetwork(newUser.user_id, level2Invitee.user_id);

    // Verify all levels created
    const network = await db('referral_network')
      .where('invitee_id', newUser.user_id)
      .orderBy('level');

    expect(network.length).toBe(3);
    expect(network[0]).toMatchObject({
      inviter_id: level2Invitee.user_id,
      level: 1
    });
    expect(network[1]).toMatchObject({
      inviter_id: level1Invitee.user_id,
      level: 2
    });
    expect(network[2]).toMatchObject({
      inviter_id: inviter.user_id,
      level: 3
    });
  });

  it('should distribute bonuses on purchase', async () => {
    const purchaseAmount = 6000; // VIP level 3
    const sourceId = 123; // Mock purchase ID
    
    // Process bonuses for all levels
    await db('referral_bonuses').insert([
      {
        inviter_id: inviter.user_id,
        invitee_id: level1Invitee.user_id,
        level: 1,
        amount: calculateReferralBonus(1, purchaseAmount),
        source: 'purchase',
        source_id: sourceId
      },
      {
        inviter_id: level1Invitee.user_id,
        invitee_id: level2Invitee.user_id,
        level: 2,
        amount: calculateReferralBonus(2, purchaseAmount),
        source: 'purchase',
        source_id: sourceId
      }
    ]);

    // Verify inviter stats updated
    const updatedInviter = await db('users')
      .where('user_id', inviter.user_id)
      .first();
    
    expect(updatedInviter.total_referral_bonus).toBe(4200);
    expect(updatedInviter.balance).toBe(4200);
    expect(updatedInviter.first_level_invites).toBe(1);
  });

  it('should award weekly bonus for active referrers', async () => {
    // Add 5+ level 1 invites to qualify for 10% bonus
    await db('users')
      .where('user_id', inviter.user_id)
      .update({ first_level_invites: 8 });

    const weeklyBonus = await calculateWeeklyBonus(inviter.user_id);
    expect(weeklyBonus).toBe(inviter.vip_amount * 0.1); // 10% of VIP amount
  });

  async function createUser(vipLevel: number, inviterId?: number) {
    const [user] = await db('users')
      .insert({
        phone_number: `+251911${Math.floor(1000 + Math.random() * 9000)}`,
        password_hash: 'hashed_password',
        invite_code: `INV${Math.random().toString(36).substr(2, 8)}`,
        vip_level: vipLevel,
        vip_amount: [0, 1200, 3000, 6000, 12000, 21000][vipLevel],
        inviter_id: inviterId || null
      })
      .returning('*');
    return user;
  }

  async function calculateWeeklyBonus(userId: number) {
    const user = await db('users')
      .where('user_id', userId)
      .first();
    
    if (user.first_level_invites >= 20) return user.vip_amount * 0.25;
    if (user.first_level_invites >= 15) return user.vip_amount * 0.20;
    if (user.first_level_invites >= 10) return user.vip_amount * 0.15;
    if (user.first_level_invites >= 5) return user.vip_amount * 0.10;
    return 0;
  }
});