import { NextRequest, NextResponse } from 'next/server';

// Configure allowed IPs (would normally come from environment or DB)
const WHITELISTED_IPS = process.env.ADMIN_IP_WHITELIST?.split(',') || [];

export const ipWhitelistMiddleware = (handler: Function) => {
  return async (req: NextRequest, ...args: any[]) => {
    const ip = req.ip || req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for');
    
    if (!WHITELISTED_IPS.includes(ip!)) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Access denied' }),
        { status: 403, headers: { 'content-type': 'application/json' } }
      );
    }

    return handler(req, ...args);
  };
};

// Advanced IP validation with CIDR support
export const isIpAllowed = (ip: string): boolean => {
  if (WHITELISTED_IPS.includes(ip)) return true;
  
  // Check CIDR ranges
  for (const range of WHITELISTED_IPS.filter(ip => ip.includes('/'))) {
    if (checkCIDR(ip, range)) return true;
  }
  
  return false;
};

function checkCIDR(ip: string, cidr: string): boolean {
  // Implementation of CIDR range checking
  const [range, bits] = cidr.split('/');
  const mask = ~(0xFFFFFFFF >>> parseInt(bits));
  
  const ipLong = ipToLong(ip);
  const rangeLong = ipToLong(range);
  
  return (ipLong & mask) === (rangeLong & mask);
}

function ipToLong(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0);
}