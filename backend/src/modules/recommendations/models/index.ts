export interface BusinessStats {
  businessId: string;
  avgRating: number | null;
  recommendationPercentage: number | null;
  reviewCount: number;
  followerCount: number;
}

export interface TopBusinessResult {
  id: string;
  businessName: string;
  description: string;
  category: string;
  location: string;
  isVerified: boolean;
  avgRating: number | null;
  recommendationPercentage: number | null;
  reviewCount: number;
  score: number;
}
