import Redis from 'ioredis';
import appConfig from './app';

class RedisClient {
  private static instance: Redis;
  private static subscriber: Redis;

  static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis({
        host: process.env.REDIS_HOST!,
        port: parseInt(process.env.REDIS_PORT!),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
        retryStrategy: (times) => Math.min(times * 50, 2000)
      });

      RedisClient.instance.on('error', (err) => {
        if (appConfig.nodeEnv === 'development') {
          console.error('Redis error:', err);
        }
      });
    }
    return RedisClient.instance;
  }

  static getSubscriber(): Redis {
    if (!RedisClient.subscriber) {
      RedisClient.subscriber = new Redis({
        host: process.env.REDIS_HOST!,
        port: parseInt(process.env.REDIS_PORT!),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0')
      });
    }
    return RedisClient.subscriber;
  }

  static async disconnect() {
    if (RedisClient.instance) {
      await RedisClient.instance.quit();
    }
    if (RedisClient.subscriber) {
      await RedisClient.subscriber.quit();
    }
  }
}

export const redis = RedisClient.getInstance();
export const redisSubscriber = RedisClient.getSubscriber();