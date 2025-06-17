import React, { useRef, useEffect, useState, useCallback } from 'react';

type OTPInputProps = {
  length?: number;
  onChange: (otp: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  error?: boolean;
  onComplete?: () => void;
};

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onChange,
  autoFocus = true,
  disabled = false,
  error = false,
  onComplete
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = useCallback(
    (index: number, value: string) => {
      if (disabled) return;

      const newOtp = [...otp];
      
      // Only allow numeric input
      if (/^[0-9]$/.test(value)) {
        newOtp[index] = value;
      } else if (value === '') {
        newOtp[index] = '';
      } else {
        return;
      }

      setOtp(newOtp);

      // Combine OTP and notify parent
      const combinedOtp = newOtp.join('');
      onChange(combinedOtp);

      // Auto-focus next input
      if (value && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Notify completion
      if (combinedOtp.length === length && onComplete) {
        onComplete();
      }
    },
    [otp, length, onChange, onComplete, disabled]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text/plain').slice(0, length);
      
      if (/^[0-9]+$/.test(pastedData)) {
        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length && i < length; i++) {
          newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);
        onChange(newOtp.join(''));
        
        // Focus last filled input
        const lastFilledIndex = Math.min(pastedData.length, length - 1);
        inputRefs.current[lastFilledIndex]?.focus();
        
        if (pastedData.length === length && onComplete) {
          onComplete();
        }
      }
    },
    [length, otp, onChange, onComplete]
  );

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  return (
    <div className="flex justify-center space-x-2">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={otp[index]}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`w-12 h-12 text-2xl text-center border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
      ))}
    </div>
  );
};