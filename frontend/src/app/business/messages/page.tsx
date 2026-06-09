'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MessageSquare, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { ConversationList, type Conversation } from '@/components/messaging/conversation-list';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/lib/api';
import { DashboardHero, DashboardHeroPill, DashboardPanel } from '@/components/dashboard/dashboard-surfaces';
import { ConversationRowSkeleton } from '@/components/dashboard/loading-skeletons';
import { apiRoutes, appRoutes } from '@/lib/routes';
import {
  type BackendConversationPreview,
  toConversationListItem,
} from '@/lib/messaging';

interface RecommendedCustomer {
  userId: string;
  name: string;
  avatar: string | null;
  reasons: string[];
  lastInteractionAt: string;
}

function initialsFor(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatInteractionDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(dateString));
}

export default function BusinessMessagesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ?? '';
  const [creatingForUserId, setCreatingForUserId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery<{ conversations: Conversation[] }>({
    queryKey: ['business-conversations'],
    queryFn: async () => {
      const res = await api.get(apiRoutes.messaging.conversations);
      const conversations = ((res.data.data ?? []) as BackendConversationPreview[]).map(
        (conversation) => toConversationListItem(conversation, currentUserId)
      );
      return { conversations };
    },
    enabled: !!session && !!currentUserId,
  });

  const { data: recommendations, isLoading: recommendationsLoading } = useQuery<
    RecommendedCustomer[]
  >({
    queryKey: ['business-conversation-recommendations'],
    queryFn: async () => {
      const res = await api.get<RecommendedCustomer[]>(apiRoutes.messaging.businessRecommendations);
      return res.data;
    },
    enabled: !!session && !!currentUserId,
  });

  const conversations = data?.conversations ?? [];

  const startConversation = async (userId: string) => {
    setCreatingForUserId(userId);
    try {
      const res = await api.post(apiRoutes.messaging.conversations, {
        type: 'DIRECT',
        participantIds: [userId],
      });
      const conversationId = res.data.id as string;
      toast.success('Conversation started');
      router.push(appRoutes.business.message(conversationId));
    } catch {
      toast.error('Could not start this conversation');
    } finally {
      setCreatingForUserId(null);
      refetch();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <DashboardHero
        eyebrow="Business messaging"
        title="Reply to customers from one business inbox."
        description="Use recent customer activity to restart high-context conversations without hunting for names across the whole platform."
        icon={MessageSquare}
      >
        <DashboardHeroPill
          icon={MessageSquare}
          label="Inbox mode"
          value="Direct threads"
          note="Every conversation stays attached to a real BuzzMap user."
        />
        <DashboardHeroPill
          icon={Sparkles}
          label="Recommendations"
          value="Real customer signals"
          note="Suggestions come from recent orders and POV reviews, not random global search."
        />
        <DashboardHeroPill
          icon={Send}
          label="Use case"
          value="Follow up fast"
          note="Thank reviewers, resolve issues, and continue purchase conversations."
        />
      </DashboardHero>

      <DashboardPanel
        title="Suggested customers"
        description="These customers interacted with your business recently and are the safest starting points for outreach."
        icon={Sparkles}
      >
        {recommendationsLoading ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <ConversationRowSkeleton key={index} />
            ))}
          </div>
        ) : (recommendations ?? []).length === 0 ? (
          <Empty className="py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Sparkles />
              </EmptyMedia>
              <EmptyTitle>No recommended customers yet</EmptyTitle>
              <EmptyDescription>
                Customer order and POV activity will populate this list automatically.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(recommendations ?? []).map((customer) => (
              <div
                key={customer.userId}
                className="flex flex-col gap-4 rounded-[24px] border border-border/70 bg-background/90 p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <Avatar>
                    {customer.avatar && (
                      <AvatarImage src={customer.avatar} alt={customer.name} />
                    )}
                    <AvatarFallback>{initialsFor(customer.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {customer.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last activity {formatInteractionDate(customer.lastInteractionAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {customer.reasons.map((reason) => (
                    <Badge key={reason} variant="outline">
                      {reason}
                    </Badge>
                  ))}
                </div>

                <Button
                  type="button"
                  onClick={() => void startConversation(customer.userId)}
                  disabled={creatingForUserId === customer.userId}
                >
                  {creatingForUserId === customer.userId ? (
                    <>
                      <Spinner data-icon="inline-start" />
                      Opening
                    </>
                  ) : (
                    <>
                      <Send data-icon="inline-start" />
                      Message customer
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </DashboardPanel>

      <DashboardPanel
        title="Conversation list"
        description="Open any existing thread and continue it in realtime."
        icon={MessageSquare}
      >
        <div className="rounded-[24px] border border-border/70 bg-background/90">
          {isLoading ? (
            <div className="flex flex-col gap-3 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ConversationRowSkeleton key={i} />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <Empty className="py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessageSquare />
                </EmptyMedia>
                <EmptyTitle>No conversations yet</EmptyTitle>
                <EmptyDescription>
                  Start with a recommended customer above to open your first thread.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ConversationList
              conversations={conversations}
              hrefBuilder={appRoutes.business.message}
            />
          )}
        </div>
      </DashboardPanel>
    </div>
  );
}
