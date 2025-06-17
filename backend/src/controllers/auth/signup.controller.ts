import { Request, Response } from 'express';
import { UserService } from '../../services/user.service';
import { ReferralService } from '../../services/referral.service';
import { validateSignupInput } from '../../validators/auth.validator';
import { logger } from '../../utils/logger';
import { generateInviteCode } from '../../utils/generators';
import { EmailService } from '../../services/email.service';
import { SMSservice } from '../../services/sms.service';
import { RedisService } from '../../services/redis.service';

export class SignupController {
  private userService = new UserService();
  private referralService = new ReferralService();
  private emailService = new EmailService();
  private smsService = new SMSservice();
  private redis = new RedisService();

  async signup(req: Request, res: Response) {
    try {
      // Validate input
      const { error, value } = validateSignupInput(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      // Check if phone/email already exists
      const exists = await this.userService.checkExistingUser(
        value.phone_number, 
        value.email
      );
      if (exists) return res.status(409).json({ error: 'User already exists' });

      // Check IP restrictions for VIP0
      if (await this.redis.exists(`ip:${req.ip}:vip0`)) {
        return res.status(403).json({ 
          error: 'Only one VIP0 account allowed per IP address' 
        });
      }

      // Process inviter if provided
      let inviterId = null;
      if (value.invite_code) {
        inviterId = await this.referralService.validateInviteCode(value.invite_code);
        if (!inviterId) {
          return res.status(400).json({ error: 'Invalid invitation code' });
        }
      }

      // Create user
      const user = await this.userService.createUser({
        ...value,
        invite_code: generateInviteCode(),
        ip_address: req.ip,
        vip_level: 0,
        vip_amount: 0,
      });

      // Mark IP as used for VIP0
      await this.redis.setex(`ip:${req.ip}:vip0`, 86400, '1');

      // Process referral network if inviter exists
      if (inviterId) {
        await this.referralService.processReferralNetwork(inviterId, user.user_id);
        
        // Send notifications to uplines
        await this.notifyUplineUsers(inviterId, user);
      }

      // Send verification codes
      if (user.email) {
        await this.emailService.sendVerificationEmail(user.email, user.user_id);
      }
      await this.smsService.sendVerificationSMS(user.phone_number);

      // Log successful registration
      logger.info(`New user registered: ${user.user_id}`);

      // Return response (without sensitive data)
      const { password_hash, ...userData } = user;
      
      res.status(201).json({
        message: 'Registration successful. Verification required.',
        user: userData,
      });

    } catch (error) {
      logger.error('Signup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async notifyUplineUsers(inviterId: number, newUser: any) {
    try {
      // Get 4 levels of upline users
      const uplineUsers = await this.referralService.getUplineUsers(inviterId, 4);
      
      // Send notifications
      for (const [index, upline] of uplineUsers.entries()) {
        const level = index + 1;
        const message = `Your level ${level} referral ${newUser.full_name} has joined!`;
        
        // Create notification
        await this.userService.createNotification(
          upline.user_id,
          'New Referral',
          message
        );

        // Send real-time notification if user is online
        if (await this.redis.isUserOnline(upline.user_id)) {
          this.referralService.sendRealtimeNotification(
            upline.user_id, 
            message
          );
        }
      }
    } catch (error) {
      logger.error('Error notifying upline users:', error);
    }
  }
}