import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextProxy } from 'next/server';

// auth(middleware) wraps a NextAuth-aware handler and redirects
// unauthenticated requests to /login for the matched routes.
const authMiddleware = auth(() => NextResponse.next()) as unknown as NextProxy;

export const proxy: NextProxy = authMiddleware;

export const config = {
  matcher: [
    '/(customer)/:path*',
    '/(business)/:path*',
  ],
};
