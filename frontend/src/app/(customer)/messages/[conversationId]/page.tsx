'use client';

import { useEffect, useState, use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChatView, type Message } from '@/components/messaging/chat-view';
import { useSocket } from '@/providers/socket-provider';
import { api } from '@/lib/api';

interface PageParams {
  conversationId: string;
}

interface ConversationMeta {
  id: string;
  participantName: string;
  participantAvatar?: string;
  participantId: string;
}

export default function ConversationPage({ params }: { params: Promise<PageParams> }) {
  const { conversationId } = use(params);
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { messagingSocket } = useSocket();
  const [isTyping, setIsTyping] = useState(false);

  const { data: meta, isLoading: metaLoading } = useQuery<ConversationMeta>({
    queryKey: ['conversation-meta', conversationId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/messaging/conversations/${conversationId}`);
      return res.data;
    },
    enabled: !!session && !!conversationId,
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery<{ messages: Message[] }>({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/messaging/conversations/${conversationId}/messages`);
      return { messages: res.data.messages ?? [] };
    },
    enabled: !!session && !!conversationId,
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const res = await api.post(
        `/api/v1/messaging/conversations/${conversationId}/messages`,
        { content }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
  });

  useEffect(() => {
    if (!messagingSocket || !conversationId) return;

    messagingSocket.emit('join-conversation', { conversationId });

    const handleNewMessage = (msg: Message) => {
      queryClient.setQueryData<{ messages: Message[] }>(
        ['messages', conversationId],
        (old) => ({ messages: [...(old?.messages ?? []), msg] })
      );
    };

    const handleTyping = ({ userId }: { userId: string }) => {
      if (userId !== session?.user?.id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    };

    messagingSocket.on('message:new', handleNewMessage);
    messagingSocket.on('message:typing', handleTyping);

    return () => {
      messagingSocket.off('message:new', handleNewMessage);
      messagingSocket.off('message:typing', handleTyping);
      messagingSocket.emit('leave-conversation', { conversationId });
    };
  }, [messagingSocket, conversationId, session?.user?.id, queryClient]);

  const messages = messagesData?.messages ?? [];
  const currentUserId = (session?.user as { id?: string })?.id ?? '';

  const initials = (meta?.participantName ?? '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-xl border bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Button variant="ghost" size="icon-sm" nativeButton={false} render={<Link href="/messages" />}>
          <ArrowLeft />
          <span className="sr-only">Back to messages</span>
        </Button>
        {metaLoading ? (
          <Skeleton className="h-8 w-40" />
        ) : (
          <>
            <Avatar size="sm">
              {meta?.participantAvatar && (
                <AvatarImage src={meta.participantAvatar} alt={meta.participantName} />
              )}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{meta?.participantName}</span>
          </>
        )}
      </div>

      {/* Chat */}
      {messagesLoading ? (
        <div className="flex flex-1 flex-col gap-3 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className={`h-10 w-48 ${i % 2 === 0 ? 'mr-auto' : 'ml-auto'}`}
            />
          ))}
        </div>
      ) : (
        <ChatView
          messages={messages}
          currentUserId={currentUserId}
          isTyping={isTyping}
          isSending={sendMessage.isPending}
          onSend={(content) => sendMessage.mutate(content)}
        />
      )}
    </div>
  );
}
