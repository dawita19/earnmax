import { render, screen, fireEvent } from '@testing-library/react';
import { VipCard } from '../../components/VipCard';
import { VipLevel } from '../../types';

describe('VipCard Component', () => {
  const mockLevel: VipLevel = {
    level: 1,
    investment: 1200,
    dailyEarning: 40,
    minWithdrawal: 40,
    maxTotalWithdrawal: 4800,
    tasks: ['Click ad', 'Comment on promo']
  };

  it('renders VIP level information correctly', () => {
    render(<VipCard level={mockLevel} currentLevel={0} onUpgrade={() => {}} />);
    
    expect(screen.getByText('VIP Level 1')).toBeInTheDocument();
    expect(screen.getByText('1,200 Birr')).toBeInTheDocument();
    expect(screen.getByText('40 Birr/day')).toBeInTheDocument();
  });

  it('shows purchase button for non-owned levels', () => {
    render(<VipCard level={mockLevel} currentLevel={0} onUpgrade={() => {}} />);
    expect(screen.getByRole('button', { name: /purchase/i })).toBeInTheDocument();
  });

  it('shows upgrade button for next level', () => {
    render(<VipCard level={mockLevel} currentLevel={0} onUpgrade={() => {}} />);
    expect(screen.getByRole('button', { name: /upgrade/i })).toBeInTheDocument();
  });

  it('calls onUpgrade with correct level', () => {
    const mockUpgrade = jest.fn();
    render(<VipCard level={mockLevel} currentLevel={0} onUpgrade={mockUpgrade} />);
    
    fireEvent.click(screen.getByRole('button', { name: /upgrade/i }));
    expect(mockUpgrade).toHaveBeenCalledWith(1);
  });
});