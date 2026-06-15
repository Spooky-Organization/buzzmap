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
  businessId: string | null;
  media: FeedMediaItem[];
  caption: string | null;
  starRating: number | null;
  recommends: boolean | null;
  visibility: 'PUBLIC' | 'FOLLOWERS';
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  author: FeedAuthor;
  business: FeedBusiness | null;
}

export interface PaginatedFeedResult {
  data: FeedPOV[];
  nextCursor: string | null;
}
