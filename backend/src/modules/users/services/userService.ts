import { getPrisma } from '../../../shared/prisma/index.js';
import { AppError } from '../../../shared/middleware/errorHandler.js';
import type {
  UpdateProfileDTO,
  UserProfileResponse,
  PublicUserProfileResponse,
  PaginatedResult,
  FollowerEntry,
  FollowingEntry,
} from '../models/index.js';

const businessProfileSelect = {
  id: true,
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
} as const;

export async function getProfile(userId: string): Promise<UserProfileResponse> {
  const prisma = getPrisma();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      role: true,
      interests: true,
      location: true,
      createdAt: true,
      businessProfile: { select: businessProfileSelect },
      _count: {
        select: {
          followers: true,
          follows: true,
          povs: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    interests: user.interests,
    location: user.location,
    createdAt: user.createdAt,
    businessProfile: user.businessProfile,
    _count: {
      followers: user._count.followers,
      following: user._count.follows,
      povs: user._count.povs,
    },
  };
}

export async function getPublicProfile(
  userId: string
): Promise<PublicUserProfileResponse> {
  const prisma = getPrisma();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      avatar: true,
      role: true,
      interests: true,
      location: true,
      createdAt: true,
      businessProfile: { select: businessProfileSelect },
      _count: {
        select: {
          followers: true,
          follows: true,
          povs: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    interests: user.interests,
    location: user.location,
    createdAt: user.createdAt,
    businessProfile: user.businessProfile,
    _count: {
      followers: user._count.followers,
      following: user._count.follows,
      povs: user._count.povs,
    },
  };
}

export async function updateProfile(
  userId: string,
  data: UpdateProfileDTO
): Promise<UserProfileResponse> {
  const prisma = getPrisma();

  // Check phone uniqueness if provided
  if (data.phone) {
    const existing = await prisma.user.findUnique({
      where: { phone: data.phone },
      select: { id: true },
    });
    if (existing && existing.id !== userId) {
      throw new AppError(409, 'Phone number is already in use');
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.avatar !== undefined && { avatar: data.avatar }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.phone !== undefined && { phone: data.phone }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      role: true,
      interests: true,
      location: true,
      createdAt: true,
      businessProfile: { select: businessProfileSelect },
      _count: {
        select: {
          followers: true,
          follows: true,
          povs: true,
        },
      },
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    interests: user.interests,
    location: user.location,
    createdAt: user.createdAt,
    businessProfile: user.businessProfile,
    _count: {
      followers: user._count.followers,
      following: user._count.follows,
      povs: user._count.povs,
    },
  };
}

export async function updateInterests(
  userId: string,
  interests: string[]
): Promise<UserProfileResponse> {
  const prisma = getPrisma();

  const user = await prisma.user.update({
    where: { id: userId },
    data: { interests },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      role: true,
      interests: true,
      location: true,
      createdAt: true,
      businessProfile: { select: businessProfileSelect },
      _count: {
        select: {
          followers: true,
          follows: true,
          povs: true,
        },
      },
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    interests: user.interests,
    location: user.location,
    createdAt: user.createdAt,
    businessProfile: user.businessProfile,
    _count: {
      followers: user._count.followers,
      following: user._count.follows,
      povs: user._count.povs,
    },
  };
}

export async function followUser(
  followerId: string,
  followingId: string
): Promise<void> {
  if (followerId === followingId) {
    throw new AppError(400, 'You cannot follow yourself');
  }

  const prisma = getPrisma();

  // Verify target user exists
  const target = await prisma.user.findUnique({
    where: { id: followingId },
    select: { id: true },
  });
  if (!target) {
    throw new AppError(404, 'User not found');
  }

  // Check for duplicate follow
  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  });
  if (existing) {
    throw new AppError(409, 'You are already following this user');
  }

  await prisma.follow.create({
    data: { followerId, followingId },
  });
}

export async function unfollowUser(
  followerId: string,
  followingId: string
): Promise<void> {
  if (followerId === followingId) {
    throw new AppError(400, 'You cannot unfollow yourself');
  }

  const prisma = getPrisma();

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  });
  if (!existing) {
    throw new AppError(404, 'You are not following this user');
  }

  await prisma.follow.delete({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  });
}

export async function getFollowers(
  userId: string,
  page: number,
  limit: number
): Promise<PaginatedResult<FollowerEntry>> {
  const prisma = getPrisma();
  const skip = (page - 1) * limit;

  const [total, records] = await Promise.all([
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.follow.findMany({
      where: { followingId: userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        createdAt: true,
        follower: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
      },
    }),
  ]);

  return {
    data: records,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getFollowing(
  userId: string,
  page: number,
  limit: number
): Promise<PaginatedResult<FollowingEntry>> {
  const prisma = getPrisma();
  const skip = (page - 1) * limit;

  const [total, records] = await Promise.all([
    prisma.follow.count({ where: { followerId: userId } }),
    prisma.follow.findMany({
      where: { followerId: userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        createdAt: true,
        following: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
      },
    }),
  ]);

  return {
    data: records,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function detectFriends(
  userId: string
): Promise<PublicUserProfileResponse[]> {
  const prisma = getPrisma();

  // Friends = users that the current user follows AND who follow the current user back
  const mutualFollows = await prisma.follow.findMany({
    where: {
      followerId: userId,
      following: {
        follows: {
          some: { followingId: userId },
        },
      },
    },
    select: {
      following: {
        select: {
          id: true,
          name: true,
          avatar: true,
          role: true,
          interests: true,
          location: true,
          createdAt: true,
          businessProfile: { select: businessProfileSelect },
          _count: {
            select: {
              followers: true,
              follows: true,
              povs: true,
            },
          },
        },
      },
    },
  });

  return mutualFollows.map(({ following }) => ({
    id: following.id,
    name: following.name,
    avatar: following.avatar,
    role: following.role,
    interests: following.interests,
    location: following.location,
    createdAt: following.createdAt,
    businessProfile: following.businessProfile,
    _count: {
      followers: following._count.followers,
      following: following._count.follows,
      povs: following._count.povs,
    },
  }));
}
