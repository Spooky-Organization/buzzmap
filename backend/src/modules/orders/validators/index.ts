import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().uuid('productId must be a valid UUID'),
  quantity: z
    .number()
    .int('quantity must be an integer')
    .min(1, 'quantity must be at least 1')
    .optional()
    .default(1),
});

export const updateCartQuantitySchema = z.object({
  quantity: z
    .number()
    .int('quantity must be an integer')
    .min(1, 'quantity must be at least 1'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'], {
    error: 'status must be one of PENDING, CONFIRMED, COMPLETED, CANCELLED',
  }),
});

export const orderPaginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(100)),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartQuantityInput = z.infer<typeof updateCartQuantitySchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderPaginationInput = z.infer<typeof orderPaginationSchema>;
