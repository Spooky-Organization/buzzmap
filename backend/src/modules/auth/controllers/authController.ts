import { type Request, type Response, type NextFunction } from 'express';
import type { Prisma } from '@prisma/client';
import { authService } from '../services/authService.js';
import {
  registerCustomerSchema,
  registerBusinessSchema,
  loginSchema,
  refreshTokenSchema,
} from '../validators/index.js';
import type { RegisterBusinessDTO } from '../models/index.js';

async function registerCustomer(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = registerCustomerSchema.parse(req.body);
    const result = await authService.register('customer', data);
    res.status(201).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

async function registerBusiness(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = registerBusinessSchema.parse(req.body);
    const data: RegisterBusinessDTO = {
      ...parsed,
      operatingHours: parsed.operatingHours as Prisma.InputJsonValue,
    };
    const result = await authService.register('business', data);
    res.status(201).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await authService.login(email, password);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

async function refresh(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    const result = await authService.refresh(refreshToken);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

export const authController = {
  registerCustomer,
  registerBusiness,
  login,
  refresh,
};
