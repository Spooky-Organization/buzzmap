'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { DashboardHero, DashboardHeroPill, DashboardPanel } from '@/components/dashboard/dashboard-surfaces';
import { api } from '@/lib/api';
import { apiRoutes } from '@/lib/routes';
import { cn } from '@/lib/utils';

type NotificationType = 'POV_POSTED' | 'ORDER_UPDATE' | 'NEW_FOLLOWER' | 'MESSAGE' | 'FRIEND_JOINED';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
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

export function NotificationsPageContent({
  eyebrow,
  title,
  description,
  panelTitle,
  panelDescription,
}: {
  eyebrow: string;
  title: string;
  description: string;
  panelTitle: string;
  panelDescription: string;
}) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

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
                  <Skeleton key={i} className="h-16 w-full" />
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
                return (
                  <div key={notification.id}>
                    <div
                      className={cn(
                        'flex items-start gap-3 px-4 py-4 transition-colors',
                        !notification.read && 'bg-accent/10',
                        notification.read ? 'opacity-80' : ''
                      )}
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
                          onClick={() => markRead.mutate(notification.id)}
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
