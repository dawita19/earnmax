import { Request, Response } from 'express';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { RedisService } from '../../services/redis.service';
import { logger } from '../../utils/logger';
import { validateLoginInput } from '../../validators/auth.validator';
import { RateLimiter } from '../../middleware/rate-limiter';

export class LoginController {
  private rateLimiter = new RateLimiter(5, 15); // 5 attempts per 15 minutes
  private userService = new UserService();
  private authService = new AuthService();
  private redis = new RedisService();

  async login(req: Request, res: Response) {
    try {
      // Validate input
      const { error, value } = validateLoginInput(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      // Check rate limit
      const ip = req.ip;
      if (await this.rateLimiter.isLimited(ip)) {
        return res.status(429).json({ 
          error: 'Too many login attempts. Please try again later.' 
        });
      }

      // Check if user exists
      const user = await this.userService.findByEmailOrPhone(value.identifier);
      if (!user) {
        await this.rateLimiter.increment(ip);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if account is locked
      if (user.is_locked) {
        const unlockTime = await this.redis.get(`lock:${user.user_id}`);
        return res.status(403).json({ 
          error: `Account locked. Try again after ${unlockTime}` 
        });
      }

      // Verify password
      const isValid = await this.authService.verifyPassword(
        value.password, 
        user.password_hash
      );
      
      if (!isValid) {
        await this.rateLimiter.increment(ip);
        await this.userService.incrementLoginAttempts(user.user_id);
        
        // Lock account after 5 failed attempts
        if (user.login_attempts + 1 >= 5) {
          await this.userService.lockAccount(user.user_id);
          await this.redis.setex(`lock:${user.user_id}`, 3600, '1 hour'); // 1 hour lock
          return res.status(403).json({ error: 'Account locked for 1 hour' });
        }
        
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Reset login attempts on successful login
      await this.userService.resetLoginAttempts(user.user_id);
      
      // Generate JWT tokens
      const { accessToken, refreshToken } = await this.authService.generateTokens(user);
      
      // Set cookies
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Log successful login
      logger.info(`User ${user.user_id} logged in from IP ${ip}`);

      // Return user data (excluding sensitive fields)
      const { password_hash, ...userData } = user;
      
      res.status(200).json({
        message: 'Login successful',
        accessToken,
        user: userData,
      });

    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}