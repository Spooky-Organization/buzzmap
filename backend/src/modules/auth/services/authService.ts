import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getPrisma } from '../../../shared/prisma/index.js';
import { AppError } from '../../../shared/middleware/errorHandler.js';
import { CustomerFactory } from '../../../shared/factories/CustomerFactory.js';
import { BusinessOwnerFactory } from '../../../shared/factories/BusinessOwnerFactory.js';
import { config } from '../../../config/index.js';
import type {
  RegisterCustomerDTO,
  RegisterBusinessDTO,
  AuthResponse,
} from '../models/index.js';

export interface JwtPayload {
  userId: string;
  role: string;
}

function generateTokens(userId: string, role: string): { accessToken: string; refreshToken: string } {
  const accessToken = jwt.sign(
    { userId, role } satisfies JwtPayload,
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiry as jwt.SignOptions['expiresIn'] }
  );

  const refreshToken = jwt.sign(
    { userId, role } satisfies JwtPayload,
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiry as jwt.SignOptions['expiresIn'] }
  );

  return { accessToken, refreshToken };
}

async function register(
  type: 'customer',
  data: RegisterCustomerDTO
): Promise<AuthResponse>;
async function register(
  type: 'business',
  data: RegisterBusinessDTO
): Promise<AuthResponse>;
async function register(
  type: 'customer' | 'business',
  data: RegisterCustomerDTO | RegisterBusinessDTO
): Promise<AuthResponse> {
  let user: { id: string; email: string; name: string; role: string };

  if (type === 'customer') {
    user = await CustomerFactory.create(data as RegisterCustomerDTO);
  } else {
    user = await BusinessOwnerFactory.create(data as RegisterBusinessDTO);
  }

  const { accessToken, refreshToken } = generateTokens(user.id, user.role);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
}

async function login(email: string, password: string): Promise<AuthResponse> {
  const prisma = getPrisma();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError(401, 'Invalid email or password.');
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new AppError(401, 'Invalid email or password.');
  }

  const { accessToken, refreshToken } = generateTokens(user.id, user.role);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
}

async function refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  const payload = verifyRefreshToken(refreshToken);
  return generateTokens(payload.userId, payload.role);
}

function verifyAccessToken(token: string): JwtPayload {
  try {
    const payload = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
    return payload;
  } catch {
    throw new AppError(401, 'Invalid or expired access token.');
  }
}

function verifyRefreshToken(token: string): JwtPayload {
  try {
    const payload = jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
    return payload;
  } catch {
    throw new AppError(401, 'Invalid or expired refresh token.');
  }
}

export const authService = {
  register,
  login,
  refresh,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
};
