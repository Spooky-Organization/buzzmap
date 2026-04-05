'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  Bell,
  Package,
  UserPlus,
  MessageSquare,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { api } from '@/lib/api';
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

export default function NotificationsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<NotificationsData>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/api/v1/notifications', { params: { limit: 50 } });
      return {
        notifications: res.data.notifications ?? [],
        unreadCount: res.data.unreadCount ?? 0,
      };
    },
    enabled: !!session,
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/api/v1/notifications/${id}/read`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    onError: () => toast.error('Failed to mark as read'),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await api.patch('/api/v1/notifications/read-all');
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
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-primary">Notifications</h1>
          <p className="text-muted-foreground">
            {isLoading ? '...' : `${unreadCount} unread`}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            disabled={markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            Mark all read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent</CardTitle>
        </CardHeader>
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
                <EmptyDescription>
                  You&apos;re all caught up
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            notifications.map((notification, index) => {
              const Icon = NOTIFICATION_ICONS[notification.type] ?? Bell;
              return (
                <div key={notification.id}>
                  <div
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 transition-colors',
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
    </div>
  );
}
