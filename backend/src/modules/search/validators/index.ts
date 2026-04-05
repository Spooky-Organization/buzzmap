import { z } from 'zod';

const paginationFields = {
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
};

export const searchBusinessesSchema = z.object({
  keyword: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  ...paginationFields,
});

export const searchProductsSchema = z.object({
  keyword: z.string().optional(),
  category: z.string().optional(),
  minPrice: z
    .string()
    .optional()
    .transform((v) => (v ? parseFloat(v) : undefined))
    .pipe(z.number().min(0).optional()),
  maxPrice: z
    .string()
    .optional()
    .transform((v) => (v ? parseFloat(v) : undefined))
    .pipe(z.number().min(0).optional()),
  ...paginationFields,
});

export const searchUsersSchema = z.object({
  keyword: z.string().optional(),
  ...paginationFields,
});

export type SearchBusinessesInput = z.infer<typeof searchBusinessesSchema>;
export type SearchProductsInput = z.infer<typeof searchProductsSchema>;
export type SearchUsersInput = z.infer<typeof searchUsersSchema>;
