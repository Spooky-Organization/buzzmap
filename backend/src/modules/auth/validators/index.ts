import { z } from 'zod';

export const registerCustomerSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  name: z.string().min(2),
  interests: z.array(z.string()).optional(),
  location: z.string().optional(),
});

export const registerBusinessSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  name: z.string().min(2),
  businessName: z.string().min(2),
  description: z.string().min(10),
  category: z.string().min(1),
  type: z.enum(['PRODUCTS', 'SERVICES']),
  location: z.string().min(1),
  coordinates: z.string().optional(),
  contactInfo: z.string().min(1),
  operatingHours: z.record(z.string(), z.unknown()),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});
