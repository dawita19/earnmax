import { NotificationInstance } from 'antd/es/notification/interface';
import { AxiosError } from 'axios';

type ErrorContext = 'auth' | 'transaction' | 'task' | 'referral' | 'admin';

interface CustomError {
  code: string;
  message: string;
  context?: ErrorContext;
  originalError?: unknown;
}

export class EarnMaxErrorHandler {
  private notification: NotificationInstance;
  
  constructor(notification: NotificationInstance) {
    this.notification = notification;
  }

  // Standard error codes mapping
  private static errorMessages: Record<string, string> = {
    NETWORK_ERROR: 'Network connection failed. Please check your internet.',
    AUTH_001: 'Invalid phone number or password',
    AUTH_002: 'Account locked due to multiple failed attempts',
    TRANS_001: 'Insufficient balance for this transaction',
    TRANS_002: 'Minimum withdrawal amount not met',
    VIP_001: 'VIP upgrade requires additional funds',
    TASK_001: 'Daily task limit reached',
    REF_001: 'Invalid invitation code',
    ADMIN_001: 'Unauthorized admin access',
  };

  public handleError(error: unknown, context?: ErrorContext): void {
    const customError = this.normalizeError(error, context);
    
    // Log error first
    this.logError(customError);

    // Show user-friendly notification
    this.notifyUser(customError);
    
    // Special cases handling
    this.handleSpecialCases(customError);
  }

  private normalizeError(error: unknown, context?: ErrorContext): CustomError {
    // Handle Axios errors
    if (this.isAxiosError(error)) {
      return {
        code: error.response?.data?.code || 'NETWORK_ERROR',
        message: error.response?.data?.message || 'Network request failed',
        context,
        originalError: error,
      };
    }
    
    // Handle custom error objects
    if (typeof error === 'object' && error !== null) {
      const err = error as Record<string, unknown>;
      return {
        code: String(err.code || 'UNKNOWN_ERROR'),
        message: String(err.message || 'An unknown error occurred'),
        context,
        originalError: error,
      };
    }
    
    // Fallback for primitive errors
    return {
      code: 'UNKNOWN_ERROR',
      message: String(error),
      context,
      originalError: error,
    };
  }

  private isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError === true;
  }

  private logError(error: CustomError): void {
    const logData = {
      code: error.code,
      message: error.message,
      context: error.context,
      timestamp: new Date().toISOString(),
      stack: error.originalError instanceof Error ? error.originalError.stack : undefined,
    };

    // Send to logging service in production
    if (process.env.NODE_ENV === 'production') {
      // Implement your logging service integration here
      console.error('Error logged:', logData);
    } else {
      console.error('Development error:', logData);
    }
  }

  private notifyUser(error: CustomError): void {
    const userMessage = EarnMaxErrorHandler.errorMessages[error.code] || 
      `An error occurred: ${error.message.substring(0, 100)}`;
    
    this.notification.error({
      message: 'Error',
      description: userMessage,
      duration: 5,
    });
  }

  private handleSpecialCases(error: CustomError): void {
    switch (error.code) {
      case 'AUTH_002':
        // Redirect to unlock account page
        window.location.href = '/account-locked';
        break;
      case 'VIP_001':
        // Show VIP upgrade modal
        // You'd implement your modal triggering logic here
        break;
      // Add other special cases as needed
    }
  }
}

// Singleton instance export
let errorHandlerInstance: EarnMaxErrorHandler;

export const initErrorHandler = (notification: NotificationInstance): EarnMaxErrorHandler => {
  errorHandlerInstance = new EarnMaxErrorHandler(notification);
  return errorHandlerInstance;
};

export const getErrorHandler = (): EarnMaxErrorHandler => {
  if (!errorHandlerInstance) {
    throw new Error('Error handler not initialized. Call initErrorHandler first.');
  }
  return errorHandlerInstance;
};