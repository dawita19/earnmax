import { NextFunction, Request, Response } from 'express';
import { Admin } from '../../models/admin';
import { RedisClient } from '../../config/redis';

export class RequestDistributor {
  private static readonly ADMIN_POOL_KEY = 'admin:request_pool';
  private static readonly REQUEST_EXPIRY = 3600; // 1 hour in seconds

  static async distribute(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.path.includes('/requests/')) {
        return next();
      }

      const redis = RedisClient.getInstance();
      const adminPool = await this.getAdminPool(redis);

      if (adminPool.length === 0) {
        throw new Error('No available admins for request distribution');
      }

      // Get next admin using round-robin
      const lastAssignedIndex = (await redis.get('last_assigned_index')) || '0';
      const currentIndex = (parseInt(lastAssignedIndex) + 1) % adminPool.length;
      
      const assignedAdmin = adminPool[currentIndex];
      await redis.set('last_assigned_index', currentIndex.toString());

      // Attach admin to request
      req.assignedAdmin = assignedAdmin;
      
      // Track request in Redis with expiry
      await redis.setex(
        `request:${req.id}:admin`,
        this.REQUEST_EXPIRY,
        assignedAdmin._id.toString()
      );

      next();
    } catch (error) {
      next(error);
    }
  }

  private static async getAdminPool(redis: RedisClient): Promise<Admin[]> {
    // Check cache first
    const cachedPool = await redis.get(this.ADMIN_POOL_KEY);
    if (cachedPool) {
      return JSON.parse(cachedPool);
    }

    // Fetch from DB if not in cache
    const activeAdmins = await Admin.find({
      is_active: true,
      admin_level: 'low' // Only distribute to low-level admins
    }).select('_id username admin_level');

    if (activeAdmins.length > 0) {
      await redis.setex(
        this.ADMIN_POOL_KEY,
        300, // 5 minute cache
        JSON.stringify(activeAdmins)
      );
    }

    return activeAdmins;
  }
}

declare global {
  namespace Express {
    interface Request {
      id: string;
      assignedAdmin?: any;
    }
  }
}