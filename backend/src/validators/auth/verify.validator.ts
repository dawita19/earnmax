import { z } from 'zod';

export const TwoFactorVerifySchema = z.object({
  userId: z.number().int().positive(),
  code: z.string().length(6),
  method: z.enum(['sms', 'email', 'authenticator'])
});

export const PhoneVerifySchema = z.object({
  phoneNumber: z.string().regex(/^\+?[0-9]{10,15}$/),
  code: z.string().length(6)
});

export const EmailVerifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6)
});

export type TwoFactorVerifyInput = z.infer<typeof TwoFactorVerifySchema>;
export type PhoneVerifyInput = z.infer<typeof PhoneVerifyVerifySchema>;
export type EmailVerifyInput = z.infer<typeof EmailVerifySchema>;