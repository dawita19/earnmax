import { Admin } from '../../models/admin.model';
import { getRepository } from 'typeorm';

export class RequestDistributor {
  private static currentIndex = 0;
  private static adminCount = 0;
  private static adminIds: number[] = [];

  /**
   * Initialize distributor with active admin IDs
   */
  static async initialize() {
    const adminRepo = getRepository(Admin);
    const admins = await adminRepo.find({ 
      where: { isActive: true },
      select: ['adminId']
    });
    
    this.adminIds = admins.map(a => a.adminId);
    this.adminCount = this.adminIds.length;
    this.currentIndex = 0;
  }

  /**
   * Get next admin ID in round-robin fashion
   */
  static getNextAdminId(): number {
    if (this.adminCount === 0) {
      throw new Error('No active admins available');
    }

    const adminId = this.adminIds[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.adminCount;
    return adminId;
  }

  /**
   * Distribute request to admin and return assigned admin ID
   */
  static async distributeRequest(requestType: 'purchase' | 'upgrade' | 'withdrawal'): Promise<number> {
    if (this.adminCount === 0) {
      await this.initialize();
    }

    const adminId = this.getNextAdminId();
    // Here you would typically log the assignment or trigger notification
    return adminId;
  }
}

// Initialize on startup
RequestDistributor.initialize().catch(console.error);