import { type Request, type Response, type NextFunction } from 'express';
import { AppError } from '../../../shared/middleware/errorHandler.js';
import { createAnalyticsEventSchema } from '../validators/index.js';
import * as analyticsService from '../services/analyticsService.js';

function assertAuthenticated(
  req: Request
): asserts req is Request & { user: { userId: string; role: string } } {
  if (!req.user || typeof (req.user as { userId?: unknown }).userId !== 'string') {
    throw new AppError(401, 'Authentication required');
  }
}

export async function createEvent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);

    const data = createAnalyticsEventSchema.parse(req.body);
    const event = await analyticsService.createAnalyticsEvent(req.user.userId, data);

    res.status(201).json({ status: 'success', data: event });
  } catch (err) {
    next(err);
  }
}
