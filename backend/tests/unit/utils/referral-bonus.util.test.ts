// backend/tests/unit/utils/referral-bonus.util.test.ts
import { calculateReferralBonuses } from '../../../src/utils/referral-bonus.util';
import { User } from '../../../src/entities/user.entity';

describe('Referral Bonus Calculations', () => {
  const mockInviterChain = [
    new User({ user_id: 1, inviter_id: null }),
    new User({ user_id: 2, inviter_id: 1 }),
    new User({ user_id: 3, inviter_id: 2 }),
    new User({ user_id: 4, inviter_id: 3 }),
  ];

  it('should calculate 4-level bonuses correctly for purchase', () => {
    const amount = 1200; // VIP Level 1 purchase
    const result = calculateReferralBonuses(mockInviterChain, amount, 'purchase');
    
    expect(result).toEqual([
      { inviter_id: 1, amount: 240, level: 1 },  // 20% of 1200
      { inviter_id: 2, amount: 120, level: 2 },  // 10% of 1200
      { inviter_id: 3, amount: 60, level: 3 },   // 5% of 1200
      { inviter_id: 4, amount: 24, level: 4 }    // 2% of 1200
    ]);
  });

  it('should handle incomplete referral chains', () => {
    const shortChain = mockInviterChain.slice(0, 2);
    const result = calculateReferralBonuses(shortChain, 1200, 'purchase');
    
    expect(result.length).toBe(2);
  });
});