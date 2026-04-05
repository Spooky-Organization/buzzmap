import { z } from 'zod';

export const feedQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? parseInt(val, 10) : undefined))
    .pipe(z.number().int().min(1).max(100).optional()),
  interests: z
    .string()
    .optional()
    .transform((val) =>
      val ? val.split(',').map((s) => s.trim()).filter(Boolean) : undefined
    ),
});

export type FeedQueryInput = z.infer<typeof feedQuerySchema>;
