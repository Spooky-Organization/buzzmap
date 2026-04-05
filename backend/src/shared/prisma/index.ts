import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from '../../config/index.js';

let prisma: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (!prisma) {
    throw new Error('Prisma client not initialized. Call initPrisma() first.');
  }
  return prisma;
}

export function initPrisma(): PrismaClient {
  if (prisma) return prisma;
  const adapter = new PrismaPg({ connectionString: config.databaseUrl });
  prisma = new PrismaClient({ adapter });
  return prisma;
}

export async function disconnectPrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}
