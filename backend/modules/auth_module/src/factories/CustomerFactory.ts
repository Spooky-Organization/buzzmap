import crypto from 'crypto';
import { prisma } from '../config/prisma';
import { hashPassword } from '../utils/passwordUtils';
import { UserRole } from '../../../shared/types';

export interface CreateCustomerData {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  interests: string[];
}

export interface CustomerResult {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  interests: string[];
  accessToken: string;
  refreshToken: string;
}

export class CustomerFactory {
  static async create(data: CreateCustomerData): Promise<CustomerResult> {
    const hashedPassword = await hashPassword(data.password);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        phone: data.phone,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: UserRole.CUSTOMER,
        interests: data.interests,
        emailVerificationToken,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        interests: true,
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
      interests: user.interests,
      accessToken,
      refreshToken,
    };
  }
}