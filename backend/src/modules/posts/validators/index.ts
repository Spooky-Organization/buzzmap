import { z } from 'zod';

export const createPostSchema = z.object({
  businessId: z.string().uuid().optional(),
  type: z.enum(['TEXT', 'IMAGE', 'VIDEO']),
  content: z.string().min(1).max(5000).optional(),
});

export const postPaginationSchema = z.object({
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

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type PostPaginationInput = z.infer<typeof postPaginationSchema>;
