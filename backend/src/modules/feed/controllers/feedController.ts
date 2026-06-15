import { type Request, type Response, type NextFunction } from 'express';
import { AppError } from '../../../shared/middleware/errorHandler.js';
import { feedQuerySchema } from '../validators/index.js';
import * as feedService from '../services/feedService.js';

function assertAuthenticated(
  req: Request
): asserts req is Request & { user: { userId: string; role: string } } {
  if (!req.user || typeof (req.user as { userId?: unknown }).userId !== 'string') {
    throw new AppError(401, 'Authentication required');
  }
}

export async function getPersonalizedFeed(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);

    const { cursor, limit } = feedQuerySchema.parse(req.query);

    const result = await feedService.getPersonalizedFeed(
      req.user.userId,
      cursor,
      limit
    );

    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

export async function getTrending(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);

    const { cursor, limit } = feedQuerySchema.parse(req.query);

    const result = await feedService.getTrending(req.user.userId, cursor, limit);

    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}
