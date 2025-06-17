import { renderHook, act } from '@testing-library/react-hooks';
import { useReferralBonus } from '../../hooks/useReferralBonus';
import { BonusTier } from '../../types';

describe('useReferralBonus hook', () => {
  const mockUserId = 'user123';
  const mockTiers: BonusTier[] = [
    { minInvites: 5, maxInvites: 10, percentage: 10 },
    { minInvites: 10, maxInvites: 15, percentage: 15 }
  ];

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ firstLevelInvites: 8 }),
      })
    ) as jest.Mock;
  });

  it('calculates correct bonus for tier 1', async () => {
    const { result, waitForNextUpdate } = renderHook(() => 
      useReferralBonus(mockUserId, mockTiers, 1000)
    );

    await waitForNextUpdate();

    expect(result.current.bonus).toBe(100); // 10% of 1000
    expect(result.current.tier).toBe(0);
  });

  it('updates when purchase amount changes', async () => {
    const { result, rerender, waitForNextUpdate } = renderHook(
      ({ amount }) => useReferralBonus(mockUserId, mockTiers, amount),
      { initialProps: { amount: 1000 } }
    );

    await waitForNextUpdate();
    expect(result.current.bonus).toBe(100);

    rerender({ amount: 2000 });
    expect(result.current.bonus).toBe(200);
  });
});