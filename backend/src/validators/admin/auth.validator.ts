import { z } from 'zod';
import { AdminLevel } from '../../enums';

export const AdminLoginSchema = z.object({
  username: z.string().min(4).max(50),
  password: z.string().min(8).max(100),
  twoFactorCode: z.string().length(6).optional()
});

export const AdminCreateSchema = z.object({
  username: z.string().min(4).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  adminLevel: z.nativeEnum(AdminLevel),
  permissions: z.record(z.boolean()).optional()
});

export const AdminUpdateSchema = AdminCreateSchema.partial().omit({ password: true }).extend({
  isActive: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional()
});

export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;
export type AdminCreateInput = z.infer<typeof AdminCreateSchema>;
export type AdminUpdateInput = z.infer<typeof AdminUpdateSchema>;