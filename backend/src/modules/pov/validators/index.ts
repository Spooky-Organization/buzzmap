import { z } from 'zod';

export const createPOVSchema = z.object({
  businessId: z
    .string()
    .uuid()
    .optional(),
  caption: z.string().max(500).optional(),
  starRating: z.number().int().min(1).max(5).optional(),
  recommends: z.boolean().optional(),
  visibility: z.enum(['PUBLIC', 'FOLLOWERS']).default('PUBLIC'),
}).superRefine((data, ctx) => {
  if (!data.businessId) return;

  if (data.starRating === undefined) {
    ctx.addIssue({
      code: 'custom',
      path: ['starRating'],
      message: 'A business-linked POV requires a star rating.',
    });
  }

  if (data.recommends === undefined) {
    ctx.addIssue({
      code: 'custom',
      path: ['recommends'],
      message: 'A business-linked POV requires a recommendation choice.',
    });
  }
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
