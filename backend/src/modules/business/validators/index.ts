import { z } from 'zod';

export const businessParamsSchema = z.object({
  id: z.string().uuid(),
});

export const updateBusinessProfileSchema = z
  .object({
    businessName: z.string().min(2).max(200).optional(),
    description: z.string().min(1).max(5000).optional(),
    category: z.string().min(1).max(100).optional(),
    type: z.enum(['PRODUCTS', 'SERVICES']).optional(),
    location: z.string().min(1).max(200).optional(),
    coordinates: z.string().min(1).max(500).optional(),
    contactInfo: z.string().min(1).max(200).optional(),
    operatingHours: z.record(z.string(), z.unknown()) as z.ZodType<Record<string, unknown>>,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type BusinessParamsInput = z.infer<typeof businessParamsSchema>;
export type UpdateBusinessProfileInput = z.infer<typeof updateBusinessProfileSchema>;
