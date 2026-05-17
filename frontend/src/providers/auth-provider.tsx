'use client';
import { useEffect, useRef } from 'react';
import { signOut, SessionProvider, useSession } from 'next-auth/react';
import { appRoutes } from '@/lib/routes';

const SESSION_COOKIE_NAMES = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
] as const;

function hasResidualSessionCookie(): boolean {
  if (typeof document === 'undefined') return false;

  return SESSION_COOKIE_NAMES.some((name) =>
    document.cookie.split(';').some((cookie) => cookie.trim().startsWith(`${name}=`))
  );
}

function AuthSessionGuard() {
  const { data: session, status } = useSession();
  const isHandlingFailure = useRef(false);
  const clearedResidualCookie = useRef(false);

  useEffect(() => {
    if (status === 'loading' || isHandlingFailure.current) {
      return;
    }

    if (session?.error === 'RefreshAccessTokenError') {
      isHandlingFailure.current = true;
      void signOut({ redirectTo: appRoutes.auth.login });
      return;
    }

    if (status === 'authenticated') {
      clearedResidualCookie.current = false;
      return;
    }

    if (
      status === 'unauthenticated' &&
      !clearedResidualCookie.current &&
      hasResidualSessionCookie()
    ) {
      clearedResidualCookie.current = true;
      isHandlingFailure.current = true;

      void signOut({ redirect: false }).finally(() => {
        isHandlingFailure.current = false;
      });
    }
  }, [session?.error, status]);

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthSessionGuard />
      {children}
    </SessionProvider>
  );
}
