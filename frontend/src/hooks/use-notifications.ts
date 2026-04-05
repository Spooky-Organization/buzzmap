'use client';
import { useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/providers/socket-provider';
import { api } from '@/lib/api';

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
}

export function useNotifications(page = 1, limit = 20) {
  const queryClient = useQueryClient();
  const { notificationSocket } = useSocket();

  const query = useQuery<NotificationsResponse>({
    queryKey: ['notifications', page, limit],
    queryFn: async () => {
      const res = await api.get('/api/v1/notifications', {
        params: { page, limit },
      });
      return res.data;
    },
  });

  const unreadQuery = useQuery<number>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const res = await api.get('/api/v1/notifications/unread-count');
      return res.data.data?.count ?? 0;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await api.patch(`/api/v1/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.patch('/api/v1/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleNewNotification = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }, [queryClient]);

  useEffect(() => {
    if (!notificationSocket) return;
    notificationSocket.on('notification:new', handleNewNotification);
    return () => {
      notificationSocket.off('notification:new', handleNewNotification);
    };
  }, [notificationSocket, handleNewNotification]);

  return {
    ...query,
    unreadCount: unreadQuery.data ?? 0,
    markRead: markReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
    isMarkingRead: markReadMutation.isPending,
    isMarkingAllRead: markAllReadMutation.isPending,
  };
}
