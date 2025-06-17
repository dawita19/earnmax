import { z } from 'zod';
import { VIP_LEVELS } from '../../constants/vip-levels';

export const vipPurchaseSchema = z.object({
  vipLevel: z.number()
    .int('VIP level must be an integer')
    .min(0, 'Invalid VIP level')
    .max(VIP_LEVELS.length - 1, `Maximum VIP level is ${VIP_LEVELS.length - 1}`),
  paymentProof: z.string()
    .url('Invalid payment proof URL')
    .min(1, 'Payment proof is required')
});

export const vipUpgradeSchema = z.object({
  currentVipLevel: z.number()
    .int('Current VIP level must be an integer')
    .min(0, 'Invalid current VIP level'),
  targetVipLevel: z.number()
    .int('Target VIP level must be an integer')
    .min(1, 'Target VIP level must be higher than current')
    .max(VIP_LEVELS.length - 1, `Maximum VIP level is ${VIP_LEVELS.length - 1}`),
  useBalance: z.boolean(),
  additionalPayment: z.object({
    amount: z.number()
      .min(0, 'Additional payment cannot be negative')
      .optional(),
    proof: z.string()
      .url('Invalid payment proof URL')
      .optional()
  }).optional()
}).superRefine((data, ctx) => {
  if (data.targetVipLevel <= data.currentVipLevel) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Target VIP level must be higher than current level",
      path: ["targetVipLevel"]
    });
  }
  
  const levelDiff = data.targetVipLevel - data.currentVipLevel;
  if (levelDiff > 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Cannot upgrade more than 2 levels at once",
      path: ["targetVipLevel"]
    });
  }
});