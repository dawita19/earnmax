import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../../config/redis';
import { ApiResponder, API_CODES } from './response';

export const apiRateLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:api:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  handler: (req: Request, res: Response) => {
    ApiResponder.error(
      res,
      API_CODES.RATE_LIMIT,
      'Too many requests, please try again later',
      429
    );
  }
});

export const authRateLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:auth:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 auth attempts per hour
  handler: (req: Request, res: Response) => {
    ApiResponder.error(
      res,
      API_CODES.RATE_LIMIT,
      'Too many authentication attempts, please try again later',
      429
    );
  }
});