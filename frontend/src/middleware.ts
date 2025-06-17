// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminToken, verifyUserToken } from './lib/auth';

// Admin route patterns to protect
const ADMIN_ROUTES = [
  '/admin/:path*',
  '/api/admin/:path*',
  '/dashboard/:path*',
  '/management/:path*'
];

// User route patterns to protect
const USER_ROUTES = [
  '/account/:path*',
  '/withdraw/:path*',
  '/vip/:path*',
  '/earnings/:path*',
  '/api/user/:path*'
];

export const config = {
  matcher: [...ADMIN_ROUTES, ...USER_ROUTES],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = ADMIN_ROUTES.some(route => 
    pathname.startsWith(route.replace('/:path*', ''))
  );

  // Check if route requires authentication
  if (isAdminRoute || USER_ROUTES.some(route => 
    pathname.startsWith(route.replace('/:path*', ''))
  )) {
    const token = request.cookies.get('authToken')?.value;

    // Admin route protection
    if (isAdminRoute) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/admin-login', request.url));
      }

      try {
        const admin = await verifyAdminToken(token);
        if (!admin || admin.role !== 'high' && pathname.startsWith('/admin/high-level')) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }

        // Add admin data to headers for API routes
        if (pathname.startsWith('/api')) {
          const headers = new Headers(request.headers);
          headers.set('x-admin-id', admin.id);
          headers.set('x-admin-level', admin.level);
          return NextResponse.next({ headers });
        }
      } catch (error) {
        return NextResponse.redirect(new URL('/auth/admin-login', request.url));
      }
    }

    // User route protection
    else {
      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      try {
        const user = await verifyUserToken(token);
        
        // VIP level restrictions
        if (pathname.startsWith('/vip/upgrade') && user.vipLevel === 8) {
          return NextResponse.redirect(new URL('/vip/max-level', request.url));
        }

        // Add user data to headers for API routes
        if (pathname.startsWith('/api/user')) {
          const headers = new Headers(request.headers);
          headers.set('x-user-id', user.id);
          headers.set('x-vip-level', user.vipLevel.toString());
          return NextResponse.next({ headers });
        }
      } catch (error) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
  }

  return NextResponse.next();
}