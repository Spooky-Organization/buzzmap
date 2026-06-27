import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  price: z.number().positive(),
  currency: z.string().length(3).optional(),
  stock: z.number().int().min(0),
  category: z.string().min(1).max(100),
});

// No non-empty refinement: an update may legitimately change only images
// (handled out-of-band via multipart files + `existingImages`), leaving every
// scalar field absent.
export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  category: z.string().min(1).max(100).optional(),
  isAvailable: z.boolean().optional(),
});

export const updateStockSchema = z.object({
  quantity: z.number().int(),
});

export const productQuerySchema = z.object({
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
