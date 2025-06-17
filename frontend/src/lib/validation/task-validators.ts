import { z } from 'zod';

export const taskCompletionSchema = z.object({
  taskId: z.string()
    .uuid('Invalid task ID format'),
  taskType: z.enum([
    'view_ad', 
    'spin_reward', 
    'share_post', 
    'watch_video',
    'click_ad',
    'comment_promo',
    'view_product',
    'simulate_order'
    // Add all other task types
  ]),
  proof: z.union([
    z.string().url('Invalid proof URL'),
    z.instanceof(File)
      .refine(file => file.size <= 5_000_000, 'File size must be less than 5MB')
      .refine(file => ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'].includes(file.type), 
      'Only images and videos are allowed')
  ]),
  userAgent: z.string(),
  ipAddress: z.string().ip()
});

export const dailyTaskVerificationSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  tasksCompleted: z.array(z.string().uuid()).max(4, 'Maximum 4 tasks per day')
});