'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Plus, MessageSquare } from 'lucide-react';
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

export default function MessagesPage() {
  const { data: session } = useSession();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [recipientUsername, setRecipientUsername] = useState('');
  const [creating, setCreating] = useState(false);

  const { data, isLoading, refetch } = useQuery<{ conversations: Conversation[] }>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await api.get('/api/v1/messaging/conversations');
      return { conversations: res.data.conversations ?? [] };
    },
    enabled: !!session,
  });

  const conversations = data?.conversations ?? [];

  const handleCreateConversation = async () => {
    if (!recipientUsername.trim()) return;
    setCreating(true);
    try {
      await api.post('/api/v1/messaging/conversations', {
        username: recipientUsername.trim(),
      });
      setDialogOpen(false);
      setRecipientUsername('');
      refetch();
      toast.success('Conversation started');
    } catch {
      toast.error('Could not start conversation. Check the username.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-primary">Messages</h1>
          <p className="text-muted-foreground">Your conversations</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus data-icon="inline-start" />
            New Conversation
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start a Conversation</DialogTitle>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel>Username</FieldLabel>
                <Input
                  placeholder="Enter username..."
                  value={recipientUsername}
                  onChange={(e) => setRecipientUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateConversation()}
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button
                disabled={creating || !recipientUsername.trim()}
                onClick={handleCreateConversation}
              >
                {creating && <Spinner data-icon="inline-start" />}
                Start
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-card">
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
              <EmptyDescription>
                Start a conversation with someone
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ConversationList conversations={conversations} />
        )}
      </div>
    </div>
  );
}
