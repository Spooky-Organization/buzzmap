import { type Request, type Response, type NextFunction } from 'express';
import { AppError } from '../../../shared/middleware/errorHandler.js';
import { businessParamsSchema, updateBusinessProfileSchema } from '../validators/index.js';
import * as businessService from '../services/businessService.js';

function assertAuthenticated(
  req: Request
): asserts req is Request & { user: { userId: string; role: string } } {
  if (!req.user || typeof (req.user as { userId?: unknown }).userId !== 'string') {
    throw new AppError(401, 'Authentication required');
  }
}

export async function getMyProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const profile = await businessService.getBusinessProfileByOwner(req.user.userId);
    res.status(200).json({ status: 'success', data: profile });
  } catch (err) {
    next(err);
  }
}

export async function updateMyProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const data = updateBusinessProfileSchema.parse(req.body);
    const profile = await businessService.updateBusinessProfile(req.user.userId, data);
    res.status(200).json({ status: 'success', data: profile });
  } catch (err) {
    next(err);
  }
}

export async function getById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const { id } = businessParamsSchema.parse(req.params);
    const profile = await businessService.getBusinessProfileById(id, req.user.userId);
    res.status(200).json({ status: 'success', data: profile });
  } catch (err) {
    next(err);
  }
}

export async function follow(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const { id } = businessParamsSchema.parse(req.params);
    await businessService.followBusiness(req.user.userId, id);
    res.status(201).json({ status: 'success', message: 'Followed successfully' });
  } catch (err) {
    next(err);
  }
}

export async function unfollow(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const { id } = businessParamsSchema.parse(req.params);
    await businessService.unfollowBusiness(req.user.userId, id);
    res.status(200).json({ status: 'success', message: 'Unfollowed successfully' });
  } catch (err) {
    next(err);
  }
}
