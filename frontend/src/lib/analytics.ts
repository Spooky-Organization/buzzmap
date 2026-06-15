import { getSession } from 'next-auth/react';
import { api } from './api';
import { apiRoutes } from './routes';

export type AnalyticsEventType =
  | 'BUSINESS_VIEWED'
  | 'PRODUCT_VIEWED'
  | 'POV_VIEWED'
  | 'ADD_TO_CART'
  | 'CHECKOUT_STARTED'
  | 'ORDER_PLACED'
  | 'MESSAGE_STARTED';

export interface AnalyticsEventPayload {
  eventType: AnalyticsEventType;
  businessId?: string;
  productId?: string;
  povId?: string;
  orderId?: string;
  conversationId?: string;
  metadata?: Record<string, string | number | boolean>;
}

export async function trackAnalyticsEvent(
  payload: AnalyticsEventPayload
): Promise<void> {
  try {
    const session = await getSession();
    if (!session?.accessToken) return;

    await api.post(apiRoutes.analytics.events, payload);
  } catch {
    // Analytics should never block the user workflow.
  }
}
