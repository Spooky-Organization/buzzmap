import { z } from 'zod';

export const createPOVSchema = z.object({
  businessId: z.string().uuid(),
  caption: z.string().max(500).optional(),
  starRating: z.number().int().min(1).max(5),
  recommends: z.boolean(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1).max(1000),
});

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 1))
    .pipe(z.number().int().min(1)),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 20))
    .pipe(z.number().int().min(1).max(100)),
});
