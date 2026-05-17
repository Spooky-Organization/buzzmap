import 'next-auth';

declare module 'next-auth' {
  interface User {
    role: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
  }
  interface Session {
    user: User & { id: string; role: string };
    accessToken?: string;
    error?: 'RefreshAccessTokenError';
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role?: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: 'RefreshAccessTokenError';
  }
}
