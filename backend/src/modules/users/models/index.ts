export interface UpdateProfileDTO {
  name?: string;
  avatar?: string;
  location?: string;
  phone?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateInterestsDTO {
  interests: string[];
}

export interface BusinessProfileSummary {
  id: string;
  businessName: string;
  description: string;
  category: string;
  type: string;
  location: string;
  coordinates: string | null;
  contactInfo: string;
  operatingHours: unknown;
  isVerified: boolean;
  qrCode: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: string;
  interests: string[];
  location: string | null;
  phone: string | null;
  createdAt: Date;
  businessProfile?: BusinessProfileSummary | null;
  _count?: {
    followers: number;
    following: number;
    povs: number;
  };
}

export interface PublicUserProfileResponse {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
  interests: string[];
  location: string | null;
  createdAt: Date;
  isFollowing: boolean;
  businessProfile?: BusinessProfileSummary | null;
  _count?: {
    followers: number;
    following: number;
    povs: number;
  };
}

export interface FollowerEntry {
  follower: {
    id: string;
    name: string;
    avatar: string | null;
    role: string;
  };
  createdAt: Date;
}

export interface FollowingEntry {
  following: {
    id: string;
    name: string;
    avatar: string | null;
    role: string;
  };
  createdAt: Date;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
