import crypto from 'crypto';
import { prisma } from '../config/prisma';
import { hashPassword } from '../utils/passwordUtils';
import { UserRole } from '../../../shared/types';

export interface CreateBusinessOwnerData {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  businessName: string;
  businessCategory: string;
  businessType: 'RETAIL' | 'SERVICE' | 'RESTAURANT' | 'ONLINE';
}

export interface BusinessOwnerResult {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  business: {
    id: string;
    name: string;
    slug: string;
    category: string | null;
    type: string;
  };
  accessToken: string;
  refreshToken: string;
}

export class BusinessOwnerFactory {
  private static generateSlug(name: string): string {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    const randomSuffix = crypto.randomBytes(4).toString('hex');
    return `${baseSlug}-${randomSuffix}`;
  }

  static async create(data: CreateBusinessOwnerData): Promise<BusinessOwnerResult> {
    const hashedPassword = await hashPassword(data.password);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const businessSlug = this.generateSlug(data.businessName);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        phone: data.phone,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: UserRole.BUSINESS_OWNER,
        emailVerificationToken,
        ownedBusiness: {
          create: {
            name: data.businessName,
            slug: businessSlug,
            category: data.businessCategory,
            type: data.businessType,
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        ownedBusiness: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            type: true,
          },
        },
      },
    });

    const { generateAccessToken, generateRefreshToken } = await import('../config/jwt');
    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id, user.email, user.role);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      business: user.ownedBusiness!,
      accessToken,
      refreshToken,
    };
  }
}