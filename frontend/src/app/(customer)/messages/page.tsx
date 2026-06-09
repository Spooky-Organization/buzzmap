'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ContactRound, MessageSquare, Phone, Plus, Search, Send, Sparkles, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
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
import { Textarea } from '@/components/ui/textarea';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { ConversationList, type Conversation } from '@/components/messaging/conversation-list';
import { api } from '@/lib/api';
import { apiRoutes, appRoutes } from '@/lib/routes';
import {
  type BackendConversationPreview,
  toConversationListItem,
} from '@/lib/messaging';
import { DashboardHero, DashboardHeroPill, DashboardPanel } from '@/components/dashboard/dashboard-surfaces';
import { ConversationRowSkeleton } from '@/components/dashboard/loading-skeletons';

interface SearchUserResult {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
}

interface RecommendedConversationUser {
  userId: string;
  name: string;
  avatar: string | null;
  reasons: string[];
  lastInteractionAt: string | null;
  matchedContactName?: string | null;
}

interface ImportedContact {
  name?: string;
  phone: string;
}

const CONTACT_SYNC_STORAGE_KEY = 'buzzmap-message-contact-sync';

function serializeContacts(contacts: ImportedContact[]): string {
  return contacts
    .map((contact) => (contact.name?.trim() ? `${contact.name.trim()}, ${contact.phone.trim()}` : contact.phone.trim()))
    .join('\n');
}

function parseContactsDraft(value: string): ImportedContact[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const segments = line
        .split(',')
        .map((segment) => segment.trim())
        .filter(Boolean);

      if (segments.length <= 1) {
        return { phone: line };
      }

      return {
        name: segments.slice(0, -1).join(', '),
        phone: segments[segments.length - 1] ?? '',
      };
    })
    .filter((contact) => contact.phone.trim().length > 0);
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

export default function MessagesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [contactsDraft, setContactsDraft] = useState('');
  const [importedContacts, setImportedContacts] = useState<ImportedContact[]>([]);
  const [creating, setCreating] = useState(false);
  const [quickStartingForUserId, setQuickStartingForUserId] = useState<string | null>(null);
  const currentUserId = session?.user?.id ?? '';

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = window.localStorage.getItem(CONTACT_SYNC_STORAGE_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as ImportedContact[];
      if (Array.isArray(parsed)) {
        setImportedContacts(
          parsed.filter((contact) => typeof contact?.phone === 'string' && contact.phone.trim().length > 0)
        );
      }
    } catch {
      window.localStorage.removeItem(CONTACT_SYNC_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!contactDialogOpen) return;
    setContactsDraft(serializeContacts(importedContacts));
  }, [contactDialogOpen, importedContacts]);

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

  const { data: recommendations, isLoading: recommendationsLoading } = useQuery<
    RecommendedConversationUser[]
  >({
    queryKey: ['conversation-recommendations'],
    queryFn: async () => {
      const res = await api.get<RecommendedConversationUser[]>(apiRoutes.messaging.recommendations);
      return res.data;
    },
    enabled: !!session && !!currentUserId,
  });

  const {
    data: contactRecommendations,
    isLoading: contactRecommendationsLoading,
  } = useQuery<RecommendedConversationUser[]>({
    queryKey: ['conversation-contact-recommendations', importedContacts],
    queryFn: async () => {
      const res = await api.post<RecommendedConversationUser[]>(
        apiRoutes.messaging.contactRecommendations,
        {
          contacts: importedContacts,
          limit: 8,
        }
      );
      return res.data;
    },
    enabled: !!session && !!currentUserId && importedContacts.length > 0,
  });

  const hasContactSync = importedContacts.length > 0;

  const saveImportedContacts = () => {
    const parsed = parseContactsDraft(contactsDraft);
    if (parsed.length === 0) {
      toast.error('Add at least one contact with a phone number');
      return;
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CONTACT_SYNC_STORAGE_KEY, JSON.stringify(parsed));
    }

    setImportedContacts(parsed);
    setContactDialogOpen(false);
    toast.success(`Synced ${parsed.length} contact${parsed.length === 1 ? '' : 's'}`);
  };

  const clearImportedContacts = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(CONTACT_SYNC_STORAGE_KEY);
    }

    setImportedContacts([]);
    setContactsDraft('');
    setContactDialogOpen(false);
    toast.success('Contact sync cleared');
  };

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

  const startRecommendedConversation = async (userId: string) => {
    setQuickStartingForUserId(userId);
    try {
      const res = await api.post(apiRoutes.messaging.conversations, {
        type: 'DIRECT',
        participantIds: [userId],
      });
      const conversationId = res.data.id as string;
      toast.success('Conversation started');
      router.push(appRoutes.customer.message(conversationId));
    } catch {
      toast.error('Could not start this conversation');
    } finally {
      setQuickStartingForUserId(null);
      refetch();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <DashboardHero
        eyebrow="Customer messaging"
        title="Keep conversations close to the commerce flow."
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
        <DashboardHeroPill
          icon={Phone}
          label="Contact sync"
          value={hasContactSync ? `${importedContacts.length} loaded` : 'Not synced'}
          note="Import phone contacts to find people already on BuzzMap."
        />
      </DashboardHero>

      <div className="flex flex-wrap justify-end gap-3">
        <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
          <DialogTrigger render={<Button variant="outline" className="rounded-2xl" />}>
            <Upload data-icon="inline-start" />
            {hasContactSync ? 'Manage Contacts' : 'Import Contacts'}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sync Contacts</DialogTitle>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel>One contact per line</FieldLabel>
                <Textarea
                  className="min-h-48"
                  placeholder={'Jane Doe, 0712345678\nAlex, +254712345678\n0700111222'}
                  value={contactsDraft}
                  onChange={(event) => setContactsDraft(event.target.value)}
                />
              </Field>
            </FieldGroup>
            <DialogFooter className="flex flex-wrap gap-2 sm:justify-between">
              {hasContactSync ? (
                <Button type="button" variant="outline" onClick={clearImportedContacts}>
                  Clear sync
                </Button>
              ) : (
                <span />
              )}
              <Button type="button" onClick={saveImportedContacts}>
                <ContactRound data-icon="inline-start" />
                Save contacts
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
        title="Recommended Starters"
        description="Suggested from synced contacts plus the people and businesses you already interact with on BuzzMap."
        icon={Sparkles}
      >
        <div className="flex flex-col gap-6">
          {hasContactSync ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">From your contacts</p>
                  <p className="text-sm text-muted-foreground">
                    Match imported phone contacts to existing BuzzMap users.
                  </p>
                </div>
                <Badge variant="outline">{importedContacts.length} synced</Badge>
              </div>
              {contactRecommendationsLoading ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <ConversationRowSkeleton key={index} />
                  ))}
                </div>
              ) : (contactRecommendations ?? []).length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-border/70 bg-background/80 px-4 py-8 text-sm text-muted-foreground">
                  None of the synced contacts match a BuzzMap account yet.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {(contactRecommendations ?? []).map((user) => (
                    <div
                      key={`contact-${user.userId}`}
                      className="flex flex-col gap-4 rounded-[24px] border border-border/70 bg-background/90 p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                          <AvatarFallback>{initialsFor(user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.matchedContactName?.trim()
                              ? `Saved as ${user.matchedContactName}`
                              : 'Matched from your imported contacts'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {user.reasons.map((reason) => (
                          <Badge key={reason} variant="outline">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        type="button"
                        onClick={() => void startRecommendedConversation(user.userId)}
                        disabled={quickStartingForUserId === user.userId}
                      >
                        {quickStartingForUserId === user.userId ? (
                          <>
                            <Spinner data-icon="inline-start" />
                            Opening
                          </>
                        ) : (
                          <>
                            <Send data-icon="inline-start" />
                            Start conversation
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-foreground">From BuzzMap activity</p>
              <p className="text-sm text-muted-foreground">
                Follow, order, and POV signals still feed the default recommendation list.
              </p>
            </div>
            {recommendationsLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <ConversationRowSkeleton key={index} />
                ))}
              </div>
            ) : (recommendations ?? []).length === 0 ? (
              <Empty className="py-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Sparkles />
                  </EmptyMedia>
                  <EmptyTitle>No suggestions yet</EmptyTitle>
                  <EmptyDescription>
                    Recommendations will appear as you follow profiles, order, leave POV reviews, or import contacts.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {(recommendations ?? []).map((user) => (
                  <div
                    key={user.userId}
                    className="flex flex-col gap-4 rounded-[24px] border border-border/70 bg-background/90 p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                        <AvatarFallback>{initialsFor(user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.lastInteractionAt
                            ? `Last signal ${formatInteractionDate(user.lastInteractionAt)}`
                            : 'Suggested from your activity'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {user.reasons.map((reason) => (
                        <Badge key={reason} variant="outline">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      type="button"
                      onClick={() => void startRecommendedConversation(user.userId)}
                      disabled={quickStartingForUserId === user.userId}
                    >
                      {quickStartingForUserId === user.userId ? (
                        <>
                          <Spinner data-icon="inline-start" />
                          Opening
                        </>
                      ) : (
                        <>
                          <Send data-icon="inline-start" />
                          Start conversation
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardPanel>

      <DashboardPanel
        title="Conversation List"
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
