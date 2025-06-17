// src/utils/auth/otp.ts
import crypto from 'crypto';
import { redis } from '../../config/redis'; // Assuming Redis setup
import { AppError } from '../api/error';

const OTP_EXPIRY_MINUTES = 5;
const OTP_RATE_LIMIT_SECONDS = 60;

export class OTPService {
  static async generateOTP(identifier: string): Promise<string> {
    // Check rate limiting
    const lastSent = await redis.get(`otp:${identifier}:last_sent`);
    if (lastSent && Date.now() - parseInt(lastSent) < OTP_RATE_LIMIT_SECONDS * 1000) {
      throw new AppError(
        'E_RATE_LIMIT',
        'Please wait before requesting another OTP',
        429
      );
    }

    // Generate 6-digit numeric OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiry = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

    // Store in Redis with expiry
    await redis.multi()
      .set(`otp:${identifier}`, otp)
      .expire(`otp:${identifier}`, OTP_EXPIRY_MINUTES * 60)
      .set(`otp:${identifier}:last_sent`, Date.now().toString())
      .expire(`otp:${identifier}:last_sent`, OTP_RATE_LIMIT_SECONDS)
      .exec();

    return otp;
  }

  static async verifyOTP(identifier: string, otp: string): Promise<boolean> {
    const storedOTP = await redis.get(`otp:${identifier}`);
    
    if (!storedOTP) {
      throw new AppError(
        'E_OTP_EXPIRED',
        'OTP expired or not generated',
        400
      );
    }

    // Constant-time comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(storedOTP),
      Buffer.from(otp)
    );

    if (isValid) {
      await redis.del(`otp:${identifier}`);
      return true;
    }

    throw new AppError(
      'E_INVALID_OTP',
      'Invalid OTP provided',
      400
    );
  }

  static async validateOTP(identifier: string, otp: string): Promise<void> {
    const isValid = await this.verifyOTP(identifier, otp);
    if (!isValid) {
      throw new AppError(
        'E_INVALID_OTP',
        'Invalid OTP provided',
        400
      );
    }
  }
}