import { type Request, type Response, type NextFunction } from 'express';
import { AppError } from '../../../shared/middleware/errorHandler.js';
import { getPrisma } from '../../../shared/prisma/index.js';

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
    const prisma = getPrisma();

    const profile = await prisma.businessProfile.findUnique({
      where: { userId: req.user.userId },
      include: {
        povs: { select: { starRating: true } },
        _count: { select: { products: true, posts: true } },
      },
    });

    if (!profile) {
      throw new AppError(404, 'Business profile not found');
    }

    const followerCount = await prisma.follow.count({
      where: { followingId: profile.userId },
    });

    const avgRating =
      profile.povs.length > 0
        ? profile.povs.reduce((sum, p) => sum + p.starRating, 0) / profile.povs.length
        : 0;

    const { povs: _povs, ...rest } = profile;

    res.status(200).json({
      status: 'success',
      data: {
        ...rest,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: _povs.length,
        followerCount,
      },
    });
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
    const prisma = getPrisma();

    const allowedFields = [
      'businessName',
      'description',
      'category',
      'type',
      'location',
      'contactInfo',
      'operatingHours',
    ] as const;

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const profile = await prisma.businessProfile.update({
      where: { userId: req.user.userId },
      data: updateData,
    });

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
    const prisma = getPrisma();
    const { id } = req.params as { id: string };

    const profile = await prisma.businessProfile.findUnique({
      where: { id },
      include: {
        povs: { select: { starRating: true } },
        _count: { select: { products: true, posts: true } },
      },
    });

    if (!profile) {
      throw new AppError(404, 'Business not found');
    }

    const followerCount = await prisma.follow.count({
      where: { followingId: profile.userId },
    });

    const isFollowing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user.userId,
          followingId: profile.userId,
        },
      },
    });

    const avgRating =
      profile.povs.length > 0
        ? profile.povs.reduce((sum, p) => sum + p.starRating, 0) / profile.povs.length
        : 0;

    const { povs: _povs, ...rest } = profile;

    res.status(200).json({
      status: 'success',
      data: {
        ...rest,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: _povs.length,
        followerCount,
        isFollowing: !!isFollowing,
      },
    });
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
    const prisma = getPrisma();
    const { id } = req.params as { id: string };

    const business = await prisma.businessProfile.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!business) {
      throw new AppError(404, 'Business not found');
    }

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user.userId,
          followingId: business.userId,
        },
      },
    });

    if (existing) {
      throw new AppError(409, 'Already following this business');
    }

    await prisma.follow.create({
      data: {
        followerId: req.user.userId,
        followingId: business.userId,
      },
    });

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
    const prisma = getPrisma();
    const { id } = req.params as { id: string };

    const business = await prisma.businessProfile.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!business) {
      throw new AppError(404, 'Business not found');
    }

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user.userId,
          followingId: business.userId,
        },
      },
    });

    if (!existing) {
      throw new AppError(404, 'Not following this business');
    }

    await prisma.follow.delete({
      where: { id: existing.id },
    });

    res.status(200).json({ status: 'success', message: 'Unfollowed successfully' });
  } catch (err) {
    next(err);
  }
}
