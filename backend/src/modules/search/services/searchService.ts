import { getPrisma } from '../../../shared/prisma/index.js';
import { logger } from '../../../shared/utils/logger.js';
import { getSignedUrl } from '../../../shared/storage/upload.js';
import { Prisma } from '@prisma/client';
import type {
  BusinessSearchResult,
  ProductSearchResult,
  UserSearchResult,
  PaginatedResult,
} from '../models/index.js';

// ─── Business Search ──────────────────────────────────────────────────────────

export async function searchBusinesses(
  keyword?: string,
  category?: string,
  location?: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResult<BusinessSearchResult>> {
  const prisma = getPrisma();

  const where: Prisma.BusinessProfileWhereInput = {
    ...(keyword && {
      OR: [
        { businessName: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ],
    }),
    ...(category && { category: { contains: category, mode: 'insensitive' } }),
    ...(location && { location: { contains: location, mode: 'insensitive' } }),
  };

  const [total, businesses] = await Promise.all([
    prisma.businessProfile.count({ where }),
    prisma.businessProfile.findMany({
      where,
      select: {
        id: true,
        businessName: true,
        description: true,
        category: true,
        location: true,
        isVerified: true,
        povs: {
          select: { starRating: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const data: BusinessSearchResult[] = businesses.map((b) => {
    const reviewCount = b.povs.length;
    const avgRating =
      reviewCount > 0
        ? b.povs.reduce((sum, p) => sum + p.starRating, 0) / reviewCount
        : null;

    return {
      id: b.id,
      businessName: b.businessName,
      description: b.description,
      category: b.category,
      location: b.location,
      isVerified: b.isVerified,
      avgRating: avgRating !== null ? parseFloat(avgRating.toFixed(2)) : null,
      reviewCount,
    };
  });

  logger.debug({ keyword, category, location, page, limit, total }, 'Business search executed');

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

// ─── Product Search ───────────────────────────────────────────────────────────

export async function searchProducts(
  keyword?: string,
  category?: string,
  minPrice?: number,
  maxPrice?: number,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResult<ProductSearchResult>> {
  const prisma = getPrisma();

  const priceFilter: Prisma.FloatFilter | undefined =
    minPrice !== undefined || maxPrice !== undefined
      ? {
          ...(minPrice !== undefined && { gte: minPrice }),
          ...(maxPrice !== undefined && { lte: maxPrice }),
        }
      : undefined;

  const where: Prisma.ProductWhereInput = {
    isAvailable: true,
    ...(keyword && {
      OR: [
        { name: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ],
    }),
    ...(category && { category: { contains: category, mode: 'insensitive' } }),
    ...(priceFilter && { price: priceFilter }),
  };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      select: {
        id: true,
        businessId: true,
        business: {
          select: {
            businessName: true,
          },
        },
        name: true,
        description: true,
        price: true,
        currency: true,
        images: true,
        category: true,
        isAvailable: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const data: ProductSearchResult[] = await Promise.all(
    products.map(async (product) => ({
      id: product.id,
      businessId: product.businessId,
      businessName: product.business.businessName,
      name: product.name,
      description: product.description,
      price: product.price,
      currency: product.currency,
      category: product.category,
      isAvailable: product.isAvailable,
      imageUrl: product.images[0] ? await getSignedUrl(product.images[0]) : null,
    }))
  );

  logger.debug({ keyword, category, minPrice, maxPrice, page, limit, total }, 'Product search executed');

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

// ─── Categories ───────────────────────────────────────────────────────────────

/**
 * Returns the distinct, non-empty category values that actually exist across
 * current business profiles and available products. This is the authoritative
 * source for the marketplace search category dropdown so the UI never offers a
 * category that matches nothing.
 */
export async function getCategories(): Promise<string[]> {
  const prisma = getPrisma();

  const [businessCategories, productCategories] = await Promise.all([
    prisma.businessProfile.findMany({
      where: { category: { not: '' } },
      select: { category: true },
      distinct: ['category'],
    }),
    prisma.product.findMany({
      where: { isAvailable: true, category: { not: '' } },
      select: { category: true },
      distinct: ['category'],
    }),
  ]);

  const categories = new Set<string>();
  for (const { category } of businessCategories) {
    const value = category.trim();
    if (value) categories.add(value);
  }
  for (const { category } of productCategories) {
    const value = category.trim();
    if (value) categories.add(value);
  }

  const sorted = Array.from(categories).sort((a, b) => a.localeCompare(b));

  logger.debug({ count: sorted.length }, 'Search categories listed');

  return sorted;
}

// ─── User Search ──────────────────────────────────────────────────────────────

export async function searchUsers(
  keyword?: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResult<UserSearchResult>> {
  const prisma = getPrisma();

  const where: Prisma.UserWhereInput = {
    ...(keyword && {
      name: { contains: keyword, mode: 'insensitive' },
    }),
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        avatar: true,
        role: true,
      },
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  logger.debug({ keyword, page, limit, total }, 'User search executed');

  return { data: users, total, page, limit, totalPages: Math.ceil(total / limit) };
}
