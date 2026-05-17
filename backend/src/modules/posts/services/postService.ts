import { getPrisma } from '../../../shared/prisma/index.js';
import { uploadToStorage } from '../../../shared/storage/upload.js';
import { AppError } from '../../../shared/middleware/errorHandler.js';
import type { CreatePostDTO, PostResponse, PaginatedPostsResult } from '../models/index.js';
import { sanitizeOptionalText } from '../../../shared/utils/sanitize.js';

const postSelect = {
  id: true,
  authorId: true,
  businessId: true,
  type: true,
  content: true,
  mediaUrls: true,
  createdAt: true,
  author: { select: { id: true, name: true, avatar: true } },
  business: { select: { id: true, businessName: true } },
} as const;

/**
 * Create a new post. If mediaFiles are provided they are uploaded to RustFS first.
 */
export async function createPost(
  authorId: string,
  data: CreatePostDTO,
  mediaFiles?: Express.Multer.File[]
): Promise<PostResponse> {
  const prisma = getPrisma();

  let mediaUrls: string[] = [];

  if (mediaFiles && mediaFiles.length > 0) {
    const folder = 'posts';
    const uploads = await Promise.all(
      mediaFiles.map((file) => uploadToStorage(file, folder))
    );
    mediaUrls = uploads;
  }

  // Validate businessId exists if provided
  if (data.businessId) {
    const business = await prisma.businessProfile.findUnique({
      where: { id: data.businessId },
      select: { id: true },
    });
    if (!business) {
      throw new AppError(404, 'Business not found');
    }
  }

  const post = await prisma.post.create({
    data: {
      authorId,
      businessId: data.businessId ?? null,
      type: data.type,
      content: sanitizeOptionalText(data.content) ?? null,
      mediaUrls,
    },
    select: postSelect,
  });

  return post as PostResponse;
}

/**
 * Delete a post. Only the original author may delete their post.
 */
export async function deletePost(
  postId: string,
  userId: string
): Promise<void> {
  const prisma = getPrisma();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post) {
    throw new AppError(404, 'Post not found');
  }

  if (post.authorId !== userId) {
    throw new AppError(403, 'You are not authorized to delete this post');
  }

  await prisma.post.delete({ where: { id: postId } });
}

/**
 * Get all posts by a specific user, paginated.
 */
export async function getPostsByUser(
  userId: string,
  page: number,
  limit: number
): Promise<PaginatedPostsResult> {
  const prisma = getPrisma();
  const skip = (page - 1) * limit;

  const [total, posts] = await Promise.all([
    prisma.post.count({ where: { authorId: userId } }),
    prisma.post.findMany({
      where: { authorId: userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: postSelect,
    }),
  ]);

  return {
    data: posts as PostResponse[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get all posts associated with a specific business, paginated.
 */
export async function getPostsByBusiness(
  businessId: string,
  page: number,
  limit: number
): Promise<PaginatedPostsResult> {
  const prisma = getPrisma();
  const skip = (page - 1) * limit;

  const [total, posts] = await Promise.all([
    prisma.post.count({ where: { businessId } }),
    prisma.post.findMany({
      where: { businessId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: postSelect,
    }),
  ]);

  return {
    data: posts as PostResponse[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
