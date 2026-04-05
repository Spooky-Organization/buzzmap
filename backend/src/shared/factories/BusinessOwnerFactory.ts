import { getPrisma } from '../prisma/index.js';
import bcrypt from 'bcrypt';
import { config } from '../../config/index.js';
import type { Prisma } from '@prisma/client';

interface CreateBusinessOwnerInput {
  email: string;
  phone?: string;
  password: string;
  name: string;
  businessName: string;
  description: string;
  category: string;
  type: 'PRODUCTS' | 'SERVICES';
  location: string;
  coordinates?: string;
  contactInfo: string;
  operatingHours: Prisma.InputJsonValue;
}

export class BusinessOwnerFactory {
  static async create(input: CreateBusinessOwnerInput) {
    const prisma = getPrisma();
    const hashedPassword = await bcrypt.hash(input.password, config.bcryptSaltRounds);

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email,
          phone: input.phone,
          password: hashedPassword,
          name: input.name,
          role: 'BUSINESS_OWNER',
          interests: [],
        },
      });

      await tx.businessProfile.create({
        data: {
          userId: user.id,
          businessName: input.businessName,
          description: input.description,
          category: input.category,
          type: input.type,
          location: input.location,
          coordinates: input.coordinates,
          contactInfo: input.contactInfo,
          operatingHours: input.operatingHours,
        },
      });

      return user;
    });
  }
}
