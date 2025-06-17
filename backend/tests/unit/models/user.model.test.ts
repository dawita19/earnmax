import { User } from '../../src/models/user.model';
import db from '../../src/config/database';

describe('User Model', () => {
  beforeAll(async () => {
    await db.sync({ force: true });
  });

  describe('Referral Hierarchy', () => {
    test('should correctly track 4-level referrals', async () => {
      const rootUser = await User.create({
        full_name: 'Root User',
        phone_number: '+1234567890',
        password_hash: 'hashed123',
        invite_code: 'ROOT123'
      });

      // Create 4 levels of referrals
      const level1 = await User.create({
        full_name: 'Level 1',
        phone_number: '+1111111111',
        password_hash: 'hashed111',
        invite_code: 'LVL111',
        inviter_id: rootUser.user_id
      });

      const level2 = await User.create({
        full_name: 'Level 2',
        phone_number: '+2222222222',
        password_hash: 'hashed222',
        invite_code: 'LVL222',
        inviter_id: level1.user_id
      });

      const level3 = await User.create({
        full_name: 'Level 3',
        phone_number: '+3333333333',
        password_hash: 'hashed333',
        invite_code: 'LVL333',
        inviter_id: level2.user_id
      });

      const level4 = await User.create({
        full_name: 'Level 4',
        phone_number: '+4444444444',
        password_hash: 'hashed444',
        invite_code: 'LVL444',
        inviter_id: level3.user_id
      });

      // Verify referral counts
      await rootUser.reload();
      expect(rootUser.first_level_invites).toBe(1);
      expect(rootUser.second_level_invites).toBe(1);
      expect(rootUser.third_level_invites).toBe(1);
      expect(rootUser.fourth_level_invites).toBe(1);
      expect(rootUser.total_invites).toBe(4);
    });
  });

  describe('VIP Status', () => {
    test('should prevent duplicate VIP0 with same phone/email/IP', async () => {
      const user1 = await User.create({
        full_name: 'Test User',
        phone_number: '+5555555555',
        email: 'test@example.com',
        password_hash: 'hashed555',
        invite_code: 'TEST55',
        ip_address: '192.168.1.1',
        vip_level: 0
      });

      await expect(User.create({
        full_name: 'Duplicate User',
        phone_number: '+5555555555',
        email: 'test@example.com',
        password_hash: 'hashed555',
        invite_code: 'DUPE55',
        ip_address: '192.168.1.1',
        vip_level: 0
      })).rejects.toThrow();
    });
  });
});