import type { BusinessType } from '@prisma/client';

export interface BusinessProfileResponse {
  id: string;
  userId: string;
  businessName: string;
  description: string;
  category: string;
  type: BusinessType;
  location: string;
  coordinates: string | null;
  contactInfo: string;
  operatingHours: unknown;
  isVerified: boolean;
  qrCode: string | null;
  createdAt: Date;
  updatedAt: Date;
  avgRating: number;
  reviewCount: number;
  followerCount: number;
  _count?: {
    products: number;
    posts: number;
  };
}

export interface PublicBusinessProfileResponse extends BusinessProfileResponse {
  isFollowing: boolean;
}

export interface UpdateBusinessProfileDTO {
  businessName?: string;
  description?: string;
  category?: string;
  type?: BusinessType;
  location?: string;
  coordinates?: string;
  contactInfo?: string;
  operatingHours?: Record<string, unknown>;
}
