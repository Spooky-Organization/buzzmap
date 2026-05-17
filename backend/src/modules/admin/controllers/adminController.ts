import { type NextFunction, type Request, type Response } from 'express';
import type { Role } from '@prisma/client';
import { AppError } from '../../../shared/middleware/errorHandler.js';
import * as adminService from '../services/adminService.js';
import {
  adminListBusinessesQuerySchema,
  adminListCatalogQuerySchema,
  adminListOrdersQuerySchema,
  adminListUsersQuerySchema,
} from '../validators/index.js';

function assertAuthenticated(
  req: Request
): asserts req is Request & { user: { userId: string; role: string } } {
  if (!req.user || typeof (req.user as { userId?: unknown }).userId !== 'string') {
    throw new AppError(401, 'Authentication required.');
  }
}

export async function getOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    assertAuthenticated(req);
    const result = await adminService.getOverview(req.user.userId);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = adminListUsersQuerySchema.parse(req.query);
    const result = await adminService.getUsers({
      ...query,
      role: query.role as Role | undefined,
    });
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

export async function getBusinesses(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = adminListBusinessesQuerySchema.parse(req.query);
    const result = await adminService.getBusinesses(query);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

export async function getCatalog(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = adminListCatalogQuerySchema.parse(req.query);
    const result = await adminService.getCatalog(query);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

export async function getOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = adminListOrdersQuerySchema.parse(req.query);
    const result = await adminService.getOrders(query);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

export async function getModeration(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await adminService.getModeration();
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

export async function getMessages(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await adminService.getMessages();
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

export async function getSecurity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    assertAuthenticated(req);
    const result = await adminService.getSecurity(req.user.userId);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

export async function getSystem(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await adminService.getSystem();
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

export async function getSettings(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await adminService.getSettings();
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

export async function getAnnouncements(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = adminService.getAnnouncementsCapability();
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

export async function getAuditLog(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = adminService.getAuditLogCapability();
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}
