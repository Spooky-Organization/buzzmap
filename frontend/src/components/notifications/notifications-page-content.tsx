'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Check,
  CheckCheck,
  MessageSquare,
  Package,
  Signal,
  UserPlus,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { DashboardHero, DashboardHeroPill, DashboardPanel } from '@/components/dashboard/dashboard-surfaces';
import { api } from '@/lib/api';
import { apiRoutes, appRoutes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { NotificationRowSkeleton } from '@/components/dashboard/loading-skeletons';

type NotificationType = 'POV_POSTED' | 'ORDER_UPDATE' | 'NEW_FOLLOWER' | 'MESSAGE' | 'FRIEND_JOINED';
type SessionRole = 'ADMIN' | 'BUSINESS_OWNER' | 'CUSTOMER';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown> | null;
}

interface NotificationsData {
  notifications: Notification[];
  unreadCount: number;
}

const NOTIFICATION_ICONS: Record<NotificationType, React.ElementType> = {
  POV_POSTED: Bell,
  ORDER_UPDATE: Package,
  NEW_FOLLOWER: UserPlus,
  MESSAGE: MessageSquare,
  FRIEND_JOINED: Users,
};

function readString(data: Record<string, unknown> | null | undefined, key: string): string | null {
  const value = data?.[key];
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function resolveNotificationHref(
  notification: Notification,
  role: SessionRole | undefined
): string | null {
  if (!role) return null;

  if (notification.type === 'MESSAGE') {
    const conversationId = readString(notification.data, 'conversationId');
    if (role === 'CUSTOMER' && conversationId) {
      return appRoutes.customer.message(conversationId);
    }
    if (role === 'BUSINESS_OWNER' && conversationId) {
      return appRoutes.business.message(conversationId);
    }
    if (role === 'ADMIN') {
      return appRoutes.admin.messages;
    }
    return null;
  }

  if (notification.type === 'ORDER_UPDATE') {
    if (role === 'BUSINESS_OWNER') {
      return appRoutes.business.orders;
    }
    if (role === 'ADMIN') {
      return appRoutes.admin.orders;
    }
    return appRoutes.customer.orders;
  }

  return null;
}

export function NotificationsPageContent({
  eyebrow,
  title,
  description,
  panelTitle,
  panelDescription,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  panelTitle: string;
  panelDescription?: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const role = session?.user?.role as SessionRole | undefined;

  const { data, isLoading } = useQuery<NotificationsData>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const [notificationsRes, unreadCountRes] = await Promise.all([
        api.get(apiRoutes.notifications.root, { params: { limit: 50 } }),
        api.get(apiRoutes.notifications.unreadCount),
      ]);

      return {
        notifications: notificationsRes.data.notifications ?? [],
        unreadCount: unreadCountRes.data.count ?? 0,
      };
    },
    enabled: !!session,
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(apiRoutes.notifications.markRead(id));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    onError: () => toast.error('Failed to mark as read'),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await api.patch(apiRoutes.notifications.markAllRead);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
    onError: () => toast.error('Failed to mark all as read'),
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const handleNotificationClick = async (notification: Notification) => {
    const href = resolveNotificationHref(notification, role);
    if (!href) return;

    if (!notification.read) {
      try {
        await markRead.mutateAsync(notification.id);
      } catch {
        // Navigation is still more useful than blocking interaction on read failure.
      }
    }

    router.push(href);
  };

  return (
    <div className="flex flex-col gap-6">
      <DashboardHero
        eyebrow={eyebrow}
        title={title}
        description={description}
        icon={Bell}
      >
        <DashboardHeroPill
          icon={Signal}
          label="Unread"
          value={`${unreadCount}`}
          note="Items that still need an explicit read acknowledgement."
        />
        <DashboardHeroPill
          icon={CheckCheck}
          label="Control"
          value="Bulk clean-up"
          note="Mark everything read when you want a fresh notification state."
        />
      </DashboardHero>

      <div className="flex justify-end">
        {unreadCount > 0 && (
          <Button
            className="rounded-2xl"
            variant="outline"
            size="sm"
            disabled={markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            <CheckCheck data-icon="inline-start" />
            Mark all read
          </Button>
        )}
      </div>

      <DashboardPanel title={panelTitle} description={panelDescription} icon={Bell}>
        <Card className="overflow-hidden border-border/70 bg-background/90 shadow-none">
          <CardContent className="flex flex-col gap-0 p-0">
            {isLoading ? (
              <div className="flex flex-col gap-3 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="rounded-[20px] border border-border/60 bg-background/80">
                    <NotificationRowSkeleton />
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <Empty className="py-12">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Bell />
                  </EmptyMedia>
                  <EmptyTitle>No notifications</EmptyTitle>
                  <EmptyDescription>You&apos;re all caught up</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              notifications.map((notification, index) => {
                const Icon = NOTIFICATION_ICONS[notification.type] ?? Bell;
                const href = resolveNotificationHref(notification, role);
                return (
                  <div key={notification.id}>
                    <div
                      className={cn(
                        'flex items-start gap-3 px-4 py-4 transition-colors',
                        href && 'cursor-pointer hover:bg-muted/40',
                        !notification.read && 'bg-accent/10',
                        notification.read ? 'opacity-80' : ''
                      )}
                      onClick={href ? () => void handleNotificationClick(notification) : undefined}
                      onKeyDown={
                        href
                          ? (event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                void handleNotificationClick(notification);
                              }
                            }
                          : undefined
                      }
                      role={href ? 'button' : undefined}
                      tabIndex={href ? 0 : undefined}
                    >
                      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        <Icon className="size-4 text-muted-foreground" />
                      </div>
                      <div className="flex flex-1 flex-col gap-0.5">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.body}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="xs"
                          disabled={markRead.isPending}
                          onClick={(event) => {
                            event.stopPropagation();
                            markRead.mutate(notification.id);
                          }}
                        >
                          <Check data-icon="inline-start" />
                          Mark read
                        </Button>
                      )}
                    </div>
                    {index < notifications.length - 1 && <Separator />}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </DashboardPanel>
    </div>
  );
}
