import { Admin } from '../types/admin';
import { logger } from './logger';

interface DistributorConfig {
  adminPoolSize?: number;
  distributionStrategy?: 'round-robin' | 'random' | 'weighted';
  adminWeights?: Record<number, number>; // adminId -> weight
}

export class RequestDistributor {
  private adminPool: Admin[] = [];
  private currentIndex = 0;
  private readonly strategy: 'round-robin' | 'random' | 'weighted';
  private readonly adminWeights: Record<number, number>;
  private weightTotal = 0;

  constructor(config: DistributorConfig = {}) {
    this.strategy = config.distributionStrategy || 'round-robin';
    
    if (this.strategy === 'weighted' && config.adminWeights) {
      this.adminWeights = config.adminWeights;
      this.weightTotal = Object.values(this.adminWeights).reduce((sum, weight) => sum + weight, 0);
    } else {
      this.adminWeights = {};
    }
  }

  public initialize(admins: Admin[]): void {
    if (!admins || admins.length === 0) {
      throw new Error('Admin pool cannot be empty');
    }

    this.adminPool = [...admins];
    logger.info(`Request distributor initialized with ${admins.length} admins`, { strategy: this.strategy });
  }

  public addAdmin(admin: Admin): void {
    this.adminPool.push(admin);
    logger.info('Admin added to distribution pool', { adminId: admin.admin_id });
  }

  public removeAdmin(adminId: number): void {
    this.adminPool = this.adminPool.filter(admin => admin.admin_id !== adminId);
    logger.info('Admin removed from distribution pool', { adminId });
  }

  public getNextAdmin(): Admin {
    if (this.adminPool.length === 0) {
      throw new Error('No admins available in the pool');
    }

    let selectedAdmin: Admin;

    switch (this.strategy) {
      case 'random':
        selectedAdmin = this.getRandomAdmin();
        break;
      
      case 'weighted':
        selectedAdmin = this.getWeightedAdmin();
        break;
      
      case 'round-robin':
      default:
        selectedAdmin = this.getRoundRobinAdmin();
        break;
    }

    logger.debug('Admin selected for request', {
      adminId: selectedAdmin.admin_id,
      strategy: this.strategy,
      currentIndex: this.currentIndex,
    });

    return selectedAdmin;
  }

  private getRoundRobinAdmin(): Admin {
    const admin = this.adminPool[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.adminPool.length;
    return admin;
  }

  private getRandomAdmin(): Admin {
    const randomIndex = Math.floor(Math.random() * this.adminPool.length);
    return this.adminPool[randomIndex];
  }

  private getWeightedAdmin(): Admin {
    if (Object.keys(this.adminWeights).length === 0) {
      logger.warn('No weights configured, falling back to round-robin');
      return this.getRoundRobinAdmin();
    }

    let random = Math.random() * this.weightTotal;
    for (const admin of this.adminPool) {
      const weight = this.adminWeights[admin.admin_id] || 1;
      if (random < weight) {
        return admin;
      }
      random -= weight;
    }

    // Fallback if weights don't cover all cases
    return this.adminPool[0];
  }

  // Special distribution for VIP-related requests
  public distributeVipRequest(request: {
    type: 'purchase' | 'upgrade';
    vipLevel: number;
    amount: number;
  }): Admin {
    // Higher VIP levels get assigned to more experienced admins
    if (this.strategy === 'weighted' && request.vipLevel >= 5) {
      // Temporarily adjust weights for VIP requests
      const originalWeights = { ...this.adminWeights };
      this.adminPool.forEach(admin => {
        this.adminWeights[admin.admin_id] = 
          admin.admin_level === 'high' ? 3 : 1;
      });
      this.weightTotal = Object.values(this.adminWeights).reduce((sum, weight) => sum + weight, 0);

      const admin = this.getWeightedAdmin();
      
      // Restore original weights
      Object.assign(this.adminWeights, originalWeights);
      this.weightTotal = Object.values(this.adminWeights).reduce((sum, weight) => sum + weight, 0);

      logger.info('VIP request distributed to high-level admin', {
        adminId: admin.admin_id,
        vipLevel: request.vipLevel,
        amount: request.amount,
      });

      return admin;
    }

    return this.getNextAdmin();
  }

  // Get current distribution statistics
  public getDistributionStats(): {
    totalAdmins: number;
    strategy: string;
    nextAdminIndex?: number;
  } {
    return {
      totalAdmins: this.adminPool.length,
      strategy: this.strategy,
      nextAdminIndex: this.strategy === 'round-robin' ? this.currentIndex : undefined,
    };
  }
}

// Singleton implementation
let distributorInstance: RequestDistributor;

export const initDistributor = (admins: Admin[], config?: DistributorConfig): RequestDistributor => {
  distributorInstance = new RequestDistributor(config);
  distributorInstance.initialize(admins);
  return distributorInstance;
};

export const getDistributor = (): RequestDistributor => {
  if (!distributorInstance) {
    throw new Error('Request distributor not initialized. Call initDistributor first.');
  }
  return distributorInstance;
};