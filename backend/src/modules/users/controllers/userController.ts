import { type Request, type Response, type NextFunction } from 'express';
import { AppError } from '../../../shared/middleware/errorHandler.js';
import {
  updateProfileSchema,
  updateInterestsSchema,
  changePasswordSchema,
  paginationSchema,
} from '../validators/index.js';
import * as userService from '../services/userService.js';

// Express Request is augmented by the auth middleware (shared/middleware/auth.ts).
function assertAuthenticated(req: Request): asserts req is Request & { user: { userId: string; role: string } } {
  if (!req.user || typeof (req.user as { userId?: unknown }).userId !== 'string') {
    throw new AppError(401, 'Authentication required');
  }
}

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const profile = await userService.getProfile(req.user.userId);
    res.status(200).json({ status: 'success', data: profile });
  } catch (err) {
    next(err);
  }
}

export async function getUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const { id } = req.params as { id: string };
    const profile = await userService.getPublicProfile(id, req.user.userId);
    res.status(200).json({ status: 'success', data: profile });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const data = updateProfileSchema.parse(req.body);
    const profile = await userService.updateProfile(req.user.userId, data);
    res.status(200).json({ status: 'success', data: profile });
  } catch (err) {
    next(err);
  }
}

export async function updateMyInterests(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const { interests } = updateInterestsSchema.parse(req.body);
    const profile = await userService.updateInterests(req.user.userId, interests);
    res.status(200).json({ status: 'success', data: profile });
  } catch (err) {
    next(err);
  }
}

export async function changeMyPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const data = changePasswordSchema.parse(req.body);
    await userService.changePassword(req.user.userId, data);
    res.status(200).json({ status: 'success', message: 'Password updated successfully' });
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
    const { id: followingId } = req.params as { id: string };
    await userService.followUser(req.user.userId, followingId);
    res.status(201).json({ status: 'success', message: 'User followed successfully' });
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
    const { id: followingId } = req.params as { id: string };
    await userService.unfollowUser(req.user.userId, followingId);
    res.status(200).json({ status: 'success', message: 'User unfollowed successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getMyFollowers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const { page, limit } = paginationSchema.parse(req.query);
    const result = await userService.getFollowers(req.user.userId, page, limit);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

export async function getMyFollowing(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const { page, limit } = paginationSchema.parse(req.query);
    const result = await userService.getFollowing(req.user.userId, page, limit);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

export async function getFriends(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const friends = await userService.detectFriends(req.user.userId);
    res.status(200).json({ status: 'success', data: friends });
  } catch (err) {
    next(err);
  }
}
