import {
  BusinessType,
  ConversationType,
  NotificationType,
  OrderStatus,
  ReportStatus,
  ReportTargetType,
  Prisma,
} from '@prisma/client';
import type { Role } from '@prisma/client';
import { config } from '../../../config/index.js';
import { getPrisma } from '../../../shared/prisma/index.js';
import * as recommendationService from '../../recommendations/services/recommendationService.js';
import type {
  AdminBusinessListItem,
  AdminCapabilityNotice,
  AdminCatalogListItem,
  AdminMessagesSummary,
  AdminModerationSummary,
  AdminOrderListItem,
  AdminOverview,
  AdminPaginationResult,
  AdminSecuritySummary,
  AdminSettingsSummary,
  AdminSystemSummary,
  AdminUserListItem,
} from '../models/index.js';

const recentDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

export async function getOverview(adminUserId: string): Promise<AdminOverview> {
  const prisma = getPrisma();

  const [
    users,
    businesses,
    listings,
    orders,
    conversations,
    reports,
    usersLast7Days,
    ordersLast7Days,
    povsLast7Days,
    postsLast7Days,
    pendingReports,
    unverifiedBusinesses,
    unreadAdminNotifications,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.businessProfile.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.conversation.count(),
    prisma.report.count(),
    prisma.user.count({ where: { createdAt: { gte: recentDate } } }),
    prisma.order.count({ where: { createdAt: { gte: recentDate } } }),
    prisma.pOV.count({ where: { createdAt: { gte: recentDate } } }),
    prisma.post.count({ where: { createdAt: { gte: recentDate } } }),
    prisma.report.count({ where: { status: ReportStatus.PENDING } }),
    prisma.businessProfile.count({ where: { isVerified: false } }),
    prisma.notification.count({ where: { userId: adminUserId, read: false } }),
  ]);

  const ordersByStatusRows = await prisma.order.groupBy({
    by: ['status'],
    _count: { status: true },
  });

  const topBusinesses = (await recommendationService.getTopBusinesses(undefined, 5)).map(
    (business) => ({
      businessId: business.id,
      businessName: business.businessName,
      category: business.category,
      score: business.score,
      avgRating: business.avgRating ?? 0,
      reviewCount: business.reviewCount,
    })
  );

  return {
    totals: { users, businesses, listings, orders, conversations, reports },
    recentActivity: { usersLast7Days, ordersLast7Days, povsLast7Days, postsLast7Days },
    queues: { pendingReports, unverifiedBusinesses, unreadAdminNotifications },
    ordersByStatus: ordersByStatusRows.map((row) => ({
      status: row.status,
      count: row._count.status,
    })),
    topBusinesses,
  };
}

export async function getUsers(params: {
  keyword?: string;
  role?: Role;
  sortBy?: 'name' | 'createdAt' | 'role';
  sortOrder?: 'asc' | 'desc';
  page: number;
  limit: number;
}): Promise<AdminPaginationResult<AdminUserListItem>> {
  const prisma = getPrisma();
  const { keyword, role, sortBy = 'createdAt', sortOrder = 'desc', page, limit } = params;

  const where: Prisma.UserWhereInput = {
    ...(keyword && {
      OR: [
        { name: { contains: keyword, mode: 'insensitive' } },
        { email: { contains: keyword, mode: 'insensitive' } },
      ],
    }),
    ...(role && { role }),
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        location: true,
        createdAt: true,
        businessProfile: {
          select: {
            id: true,
            businessName: true,
            category: true,
            isVerified: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    data: users as AdminUserListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getBusinesses(params: {
  keyword?: string;
  verified?: boolean;
  sortBy?: 'businessName' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page: number;
  limit: number;
}): Promise<AdminPaginationResult<AdminBusinessListItem>> {
  const prisma = getPrisma();
  const {
    keyword,
    verified,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page,
    limit,
  } = params;

  const where: Prisma.BusinessProfileWhereInput = {
    ...(keyword && {
      OR: [
        { businessName: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
        { user: { name: { contains: keyword, mode: 'insensitive' } } },
        { user: { email: { contains: keyword, mode: 'insensitive' } } },
      ],
    }),
    ...(verified !== undefined && { isVerified: verified }),
  };

  const [total, businesses] = await Promise.all([
    prisma.businessProfile.count({ where }),
    prisma.businessProfile.findMany({
      where,
      select: {
        id: true,
        businessName: true,
        description: true,
        category: true,
        type: true,
        location: true,
        isVerified: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        products: {
          select: { id: true },
        },
        povs: {
          select: { starRating: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    data: businesses.map((business) => {
      const ratedPovs = business.povs.filter((pov) => pov.starRating !== null);
      const reviewCount = ratedPovs.length;
      const avgRating =
        reviewCount > 0
          ? Number(
              (ratedPovs.reduce((sum, pov) => sum + (pov.starRating ?? 0), 0) / reviewCount).toFixed(2)
            )
          : null;

      return {
        id: business.id,
        businessName: business.businessName,
        description: business.description,
        category: business.category,
        type: business.type,
        location: business.location,
        isVerified: business.isVerified,
        createdAt: business.createdAt,
        owner: business.user,
        productCount: business.products.length,
        avgRating,
        reviewCount,
      };
    }),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getCatalog(params: {
  keyword?: string;
  category?: string;
  availability?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt' | 'stock';
  sortOrder?: 'asc' | 'desc';
  page: number;
  limit: number;
}): Promise<AdminPaginationResult<AdminCatalogListItem>> {
  const prisma = getPrisma();
  const {
    keyword,
    category,
    availability,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page,
    limit,
  } = params;

  const where: Prisma.ProductWhereInput = {
    ...(keyword && {
      OR: [
        { name: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ],
    }),
    ...(category && { category: { contains: category, mode: 'insensitive' } }),
    ...(availability !== undefined && { isAvailable: availability }),
  };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        price: true,
        currency: true,
        stock: true,
        isAvailable: true,
        createdAt: true,
        business: {
          select: {
            id: true,
            businessName: true,
            category: true,
            location: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    data: products as AdminCatalogListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getOrders(params: {
  status?: OrderStatus;
  sortBy?: 'createdAt' | 'totalAmount' | 'status';
  sortOrder?: 'asc' | 'desc';
  page: number;
  limit: number;
}): Promise<AdminPaginationResult<AdminOrderListItem>> {
  const prisma = getPrisma();
  const {
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page,
    limit,
  } = params;

  const where: Prisma.OrderWhereInput = {
    ...(status && { status }),
  };

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      select: {
        id: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        updatedAt: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          select: {
            id: true,
            product: {
              select: {
                business: {
                  select: {
                    id: true,
                    businessName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    data: orders.map((order) => {
      const businessesMap = new Map(
        order.items.map((item) => [item.product.business.id, item.product.business])
      );

      return {
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        itemCount: order.items.length,
        customer: order.customer,
        businesses: Array.from(businessesMap.values()),
      };
    }),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getModeration(): Promise<AdminModerationSummary> {
  const prisma = getPrisma();

  const [pending, reviewed, resolved, recentReports, recentPovs, recentComments, recentPosts] =
    await Promise.all([
      prisma.report.count({ where: { status: ReportStatus.PENDING } }),
      prisma.report.count({ where: { status: ReportStatus.REVIEWED } }),
      prisma.report.count({ where: { status: ReportStatus.RESOLVED } }),
      prisma.report.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          targetType: true,
          targetId: true,
          reason: true,
          status: true,
          createdAt: true,
          reporter: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.pOV.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true,
          caption: true,
          starRating: true,
          createdAt: true,
          author: { select: { id: true, name: true } },
          business: { select: { id: true, businessName: true } },
        },
      }),
      prisma.comment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true,
          content: true,
          createdAt: true,
          povId: true,
          user: { select: { id: true, name: true } },
        },
      }),
      prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true,
          type: true,
          content: true,
          createdAt: true,
          author: { select: { id: true, name: true } },
        },
      }),
    ]);

  return {
    counts: { pending, reviewed, resolved },
    recentReports,
    recentPovs,
    recentComments,
    recentPosts,
  };
}

export async function getMessages(): Promise<AdminMessagesSummary> {
  const prisma = getPrisma();

  const [conversations, direct, group, unreadMessages, recentConversations] = await Promise.all([
    prisma.conversation.count(),
    prisma.conversation.count({ where: { type: ConversationType.DIRECT } }),
    prisma.conversation.count({ where: { type: ConversationType.GROUP } }),
    prisma.message.count({ where: { readAt: null } }),
    prisma.conversation.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        name: true,
        updatedAt: true,
        participants: {
          select: { id: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            sender: {
              select: { id: true, name: true },
            },
          },
        },
      },
    }),
  ]);

  return {
    totals: { conversations, direct, group, unreadMessages },
    recentConversations: recentConversations.map((conversation) => ({
      id: conversation.id,
      type: conversation.type,
      name: conversation.name,
      participantCount: conversation.participants.length,
      updatedAt: conversation.updatedAt,
      lastMessage: conversation.messages[0] ?? null,
    })),
  };
}

export async function getSecurity(adminUserId: string): Promise<AdminSecuritySummary> {
  const prisma = getPrisma();

  const [adminUsers, unverifiedBusinesses, pendingReports, unreadAdminNotifications, recentUsers] =
    await Promise.all([
      prisma.user.count({ where: { role: 'ADMIN' as Role } }),
      prisma.businessProfile.count({ where: { isVerified: false } }),
      prisma.report.count({ where: { status: ReportStatus.PENDING } }),
      prisma.notification.count({ where: { userId: adminUserId, read: false } }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

  return {
    posture: {
      adminUsers,
      unverifiedBusinesses,
      pendingReports,
      unreadAdminNotifications,
    },
    policy: {
      maxFileSize: config.maxFileSize,
      allowedFileTypes: config.allowedFileTypes,
      rateLimitWindowMs: config.rateLimitWindowMs,
      rateLimitMaxRequests: config.rateLimitMaxRequests,
    },
    recentUsers,
  };
}

export async function getSystem(): Promise<AdminSystemSummary> {
  const prisma = getPrisma();

  const [users, businesses, products, orders, notifications] = await Promise.all([
    prisma.user.count(),
    prisma.businessProfile.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.notification.count(),
  ]);

  await prisma.$queryRaw`SELECT 1`;

  return {
    health: {
      api: 'ok',
      database: 'ok',
      storageSslEnabled: config.storage.useSsl,
      redisConfigured: Boolean(config.redis.url),
    },
    runtime: {
      nodeEnv: config.nodeEnv,
      backendUrl: config.backendUrl,
      frontendUrl: config.frontendUrl,
      logLevel: config.logLevel,
    },
    counts: {
      users,
      businesses,
      products,
      orders,
      notifications,
    },
  };
}

export function getSettings(): AdminSettingsSummary {
  return {
    roles: ['ADMIN', 'CUSTOMER', 'BUSINESS_OWNER'] as Role[],
    orderStatuses: [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.COMPLETED,
      OrderStatus.CANCELLED,
    ],
    reportStatuses: [ReportStatus.PENDING, ReportStatus.REVIEWED, ReportStatus.RESOLVED],
    reportTargets: [ReportTargetType.POV, ReportTargetType.USER, ReportTargetType.BUSINESS],
    notificationTypes: [
      NotificationType.POV_POSTED,
      NotificationType.ORDER_UPDATE,
      NotificationType.NEW_FOLLOWER,
      NotificationType.MESSAGE,
      NotificationType.FRIEND_JOINED,
    ],
    businessTypes: [BusinessType.PRODUCTS, BusinessType.SERVICES],
    policy: {
      maxFileSize: config.maxFileSize,
      allowedFileTypes: config.allowedFileTypes,
      rateLimitWindowMs: config.rateLimitWindowMs,
      rateLimitMaxRequests: config.rateLimitMaxRequests,
    },
  };
}

export function getAnnouncementsCapability(): AdminCapabilityNotice {
  return {
    supported: false,
    reason: 'The current schema has no announcement or campaign persistence model.',
    nextStep: 'Introduce an announcements table and delivery workflow before exposing write-capable admin messaging.',
  };
}

export function getAuditLogCapability(): AdminCapabilityNotice {
  return {
    supported: false,
    reason: 'The current schema has no persisted admin audit-log model.',
    nextStep: 'Introduce an audit-event table and write-side logging hooks before exposing audit history.',
  };
}
