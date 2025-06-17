// backend/tests/unit/utils/withdrawal-validation.util.test.ts
import { validateWithdrawal } from '../../../src/utils/withdrawal-validation.util';
import { User } from '../../../src/entities/user.entity';
import { VIPLevel } from '../../../src/constants/vip.constants';

describe('Withdrawal Validation', () => {
  const mockVIP0User = new User({
    vip_level: VIPLevel.LEVEL_0,
    balance: 100,
    total_withdrawn: 0
  });

  const mockVIP1User = new User({
    vip_level: VIPLevel.LEVEL_1,
    balance: 5000,
    total_withdrawn: 2000
  });

  it('should enforce VIP0 withdrawal limits', () => {
    // VIP0 max total withdrawal is 300
    const user = { ...mockVIP0User, total_withdrawn: 300 };
    const result = validateWithdrawal(user, 50);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch('maximum withdrawal');
  });

  it('should validate minimum withdrawal amounts', () => {
    // VIP1 min withdrawal is 40
    const result = validateWithdrawal(mockVIP1User, 30);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch('Minimum withdrawal');
  });

  it('should check available balance', () => {
    const result = validateWithdrawal(mockVIP1User, 6000);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch('Insufficient balance');
  });
});