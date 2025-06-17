// src/lib/utils/error-handler.ts
import { ErrorObject } from 'vue/types/umd';
import { showErrorToast } from './notifications';
import { isObject, isString } from 'lodash';

export class AppError extends Error {
  public code: string;
  public details: any;
  public isOperational: boolean;

  constructor(code: string, message: string, details?: any, isOperational = true) {
    super(message);
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorCodes = {
  // Authentication Errors
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  
  // Transaction Errors
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  WITHDRAWAL_LIMIT_EXCEEDED: 'WITHDRAWAL_LIMIT_EXCEEDED',
  VIP_UPGRADE_REQUIRED: 'VIP_UPGRADE_REQUIRED',
  
  // Validation Errors
  INVALID_INPUT: 'INVALID_INPUT',
  INVALID_PAYMENT_PROOF: 'INVALID_PAYMENT_PROOF',
  
  // System Errors
  SERVER_ERROR: 'SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

export function handleError(error: any, context?: string): void {
  let errorMessage = 'An unexpected error occurred';
  let errorCode = errorCodes.UNKNOWN_ERROR;
  let details = null;

  if (error instanceof AppError) {
    errorMessage = error.message;
    errorCode = error.code;
    details = error.details;
  } else if (error.response) {
    // Axios error
    const { data, status } = error.response;
    if (data && data.error) {
      errorMessage = data.error.message || errorMessage;
      errorCode = data.error.code || errorCode;
      details = data.error.details;
    } else if (status === 401) {
      errorMessage = 'Session expired. Please login again.';
      errorCode = errorCodes.AUTH_REQUIRED;
    } else if (status === 403) {
      errorMessage = 'You are not authorized to perform this action';
      errorCode = errorCodes.AUTH_REQUIRED;
    } else if (status === 500) {
      errorMessage = 'Internal server error. Please try again later.';
      errorCode = errorCodes.SERVER_ERROR;
    }
  } else if (error.request) {
    // The request was made but no response was received
    errorMessage = 'Network error. Please check your connection.';
    errorCode = errorCodes.NETWORK_ERROR;
  } else if (isString(error)) {
    errorMessage = error;
  } else if (isObject(error) && error.message) {
    errorMessage = error.message;
  }

  // Log error with context
  console.error(`[${context || 'App'}] Error (${errorCode}):`, errorMessage, details || '');

  // Show user-friendly message
  showErrorToast(errorMessage);

  // Special handling for specific errors
  switch (errorCode) {
    case errorCodes.AUTH_REQUIRED:
      // Redirect to login
      break;
    case errorCodes.VIP_UPGRADE_REQUIRED:
      // Show VIP upgrade modal
      break;
  }
}

export function createErrorHandler(componentName: string) {
  return (error: ErrorObject) => {
    handleError(error, componentName);
  };
}

export function validationErrorHandler(error: any, field: string): string {
  if (!error) return '';
  
  if (error.response && error.response.data) {
    const errors = error.response.data.errors;
    if (errors && errors[field]) {
      return errors[field][0];
    }
  }
  
  return 'Invalid value';
}

export function isErrorCode(error: any, code: string): boolean {
  if (error instanceof AppError) {
    return error.code === code;
  }
  if (error.response && error.response.data && error.response.data.error) {
    return error.response.data.error.code === code;
  }
  return false;
}