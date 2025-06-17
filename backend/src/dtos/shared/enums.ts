export enum AdminLevel {
  HIGH = 'high',
  LOW = 'low'
}

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum RequestType {
  PURCHASE = 'purchase',
  UPGRADE = 'upgrade',
  WITHDRAWAL = 'withdrawal'
}

export enum AccountStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  APPEALED = 'appealed',
  LOCKED = 'locked'
}

export enum TaskType {
  AD_VIEW = 'ad_view',
  SPIN_REWARD = 'spin_reward',
  SHARE_POST = 'share_post',
  WATCH_VIDEO = 'watch_video',
  // Add all other task types from your VIP levels
}