// shared/schemas/user.ts
import { z } from 'zod';

export const UserSchema = z.object({
  full_name: z.string().min(3).max(100),
  phone_number: z.string().regex(/^\+?[0-9]{10,15}$/),
  email: z.string().email().optional(),
  password: z.string().min(8),
  invite_code: z.string().length(8).optional()
});

// shared/schemas/transactions.ts
export const PurchaseRequestSchema = z.object({
  vip_level: z.number().min(0).max(8),
  payment_proof_url: z.string().url()
});