import { z } from 'zod';
import { AccountStatus } from '../../enums';

export const UserQuerySchema = z.object({
  search: z.string().max(100).optional(),
  vipLevel: z.number().int().min(0).max(8).optional(),
  status: z.nativeEnum(AccountStatus).optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
  fromDate: z.date().optional(),
  toDate: z.date().optional()
});

export const UserUpdateSchema = z.object({
  vipLevel: z.number().int().min(0).max(8).optional(),
  vipAmount: z.number().nonnegative().optional(),
  balance: z.number().optional(),
  accountStatus: z.nativeEnum(AccountStatus).optional(),
  isLocked: z.boolean().optional()
});

export const UserSuspendSchema = z.object({
  userId: z.number().int().positive(),
  reason: z.string().min(10).max(500),
  durationDays: z.number().int().min(1).max(365),
  adminNotes: z.string().max(500).optional()
});

export type UserQueryInput = z.infer<typeof UserQuerySchema>;
export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;
export type UserSuspendInput = z.infer<typeof UserSuspendSchema>;