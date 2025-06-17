import { z } from 'zod';
import { phoneRegex, emailRegex, passwordRegex } from '../constants';

export const signupSchema = z.object({
  fullName: z.string()
    .min(3, 'Full name must be at least 3 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  phoneNumber: z.string()
    .regex(phoneRegex, 'Invalid phone number format')
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number cannot exceed 20 digits'),
  email: z.string()
    .regex(emailRegex, 'Invalid email address')
    .optional()
    .or(z.literal('')),
  password: z.string()
    .regex(passwordRegex, 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character'),
  confirmPassword: z.string(),
  inviteCode: z.string()
    .length(8, 'Invite code must be exactly 8 characters')
    .optional()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const loginSchema = z.object({
  identifier: z.string()
    .min(3, 'Email or phone number is required'),
  password: z.string()
    .min(1, 'Password is required')
});

export const passwordResetSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .regex(passwordRegex, 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character'),
  confirmNewPassword: z.string()
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"]
});

export const twoFactorSchema = z.object({
  code: z.string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d+$/, 'Verification code must contain only numbers')
});