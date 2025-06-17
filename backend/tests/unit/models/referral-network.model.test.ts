import { ReferralNetwork, User } from '../../src/models';
import db from '../../src/config/database';

describe('Referral Network Model', () => {
  beforeAll(async () => {
    await db.sync({ force: true });
  });

  test('should maintain correct referral relationships', async () => {
    const [user1, user2, user3, user4] = await Promise.all([
      User.create({
        full_name: 'User 1',
        phone_number: '+1111111111',
        password_hash: 'hash1',
        invite_code: 'USER1'
      }),
      User.create({
        full_name: 'User 2',
        phone_number: '+2222222222',
        password_hash: 'hash2',
        invite_code: 'USER2',
        inviter_id: 1
      }),
      User.create({
        full_name: 'User 3',
        phone_number: '+3333333333',
        password_hash: 'hash3',
        invite_code: 'USER3',
        inviter_id: 2
      }),
      User.create({
        full_name: 'User 4',
        phone_number: '+4444444444',
        password_hash: 'hash4',
        invite_code: 'USER4',
        inviter_id: 3
      })
    ]);

    const relations = await ReferralNetwork.findAll();
    expect(relations).toHaveLength(3);
    
    expect(relations[0].inviter_id).toBe(user1.user_id);
    expect(relations[0].invitee_id).toBe(user2.user_id);
    expect(relations[0].level).toBe(1);
    
    expect(relations[1].inviter_id).toBe(user1.user_id);
    expect(relations[1].invitee_id).toBe(user3.user_id);
    expect(relations[1].level).toBe(2);
    
    expect(relations[2].inviter_id).toBe(user1.user_id);
    expect(relations[2].invitee_id).toBe(user4.user_id);
    expect(relations[2].level).toBe(3);
  });
});