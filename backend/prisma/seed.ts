import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const TEST_USERS = [
  { email: 'admin@dashlabs.dev', firstName: 'Admin', lastName: 'User', role: UserRole.ADMIN },
  { email: 'user@dashlabs.dev', firstName: 'John', lastName: 'Doe', role: UserRole.USER },
  { email: 'accountant@dashlabs.dev', firstName: 'Jane', lastName: 'Smith', role: UserRole.ACCOUNTANT },
];

const TEST_PASSWORD = 'Password123!';

async function main() {
  console.log('🌱 Starting database seed...\n');

  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 12);

  for (const userData of TEST_USERS) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      console.log(`⏭️  User already exists: ${userData.email} (${userData.role})`);
    } else {
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          isEmailVerified: true,
        },
      });
      console.log(`✅ Created user: ${user.email} (${user.role})`);
    }
  }

  console.log('\n🎉 Database seeding completed successfully!\n');
  console.log('===========================================');
  console.log('Test Credentials:');
  console.log('===========================================');
  for (const user of TEST_USERS) {
    console.log(`Email:    ${user.email}`);
    console.log(`Password: ${TEST_PASSWORD}`);
    console.log(`Role:     ${user.role}`);
    console.log('---------------------------------------------');
  }
  console.log('===========================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
