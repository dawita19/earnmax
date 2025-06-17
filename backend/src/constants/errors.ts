export const ERROR_CODES = {
  // Authentication errors
  AUTH: {
    INVALID_CREDENTIALS: 'AUTH001',
    ACCOUNT_LOCKED: 'AUTH002',
    UNAUTHORIZED: 'AUTH003',
    INVALID_2FA: 'AUTH004'
  },
  
  // User errors
  USER: {
    EXISTS: 'USER001',
    NOT_FOUND: 'USER002',
    INVALID_VIP: 'USER003',
    INSUFFICIENT_BALANCE: 'USER004',
    WITHDRAWAL_LIMIT: 'USER005'
  },
  
  // Request errors
  REQUEST: {
    INVALID_TYPE: 'REQ001',
    EXPIRED: 'REQ002',
    ALREADY_PROCESSED: 'REQ003',
    INVALID_PROOF: 'REQ004'
  },
  
  // Referral errors
  REFERRAL: {
    INVALID_CODE: 'REF001',
    SELF_REFERRAL: 'REF002',
    MAX_LEVEL: 'REF003'
  },
  
  // Task errors
  TASK: {
    NOT_AVAILABLE: 'TASK001',
    ALREADY_COMPLETED: 'TASK002',
    INVALID_COMPLETION: 'TASK003'
  },
  
  // System errors
  SYSTEM: {
    MAINTENANCE: 'SYS001',
    CONFIGURATION: 'SYS002',
    RATE_LIMIT: 'SYS003'
  }
} as const;

export const ERROR_MESSAGES = {
  [ERROR_CODES.AUTH.INVALID_CREDENTIALS]: 'Invalid credentials provided',
  [ERROR_CODES.AUTH.ACCOUNT_LOCKED]: 'Account temporarily locked',
  [ERROR_CODES.USER.INSUFFICIENT_BALANCE]: 'Insufficient balance for this operation',
  // ... other error messages
} as const;