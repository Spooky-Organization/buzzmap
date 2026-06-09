import { type Request, type Response, type NextFunction } from 'express';
import { AppError } from '../../../shared/middleware/errorHandler.js';
import { createPOVSchema, createCommentSchema, paginationSchema } from '../validators/index.js';
import * as povService from '../services/povService.js';

function assertAuthenticated(
  req: Request
): asserts req is Request & { user: { userId: string; role: string } } {
  if (!req.user || typeof (req.user as { userId?: unknown }).userId !== 'string') {
    throw new AppError(401, 'Authentication required');
  }
}

export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);

    const files = (req.files as Express.Multer.File[] | undefined) ?? [];

    // Body fields come as strings from multipart/form-data — coerce them
    const rawBody = {
      ...req.body,
      starRating: Number(req.body.starRating),
      recommends:
        req.body.recommends === 'true' || req.body.recommends === true,
    };

    const data = createPOVSchema.parse(rawBody);
    if (files.length === 0 && !data.caption?.trim()) {
      throw new AppError(400, 'A text-only POV requires a caption.');
    }
    const pov = await povService.createPOV(req.user.userId, data, files);

    res.status(201).json({ status: 'success', data: pov });
  } catch (err) {
    next(err);
  }
}

export async function deletePOV(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const { id } = req.params as { id: string };
    await povService.deletePOV(id, req.user.userId);
    res.status(200).json({ status: 'success', message: 'POV deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getOne(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const { id } = req.params as { id: string };
    const pov = await povService.getPOV(id, req.user.userId);
    res.status(200).json({ status: 'success', data: pov });
  } catch (err) {
    next(err);
  }
}

export async function getByBusiness(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const { businessId } = req.params as { businessId: string };
    const { page, limit } = paginationSchema.parse(req.query);
    const result = await povService.getPOVsByBusiness(businessId, page, limit, req.user.userId);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

export async function getMyPOVs(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const { page, limit } = paginationSchema.parse(req.query);
    const result = await povService.getPOVsByUser(req.user.userId, page, limit);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

export async function getByUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const { userId } = req.params as { userId: string };
    const { page, limit } = paginationSchema.parse(req.query);
    const result = await povService.getPOVsByUser(userId, page, limit);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

export async function like(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const { id } = req.params as { id: string };
    await povService.likePOV(req.user.userId, id);
    res.status(201).json({ status: 'success', message: 'POV liked' });
  } catch (err) {
    next(err);
  }
}

export async function unlike(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const { id } = req.params as { id: string };
    await povService.unlikePOV(req.user.userId, id);
    res.status(200).json({ status: 'success', message: 'POV unliked' });
  } catch (err) {
    next(err);
  }
}

export async function addComment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const { id } = req.params as { id: string };
    const { content } = createCommentSchema.parse(req.body);
    const comment = await povService.addComment(req.user.userId, id, content);
    res.status(201).json({ status: 'success', data: comment });
  } catch (err) {
    next(err);
  }
}

export async function getComments(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const { id } = req.params as { id: string };
    const { page, limit } = paginationSchema.parse(req.query);
    const result = await povService.getComments(id, page, limit);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}
