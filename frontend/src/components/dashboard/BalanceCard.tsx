// src/components/dashboard/BalanceCard.tsx
import { useEffect, useState } from 'react';
import { CountUp } from 'use-count-up';
import { useEarnings } from '@/hooks/useEarnings';

export const BalanceCard = () => {
  const { balance, totalEarnings } = useEarnings();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false);
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <h2 className="text-gray-500 font-medium">Available Balance</h2>
      <div className="mt-2">
        {isVisible && (
          <CountUp
            isCounting
            end={balance}
            duration={1.5}
            thousandsSeparator=","
            decimalSeparator="."
            prefix="ETB "
            className="text-3xl font-bold text-gray-800"
          />
        )}
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex justify-between">
          <span className="text-gray-500">Total Earnings:</span>
          <span className="font-medium">
            ETB {totalEarnings.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-gray-500">Withdrawable:</span>
          <span className="font-medium text-green-600">
            ETB {(balance).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};