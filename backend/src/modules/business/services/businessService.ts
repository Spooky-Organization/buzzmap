import { getPrisma } from '../../../shared/prisma/index.js';
import { AppError } from '../../../shared/middleware/errorHandler.js';
import { sanitizeOptionalText, sanitizePlainText } from '../../../shared/utils/sanitize.js';
import type { Prisma } from '@prisma/client';
import type {
  BusinessProfileResponse,
  PublicBusinessProfileResponse,
  UpdateBusinessProfileDTO,
} from '../models/index.js';

const businessProfileSelect = {
  id: true,
  userId: true,
  businessName: true,
  description: true,
  category: true,
  type: true,
  location: true,
  coordinates: true,
  contactInfo: true,
  operatingHours: true,
  isVerified: true,
  qrCode: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { products: true, posts: true } },
  povs: { select: { starRating: true } },
} as const;

type SelectedBusinessProfile = Prisma.BusinessProfileGetPayload<{
  select: typeof businessProfileSelect;
}>;

function mapBusinessProfile(
  profile: SelectedBusinessProfile,
  followerCount: number
): BusinessProfileResponse {
  const avgRating =
    profile.povs.length > 0
      ? profile.povs.reduce((sum, p) => sum + p.starRating, 0) / profile.povs.length
      : 0;

  return {
    id: profile.id,
    userId: profile.userId,
    businessName: profile.businessName,
    description: profile.description,
    category: profile.category,
    type: profile.type,
    location: profile.location,
    coordinates: profile.coordinates,
    contactInfo: profile.contactInfo,
    operatingHours: profile.operatingHours,
    isVerified: profile.isVerified,
    qrCode: profile.qrCode,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    avgRating: Math.round(avgRating * 10) / 10,
    reviewCount: profile.povs.length,
    followerCount,
    _count: profile._count,
  };
}

function sanitizeBusinessProfileUpdate(data: UpdateBusinessProfileDTO): UpdateBusinessProfileDTO {
  return {
    ...(data.businessName !== undefined && {
      businessName: sanitizePlainText(data.businessName),
    }),
    ...(data.description !== undefined && {
      description: sanitizePlainText(data.description),
    }),
    ...(data.category !== undefined && {
      category: sanitizePlainText(data.category),
    }),
    ...(data.type !== undefined && { type: data.type }),
    ...(data.location !== undefined && {
      location: sanitizePlainText(data.location),
    }),
    ...(data.coordinates !== undefined && {
      coordinates: sanitizeOptionalText(data.coordinates) ?? '',
    }),
    ...(data.contactInfo !== undefined && {
      contactInfo: sanitizeOptionalText(data.contactInfo) ?? '',
    }),
    ...(data.operatingHours !== undefined && {
      operatingHours: data.operatingHours,
    }),
  };
}

export async function getBusinessProfileByOwner(userId: string): Promise<BusinessProfileResponse> {
  const prisma = getPrisma();

  const profile = await prisma.businessProfile.findUnique({
    where: { userId },
    select: businessProfileSelect,
  });

  if (!profile) {
    throw new AppError(404, 'Business profile not found');
  }

  const followerCount = await prisma.follow.count({
    where: { followingId: profile.userId },
  });

  return mapBusinessProfile(profile, followerCount);
}

export async function updateBusinessProfile(
  userId: string,
  data: UpdateBusinessProfileDTO
): Promise<BusinessProfileResponse> {
  const prisma = getPrisma();
  const sanitizedData = sanitizeBusinessProfileUpdate(data);
  const prismaData: Prisma.BusinessProfileUpdateInput = {};

  if (sanitizedData.businessName !== undefined) prismaData.businessName = sanitizedData.businessName;
  if (sanitizedData.description !== undefined) prismaData.description = sanitizedData.description;
  if (sanitizedData.category !== undefined) prismaData.category = sanitizedData.category;
  if (sanitizedData.type !== undefined) prismaData.type = sanitizedData.type;
  if (sanitizedData.location !== undefined) prismaData.location = sanitizedData.location;
  if (sanitizedData.coordinates !== undefined) prismaData.coordinates = sanitizedData.coordinates;
  if (sanitizedData.contactInfo !== undefined) prismaData.contactInfo = sanitizedData.contactInfo;
  if (sanitizedData.operatingHours !== undefined) {
    prismaData.operatingHours = sanitizedData.operatingHours as Prisma.InputJsonValue;
  }

  await prisma.businessProfile.update({
    where: { userId },
    data: prismaData,
  });
  return getBusinessProfileByOwner(userId);
}

export async function getBusinessProfileById(
  businessId: string,
  currentUserId: string
): Promise<PublicBusinessProfileResponse> {
  const prisma = getPrisma();

  const profile = await prisma.businessProfile.findUnique({
    where: { id: businessId },
    select: businessProfileSelect,
  });

  if (!profile) {
    throw new AppError(404, 'Business not found');
  }

  const [followerCount, isFollowing] = await Promise.all([
    prisma.follow.count({
      where: { followingId: profile.userId },
    }),
    prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: profile.userId,
        },
      },
      select: { id: true },
    }),
  ]);

  return {
    ...mapBusinessProfile(profile, followerCount),
    isFollowing: !!isFollowing,
  };
}

export async function followBusiness(
  followerId: string,
  businessId: string
): Promise<void> {
  const prisma = getPrisma();

  const business = await prisma.businessProfile.findUnique({
    where: { id: businessId },
    select: { userId: true },
  });

  if (!business) {
    throw new AppError(404, 'Business not found');
  }

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId: business.userId,
      },
    },
  });

  if (existing) {
    throw new AppError(409, 'Already following this business');
  }

  await prisma.follow.create({
    data: {
      followerId,
      followingId: business.userId,
    },
  });
}

export async function unfollowBusiness(
  followerId: string,
  businessId: string
): Promise<void> {
  const prisma = getPrisma();

  const business = await prisma.businessProfile.findUnique({
    where: { id: businessId },
    select: { userId: true },
  });

  if (!business) {
    throw new AppError(404, 'Business not found');
  }

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId: business.userId,
      },
    },
  });

  if (!existing) {
    throw new AppError(404, 'Not following this business');
  }

  await prisma.follow.delete({
    where: { id: existing.id },
  });
}
