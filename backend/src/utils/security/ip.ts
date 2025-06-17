import { Request } from 'express';
import { Injectable } from '@nestjs/common';

@Injectable()
export class IpService {
  getClientIp(request: Request): string {
    // Standard headers checked for IP address
    const headers = [
      'x-client-ip',
      'x-forwarded-for',
      'cf-connecting-ip',
      'fastly-client-ip',
      'x-real-ip',
      'x-cluster-client-ip',
      'x-forwarded',
      'forwarded-for',
      'forwarded'
    ];

    for (const header of headers) {
      const value = request.headers[header];
      if (value) {
        if (Array.isArray(value)) {
          return value[0].split(',')[0].trim();
        } else if (typeof value === 'string') {
          return value.split(',')[0].trim();
        }
      }
    }

    return request.socket?.remoteAddress || '';
  }

  isSuspiciousIp(ip: string): boolean {
    if (!ip) return false;
    
    // Check for localhost or internal IPs
    if (ip === '127.0.0.1' || ip.startsWith('192.168.')) {
      return true;
    }

    // Check for known VPN/proxy IPs (mock implementation)
    // In production, use a service like ipinfo.io or maxmind
    const suspiciousRanges = [
      '185.107.80.0/24',
      '45.88.223.0/24'
    ];
    
    return suspiciousRanges.some(range => this.isIpInRange(ip, range));
  }

  private isIpInRange(ip: string, range: string): boolean {
    // Simplified range check - implement proper CIDR checking in production
    const [rangeIp] = range.split('/');
    return ip.startsWith(rangeIp.split('.').slice(0, 3).join('.'));
  }
}