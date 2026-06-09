export interface BusinessSearchResult {
  id: string;
  businessName: string;
  description: string;
  category: string;
  location: string;
  isVerified: boolean;
  avgRating: number | null;
  reviewCount: number;
}

export interface ProductSearchResult {
  id: string;
  businessId: string;
  businessName: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  isAvailable: boolean;
  imageUrl: string | null;
}

export interface UserSearchResult {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
