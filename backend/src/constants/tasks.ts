export const TASK_TYPES = {
  // Free tier tasks
  FREE: {
    VIEW_AD: 'view_ad',
    SPIN_REWARD: 'spin_reward',
    SHARE_POST: 'share_post',
    WATCH_VIDEO: 'watch_video'
  },
  
  // VIP tier tasks (grouped by level)
  VIP: {
    1: {
      CLICK_AD: 'click_ad',
      COMMENT_PROMO: 'comment_promo',
      SHARE_PROMOTION: 'share_promotion',
      CLAIM_REWARD: 'claim_reward'
    },
    // ... other VIP levels
    8: {
      SIM_PORTFOLIO: 'sim_portfolio',
      READ_EARNINGS: 'read_earnings',
      ANALYZE_TRENDS: 'analyze_trends',
      PREDICT_OUTLOOK: 'predict_outlook'
    }
  }
} as const;

export const TASK_EXPIRY_HOURS = 24;
export const MAX_DAILY_TASKS = 4;

export const TASK_EARNINGS = {
  // Free tier
  0: 5.00,
  // VIP tiers
  1: 10.00,
  2: 25.00,
  3: 50.00,
  4: 100.00,
  5: 175.00,
  6: 275.00,
  7: 500.00,
  8: 1000.00
} as const;

export const TASK_VERIFICATION = {
  MIN_TIME_SECONDS: 30,  // Minimum time to spend on task
  MAX_ATTEMPTS: 3       // Max attempts before lockout
} as const;