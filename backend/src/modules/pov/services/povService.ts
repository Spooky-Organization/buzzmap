import { getPrisma } from '../../../shared/prisma/index.js';
import { uploadToStorage, deleteFromStorage, getSignedUrl } from '../../../shared/storage/upload.js';
import { AppError } from '../../../shared/middleware/errorHandler.js';
import { logger } from '../../../shared/utils/logger.js';
import type { CreatePOVDTO, POVResponse, CommentResponse, PaginatedResult } from '../models/index.js';
import { sanitizeOptionalText, sanitizePlainText } from '../../../shared/utils/sanitize.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function resolveVideoUrl(videoKey: string): Promise<string> {
  return getSignedUrl(videoKey);
}

async function formatPOV(
  pov: {
    id: string;
    videoUrl: string;
    thumbnailUrl: string | null;
    caption: string | null;
    starRating: number;
    recommends: boolean;
    likesCount: number;
    commentsCount: number;
    createdAt: Date;
    author: { id: string; name: string; avatar: string | null };
    business: { id: string; businessName: string };
  },
  requestingUserId?: string
): Promise<POVResponse> {
  const prisma = getPrisma();

  let isLiked: boolean | undefined;
  if (requestingUserId) {
    const like = await prisma.like.findUnique({
      where: { userId_povId: { userId: requestingUserId, povId: pov.id } },
      select: { id: true },
    });
    isLiked = like !== null;
  }

  const videoUrl = await resolveVideoUrl(pov.videoUrl);

  return {
    id: pov.id,
    author: pov.author,
    business: pov.business,
    videoUrl,
    thumbnailUrl: pov.thumbnailUrl,
    caption: pov.caption,
    starRating: pov.starRating,
    recommends: pov.recommends,
    likesCount: pov.likesCount,
    commentsCount: pov.commentsCount,
    createdAt: pov.createdAt,
    ...(requestingUserId !== undefined && { isLiked }),
  };
}

const POV_SELECT = {
  id: true,
  videoUrl: true,
  thumbnailUrl: true,
  caption: true,
  starRating: true,
  recommends: true,
  likesCount: true,
  commentsCount: true,
  createdAt: true,
  author: { select: { id: true, name: true, avatar: true } },
  business: { select: { id: true, businessName: true } },
} as const;

// ─── Service functions ────────────────────────────────────────────────────────

export async function createPOV(
  authorId: string,
  data: CreatePOVDTO,
  videoFile: Express.Multer.File
): Promise<POVResponse> {
  const prisma = getPrisma();

  // Verify business exists
  const business = await prisma.businessProfile.findUnique({
    where: { id: data.businessId },
    select: { id: true, businessName: true },
  });
  if (!business) {
    throw new AppError(404, 'Business not found');
  }

  const videoKey = await uploadToStorage(videoFile, 'povs');
  logger.info({ authorId, businessId: data.businessId, videoKey }, 'POV video uploaded');

  const pov = await prisma.pOV.create({
    data: {
      authorId,
      businessId: data.businessId,
      videoUrl: videoKey,
      caption: sanitizeOptionalText(data.caption) ?? null,
      starRating: data.starRating,
      recommends: data.recommends,
    },
    select: POV_SELECT,
  });

  return formatPOV(pov, authorId);
}

export async function deletePOV(povId: string, userId: string): Promise<void> {
  const prisma = getPrisma();

  const pov = await prisma.pOV.findUnique({
    where: { id: povId },
    select: { id: true, authorId: true, videoUrl: true },
  });

  if (!pov) {
    throw new AppError(404, 'POV not found');
  }

  if (pov.authorId !== userId) {
    throw new AppError(403, 'You are not authorized to delete this POV');
  }

  // Remove from storage first, then delete DB record
  await deleteFromStorage(pov.videoUrl);

  await prisma.pOV.delete({ where: { id: povId } });

  logger.info({ povId, userId }, 'POV deleted');
}

export async function getPOV(
  povId: string,
  requestingUserId?: string
): Promise<POVResponse> {
  const prisma = getPrisma();

  const pov = await prisma.pOV.findUnique({
    where: { id: povId },
    select: POV_SELECT,
  });

  if (!pov) {
    throw new AppError(404, 'POV not found');
  }

  return formatPOV(pov, requestingUserId);
}

export async function getPOVsByBusiness(
  businessId: string,
  page: number,
  limit: number,
  requestingUserId?: string
): Promise<PaginatedResult<POVResponse>> {
  const prisma = getPrisma();

  const [total, povs] = await Promise.all([
    prisma.pOV.count({ where: { businessId } }),
    prisma.pOV.findMany({
      where: { businessId },
      select: POV_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const data = await Promise.all(
    povs.map((pov) => formatPOV(pov, requestingUserId))
  );

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getPOVsByUser(
  userId: string,
  page: number,
  limit: number
): Promise<PaginatedResult<POVResponse>> {
  const prisma = getPrisma();

  const [total, povs] = await Promise.all([
    prisma.pOV.count({ where: { authorId: userId } }),
    prisma.pOV.findMany({
      where: { authorId: userId },
      select: POV_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const data = await Promise.all(povs.map((pov) => formatPOV(pov)));

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function likePOV(userId: string, povId: string): Promise<void> {
  const prisma = getPrisma();

  // Verify POV exists
  const pov = await prisma.pOV.findUnique({
    where: { id: povId },
    select: { id: true },
  });
  if (!pov) {
    throw new AppError(404, 'POV not found');
  }

  // Handle duplicate gracefully using upsert
  const existingLike = await prisma.like.findUnique({
    where: { userId_povId: { userId, povId } },
    select: { id: true },
  });

  if (existingLike) {
    // Already liked — no-op
    return;
  }

  await prisma.$transaction([
    prisma.like.create({ data: { userId, povId } }),
    prisma.pOV.update({
      where: { id: povId },
      data: { likesCount: { increment: 1 } },
    }),
  ]);
}

export async function unlikePOV(userId: string, povId: string): Promise<void> {
  const prisma = getPrisma();

  const like = await prisma.like.findUnique({
    where: { userId_povId: { userId, povId } },
    select: { id: true },
  });

  if (!like) {
    // Not liked — no-op
    return;
  }

  await prisma.$transaction([
    prisma.like.delete({ where: { userId_povId: { userId, povId } } }),
    prisma.pOV.update({
      where: { id: povId },
      data: { likesCount: { decrement: 1 } },
    }),
  ]);
}

export async function addComment(
  userId: string,
  povId: string,
  content: string
): Promise<CommentResponse> {
  const prisma = getPrisma();

  const pov = await prisma.pOV.findUnique({
    where: { id: povId },
    select: { id: true },
  });
  if (!pov) {
    throw new AppError(404, 'POV not found');
  }

  const [comment] = await prisma.$transaction([
    prisma.comment.create({
      data: { userId, povId, content: sanitizePlainText(content) },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: { select: { id: true, name: true, avatar: true } },
      },
    }),
    prisma.pOV.update({
      where: { id: povId },
      data: { commentsCount: { increment: 1 } },
    }),
  ]);

  return {
    id: comment.id,
    author: comment.user,
    content: comment.content,
    createdAt: comment.createdAt,
  };
}

export async function getComments(
  povId: string,
  page: number,
  limit: number
): Promise<PaginatedResult<CommentResponse>> {
  const prisma = getPrisma();

  const pov = await prisma.pOV.findUnique({
    where: { id: povId },
    select: { id: true },
  });
  if (!pov) {
    throw new AppError(404, 'POV not found');
  }

  const [total, comments] = await Promise.all([
    prisma.comment.count({ where: { povId } }),
    prisma.comment.findMany({
      where: { povId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const data: CommentResponse[] = comments.map((c) => ({
    id: c.id,
    author: c.user,
    content: c.content,
    createdAt: c.createdAt,
  }));

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}
