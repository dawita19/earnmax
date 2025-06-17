import { z } from 'zod';
import { VIP_LEVELS } from '....constantsvip-levels';

export const withdrawalRequestSchema = (currentVipLevel number) = {
  const vipData = VIP_LEVELS[currentVipLevel];
  
  return z.object({
    amount z.number()
      .positive('Withdrawal amount must be positive')
      .min(vipData.minWithdrawal, `Minimum withdrawal for VIP ${currentVipLevel} is ${vipData.minWithdrawal}`)
      .max(vipData.maxTotalWithdrawal, `Maximum total withdrawal for VIP ${currentVipLevel} is ${vipData.maxTotalWithdrawal}`),
    paymentMethod z.enum(['bank', 'mobile_money', 'crypto']),
    securityPin z.string()
      .length(4, 'Security PIN must be 4 digits')
      .regex(^d+$, 'Security PIN must contain only numbers')
  });
};

export const withdrawalMethodSchema = z.object({
  methodType z.enum(['bank', 'mobile_money', 'crypto']),
  accountDetails z.object({
    name z.string().min(2, 'Account name is required'),
    number z.string().min(4, 'Account number is required'),
    additionalInfo z.string().optional()
  })
});