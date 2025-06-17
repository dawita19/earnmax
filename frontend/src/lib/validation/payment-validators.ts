import { z } from 'zod';
import { VIP_LEVELS } from '../../constants/vip-levels';

export const paymentProofSchema = z.object({
  paymentMethod: z.enum(['bank', 'mobile_money', 'crypto']),
  transactionId: z.string()
    .min(6, 'Transaction ID must be at least 6 characters')
    .max(50, 'Transaction ID cannot exceed 50 characters'),
  amount: z.number()
    .positive('Amount must be positive')
    .min(VIP_LEVELS[0].investment, `Minimum investment is ${VIP_LEVELS[0].investment}`),
  screenshot: z.instanceof(File)
    .refine(file => file.size <= 5_000_000, 'File size must be less than 5MB')
    .refine(file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type), 'Only images are allowed')
});

export const paymentMethodUpdateSchema = z.object({
  methodType: z.enum(['bank', 'mobile_money', 'crypto']),
  accountName: z.string().min(2, 'Account name is required'),
  accountNumber: z.string().min(4, 'Account number is required'),
  provider: z.string().min(2, 'Provider is required').optional(),
  network: z.string().min(3, 'Network is required').optional()
}).superRefine((data, ctx) => {
  if (data.methodType === 'mobile_money' && !data.provider) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Provider is required for mobile money",
      path: ["provider"]
    });
  }
  if (data.methodType === 'crypto' && !data.network) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Network is required for crypto",
      path: ["network"]
    });
  }
});