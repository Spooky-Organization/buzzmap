import { getPrisma } from '../../../shared/prisma/index.js';
import {
  uploadToStorage,
  resolveStorageUrl,
  deleteFromStorage,
} from '../../../shared/storage/upload.js';
import { AppError } from '../../../shared/middleware/errorHandler.js';
import { logger } from '../../../shared/utils/logger.js';
import type {
  CreateProductDTO,
  UpdateProductDTO,
  ProductResponse,
  PaginatedResult,
} from '../models/index.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MAX_PRODUCT_IMAGES = 10;

async function resolveImageUrls(keys: string[]): Promise<string[]> {
  return Promise.all(keys.map((key) => resolveStorageUrl(key)));
}

/** A stored image is a deletable storage object only if it's not an absolute URL. */
function isStorageKey(value: string): boolean {
  return !/^https?:\/\//i.test(value);
}

/** Best-effort removal of storage objects; never fails the request on cleanup. */
async function deleteStorageKeys(keys: string[]): Promise<void> {
  await Promise.all(
    keys.filter(isStorageKey).map(async (key) => {
      try {
        await deleteFromStorage(key);
      } catch (err) {
        logger.warn({ key, err }, 'Failed to delete product image from storage');
      }
    })
  );
}

async function formatProduct(product: {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  stock: number;
  category: string;
  isAvailable: boolean;
  createdAt: Date;
}): Promise<ProductResponse> {
  const images = await resolveImageUrls(product.images);
  // `imageKeys` exposes the raw stored references so the owner's edit UI can
  // identify which images to keep/remove (signed URLs are not stable ids).
  return { ...product, images, imageKeys: product.images };
}

const PRODUCT_SELECT = {
  id: true,
  businessId: true,
  name: true,
  description: true,
  price: true,
  currency: true,
  images: true,
  stock: true,
  category: true,
  isAvailable: true,
  createdAt: true,
} as const;

// ─── Ownership helper ─────────────────────────────────────────────────────────

/**
 * Resolves the BusinessProfile owned by the given user.
 * Throws 403 if the user has no business profile.
 */
async function getBusinessForUser(userId: string): Promise<{ id: string }> {
  const prisma = getPrisma();
  const business = await prisma.businessProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!business) {
    throw new AppError(403, 'No business profile found for this user');
  }
  return business;
}

/**
 * Fetches a product and verifies it belongs to the given user's business.
 * Throws 404 if not found, 403 if not owned.
 */
async function getOwnedProduct(
  productId: string,
  userId: string
): Promise<{ id: string; images: string[]; businessId: string }> {
  const prisma = getPrisma();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, images: true, businessId: true },
  });
  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  const business = await getBusinessForUser(userId);
  if (product.businessId !== business.id) {
    throw new AppError(403, 'You do not own this product');
  }

  return product;
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function createProduct(
  userId: string,
  data: CreateProductDTO,
  imageFiles?: Express.Multer.File[]
): Promise<ProductResponse> {
  const prisma = getPrisma();
  const business = await getBusinessForUser(userId);

  const imageKeys: string[] = [];
  if (imageFiles && imageFiles.length > 0) {
    for (const file of imageFiles) {
      const key = await uploadToStorage(file, 'products');
      imageKeys.push(key);
    }
    logger.info(
      { userId, businessId: business.id, imageCount: imageKeys.length },
      'Product images uploaded'
    );
  }

  const product = await prisma.product.create({
    data: {
      businessId: business.id,
      name: data.name,
      description: data.description,
      price: data.price,
      currency: data.currency ?? 'KES',
      images: imageKeys,
      stock: data.stock,
      category: data.category,
    },
    select: PRODUCT_SELECT,
  });

  logger.info({ productId: product.id, businessId: business.id }, 'Product created');
  return formatProduct(product);
}

export async function updateProduct(
  productId: string,
  userId: string,
  data: UpdateProductDTO,
  imageFiles?: Express.Multer.File[],
  existingImages?: string[]
): Promise<ProductResponse> {
  const prisma = getPrisma();
  const owned = await getOwnedProduct(productId, userId);

  // Images are only touched when the request manages them — i.e. it uploaded
  // new files and/or sent an explicit `existingImages` keep-list. A plain
  // scalar update (or availability toggle) leaves the gallery untouched.
  const managesImages =
    (imageFiles && imageFiles.length > 0) || existingImages !== undefined;

  let images: string[] | undefined;
  if (managesImages) {
    // Keep only references that actually belong to this product (guards against
    // a stale/forged keep-list), then append the freshly uploaded keys.
    const kept = (existingImages ?? owned.images).filter((ref) =>
      owned.images.includes(ref)
    );

    const uploaded: string[] = [];
    if (imageFiles) {
      for (const file of imageFiles) {
        uploaded.push(await uploadToStorage(file, 'products'));
      }
    }

    images = [...kept, ...uploaded];
    if (images.length > MAX_PRODUCT_IMAGES) {
      await deleteStorageKeys(uploaded); // roll back to avoid orphaned objects
      throw new AppError(
        400,
        `A product can have at most ${MAX_PRODUCT_IMAGES} images.`
      );
    }

    // Purge images the owner dropped.
    await deleteStorageKeys(owned.images.filter((ref) => !images!.includes(ref)));
  }

  const product = await prisma.product.update({
    where: { id: productId },
    data: { ...data, ...(images !== undefined ? { images } : {}) },
    select: PRODUCT_SELECT,
  });

  logger.info({ productId, userId }, 'Product updated');
  return formatProduct(product);
}

export async function deleteProduct(
  productId: string,
  userId: string
): Promise<void> {
  const prisma = getPrisma();
  const owned = await getOwnedProduct(productId, userId);

  await prisma.product.delete({ where: { id: productId } });
  await deleteStorageKeys(owned.images); // free the product's storage objects

  logger.info({ productId, userId }, 'Product deleted');
}

export async function getProductsByOwner(
  userId: string,
  page: number,
  limit: number
): Promise<PaginatedResult<ProductResponse>> {
  const prisma = getPrisma();

  const business = await prisma.businessProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!business) {
    throw new AppError(404, 'Business profile not found.');
  }

  return getProductsByBusiness(business.id, page, limit, userId);
}

export async function getProductsByBusiness(
  businessId: string,
  page: number,
  limit: number,
  requestingUserId?: string
): Promise<PaginatedResult<ProductResponse>> {
  const prisma = getPrisma();

  // Only show available products unless it's the owner viewing their own shelf
  let isOwner = false;
  if (requestingUserId) {
    const business = await prisma.businessProfile.findUnique({
      where: { userId: requestingUserId },
      select: { id: true },
    });
    isOwner = business?.id === businessId;
  }

  const where = isOwner
    ? { businessId }
    : { businessId, isAvailable: true };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      select: PRODUCT_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const data = await Promise.all(products.map(formatProduct));
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getProductsByCategory(
  category: string,
  page: number,
  limit: number
): Promise<PaginatedResult<ProductResponse>> {
  const prisma = getPrisma();

  const where = { category, isAvailable: true };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      select: PRODUCT_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const data = await Promise.all(products.map(formatProduct));
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function updateStock(
  productId: string,
  userId: string,
  quantity: number
): Promise<ProductResponse> {
  const prisma = getPrisma();
  await getOwnedProduct(productId, userId);

  const product = await prisma.product.update({
    where: { id: productId },
    data: { stock: { increment: quantity } },
    select: PRODUCT_SELECT,
  });

  logger.info({ productId, userId, quantity }, 'Product stock updated');
  return formatProduct(product);
}

export async function toggleAvailability(
  productId: string,
  userId: string
): Promise<ProductResponse> {
  const prisma = getPrisma();
  const existing = await getOwnedProduct(productId, userId);

  const current = await prisma.product.findUnique({
    where: { id: existing.id },
    select: { isAvailable: true },
  });

  const product = await prisma.product.update({
    where: { id: productId },
    data: { isAvailable: !current!.isAvailable },
    select: PRODUCT_SELECT,
  });

  logger.info(
    { productId, userId, isAvailable: product.isAvailable },
    'Product availability toggled'
  );
  return formatProduct(product);
}
