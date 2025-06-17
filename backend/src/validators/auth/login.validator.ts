import { z } from 'zod';

export const LoginSchema = z.object({
  identifier: z.string().min(3).max(100), // Can be email or phone
  password: z.string().min(6).max(100),
  ipAddress: z.string().ip().optional(),
  deviceId: z.string().max(100).optional()
});

export const LoginResponseSchema = z.object({
  token: z.string(),
  requiresTwoFactor: z.boolean(),
  user: z.object({
    userId: z.number(),
    fullName: z.string(),
    vipLevel: z.number()
  })
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;