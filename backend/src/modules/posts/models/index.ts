import type { PostType } from '@prisma/client';

export interface CreatePostDTO {
  businessId?: string; // optional — customer posts don't need this
  type: PostType;
  content?: string;
  // mediaUrls populated from uploaded files after storage upload
}

export interface PostAuthor {
  id: string;
  name: string;
  avatar: string | null;
}

export interface PostBusiness {
  id: string;
  businessName: string;
}

export interface PostResponse {
  id: string;
  authorId: string;
  businessId: string | null;
  type: PostType;
  content: string | null;
  mediaUrls: string[];
  createdAt: Date;
  author: PostAuthor;
  business: PostBusiness | null;
}

export interface PaginatedPostsResult {
  data: PostResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
