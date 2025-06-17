import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Using Upstash Redis for distributed rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Create separate rate limiters for different actions
export const signupRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'), // 3 signups per hour
  prefix: 'ratelimit:signup',
  analytics: true,
});

export const ipRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 d'), // 10 signups per day per IP
  prefix: 'ratelimit:ip',
  analytics: true,
});

export const phoneRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1, '24 h'), // 1 signup per phone per day
  prefix: 'ratelimit:phone',
  analytics: true,
});

export async function checkRateLimit(
  identifier: string,
  type: 'signup' | 'ip' | 'phone'
): Promise<{ allowed: boolean; limit: number; remaining: number }> {
  const limiter = {
    signup: signupRateLimiter,
    ip: ipRateLimiter,
    phone: phoneRateLimiter,
  }[type];

  const { success, limit, remaining } = await limiter.limit(identifier);

  return {
    allowed: success,
    limit,
    remaining,
  };
}