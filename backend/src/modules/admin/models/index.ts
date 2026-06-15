import type {
  BusinessType,
  NotificationType,
  OrderStatus,
  PostType,
  ReportStatus,
  ReportTargetType,
  Role,
} from '@prisma/client';

export interface AdminPaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminOverview {
  totals: {
    users: number;
    businesses: number;
    listings: number;
    orders: number;
    conversations: number;
    reports: number;
  };
  recentActivity: {
    usersLast7Days: number;
    ordersLast7Days: number;
    povsLast7Days: number;
    postsLast7Days: number;
  };
  queues: {
    pendingReports: number;
    unverifiedBusinesses: number;
    unreadAdminNotifications: number;
  };
  ordersByStatus: Array<{
    status: OrderStatus;
    count: number;
  }>;
  topBusinesses: Array<{
    businessId: string;
    businessName: string;
    category: string;
    score: number;
    avgRating: number;
    reviewCount: number;
  }>;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: Role;
  location: string | null;
  createdAt: Date;
  businessProfile: null | {
    id: string;
    businessName: string;
    category: string;
    isVerified: boolean;
  };
}

export interface AdminBusinessListItem {
  id: string;
  businessName: string;
  description: string;
  category: string;
  type: BusinessType;
  location: string;
  isVerified: boolean;
  createdAt: Date;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  productCount: number;
  avgRating: number | null;
  reviewCount: number;
}

export interface AdminCatalogListItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  stock: number;
  isAvailable: boolean;
  createdAt: Date;
  business: {
    id: string;
    businessName: string;
    category: string;
    location: string;
  };
}

export interface AdminOrderListItem {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  itemCount: number;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  businesses: Array<{
    id: string;
    businessName: string;
  }>;
}

export interface AdminModerationSummary {
  counts: {
    pending: number;
    reviewed: number;
    resolved: number;
  };
  recentReports: Array<{
    id: string;
    targetType: ReportTargetType;
    targetId: string;
    reason: string;
    status: ReportStatus;
    createdAt: Date;
    reporter: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  recentPovs: Array<{
    id: string;
    caption: string | null;
    starRating: number | null;
    createdAt: Date;
    author: { id: string; name: string };
    business: { id: string; businessName: string } | null;
  }>;
  recentComments: Array<{
    id: string;
    content: string;
    createdAt: Date;
    user: { id: string; name: string };
    povId: string;
  }>;
  recentPosts: Array<{
    id: string;
    type: PostType;
    content: string | null;
    createdAt: Date;
    author: { id: string; name: string };
  }>;
}

export interface AdminMessagesSummary {
  totals: {
    conversations: number;
    direct: number;
    group: number;
    unreadMessages: number;
  };
  recentConversations: Array<{
    id: string;
    type: string;
    name: string | null;
    participantCount: number;
    updatedAt: Date;
    lastMessage: null | {
      id: string;
      content: string | null;
      createdAt: Date;
      sender: {
        id: string;
        name: string;
      };
    };
  }>;
}

export interface AdminSecuritySummary {
  posture: {
    adminUsers: number;
    unverifiedBusinesses: number;
    pendingReports: number;
    unreadAdminNotifications: number;
  };
  policy: {
    maxFileSize: string;
    allowedFileTypes: string[];
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
  };
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: Role;
    createdAt: Date;
  }>;
}

export interface AdminSystemSummary {
  health: {
    api: 'ok';
    database: 'ok';
    storageSslEnabled: boolean;
    redisConfigured: boolean;
  };
  runtime: {
    nodeEnv: string;
    backendUrl: string;
    frontendUrl: string;
    logLevel: string;
  };
  counts: {
    users: number;
    businesses: number;
    products: number;
    orders: number;
    notifications: number;
  };
}

export interface AdminSettingsSummary {
  roles: Role[];
  orderStatuses: OrderStatus[];
  reportStatuses: ReportStatus[];
  reportTargets: ReportTargetType[];
  notificationTypes: NotificationType[];
  businessTypes: BusinessType[];
  policy: {
    maxFileSize: string;
    allowedFileTypes: string[];
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
  };
}

export interface AdminCapabilityNotice {
  supported: false;
  reason: string;
  nextStep: string;
}
