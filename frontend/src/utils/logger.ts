import { Severity } from '@sentry/react';
import { User } from '../types/user';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

interface LogPayload {
  message: string;
  level: LogLevel;
  data?: Record<string, unknown>;
  user?: Partial<User>;
  timestamp?: string;
  tags?: Record<string, string>;
}

export class EarnMaxLogger {
  private static instance: EarnMaxLogger;
  private user?: Partial<User>;
  private enabled: boolean;
  private remoteLogging: boolean;

  private constructor() {
    this.enabled = process.env.NODE_ENV !== 'test';
    this.remoteLogging = process.env.NODE_ENV === 'production';
  }

  public static getInstance(): EarnMaxLogger {
    if (!EarnMaxLogger.instance) {
      EarnMaxLogger.instance = new EarnMaxLogger();
    }
    return EarnMaxLogger.instance;
  }

  public setUser(user: Partial<User>): void {
    this.user = user;
  }

  public enable(): void {
    this.enabled = true;
  }

  public disable(): void {
    this.enabled = false;
  }

  public debug(message: string, data?: Record<string, unknown>, tags?: Record<string, string>): void {
    this.log({ message, level: 'debug', data, tags });
  }

  public info(message: string, data?: Record<string, unknown>, tags?: Record<string, string>): void {
    this.log({ message, level: 'info', data, tags });
  }

  public warn(message: string, data?: Record<string, unknown>, tags?: Record<string, string>): void {
    this.log({ message, level: 'warn', data, tags });
  }

  public error(message: string, data?: Record<string, unknown>, tags?: Record<string, string>): void {
    this.log({ message, level: 'error', data, tags });
  }

  public critical(message: string, data?: Record<string, unknown>, tags?: Record<string, string>): void {
    this.log({ message, level: 'critical', data, tags });
  }

  private log(payload: LogPayload): void {
    if (!this.enabled) return;

    const fullPayload: LogPayload = {
      ...payload,
      user: this.user,
      timestamp: new Date().toISOString(),
    };

    // Console logging in development
    if (process.env.NODE_ENV !== 'production') {
      this.consoleLog(fullPayload);
    }

    // Remote logging in production
    if (this.remoteLogging) {
      this.remoteLog(fullPayload);
    }
  }

  private consoleLog(payload: LogPayload): void {
    const { level, message, data, tags } = payload;
    const styles = {
      debug: 'color: #666;',
      info: 'color: #2b73b7;',
      warn: 'color: #cc7a00;',
      error: 'color: #cc0000;',
      critical: 'color: #ffffff; background: #cc0000; padding: 2px 4px; border-radius: 3px;',
    };

    const style = styles[payload.level] || '';
    const parts = [`%c[${level.toUpperCase()}] ${message}`, style];

    if (data) {
      parts.push('\nData:', JSON.stringify(data, null, 2));
    }

    if (tags) {
      parts.push('\nTags:', JSON.stringify(tags, null, 2));
    }

    console[level === 'critical' ? 'error' : level](...parts);
  }

  private async remoteLog(payload: LogPayload): Promise<void> {
    try {
      // Convert to Sentry-compatible severity
      const sentrySeverity: Severity = 
        payload.level === 'critical' ? 'fatal' : 
        payload.level as Severity;

      // If using Sentry
      if (window.Sentry) {
        window.Sentry.withScope(scope => {
          scope.setLevel(sentrySeverity);
          if (payload.user) {
            scope.setUser(payload.user);
          }
          if (payload.tags) {
            scope.setTags(payload.tags);
          }
          if (payload.data) {
            scope.setExtras(payload.data);
          }
          window.Sentry.captureMessage(payload.message);
        });
      }

      // Send to your backend logging service
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Failed to send remote log:', error);
    }
  }

  // Transaction logging for financial operations
  public logTransaction(
    type: 'purchase' | 'upgrade' | 'withdrawal' | 'referral',
    amount: number,
    details: Record<string, unknown>
  ): void {
    this.info(`Transaction: ${type}`, {
      transactionType: type,
      amount,
      ...details,
    }, { category: 'transaction' });
  }

  // Task completion logging
  public logTaskCompletion(
    taskId: string,
    vipLevel: number,
    earnings: number
  ): void {
    this.info('Task completed', {
      taskId,
      vipLevel,
      earnings,
    }, { category: 'task' });
  }
}

// Singleton export
export const logger = EarnMaxLogger.getInstance();