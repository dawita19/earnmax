import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedSystemStatistics() {
  try {
    await prisma.systemStatistics.deleteMany();
    
    await prisma.systemStatistics.create({
      data: {
        total_users: 0,
        active_users: 0,
        total_revenue: 0,
        total_withdrawals: 0,
        total_purchases: 0,
        total_upgrades: 0,
        pending_withdrawals: 0,
        pending_purchases: 0,
        pending_upgrades: 0,
        suspended_users: 0,
        vip_distribution: {
          0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0
        }
      }
    });
    
    console.log('System statistics initialized successfully');
  } catch (error) {
    console.error('Error seeding system statistics:', error);
  } finally {
    await prisma.$disconnect();
  }
}