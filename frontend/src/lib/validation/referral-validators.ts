import { z } from 'zod';

export const inviteCodeSchema = z.object({
  inviteCode: z.string()
    .length(8, 'Invite code must be exactly 8 characters')
    .regex(/^[A-Z0-9]+$/, 'Invite code can only contain uppercase letters and numbers')
});

export const referralBonusClaimSchema = z.object({
  bonusType: z.enum(['weekly', 'monthly', 'special']),
  verificationCode: z.string()
    .length(6, 'Verification code must be 6 digits')
    .optional()
});