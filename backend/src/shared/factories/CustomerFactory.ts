import { getPrisma } from '../prisma/index.js';
import bcrypt from 'bcrypt';
import { config } from '../../config/index.js';
import { sanitizePlainText, sanitizeOptionalText, sanitizeStringArray } from '../utils/sanitize.js';

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
        phone: sanitizeOptionalText(input.phone),
        password: hashedPassword,
        name: sanitizePlainText(input.name),
        role: 'CUSTOMER',
        interests: sanitizeStringArray(input.interests) ?? [],
        location: sanitizeOptionalText(input.location),
      },
    });
  }
}
