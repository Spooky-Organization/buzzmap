import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { JWT } from '@auth/core/jwt';
import './auth-types';
import { apiRoutes, appRoutes } from './routes';

function getApiUrl(): string {
  return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || '';
}

function getTokenExpiry(token: string): number {
  try {
    const payload = token.split('.')[1];
    if (!payload) return Date.now();
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(Buffer.from(normalized, 'base64').toString('utf8')) as {
      exp?: number;
    };
    return decoded.exp ? decoded.exp * 1000 : Date.now();
  } catch {
    return Date.now();
  }
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    if (!token.refreshToken) {
      throw new Error('Missing refresh token');
    }

    const res = await fetch(`${getApiUrl()}${apiRoutes.auth.refresh}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });

    if (!res.ok) {
      throw new Error('Refresh request failed');
    }

    const { data } = await res.json();

    return {
      ...token,
      accessToken: data.accessToken as string,
      refreshToken: data.refreshToken as string,
      accessTokenExpires: getTokenExpiry(data.accessToken as string),
      error: undefined,
    };
  } catch {
    return {
      ...token,
      accessToken: undefined,
      refreshToken: undefined,
      accessTokenExpires: 0,
      error: 'RefreshAccessTokenError' as const,
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const res = await fetch(
          `${getApiUrl()}${apiRoutes.auth.login}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          }
        );

        if (!res.ok) return null;

        const { data } = await res.json();
        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          accessTokenExpires: getTokenExpiry(data.accessToken),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = user.accessTokenExpires;
        token.error = undefined;
        return token;
      }

      if (
        typeof token.accessTokenExpires === 'number' &&
        Date.now() < token.accessTokenExpires - 30_000
      ) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user.id = token.sub!;
      session.user.role = token.role as string;
      session.accessToken = token.accessToken as string | undefined;
      session.error = token.error;
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      return `${baseUrl}${appRoutes.auth.login}`;
    },
  },
  pages: {
    signIn: appRoutes.auth.login,
  },
});
