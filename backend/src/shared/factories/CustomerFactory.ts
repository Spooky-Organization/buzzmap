import { getPrisma } from '../prisma/index.js';
import bcrypt from 'bcrypt';
import { config } from '../../config/index.js';

interface CreateCustomerInput {
  email: string;
  phone?: string;
  password: string;
  name: string;
  interests?: string[];
  location?: string;
}

export class CustomerFactory {
  static async create(input: CreateCustomerInput) {
    const prisma = getPrisma();
    const hashedPassword = await bcrypt.hash(input.password, config.bcryptSaltRounds);

    return prisma.user.create({
      data: {
        email: input.email,
        phone: input.phone,
        password: hashedPassword,
        name: input.name,
        role: 'CUSTOMER',
        interests: input.interests ?? [],
        location: input.location,
      },
    });
  }
}
