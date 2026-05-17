'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { MessageSquare, Plus, Search, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { ConversationList, type Conversation } from '@/components/messaging/conversation-list';
import { api } from '@/lib/api';
import { apiRoutes } from '@/lib/routes';
import {
  type BackendConversationPreview,
  toConversationListItem,
} from '@/lib/messaging';
import { DashboardHero, DashboardHeroPill, DashboardPanel } from '@/components/dashboard/dashboard-surfaces';

interface SearchUserResult {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [creating, setCreating] = useState(false);
  const currentUserId = session?.user?.id ?? '';

  const { data, isLoading, refetch } = useQuery<{ conversations: Conversation[] }>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await api.get(apiRoutes.messaging.conversations);
      const conversations = ((res.data.data ?? []) as BackendConversationPreview[]).map(
        (conversation) => toConversationListItem(conversation, currentUserId)
      );
      return { conversations };
    },
    enabled: !!session && !!currentUserId,
  });

  const conversations = data?.conversations ?? [];

  const handleCreateConversation = async () => {
    const name = recipientName.trim();
    if (!name) return;

    setCreating(true);
    try {
      const searchRes = await api.get(apiRoutes.search.users, {
        params: { keyword: name, limit: 10 },
      });

      const users = (searchRes.data.data ?? []) as SearchUserResult[];
      const normalizedName = name.toLowerCase();
      const participant =
        users.find(
          (user) => user.id !== currentUserId && user.name.trim().toLowerCase() === normalizedName
        ) ?? users.find((user) => user.id !== currentUserId);

      if (!participant) {
        throw new Error('participant-not-found');
      }

      await api.post(apiRoutes.messaging.conversations, {
        type: 'DIRECT',
        participantIds: [participant.id],
      });
      setDialogOpen(false);
      setRecipientName('');
      refetch();
      toast.success('Conversation started');
    } catch {
      toast.error('Could not start conversation. Enter an existing user name.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <DashboardHero
        eyebrow="Customer messaging"
        title="Keep conversations close to the commerce flow."
        description="Use messages to talk to businesses and other users without losing the context of products, orders, and recommendations."
        icon={MessageSquare}
      >
        <DashboardHeroPill
          icon={Send}
          label="Thread model"
          value="Direct chats"
          note="Conversations stay lightweight and easy to inspect."
        />
        <DashboardHeroPill
          icon={Search}
          label="Start fast"
          value="Name lookup"
          note="Create a new conversation by finding an existing user."
        />
      </DashboardHero>

      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className="rounded-2xl" />}>
            <Plus data-icon="inline-start" />
            New Conversation
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start a Conversation</DialogTitle>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel>User Name</FieldLabel>
                <Input
                  placeholder="Enter a user name..."
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateConversation()}
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button disabled={creating || !recipientName.trim()} onClick={handleCreateConversation}>
                {creating ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Start
                  </>
                ) : (
                  <>
                    <MessageSquare data-icon="inline-start" />
                    Start
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DashboardPanel
        title="Conversation List"
        description="Recent message threads available to the signed-in user."
        icon={MessageSquare}
      >
        <div className="rounded-[24px] border border-border/70 bg-background/90">
          {isLoading ? (
            <div className="flex flex-col gap-3 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <Empty className="py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessageSquare />
                </EmptyMedia>
                <EmptyTitle>No conversations yet</EmptyTitle>
                <EmptyDescription>Start a conversation with someone</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ConversationList conversations={conversations} />
          )}
        </div>
      </DashboardPanel>
    </div>
  );
}
