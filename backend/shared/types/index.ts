export enum UserRole {
  ADMIN = "ADMIN",
  CUSTOMER = "CUSTOMER",
  BUSINESS_OWNER = "BUSINESS_OWNER",
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PREPARING = "PREPARING",
  READY = "READY",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export enum CheckoutMethod {
  CASH = "CASH",
  CARD = "CARD",
  WALLET = "WALLET",
}

export enum ConversationType {
  DIRECT = "DIRECT",
  GROUP = "GROUP",
  SUPPORT = "SUPPORT",
}

export enum NotificationType {
  ORDER = "ORDER",
  MESSAGE = "MESSAGE",
  SYSTEM = "SYSTEM",
  PROMOTION = "PROMOTION",
  REVIEW = "REVIEW",
}

export enum MediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  DOCUMENT = "DOCUMENT",
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
  sessionId?: string;
  deviceId?: string;
}