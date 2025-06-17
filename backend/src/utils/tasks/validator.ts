import { DailyTask } from '../../models/task.model';

export function validateTaskCompletion(
  task: DailyTask,
  userIp: string,
  userAgent: string
): { valid: boolean; reason?: string } {
  // Check expiration
  if (task.expires_at < new Date()) {
    return { valid: false, reason: 'Task expired' };
  }

  // Check if already completed
  if (task.is_completed) {
    return { valid: false, reason: 'Task already completed' };
  }

  // IP-based fraud detection (simplified)
  if (isSuspiciousIp(userIp)) {
    return { valid: false, reason: 'Suspicious activity detected' };
  }

  return { valid: true };
}

function isSuspiciousIp(ip: string): boolean {
  // Implement actual IP analysis logic
  // This could check for VPNs, proxies, or known fraudulent IPs
  return false;
}