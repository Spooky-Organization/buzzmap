'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Socket } from 'socket.io-client';
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
  const [notificationSocket, setNotificationSocket] = useState<Socket | null>(null);
  const [messagingSocket, setMessagingSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.accessToken) return;

    const token = session.accessToken;

    const notifSocket = createSocket('/notifications', token);
    const msgSocket = createSocket('/messaging', token);

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    notifSocket.on('connect', handleConnect);
    notifSocket.on('disconnect', handleDisconnect);

    notifSocket.connect();
    msgSocket.connect();

    setNotificationSocket(notifSocket);
    setMessagingSocket(msgSocket);

    return () => {
      notifSocket.disconnect();
      msgSocket.disconnect();
    };
  }, [status, session?.accessToken]);

  return (
    <SocketContext.Provider value={{ notificationSocket, messagingSocket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
