'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Socket } from 'socket.io-client';
import { socketRoutes } from '@/lib/routes';
import { createSocket } from '@/lib/socket';

interface SocketContextType {
  notificationSocket: Socket | null;
  messagingSocket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  notificationSocket: null,
  messagingSocket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const token = status === 'authenticated' ? session?.accessToken : undefined;

  const notificationSocket = useMemo<Socket | null>(
    () => (token ? createSocket(socketRoutes.notifications, token) : null),
    [token]
  );
  const messagingSocket = useMemo<Socket | null>(
    () => (token ? createSocket(socketRoutes.messaging, token) : null),
    [token]
  );

  useEffect(() => {
    if (!notificationSocket || !messagingSocket) return;

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    notificationSocket.on('connect', handleConnect);
    notificationSocket.on('disconnect', handleDisconnect);

    notificationSocket.connect();
    messagingSocket.connect();

    return () => {
      notificationSocket.disconnect();
      messagingSocket.disconnect();
      notificationSocket.off('connect', handleConnect);
      notificationSocket.off('disconnect', handleDisconnect);
    };
  }, [notificationSocket, messagingSocket]);

  return (
    <SocketContext.Provider value={{ notificationSocket, messagingSocket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
