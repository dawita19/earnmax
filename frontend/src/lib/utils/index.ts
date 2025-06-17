// src/lib/utils/index.ts
import { apiService } from './api';
import { handleError, createErrorHandler, validationErrorHandler, isErrorCode, AppError, errorCodes } from './error-handler';
import { formatCurrency, formatDate, formatDateTime, truncateText } from './formatters';
import { 
  isMobile,
  isIOS,
  isAndroid,
  isWeChat,
  getBrowser,
  getOS 
} from './device';
import { 
  debounce,
  throttle,
  memoize,
  deepClone,
  mergeObjects 
} from './performance';
import { 
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  showLoading,
  hideLoading 
} from './notifications';
import { 
  copyToClipboard,
  shareContent,
  downloadFile,
  openInNewTab 
} from './browser';
import { 
  validateEmail,
  validatePhone,
  validatePassword,
  validatePaymentProof 
} from './validators';
import { 
  getVipLevelBenefits,
  calculateReferralBonus,
  calculateWithdrawalLimit,
  getTaskEarnings 
} from './earnmax-calculations';

// Core exports
export {
  apiService,
  handleError,
  createErrorHandler,
  validationErrorHandler,
  isErrorCode,
  AppError,
  errorCodes
};

// Formatters
export {
  formatCurrency,
  formatDate,
  formatDateTime,
  truncateText
};

// Device detection
export {
  isMobile,
  isIOS,
  isAndroid,
  isWeChat,
  getBrowser,
  getOS
};

// Performance helpers
export {
  debounce,
  throttle,
  memoize,
  deepClone,
  mergeObjects
};

// UI Notifications
export {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  showLoading,
  hideLoading
};

// Browser utilities
export {
  copyToClipboard,
  shareContent,
  downloadFile,
  openInNewTab
};

// Validators
export {
  validateEmail,
  validatePhone,
  validatePassword,
  validatePaymentProof
};

// EarnMax-specific calculations
export {
  getVipLevelBenefits,
  calculateReferralBonus,
  calculateWithdrawalLimit,
  getTaskEarnings
};

// Additional helper functions
export * from './helpers';