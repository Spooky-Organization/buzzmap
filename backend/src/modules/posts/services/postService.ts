import { getPrisma } from '../../../shared/prisma/index.js';
import { resolveStorageUrl, uploadToStorage } from '../../../shared/storage/upload.js';
import { AppError } from '../../../shared/middleware/errorHandler.js';
import type { CreatePostDTO, PostResponse, PaginatedPostsResult } from '../models/index.js';
import { sanitizeOptionalText } from '../../../shared/utils/sanitize.js';
import { Role } from '@prisma/client';

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

type RawPost = Awaited<ReturnType<typeof getPrisma>>['post'] extends never
  ? never
  : {
      id: string;
      authorId: string;
      businessId: string | null;
      type: PostResponse['type'];
      content: string | null;
      mediaUrls: string[];
      createdAt: Date;
      author: PostResponse['author'];
      business: PostResponse['business'];
    };

async function formatPost(post: RawPost): Promise<PostResponse> {
  const mediaUrls = await Promise.all(
    post.mediaUrls.map((url) => resolveStorageUrl(url))
  );

  return {
    ...post,
    mediaUrls,
  };
}

async function resolveBusinessIdForPost(
  authorId: string,
  requestedBusinessId?: string
): Promise<string | null> {
  const prisma = getPrisma();

  const author = await prisma.user.findUnique({
    where: { id: authorId },
    select: {
      role: true,
      businessProfile: { select: { id: true } },
    },
  });

  if (!author) {
    throw new AppError(404, 'Author not found');
  }

  if (requestedBusinessId) {
    const business = await prisma.businessProfile.findUnique({
      where: { id: requestedBusinessId },
      select: { id: true },
    });
    if (!business) {
      throw new AppError(404, 'Business not found');
    }

    if (author.role === Role.BUSINESS_OWNER && author.businessProfile?.id !== requestedBusinessId) {
      throw new AppError(403, 'You can only publish posts for your own business.');
    }

    return requestedBusinessId;
  }

  if (author.role === Role.BUSINESS_OWNER) {
    if (!author.businessProfile) {
      throw new AppError(403, 'No business profile found for this user');
    }
    return author.businessProfile.id;
  }

  return null;
}

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

  const content = sanitizeOptionalText(data.content) ?? null;

  if (!content && mediaUrls.length === 0) {
    throw new AppError(400, 'Post must have content or a media attachment.');
  }

  const businessId = await resolveBusinessIdForPost(authorId, data.businessId);

  const post = await prisma.post.create({
    data: {
      authorId,
      businessId,
      type: data.type,
      content,
      mediaUrls,
    },
    select: postSelect,
  });

  return formatPost(post);
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
    data: await Promise.all(posts.map(formatPost)),
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
    data: await Promise.all(posts.map(formatPost)),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
