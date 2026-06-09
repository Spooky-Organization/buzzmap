'use client';

import { useEffect, useState, use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { ArrowLeft, MessageSquareMore } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChatView, type Message } from '@/components/messaging/chat-view';
import { api } from '@/lib/api';
import { apiRoutes, appRoutes } from '@/lib/routes';
import {
  type BackendConversationDetail,
  type BackendConversationMessage,
  toChatMessage,
  toConversationMeta,
} from '@/lib/messaging';
import { useMessages } from '@/hooks/useMessages';
import { DashboardHero, DashboardHeroPill } from '@/components/dashboard/dashboard-surfaces';
import { ConversationRouteLoading } from '@/components/dashboard/loading-skeletons';

interface PageParams {
  conversationId: string;
}

export default function ConversationPage({ params }: { params: Promise<PageParams> }) {
  const { conversationId } = use(params);
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isTyping, setIsTyping] = useState(false);
  const currentUserId = session?.user?.id ?? '';
  const { onNewMessage, onReadReceipt, sendTyping, markAsRead, typingUsers } =
    useMessages(conversationId);

  const { data: meta, isLoading: metaLoading } = useQuery({
    queryKey: ['conversation-meta', conversationId],
    queryFn: async () => {
      const res = await api.get(apiRoutes.messaging.conversation(conversationId));
      return toConversationMeta(res.data as BackendConversationDetail, currentUserId);
    },
    enabled: !!session && !!conversationId && !!currentUserId,
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery<{ messages: Message[] }>({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const res = await api.get(apiRoutes.messaging.messages(conversationId));
      const messages = ((res.data.data ?? []) as BackendConversationMessage[])
        .slice()
        .reverse()
        .map(toChatMessage);
      return { messages };
    },
    enabled: !!session && !!conversationId,
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const res = await api.post(
        apiRoutes.messaging.messages(conversationId),
        { content }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
  });

  useEffect(() => {
    onNewMessage((msg) => {
      queryClient.setQueryData<{ messages: Message[] }>(
        ['messages', conversationId],
        (old) => {
          const existing = old?.messages ?? [];
          if (existing.some((message) => message.id === msg.id)) {
            return old ?? { messages: existing };
          }

          const next = [...existing, msg];
          return { messages: next };
        }
      );

      if (msg.senderId !== currentUserId) {
        markAsRead();
      }
    });

    onReadReceipt(({ userId }) => {
      if (userId === currentUserId) return;

      queryClient.setQueryData<{ messages: Message[] }>(
        ['messages', conversationId],
        (old) => ({
          messages:
            old?.messages.map((message) =>
              message.senderId === currentUserId
                ? { ...message, isRead: true }
                : message
            ) ?? [],
        })
      );
    });
  }, [conversationId, currentUserId, markAsRead, onNewMessage, onReadReceipt, queryClient]);

  useEffect(() => {
    setIsTyping(typingUsers.size > 0);
  }, [typingUsers]);

  useEffect(() => {
    if (!messagesData?.messages.length) return;
    markAsRead();
  }, [messagesData?.messages.length, markAsRead]);

  const messages = messagesData?.messages ?? [];

  const initials = (meta?.participantName ?? '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (metaLoading && messagesLoading) {
    return <ConversationRouteLoading />;
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardHero
        eyebrow="Conversation view"
        title={metaLoading ? 'Opening conversation...' : `Chat with ${meta?.participantName ?? 'participant'}`}
        icon={MessageSquareMore}
      >
        <DashboardHeroPill
          icon={MessageSquareMore}
          label="Thread status"
          value={isTyping ? 'Typing now' : 'Live'}
          note="The current conversation stays updated through the realtime messaging channel."
        />
      </DashboardHero>

    <div className="flex h-[calc(100vh-12rem)] flex-col rounded-[24px] border border-border/70 bg-card shadow-[0_22px_70px_-48px_rgba(15,37,64,0.68)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Button variant="ghost" size="icon-sm" nativeButton={false} render={<Link href={appRoutes.customer.messages} />}>
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
          onTyping={sendTyping}
        />
      )}
    </div>
    </div>
  );
}
