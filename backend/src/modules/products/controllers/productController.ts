import { type Request, type Response, type NextFunction } from 'express';
import { AppError } from '../../../shared/middleware/errorHandler.js';
import {
  createProductSchema,
  updateProductSchema,
  updateStockSchema,
  productQuerySchema,
} from '../validators/index.js';
import * as productService from '../services/productService.js';

// ─── Auth assertion helper ────────────────────────────────────────────────────

function assertAuthenticated(
  req: Request
): asserts req is Request & { user: { userId: string; role: string } } {
  if (!req.user || typeof (req.user as { userId?: unknown }).userId !== 'string') {
    throw new AppError(401, 'Authentication required');
  }
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);

    // Coerce numeric fields that arrive as strings from multipart/form-data
    const rawBody = {
      ...req.body,
      price: Number(req.body.price),
      stock: Number(req.body.stock),
    };

    const data = createProductSchema.parse(rawBody);
    const imageFiles = req.files as Express.Multer.File[] | undefined;

    const product = await productService.createProduct(
      req.user.userId,
      data,
      imageFiles
    );

    res.status(201).json({ status: 'success', data: product });
  } catch (err) {
    next(err);
  }
}

export async function update(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const { id } = req.params as { id: string };
    const data = updateProductSchema.parse(req.body);
    const product = await productService.updateProduct(id, req.user.userId, data);
    res.status(200).json({ status: 'success', data: product });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const { id } = req.params as { id: string };
    await productService.deleteProduct(id, req.user.userId);
    res.status(200).json({ status: 'success', message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getMyProducts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const { page, limit } = productQuerySchema.parse(req.query);
    const result = await productService.getProductsByOwner(req.user.userId, page, limit);
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
    const { page, limit } = productQuerySchema.parse(req.query);
    const result = await productService.getProductsByBusiness(
      businessId,
      page,
      limit,
      req.user.userId
    );
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

export async function getByCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const { category } = req.params as { category: string };
    const { page, limit } = productQuerySchema.parse(req.query);
    const result = await productService.getProductsByCategory(category, page, limit);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

export async function updateStock(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const { id } = req.params as { id: string };
    const { quantity } = updateStockSchema.parse(req.body);
    const product = await productService.updateStock(id, req.user.userId, quantity);
    res.status(200).json({ status: 'success', data: product });
  } catch (err) {
    next(err);
  }
}

export async function toggleAvailability(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const { id } = req.params as { id: string };
    const product = await productService.toggleAvailability(id, req.user.userId);
    res.status(200).json({ status: 'success', data: product });
  } catch (err) {
    next(err);
  }
}
