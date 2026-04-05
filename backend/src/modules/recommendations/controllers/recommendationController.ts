import { type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../../../shared/middleware/errorHandler.js';
import * as recommendationService from '../services/recommendationService.js';

function assertAuthenticated(
  req: Request
): asserts req is Request & { user: { userId: string; role: string } } {
  if (!req.user || typeof (req.user as { userId?: unknown }).userId !== 'string') {
    throw new AppError(401, 'Authentication required');
  }
}

const getBusinessStatsParamsSchema = z.object({
  id: z.string().uuid(),
});

const getTopBusinessesQuerySchema = z.object({
  category: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 10))
    .pipe(z.number().int().min(1).max(50)),
});

export async function getMyBusinessStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const stats = await recommendationService.getBusinessStatsByOwner(req.user.userId);
    res.status(200).json({ status: 'success', data: stats });
  } catch (err) {
    next(err);
  }
}

export async function getBusinessStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const { id } = getBusinessStatsParamsSchema.parse(req.params);
    const stats = await recommendationService.getBusinessStats(id);
    res.status(200).json({ status: 'success', data: stats });
  } catch (err) {
    next(err);
  }
}

export async function getTopBusinesses(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const { category, limit } = getTopBusinessesQuerySchema.parse(req.query);
    const results = await recommendationService.getTopBusinesses(category, limit);
    res.status(200).json({ status: 'success', data: results });
  } catch (err) {
    next(err);
  }
}
