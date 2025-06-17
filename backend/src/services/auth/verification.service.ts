import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { SmsService } from '../../notifications/sms.service';
import { EmailService } from '../../notifications/email.service';

@Injectable()
export class VerificationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly smsService: SmsService,
    private readonly emailService: EmailService,
  ) {}

  async sendPhoneVerification(phoneNumber: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.usersService.cacheVerificationCode(phoneNumber, code);
    await this.smsService.sendVerificationCode(phoneNumber, code);
    return { sent: true };
  }

  async verifyPhone(phoneNumber: string, code: string) {
    const isValid = await this.usersService.validateVerificationCode(
      phoneNumber,
      code
    );
    if (isValid) {
      await this.usersService.markPhoneAsVerified(phoneNumber);
      return { verified: true };
    }
    throw new Error('Invalid verification code');
  }

  async sendEmailVerification(email: string) {
    const token = generateSecureToken();
    await this.usersService.cacheEmailToken(email, token);
    await this.emailService.sendVerificationEmail(email, token);
    return { sent: true };
  }
}