import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { app } from './app.js';
import { config } from '../config/index.js';

const httpServer = http.createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.socketCorsOrigin,
    credentials: true,
  },
});

// Redis adapter is attached in src/index.ts after the Redis singleton is ready.

export { httpServer, io };
