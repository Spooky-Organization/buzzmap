import type { POVVisibility } from '@prisma/client';

export interface CreatePOVDTO {
  businessId?: string;
  caption?: string;
  starRating?: number; // 1-5, required for business-linked POVs
  recommends?: boolean; // required for business-linked POVs
  visibility?: POVVisibility;
}

export type POVMediaType = 'image' | 'video';

export interface POVMediaItem {
  id: string;
  url: string; // signed URL
  type: POVMediaType;
  thumbnailUrl: string | null;
  position: number;
}

export interface POVResponse {
  id: string;
  author: { id: string; name: string; avatar: string | null };
  business: { id: string; businessName: string } | null;
  media: POVMediaItem[];
  caption: string | null;
  starRating: number | null;
  recommends: boolean | null;
  visibility: POVVisibility;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  isLiked?: boolean; // whether the requesting user liked this
}

export interface CommentResponse {
  id: string;
  author: { id: string; name: string; avatar: string | null };
  content: string;
  createdAt: Date;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
