import { randomBytes, createHash } from 'crypto';

export class InviteCodeGenerator {
  private static readonly CODE_LENGTH = 8;
  private static readonly SALT = process.env.INVITE_CODE_SALT || 'earnmax-secret';

  /**
   * Generate unique invite code based on user ID
   */
  static generate(userId: number): string {
    const hash = createHash('sha256')
      .update(userId.toString())
      .update(this.SALT)
      .digest('hex');
    
    return hash.substring(0, this.CODE_LENGTH).toUpperCase();
  }

  /**
   * Generate random backup codes
   */
  static generateBackupCodes(count: number = 3): string[] {
    return Array.from({ length: count }, () => 
      randomBytes(this.CODE_LENGTH / 2).toString('hex').toUpperCase()
    );
  }
}