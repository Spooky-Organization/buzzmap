import { getPrisma } from '../../../shared/prisma/index.js';
import { AppError } from '../../../shared/middleware/errorHandler.js';
import { logger } from '../../../shared/utils/logger.js';
import { Prisma } from '@prisma/client';
import type { BusinessStats, TopBusinessResult } from '../models/index.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_REVIEW_THRESHOLD = 1;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeAvgRating(povs: { starRating: number }[]): number | null {
  if (povs.length === 0) return null;
  const sum = povs.reduce((acc, p) => acc + p.starRating, 0);
  return parseFloat((sum / povs.length).toFixed(2));
}

function computeRecommendationPercentage(
  povs: { recommends: boolean }[]
): number | null {
  if (povs.length === 0) return null;
  const recommends = povs.filter((p) => p.recommends).length;
  return parseFloat(((recommends / povs.length) * 100).toFixed(2));
}

/**
 * Composite score used to rank businesses.
 * Weighted: 60% avg rating (normalized to 0-1 on a 5-star scale)
 *         + 40% recommendation percentage (normalized to 0-1)
 */
function computeScore(
  avgRating: number | null,
  recommendationPercentage: number | null
): number {
  const ratingNorm = avgRating !== null ? avgRating / 5 : 0;
  const recNorm =
    recommendationPercentage !== null ? recommendationPercentage / 100 : 0;
  return parseFloat((ratingNorm * 0.6 + recNorm * 0.4).toFixed(4));
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function getBusinessStatsByOwner(userId: string): Promise<BusinessStats> {
  const prisma = getPrisma();

  const business = await prisma.businessProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!business) {
    throw new AppError(404, 'Business profile not found.');
  }

  return getBusinessStats(business.id);
}

export async function getBusinessStats(
  businessId: string
): Promise<BusinessStats> {
  const prisma = getPrisma();

  const business = await prisma.businessProfile.findUnique({
    where: { id: businessId },
    select: {
      id: true,
      userId: true,
      povs: {
        select: { starRating: true, recommends: true },
      },
    },
  });

  if (!business) {
    throw new AppError(404, 'Business not found');
  }

  const followerCount = await prisma.follow.count({
    where: { followingId: business.userId },
  });

  const avgRating = computeAvgRating(business.povs);
  const recommendationPercentage = computeRecommendationPercentage(business.povs);

  logger.debug(
    { businessId, reviewCount: business.povs.length, followerCount },
    'Business stats retrieved'
  );

  return {
    businessId,
    avgRating,
    recommendationPercentage,
    reviewCount: business.povs.length,
    followerCount,
  };
}

export async function getTopBusinesses(
  category?: string,
  limit: number = 10
): Promise<TopBusinessResult[]> {
  const prisma = getPrisma();

  const where: Prisma.BusinessProfileWhereInput = {
    ...(category && { category: { contains: category, mode: 'insensitive' } }),
  };

  const businesses = await prisma.businessProfile.findMany({
    where,
    select: {
      id: true,
      businessName: true,
      description: true,
      category: true,
      location: true,
      isVerified: true,
      povs: {
        select: { starRating: true, recommends: true },
      },
    },
  });

  const results: TopBusinessResult[] = businesses
    .filter((b) => b.povs.length >= MIN_REVIEW_THRESHOLD)
    .map((b) => {
      const avgRating = computeAvgRating(b.povs);
      const recommendationPercentage = computeRecommendationPercentage(b.povs);
      const score = computeScore(avgRating, recommendationPercentage);

      return {
        id: b.id,
        businessName: b.businessName,
        description: b.description,
        category: b.category,
        location: b.location,
        isVerified: b.isVerified,
        avgRating,
        recommendationPercentage,
        reviewCount: b.povs.length,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  logger.debug(
    { category, limit, resultCount: results.length },
    'Top businesses retrieved'
  );

  return results;
}
