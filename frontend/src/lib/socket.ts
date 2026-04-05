import { io, Socket } from 'socket.io-client';

export function createSocket(namespace: string, token: string): Socket {
  return io(`${process.env.NEXT_PUBLIC_SOCKET_URL}${namespace}`, {
    auth: { token },
    autoConnect: false,
  });
}
