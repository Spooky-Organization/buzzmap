import { Prisma } from '@prisma/client';
import { type NotificationType, type Notification, type NotificationListResult } from '../models/index.js';
import { getPrisma } from '../../../shared/prisma/index.js';
import { getIO } from '../../../shared/socket/index.js';
import { AppError } from '../../../shared/middleware/errorHandler.js';

function toNotification(raw: {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Prisma.JsonValue;
  read: boolean;
  createdAt: Date;
}): Notification {
  return {
    id: raw.id,
    userId: raw.userId,
    type: raw.type,
    title: raw.title,
    body: raw.body,
    data: raw.data as Record<string, unknown> | null,
    read: raw.read,
    createdAt: raw.createdAt,
  };
}

async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<Notification> {
  const prisma = getPrisma();

  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      data: data !== undefined ? (data as Prisma.InputJsonValue) : Prisma.JsonNull,
    },
  });

  const result = toNotification(notification);

  // Emit after persisting to DB
  try {
    getIO()
      .of('/notifications')
      .to(`user:${userId}`)
      .emit('notification:new', result);
  } catch {
    // Socket.IO may not be available in test environments — do not throw
  }

  return result;
}

async function getUserNotifications(
  userId: string,
  page: number,
  limit: number,
  readFilter?: boolean
): Promise<NotificationListResult> {
  const prisma = getPrisma();

  const where: Prisma.NotificationWhereInput = {
    userId,
    ...(readFilter !== undefined ? { read: readFilter } : {}),
  };

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    notifications: notifications.map(toNotification),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

async function markAsRead(notificationId: string, userId: string): Promise<Notification> {
  const prisma = getPrisma();

  const existing = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!existing) {
    throw new AppError(404, 'Notification not found.');
  }

  if (existing.userId !== userId) {
    throw new AppError(403, 'You do not have permission to update this notification.');
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });

  return toNotification(updated);
}

async function markAllAsRead(userId: string): Promise<{ count: number }> {
  const prisma = getPrisma();

  const result = await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });

  return { count: result.count };
}

async function getUnreadCount(userId: string): Promise<number> {
  const prisma = getPrisma();

  return prisma.notification.count({
    where: { userId, read: false },
  });
}

export const notificationService = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
