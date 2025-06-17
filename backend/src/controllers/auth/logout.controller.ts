import { Request, Response } from 'express';
import { RedisService } from '../../services/redis.service';
import { AuthService } from '../../services/auth.service';
import { logger } from '../../utils/logger';

export class LogoutController {
  private redis = new RedisService();
  private authService = new AuthService();

  async logout(req: Request, res: Response) {
    try {
      const token = req.cookies?.refreshToken || req.headers['authorization']?.split(' ')[1];
      
      if (!token) {
        return res.status(400).json({ error: 'No token provided' });
      }

      // Add token to blacklist
      await this.authService.blacklistToken(token);

      // Clear cookies
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });

      // Log logout action
      if (req.user?.userId) {
        logger.info(`User ${req.user.userId} logged out`);
      }

      res.status(200).json({ message: 'Logout successful' });

    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async logoutAllDevices(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      // Invalidate all user sessions
      await this.authService.invalidateAllUserSessions(userId);

      // Clear cookies
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });

      logger.info(`User ${userId} logged out from all devices`);

      res.status(200).json({ message: 'Logged out from all devices' });

    } catch (error) {
      logger.error('Logout all devices error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}