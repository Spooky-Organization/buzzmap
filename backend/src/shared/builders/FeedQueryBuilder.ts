/**
 * Builder pattern for constructing Prisma POV feed queries.
 * Chain filter/pagination methods then call .build() to get findMany args.
 */
export class FeedQueryBuilder {
  private where: Record<string, unknown> = {};
  private orderBy: Record<string, unknown> = { createdAt: 'desc' };
  private cursor?: string;
  private take: number = 20;

  /**
   * Filter POVs where the associated business category is in the provided list.
   */
  filterByInterests(interests: string[]): this {
    if (interests.length > 0) {
      this.where['business'] = { category: { in: interests } };
    }
    return this;
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
    this.where['createdAt'] = { gte: new Date(Date.now() - withinMs) };
    return this;
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
        author: { select: { id: true, name: true, avatar: true } },
        business: { select: { id: true, businessName: true } },
      },
    } as const;
  }
}
