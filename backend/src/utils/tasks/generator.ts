import { VipLevel } from '../../models/vip.model';
import { DailyTask } from '../../models/task.model';

const TASK_TEMPLATES: Record<number, Omit<DailyTask, 'user_id'|'expires_at'>[]> = {
  0: [
    { type: 'view_ad', description: 'View advertisement', earnings: 5.00 },
    { type: 'spin_reward', description: 'Spin reward wheel', earnings: 5.00 },
    { type: 'share_post', description: 'Share social media post', earnings: 5.00 },
    { type: 'watch_video', description: 'Watch promotional video', earnings: 5.00 }
  ],
  1: [
    { type: 'click_ad', description: 'Click advertisement', earnings: 10.00 },
    { type: 'comment_promo', description: 'Comment on promotion', earnings: 10.00 },
    { type: 'share_promo', description: 'Share promotion', earnings: 10.00 },
    { type: 'claim_reward', description: 'Claim daily reward', earnings: 10.00 }
  ],
  // ... other VIP levels
};

export function generateDailyTasks(userId: string, vipLevel: VipLevel): DailyTask[] {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + 1);
  
  return TASK_TEMPLATES[vipLevel].map(task => ({
    ...task,
    user_id: userId,
    expires_at: expiresAt,
    is_completed: false
  }));
}

export function regenerateExpiredTasks(existingTasks: DailyTask[]): DailyTask[] {
  const now = new Date();
  return existingTasks.map(task => {
    if (task.expires_at < now && !task.is_completed) {
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + 1);
      return { ...task, expires_at: newExpiry, is_completed: false };
    }
    return task;
  });
}