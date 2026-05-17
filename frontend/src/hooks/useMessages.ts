'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '@/providers/socket-provider';
import type { Message } from '@/components/messaging/chat-view';

export interface SocketMessage extends Message {
  conversationId: string;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
}

interface MessageReadReceipt {
  conversationId: string;
  userId: string;
  readAt: string;
}

export function useMessages(conversationId?: string) {
  const { messagingSocket } = useSocket();
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const newMessageCallbackRef = useRef<((msg: SocketMessage) => void) | null>(null);
  const readReceiptCallbackRef = useRef<((receipt: MessageReadReceipt) => void) | null>(null);
  const typingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const lastTypingAtRef = useRef(0);

  useEffect(() => {
    if (!messagingSocket) return;
    const typingTimeouts = typingTimeoutsRef.current;

    const handleMessage = (message: SocketMessage) => {
      if (conversationId && message.conversationId !== conversationId) return;
      newMessageCallbackRef.current?.(message);
    };

    const handleTyping = ({ conversationId: cid, userId }: TypingIndicator) => {
      if (conversationId && cid !== conversationId) return;

      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.add(userId);
        return next;
      });

      const existingTimeout = typingTimeouts.get(userId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      const timeout = setTimeout(() => {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
        typingTimeouts.delete(userId);
      }, 3000);

      typingTimeouts.set(userId, timeout);
    };

    const handleReadReceipt = (receipt: MessageReadReceipt) => {
      if (conversationId && receipt.conversationId !== conversationId) return;
      readReceiptCallbackRef.current?.(receipt);
    };

    messagingSocket.on('message:new', handleMessage);
    messagingSocket.on('message:typing', handleTyping);
    messagingSocket.on('message:read', handleReadReceipt);

    return () => {
      messagingSocket.off('message:new', handleMessage);
      messagingSocket.off('message:typing', handleTyping);
      messagingSocket.off('message:read', handleReadReceipt);
      typingTimeouts.forEach((timeout) => clearTimeout(timeout));
      typingTimeouts.clear();
    };
  }, [messagingSocket, conversationId]);

  const onNewMessage = useCallback((cb: (msg: SocketMessage) => void) => {
    newMessageCallbackRef.current = cb;
  }, []);

  const onReadReceipt = useCallback((cb: (receipt: MessageReadReceipt) => void) => {
    readReceiptCallbackRef.current = cb;
  }, []);

  const sendTyping = useCallback(() => {
      const now = Date.now();
      if (!messagingSocket || !conversationId) return;
      if (now - lastTypingAtRef.current < 1200) return;

      lastTypingAtRef.current = now;
      messagingSocket.emit('message:typing', { conversationId });
    },
    [messagingSocket, conversationId]
  );

  const markAsRead = useCallback(() => {
    if (!messagingSocket || !conversationId) return;
    messagingSocket.emit('message:read', { conversationId });
  }, [messagingSocket, conversationId]);

  return { onNewMessage, onReadReceipt, sendTyping, markAsRead, typingUsers };
}
