export interface FeedAuthor {
  id: string;
  name: string;
  avatar: string | null;
}

export interface FeedBusiness {
  id: string;
  businessName: string;
}

export interface FeedMediaItem {
  id: string;
  url: string; // signed URL
  type: 'image' | 'video';
  thumbnailUrl: string | null;
  position: number;
}

export interface FeedPOV {
  id: string;
  authorId: string;
  businessId: string;
  media: FeedMediaItem[];
  caption: string | null;
  starRating: number;
  recommends: boolean;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  author: FeedAuthor;
  business: FeedBusiness;
}

export interface PaginatedFeedResult {
  data: FeedPOV[];
  nextCursor: string | null;
}
