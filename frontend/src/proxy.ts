import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextProxy } from 'next/server';

// auth(middleware) wraps a NextAuth-aware handler and redirects
// unauthenticated requests to /login for the matched routes.
const authMiddleware = auth(() => NextResponse.next()) as unknown as NextProxy;

export const proxy: NextProxy = authMiddleware;

export const config = {
  // Next requires matcher values to stay as static literals in this segment config.
  matcher: [
    '/admin/:path*',
    '/feed/:path*',
    '/dashboard/:path*',
    '/cart/:path*',
    '/orders/:path*',
    '/search/:path*',
    '/pov/create/:path*',
    '/messages/:path*',
    '/notifications/:path*',
    '/admin/notifications/:path*',
    '/business/dashboard/:path*',
    '/business/notifications/:path*',
    '/business/shelf/:path*',
    '/business/orders/:path*',
    '/business/posts/:path*',
    '/business/analytics/:path*',
    '/business/settings/:path*',
  ],
};
