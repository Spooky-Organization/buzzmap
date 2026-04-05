import type { Namespace, Socket } from 'socket.io';
import { authService } from '../auth/services/authService.js';
import { messagingService } from './services/messagingService.js';
import { logger } from '../../shared/utils/logger.js';

// ─── Event payload shapes ──────────────────────────────────────────────────────

interface MessageSendPayload {
  conversationId: string;
  content?: string;
}

interface MessageTypingPayload {
  conversationId: string;
}

interface MessageReadPayload {
  conversationId: string;
}

// ─── Namespace setup ──────────────────────────────────────────────────────────

export function setupMessagingNamespace(nsp: Namespace): void {
  // ── Auth middleware ──────────────────────────────────────────────────────────
  nsp.use((socket, next) => {
    const token =
      (socket.handshake.auth as Record<string, string | undefined>)['token'] ??
      (socket.handshake.headers['authorization'] as string | undefined)?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication error: no token provided.'));
    }

    try {
      const payload = authService.verifyAccessToken(token);
      (socket.data as Record<string, unknown>)['userId'] = payload.userId;
      (socket.data as Record<string, unknown>)['role'] = payload.role;
      next();
    } catch {
      next(new Error('Authentication error: invalid or expired token.'));
    }
  });

  // ── Connection handler ───────────────────────────────────────────────────────
  nsp.on('connection', (socket: Socket) => {
    const userId = (socket.data as Record<string, unknown>)['userId'] as string;

    logger.info({ userId, socketId: socket.id }, 'Messaging socket connected');

    // Join all conversation rooms for this user
    messagingService
      .getConversationsForSocket(userId)
      .then((conversations) => {
        conversations.forEach((c) => void socket.join(`conv:${c.id}`));
      })
      .catch((err: unknown) => {
        logger.error({ err, userId }, 'Failed to join conversation rooms');
      });

    // ── message:send ───────────────────────────────────────────────────────────
    socket.on('message:send', (rawData: unknown) => {
      const data = rawData as MessageSendPayload | null;

      if (!data || typeof data.conversationId !== 'string') {
        socket.emit('error', { message: 'Invalid message:send payload.' });
        return;
      }

      messagingService
        .sendMessage(userId, data.conversationId, data.content)
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : 'Failed to send message.';
          socket.emit('error', { message });
        });
      // The service emits 'message:new' to the room after persisting.
    });

    // ── message:typing ─────────────────────────────────────────────────────────
    // No DB persistence — broadcast to the room only.
    socket.on('message:typing', (rawData: unknown) => {
      const data = rawData as MessageTypingPayload | null;
      if (!data || typeof data.conversationId !== 'string') return;

      socket.to(`conv:${data.conversationId}`).emit('message:typing', {
        userId,
        conversationId: data.conversationId,
      });
    });

    // ── message:read ───────────────────────────────────────────────────────────
    socket.on('message:read', (rawData: unknown) => {
      const data = rawData as MessageReadPayload | null;

      if (!data || typeof data.conversationId !== 'string') {
        socket.emit('error', { message: 'Invalid message:read payload.' });
        return;
      }

      messagingService
        .markAsRead(data.conversationId, userId)
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : 'Failed to mark as read.';
          socket.emit('error', { message });
        });
      // The service emits 'message:read' to the room after persisting.
    });

    // ── disconnect ─────────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      logger.info({ userId, socketId: socket.id }, 'Messaging socket disconnected');
    });
  });
}
