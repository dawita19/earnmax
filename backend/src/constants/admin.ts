export const ADMIN_LEVELS = {
  HIGH: 'high',
  LOW: 'low'
} as const;

export const ADMIN_PERMISSIONS = {
  // High-level admin permissions
  HIGH: {
    USER_MANAGEMENT: 'user_management',
    FINANCIAL_REPORTS: 'financial_reports',
    SYSTEM_CONFIG: 'system_config',
    CONTENT_MANAGEMENT: 'content_management',
    AUDIT_LOGS: 'audit_logs'
  },
  // Low-level admin permissions
  LOW: {
    REQUEST_APPROVAL: 'request_approval',
    BASIC_USER_MANAGEMENT: 'basic_user_management',
    TASK_VERIFICATION: 'task_verification'
  }
} as const;

export const REQUEST_TYPES = {
  PURCHASE: 'purchase',
  UPGRADE: 'upgrade',
  WITHDRAWAL: 'withdrawal'
} as const;

export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

export const ROUND_ROBIN_ADMIN_LIMIT = 10;
export const REQUEST_EXPIRY_HOURS = 48;