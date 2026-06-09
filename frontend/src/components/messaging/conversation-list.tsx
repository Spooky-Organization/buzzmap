'use client';

import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { appRoutes } from '@/lib/routes';
import { cn } from '@/lib/utils';

export interface Conversation {
  id: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageAt?: string;
  unreadCount: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeId?: string;
  hrefBuilder?: (conversationId: string) => string;
}

export function ConversationList({
  conversations,
  activeId,
  hrefBuilder = appRoutes.customer.message,
}: ConversationListProps) {
  const router = useRouter();

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-0">
        {conversations.map((convo) => {
          const initials = convo.participantName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          return (
            <button
              key={convo.id}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted',
                activeId === convo.id && 'bg-muted'
              )}
              onClick={() => router.push(hrefBuilder(convo.id))}
            >
              <Avatar>
                {convo.participantAvatar && (
                  <AvatarImage src={convo.participantAvatar} alt={convo.participantName} />
                )}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{convo.participantName}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {convo.lastMessageAt
                      ? new Date(convo.lastMessageAt).toLocaleDateString()
                      : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-muted-foreground">
                    {convo.lastMessage}
                  </span>
                  {convo.unreadCount > 0 && (
                    <Badge className="shrink-0 rounded-full text-xs">
                      {convo.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
