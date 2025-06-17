import React, { useState, useEffect } from 'react';
import { PaymentMethod as PaymentMethodType, UserPaymentDetails } from '@/types/payment';

interface PaymentMethodProps {
  userDetails: UserPaymentDetails | null;
  onSelect: (method: PaymentMethodType) => void;
  allowedMethods?: PaymentMethodType[];
  defaultMethod?: PaymentMethodType;
}

const PaymentMethod: React.FC<PaymentMethodProps> = ({
  userDetails,
  onSelect,
  allowedMethods = ['telebirr', 'cbe', 'hello-cash', 'bank'],
  defaultMethod = 'telebirr'
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>(defaultMethod);
  const [savedMethods, setSavedMethods] = useState<UserPaymentDetails[]>([]);

  useEffect(() => {
    // Load user's saved payment methods
    if (userDetails) {
      setSavedMethods([userDetails]);
    }
  }, [userDetails]);

  const handleMethodChange = (method: PaymentMethodType) => {
    setSelectedMethod(method);
    onSelect(method);
  };

  const renderMethodDetails = () => {
    const method = savedMethods.find(m => m.method === selectedMethod);
    if (!method) return null;

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium">Saved {method.method.toUpperCase()} Details</h4>
        {method.method === 'bank' ? (
          <>
            <p>Account: {method.accountNumber}</p>
            <p>Bank: {method.bankName}</p>
            <p>Branch: {method.branchName}</p>
          </>
        ) : (
          <p>Phone: {method.phoneNumber}</p>
        )}
      </div>
    );
  };

  return (
    <div className="payment-method-selector">
      <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {allowedMethods.map(method => (
          <button
            key={method}
            onClick={() => handleMethodChange(method)}
            className={`p-3 border rounded-lg transition-all ${
              selectedMethod === method
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-center">
              <img 
                src={`/assets/payment/${method}.png`} 
                alt={method} 
                className="h-8 mr-2"
              />
              <span className="capitalize">{method.replace('-', ' ')}</span>
            </div>
          </button>
        ))}
      </div>
      {renderMethodDetails()}
    </div>
  );
};

export default PaymentMethod;