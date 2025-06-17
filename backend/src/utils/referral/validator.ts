import { InviteCodeGenerator } from './code';
import { User } from '../../models/user.model';

export class ReferralValidator {
  /**
   * Validate invite code format
   */
  static isValidFormat(code: string): boolean {
    return /^[A-Z0-9]{8}$/.test(code);
  }

  /**
   * Check if code belongs to existing user
   */
  static async isCodeActive(code: string, userRepo: any): Promise<boolean> {
    return userRepo.exists({ inviteCode: code, accountStatus: 'active' });
  }

  /**
   * Verify code-user relationship (prevent self-referral)
   */
  static isNotSelfReferral(userId: number, inviterCode: string, userRepo: any): Promise<boolean> {
    return userRepo.findOne({ 
      where: { inviteCode: inviterCode },
      select: ['userId']
    }).then(inviter => inviter.userId !== userId);
  }

  /**
   * Full referral validation pipeline
   */
  static async validateReferral(
    userId: number, 
    code: string, 
    userRepo: any
  ): Promise<{ valid: boolean; inviterId?: number }> {
    if (!this.isValidFormat(code)) {
      return { valid: false };
    }

    if (!await this.isCodeActive(code, userRepo)) {
      return { valid: false };
    }

    const inviter = await userRepo.findOne({ 
      where: { inviteCode: code },
      select: ['userId']
    });

    if (!inviter || inviter.userId === userId) {
      return { valid: false };
    }

    return { valid: true, inviterId: inviter.userId };
  }
}