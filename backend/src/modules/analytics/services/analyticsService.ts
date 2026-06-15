import { getPrisma } from '../../../shared/prisma/index.js';
import type { AnalyticsEventResponse, CreateAnalyticsEventDTO } from '../models/index.js';

export async function createAnalyticsEvent(
  userId: string,
  data: CreateAnalyticsEventDTO
): Promise<AnalyticsEventResponse> {
  const prisma = getPrisma();

  return prisma.analyticsEvent.create({
    data: {
      userId,
      eventType: data.eventType,
      businessId: data.businessId ?? null,
      productId: data.productId ?? null,
      povId: data.povId ?? null,
      orderId: data.orderId ?? null,
      conversationId: data.conversationId ?? null,
      metadata: data.metadata ?? undefined,
    },
  });
}
