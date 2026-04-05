'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '@/providers/socket-provider';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export function useMessages(conversationId?: string) {
  const { messagingSocket } = useSocket();
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const newMessageCallbackRef = useRef<((msg: Message) => void) | null>(null);

  useEffect(() => {
    if (!messagingSocket) return;

    const handleMessage = (message: Message) => {
      if (conversationId && message.conversationId !== conversationId) return;
      newMessageCallbackRef.current?.(message);
    };

    const handleTyping = ({ conversationId: cid, userId, isTyping }: TypingIndicator) => {
      if (conversationId && cid !== conversationId) return;
      setTypingUsers((prev) => {
        const next = new Set(prev);
        if (isTyping) {
          next.add(userId);
        } else {
          next.delete(userId);
        }
        return next;
      });
    };

    messagingSocket.on('message:new', handleMessage);
    messagingSocket.on('message:typing', handleTyping);

    return () => {
      messagingSocket.off('message:new', handleMessage);
      messagingSocket.off('message:typing', handleTyping);
    };
  }, [messagingSocket, conversationId]);

  const onNewMessage = useCallback((cb: (msg: Message) => void) => {
    newMessageCallbackRef.current = cb;
  }, []);

  const sendMessage = useCallback(
    (content: string) => {
      if (!messagingSocket || !conversationId) return;
      messagingSocket.emit('message:send', { conversationId, content });
    },
    [messagingSocket, conversationId]
  );

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!messagingSocket || !conversationId) return;
      messagingSocket.emit('message:typing', { conversationId, isTyping });
    },
    [messagingSocket, conversationId]
  );

  return { onNewMessage, sendMessage, sendTyping, typingUsers };
}
