import prisma from "../config/prisma";
import { User } from "@prisma/client";

interface CreateUserData {
  email: string;
  password: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string;
  phone?: string;
  emailVerificationToken?: string;
}

class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { phone } });
  }

  async create(data: CreateUserData): Promise<User> {
    return prisma.user.create({ data });
  }

  async updateRefreshToken(userId: string, token: string | null): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: token },
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async incrementFailedAttempts(userId: string): Promise<number> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { failedAttempts: { increment: 1 } },
    });
    return user.failedAttempts;
  }

  async resetFailedAttempts(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { failedAttempts: 0, lockedUntil: null },
    });
  }

  async lockAccount(userId: string, until: Date): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { lockedUntil: until },
    });
  }

  async banAccount(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { isBanned: true },
    });
  }

  async verifyEmail(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true, emailVerificationToken: null },
    });
  }
}

export const userRepository = new UserRepository();
export default userRepository;