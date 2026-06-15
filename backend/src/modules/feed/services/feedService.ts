import { getPrisma } from '../../../shared/prisma/index.js';
import { FeedQueryBuilder } from '../../../shared/builders/FeedQueryBuilder.js';
import { formatMedia, type RawPOVMedia } from '../../../shared/storage/povMedia.js';
import type { PaginatedFeedResult, FeedPOV } from '../models/index.js';

const TRENDING_TIMEFRAME_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Resolve raw POV rows (with raw media storage keys) into FeedPOVs whose media
 * carry signed URLs. Routes through the shared `formatMedia` helper so signing
 * is consistent with the POV module.
 */
async function toFeedPOVs(
  rows: Array<{ media: RawPOVMedia[] } & Record<string, unknown>>
): Promise<FeedPOV[]> {
  return Promise.all(
    rows.map(async (row) => {
      const { media, ...rest } = row;
      return { ...rest, media: await formatMedia(media) } as FeedPOV;
    })
  );
}

function toPaginatedResult(items: FeedPOV[], take: number): PaginatedFeedResult {
  const nextCursor =
    items.length === take ? (items[items.length - 1]?.id ?? null) : null;
  return { data: items, nextCursor };
}

/**
 * Returns a personalized feed for the given user.
 * If the user has interests set, filter POVs whose business category is in those interests.
 * Falls back to a chronological feed when no interests are configured.
 */
export async function getPersonalizedFeed(
  userId: string,
  cursor?: string,
  limit?: number
): Promise<PaginatedFeedResult> {
  const prisma = getPrisma();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { interests: true },
  });

  const interests = user?.interests ?? [];
  const effectiveLimit = limit ?? 20;

  const builder = new FeedQueryBuilder()
    .filterByVisibleTo(userId)
    .paginate(cursor, effectiveLimit);

  if (interests.length > 0) {
    builder.filterByInterests(interests);
  }

  const args = builder.build();

  const rows = await prisma.pOV.findMany(args);
  const povs = await toFeedPOVs(rows as unknown as Parameters<typeof toFeedPOVs>[0]);

  return toPaginatedResult(povs, effectiveLimit);
}

/**
 * Returns trending POVs sorted by likesCount desc within the past 7 days.
 */
export async function getTrending(
  userId: string,
  cursor?: string,
  limit?: number
): Promise<PaginatedFeedResult> {
  const effectiveLimit = limit ?? 20;

  const args = new FeedQueryBuilder()
    .filterByVisibleTo(userId)
    .sortByTrending()
    .withinTimeframe(TRENDING_TIMEFRAME_MS)
    .paginate(cursor, effectiveLimit)
    .build();

  const prisma = getPrisma();
  const rows = await prisma.pOV.findMany(args);
  const povs = await toFeedPOVs(rows as unknown as Parameters<typeof toFeedPOVs>[0]);

  return toPaginatedResult(povs, effectiveLimit);
}
