import { z } from 'zod';
import { RequestStatus, RequestType } from '../../enums';

export const RequestApprovalSchema = z.object({
  requestId: z.number().int().positive(),
  adminId: z.number().int().positive(),
  status: z.nativeEnum(RequestStatus),
  notes: z.string().max(500).optional(),
  processedAt: z.date().optional()
});

export const RequestQuerySchema = z.object({
  type: z.nativeEnum(RequestType),
  status: z.nativeEnum(RequestStatus).optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
  fromDate: z.date().optional(),
  toDate: z.date().optional()
});

export const PurchaseRequestSchema = z.object({
  userId: z.number().int().positive(),
  vipLevel: z.number().int().min(0).max(8),
  amount: z.number().positive(),
  paymentMethod: z.string().min(2).max(50),
  paymentProofUrl: z.string().url()
});

export type RequestApprovalInput = z.infer<typeof RequestApprovalSchema>;
export type RequestQueryInput = z.infer<typeof RequestQuerySchema>;
export type PurchaseRequestInput = z.infer<typeof PurchaseRequestSchema>;