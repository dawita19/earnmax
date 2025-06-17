import { z } from 'zod';
import { TaskType } from '../../enums';

export const TaskGenerationSchema = z.object({
  userId: z.number().int().positive(),
  vipLevel: z.number().int().min(0).max(8),
  date: z.date().default(() => new Date())
});

export const TaskQuerySchema = z.object({
  vipLevel: z.number().int().min(0).max(8).optional(),
  type: z.nativeEnum(TaskType).optional(),
  isCompleted: z.boolean().optional(),
  fromDate: z.date().optional(),
  toDate: z.date().optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0)
});

export const TaskUpdateSchema = z.object({
  taskId: z.number().int().positive(),
  earnings: z.number().positive().optional(),
  isCompleted: z.boolean().optional(),
  completionDate: z.date().optional()
});

export type TaskGenerationInput = z.infer<typeof TaskGenerationSchema>;
export type TaskQueryInput = z.infer<typeof TaskQuerySchema>;
export type TaskUpdateInput = z.infer<typeof TaskUpdateSchema>;