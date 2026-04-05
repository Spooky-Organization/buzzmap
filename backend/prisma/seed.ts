import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL']! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = 'testadmin@gmail.com';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log(`Admin user already exists (${existing.id}), skipping seed.`);
    return;
  }

  const hashedPassword = await bcrypt.hash('Test@Admin1', 12);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: 'Test Admin',
      password: hashedPassword,
      role: 'ADMIN',
      interests: [],
    },
  });

  console.log(`Admin user seeded successfully (${admin.id})`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
