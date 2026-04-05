import { type Request, type Response, type NextFunction } from 'express';
import { AppError } from '../../../shared/middleware/errorHandler.js';
import { createPostSchema, postPaginationSchema } from '../validators/index.js';
import * as postService from '../services/postService.js';

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

    const data = createPostSchema.parse(req.body);
    const mediaFiles = req.files as Express.Multer.File[] | undefined;

    const post = await postService.createPost(req.user.userId, data, mediaFiles);

    res.status(201).json({ status: 'success', data: post });
  } catch (err) {
    next(err);
  }
}

export async function deleteOne(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);

    const { id } = req.params as { id: string };

    await postService.deletePost(id, req.user.userId);

    res.status(204).send();
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
    const { page, limit } = postPaginationSchema.parse(req.query);

    const result = await postService.getPostsByUser(userId, page, limit);

    res.status(200).json({ status: 'success', data: result });
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
    const { page, limit } = postPaginationSchema.parse(req.query);

    const result = await postService.getPostsByBusiness(businessId, page, limit);

    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}
