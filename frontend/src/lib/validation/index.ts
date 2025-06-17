export * from './auth-validators';
export * from './payment-validators';
export * from './vip-validators';
export * from './referral-validators';
export * from './withdrawal-validators';
export * from './task-validators';

import type { infer as zodInfer } from 'zod';
import * as schemas from '.';

export type SignupForm = zodInfer<typeof schemas.signupSchema>;
export type LoginForm = zodInfer<typeof schemas.loginSchema>;
export type VipPurchaseForm = zodInfer<typeof schemas.vipPurchaseSchema>;
export type VipUpgradeForm = zodInfer<typeof schemas.vipUpgradeSchema>;
export type WithdrawalRequestForm = ReturnType<typeof schemas.withdrawalRequestSchema>;
export type TaskCompletionForm = zodInfer<typeof schemas.taskCompletionSchema>;
// Export all other types as needed

export const validate = {
  auth: {
    signup: schemas.signupSchema.safeParse,
    login: schemas.loginSchema.safeParse,
    passwordReset: schemas.passwordResetSchema.safeParse,
    twoFactor: schemas.twoFactorSchema.safeParse
  },
  payment: {
    proof: schemas.paymentProofSchema.safeParse,
    methodUpdate: schemas.paymentMethodUpdateSchema.safeParse
  },
  vip: {
    purchase: schemas.vipPurchaseSchema.safeParse,
    upgrade: schemas.vipUpgradeSchema.safeParse
  },
  referral: {
    inviteCode: schemas.inviteCodeSchema.safeParse,
    bonusClaim: schemas.referralBonusClaimSchema.safeParse
  },
  withdrawal: (level: number) => schemas.withdrawalRequestSchema(level).safeParse,
  task: {
    completion: schemas.taskCompletionSchema.safeParse,
    dailyVerification: schemas.dailyTaskVerificationSchema.safeParse
  }
};