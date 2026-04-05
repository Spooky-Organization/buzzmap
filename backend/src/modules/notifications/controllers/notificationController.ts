import { type Request, type Response, type NextFunction } from 'express';
import { notificationService } from '../services/notificationService.js';
import { getNotificationsQuerySchema } from '../validators/index.js';
import { AppError } from '../../../shared/middleware/errorHandler.js';

async function getNotifications(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required.'));
    }

    const { page, limit, read } = getNotificationsQuerySchema.parse(req.query);
    const result = await notificationService.getUserNotifications(
      req.user.userId,
      page,
      limit,
      read
    );

    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

async function getUnreadCount(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required.'));
    }

    const count = await notificationService.getUnreadCount(req.user.userId);
    res.status(200).json({ status: 'success', data: { count } });
  } catch (err) {
    next(err);
  }
}

async function markAsRead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required.'));
    }

    const { id } = req.params as { id: string };
    if (!id) {
      return next(new AppError(400, 'Notification ID is required.'));
    }

    const notification = await notificationService.markAsRead(id, req.user.userId);
    res.status(200).json({ status: 'success', data: notification });
  } catch (err) {
    next(err);
  }
}

async function markAllAsRead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required.'));
    }

    const result = await notificationService.markAllAsRead(req.user.userId);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

export const notificationController = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
