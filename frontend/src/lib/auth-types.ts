import 'next-auth';

declare module 'next-auth' {
  interface User {
    role: string;
    accessToken: string;
    refreshToken: string;
  }
  interface Session {
    user: User & { id: string; role: string };
    accessToken: string;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role: string;
    accessToken: string;
    refreshToken: string;
  }
}
