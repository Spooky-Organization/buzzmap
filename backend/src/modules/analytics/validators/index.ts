import { z } from 'zod';

const analyticsEventTypeSchema = z.enum([
  'BUSINESS_VIEWED',
  'PRODUCT_VIEWED',
  'POV_VIEWED',
  'ADD_TO_CART',
  'CHECKOUT_STARTED',
  'ORDER_PLACED',
  'MESSAGE_STARTED',
]);

export const createAnalyticsEventSchema = z.object({
  eventType: analyticsEventTypeSchema,
  businessId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  povId: z.string().uuid().optional(),
  orderId: z.string().uuid().optional(),
  conversationId: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
}).superRefine((data, ctx) => {
  const requiredTargetByEvent: Partial<Record<typeof data.eventType, keyof typeof data>> = {
    BUSINESS_VIEWED: 'businessId',
    PRODUCT_VIEWED: 'productId',
    POV_VIEWED: 'povId',
    ADD_TO_CART: 'productId',
    ORDER_PLACED: 'orderId',
    MESSAGE_STARTED: 'conversationId',
  };

  const requiredTarget = requiredTargetByEvent[data.eventType];
  if (requiredTarget && !data[requiredTarget]) {
    ctx.addIssue({
      code: 'custom',
      path: [requiredTarget],
      message: `${data.eventType} requires ${requiredTarget}.`,
    });
  }
});

export type CreateAnalyticsEventInput = z.infer<typeof createAnalyticsEventSchema>;
