import { z } from 'zod';

export const SignupSchema = z.object({
  fullName: z.string().min(3).max(100),
  phoneNumber: z.string().regex(/^\+?[0-9]{10,15}$/),
  email: z.string().email().optional(),
  password: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100),
  inviterCode: z.string().length(8).optional(),
  ipAddress: z.string().ip().optional()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const InviteCodeCheckSchema = z.object({
  code: z.string().length(8)
});

export type SignupInput = z.infer<typeof SignupSchema>;
export type InviteCodeCheckInput = z.infer<typeof InviteCodeCheckSchema>;