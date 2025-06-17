import { Request, Response } from 'express';
import { UserService } from '../../services/user.service';
import { RedisService } from '../../services/redis.service';
import { AuthService } from '../../services/auth.service';
import { EmailService } from '../../services/email.service';
import { SMSservice } from '../../services/sms.service';
import { logger } from '../../utils/logger';
import { validateVerificationInput } from '../../validators/auth.validator';

export class VerificationController {
  private userService = new UserService();
  private redis = new RedisService();
  private authService = new AuthService();
  private emailService = new EmailService();
  private smsService = new SMSservice();

  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.params;
      
      // Verify token
      const userId = await this.authService.verifyEmailToken(token);
      if (!userId) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }

      // Update user verification status
      await this.userService.verifyEmail(userId);

      logger.info(`User ${userId} verified their email`);

      res.status(200).json({ message: 'Email verified successfully' });

    } catch (error) {
      logger.error('Email verification error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async verifyPhone(req: Request, res: Response) {
    try {
      const { error, value } = validateVerificationInput(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      // Verify OTP
      const isValid = await this.smsService.verifyOTP(
        value.phone_number, 
        value.code
      );
      
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid or expired code' });
      }

      // Update user verification status
      await this.userService.verifyPhone(value.phone_number);

      logger.info(`User with phone ${value.phone_number} verified their phone`);

      res.status(200).json({ message: 'Phone number verified successfully' });

    } catch (error) {
      logger.error('Phone verification error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async resendVerification(req: Request, res: Response) {
    try {
      const { type, identifier } = req.body;
      
      // Find user by email or phone
      const user = await this.userService.findByEmailOrPhone(identifier);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check cooldown
      const cooldownKey = `verification:${user.user_id}:${type}`;
      if (await this.redis.exists(cooldownKey)) {
        return res.status(429).json({ 
          error: 'Please wait before requesting another verification' 
        });
      }

      // Process resend based on type
      if (type === 'email' && user.email) {
        await this.emailService.sendVerificationEmail(user.email, user.user_id);
        await this.redis.setex(cooldownKey, 60, '1 minute');
      } 
      else if (type === 'phone') {
        await this.smsService.sendVerificationSMS(user.phone_number);
        await this.redis.setex(cooldownKey, 60, '1 minute');
      } 
      else {
        return res.status(400).json({ error: 'Invalid verification type' });
      }

      res.status(200).json({ message: 'Verification code resent' });

    } catch (error) {
      logger.error('Resend verification error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}