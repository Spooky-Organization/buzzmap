import type { AnalyticsEventType, Prisma } from '@prisma/client';

export interface CreateAnalyticsEventDTO {
  eventType: AnalyticsEventType;
  businessId?: string;
  productId?: string;
  povId?: string;
  orderId?: string;
  conversationId?: string;
  metadata?: Prisma.InputJsonValue;
}

export interface AnalyticsEventResponse {
  id: string;
  userId: string;
  eventType: AnalyticsEventType;
  businessId: string | null;
  productId: string | null;
  povId: string | null;
  orderId: string | null;
  conversationId: string | null;
  metadata: Prisma.JsonValue | null;
  createdAt: Date;
}
