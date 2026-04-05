import { type Namespace } from 'socket.io';
import { authService } from '../auth/services/authService.js';
import { notificationService } from './services/notificationService.js';

export function setupNotificationNamespace(nsp: Namespace): void {
  // Auth middleware — verify JWT from handshake
  nsp.use(async (socket, next) => {
    const token = socket.handshake.auth['token'] as string | undefined;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const payload = authService.verifyAccessToken(token);
      socket.data['userId'] = payload.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  nsp.on('connection', (socket) => {
    const userId = socket.data['userId'] as string;

    // Join personal room
    socket.join(`user:${userId}`);

    socket.on('notification:markRead', async (notificationId: string) => {
      try {
        const updated = await notificationService.markAsRead(notificationId, userId);
        socket.emit('notification:readConfirmed', updated);
      } catch (err) {
        socket.emit('notification:error', {
          event: 'notification:markRead',
          message: err instanceof Error ? err.message : 'Failed to mark notification as read',
        });
      }
    });

    socket.on('notification:markAllRead', async () => {
      try {
        const result = await notificationService.markAllAsRead(userId);
        socket.emit('notification:allReadConfirmed', result);
      } catch (err) {
        socket.emit('notification:error', {
          event: 'notification:markAllRead',
          message: err instanceof Error ? err.message : 'Failed to mark all notifications as read',
        });
      }
    });
  });
}
