'use client';
import { AuthProvider } from './auth-provider';
import { QueryProvider } from './query-provider';
import { SocketProvider } from './socket-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <QueryProvider>
        <SocketProvider>{children}</SocketProvider>
      </QueryProvider>
    </AuthProvider>
  );
}
