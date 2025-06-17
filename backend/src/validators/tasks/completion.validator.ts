import { z } from 'zod';

export const TaskCompletionSchema = z.object({
  taskId: z.number().int().positive(),
  userId: z.number().int().positive(),
  ipAddress: z.string().ip(),
  deviceId: z.string().max(100).optional(),
  completionProof: z.string().max(500).optional() // Could be URL or text proof
});

export const TaskRewardSchema = z.object({
  userId: z.number().int().positive(),
  taskId: z.number().int().positive(),
  baseEarnings: z.number().positive(),
  referralBonuses: z.array(
    z.object({
      inviterId: z.number().int().positive(),
      level: z.number().int().min(1).max(4),
      amount: z.number().positive()
    })
  ),
  totalEarnings: z.number().positive()
});

export type TaskCompletionInput = z.infer<typeof TaskCompletionSchema>;
export type TaskRewardInput = z.infer<typeof TaskRewardSchema>;