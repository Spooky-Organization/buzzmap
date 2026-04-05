export interface CreatePOVDTO {
  businessId: string;
  caption?: string;
  starRating: number; // 1-5
  recommends: boolean;
}

export interface POVResponse {
  id: string;
  author: { id: string; name: string; avatar: string | null };
  business: { id: string; businessName: string };
  videoUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
  starRating: number;
  recommends: boolean;
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
