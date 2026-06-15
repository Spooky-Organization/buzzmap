import type { Prisma } from '@prisma/client';

/**
 * Builder pattern for constructing Prisma POV feed queries.
 * Chain filter/pagination methods then call .build() to get findMany args.
 */
export class FeedQueryBuilder {
  private where: Prisma.POVWhereInput = {};
  private orderBy: Prisma.POVOrderByWithRelationInput = { createdAt: 'desc' };
  private cursor?: string;
  private take: number = 20;

  private addFilter(filter: Prisma.POVWhereInput): this {
    if (Object.keys(this.where).length === 0) {
      this.where = filter;
      return this;
    }

    this.where = { AND: [this.where, filter] };
    return this;
  }

  /**
   * Filter POVs where the associated business category is in the provided list.
   */
  filterByInterests(interests: string[]): this {
    if (interests.length > 0) {
      this.addFilter({
        OR: [
          { business: { category: { in: interests } } },
          { businessId: null },
        ],
      });
    }
    return this;
  }

  /**
   * Restrict follower-only POVs to the author or users who follow the author.
   */
  filterByVisibleTo(userId: string): this {
    return this.addFilter({
      OR: [
        { visibility: 'PUBLIC' },
        { authorId: userId },
        {
          visibility: 'FOLLOWERS',
          author: {
            followers: {
              some: { followerId: userId },
            },
          },
        },
      ],
    });
  }

  /**
   * Apply cursor-based pagination.
   */
  paginate(cursor?: string, limit?: number): this {
    if (cursor) this.cursor = cursor;
    if (limit !== undefined && limit > 0) this.take = limit;
    return this;
  }

  /**
   * Sort by likesCount descending (for trending feed).
   */
  sortByTrending(): this {
    this.orderBy = { likesCount: 'desc' };
    return this;
  }

  /**
   * Restrict results to POVs created within a recent timeframe.
   * @param withinMs milliseconds from now to look back (default 7 days)
   */
  withinTimeframe(withinMs: number = 7 * 24 * 60 * 60 * 1000): this {
    return this.addFilter({ createdAt: { gte: new Date(Date.now() - withinMs) } });
  }

  /**
   * Returns Prisma findMany arguments ready for prisma.pOV.findMany().
   */
  build() {
    return {
      where: this.where,
      orderBy: this.orderBy,
      take: this.take,
      ...(this.cursor ? { skip: 1, cursor: { id: this.cursor } } : {}),
      include: {
        media: {
          select: { id: true, url: true, type: true, thumbnailUrl: true, position: true },
          orderBy: { position: 'asc' as const },
        },
        author: { select: { id: true, name: true, avatar: true } },
        business: { select: { id: true, businessName: true } },
      },
    } as const;
  }
}
