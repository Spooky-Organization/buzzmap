import { z } from 'zod';

const pageTransform = z
  .string()
  .optional()
  .transform((value) => (value ? parseInt(value, 10) : 1))
  .pipe(z.number().int().min(1));

const limitTransform = z
  .string()
  .optional()
  .transform((value) => (value ? parseInt(value, 10) : 20))
  .pipe(z.number().int().min(1).max(100));

export const adminListUsersQuerySchema = z.object({
  keyword: z.string().trim().min(1).optional(),
  role: z.enum(['ADMIN', 'CUSTOMER', 'BUSINESS_OWNER']).optional(),
  sortBy: z.enum(['name', 'createdAt', 'role']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: pageTransform,
  limit: limitTransform,
});

export const adminListBusinessesQuerySchema = z.object({
  keyword: z.string().trim().min(1).optional(),
  verified: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
  sortBy: z.enum(['businessName', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: pageTransform,
  limit: limitTransform,
});

export const adminListCatalogQuerySchema = z.object({
  keyword: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  availability: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
  sortBy: z.enum(['name', 'price', 'createdAt', 'stock']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: pageTransform,
  limit: limitTransform,
});

export const adminListOrdersQuerySchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
  sortBy: z.enum(['createdAt', 'totalAmount', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: pageTransform,
  limit: limitTransform,
});

export type AdminListUsersQuery = z.infer<typeof adminListUsersQuerySchema>;
export type AdminListBusinessesQuery = z.infer<typeof adminListBusinessesQuerySchema>;
export type AdminListCatalogQuery = z.infer<typeof adminListCatalogQuerySchema>;
export type AdminListOrdersQuery = z.infer<typeof adminListOrdersQuerySchema>;
