// src/utils/auth/password.ts
import crypto from 'crypto';
import { promisify } from 'util';
import { AppError } from '../api/error';

const scrypt = promisify(crypto.scrypt);
const randomBytes = promisify(crypto.randomBytes);

// Argon2 would be better but Node's crypto is more universally available
export class PasswordService {
  static async hashPassword(password: string): Promise<string> {
    if (password.length < 8) {
      throw new AppError(
        'E_WEAK_PASSWORD',
        'Password must be at least 8 characters',
        400
      );
    }

    const salt = (await randomBytes(16)).toString('hex');
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    return `${salt}:${derivedKey.toString('hex')}`;
  }

  static async comparePassword(
    storedPassword: string,
    suppliedPassword: string
  ): Promise<boolean> {
    const [salt, key] = storedPassword.split(':');
    if (!salt || !key) {
      throw new AppError(
        'E_INVALID_HASH',
        'Invalid password format',
        500
      );
    }

    const keyBuffer = Buffer.from(key, 'hex');
    const suppliedKey = (await scrypt(suppliedPassword, salt, 64)) as Buffer;
    
    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(keyBuffer, suppliedKey);
  }

  static async validatePasswordStrength(password: string): Promise<void> {
    const requirements = [
      { regex: /.{8,}/, message: 'Must be at least 8 characters' },
      { regex: /[A-Z]/, message: 'Must contain uppercase letter' },
      { regex: /[a-z]/, message: 'Must contain lowercase letter' },
      { regex: /[0-9]/, message: 'Must contain number' },
      { regex: /[^A-Za-z0-9]/, message: 'Must contain special character' }
    ];

    const errors = requirements
      .filter(req => !req.regex.test(password))
      .map(req => req.message);

    if (errors.length > 0) {
      throw new AppError(
        'E_WEAK_PASSWORD',
        'Password does not meet requirements',
        400,
        errors
      );
    }
  }

  static generateRandomPassword(length = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    const values = crypto.randomBytes(length);
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += charset[values[i] % charset.length];
    }
    
    return result;
  }
}