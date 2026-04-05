import { type $Enums } from '@prisma/client';

// Re-export Prisma's enum so consumers use a single source of truth
export type NotificationType = $Enums.NotificationType;
export const NotificationType = {
  POV_POSTED: 'POV_POSTED',
  ORDER_UPDATE: 'ORDER_UPDATE',
  NEW_FOLLOWER: 'NEW_FOLLOWER',
  MESSAGE: 'MESSAGE',
  FRIEND_JOINED: 'FRIEND_JOINED',
} as const satisfies Record<string, $Enums.NotificationType>;

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  read: boolean;
  createdAt: Date;
}

export interface CreateNotificationDTO {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface NotificationListResult {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
