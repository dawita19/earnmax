import { PrismaClient } from '@prisma/client';
import { VipLevelData } from '../../types';

const prisma = new PrismaClient();

const vipLevels: VipLevelData[] = [
  {
    level_id: 0,
    name: 'Free Tier',
    investment_amount: 0,
    daily_earning: 20,
    per_task_earning: 5.00,
    min_withdrawal: 60,
    max_total_withdrawal: 300,
    investment_area: 'Free Trial',
    daily_tasks: [
      { type: 'view_ad', description: 'View advertisement', earnings: 5.00 },
      { type: 'spin_reward', description: 'Spin reward wheel', earnings: 5.00 },
      { type: 'share_post', description: 'Share social media post', earnings: 5.00 },
      { type: 'watch_video', description: 'Watch promotional video', earnings: 5.00 }
    ]
  },
  {
    level_id: 1,
    name: 'Digital Advertising',
    investment_amount: 1200,
    daily_earning: 40,
    per_task_earning: 10.00,
    min_withdrawal: 40,
    max_total_withdrawal: 4800,
    investment_area: 'Digital Advertising',
    daily_tasks: [
      { type: 'click_ad', description: 'Click advertisement', earnings: 10.00 },
      { type: 'comment_promo', description: 'Comment on promotion', earnings: 10.00 },
      { type: 'share_promo', description: 'Share promotion', earnings: 10.00 },
      { type: 'claim_reward', description: 'Claim daily reward', earnings: 10.00 }
    ]
  },
  // Add levels 2-8 following the same pattern
];

export async function seedVipLevels() {
  try {
    await prisma.vipLevel.deleteMany();
    
    for (const level of vipLevels) {
      await prisma.vipLevel.create({
        data: {
          level_id: level.level_id,
          name: level.name,
          investment_amount: level.investment_amount,
          daily_earning: level.daily_earning,
          per_task_earning: level.per_task_earning,
          min_withdrawal: level.min_withdrawal,
          max_total_withdrawal: level.max_total_withdrawal,
          investment_area: level.investment_area,
          daily_tasks: level.daily_tasks
        }
      });
    }
    
    console.log('VIP levels seeded successfully');
  } catch (error) {
    console.error('Error seeding VIP levels:', error);
  } finally {
    await prisma.$disconnect();
  }
}