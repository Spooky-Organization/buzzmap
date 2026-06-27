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

/**
 * Parse the multipart `existingImages` field (JSON array of stored image
 * references the client wants to keep). Absent → undefined (images untouched).
 */
function parseExistingImages(raw: unknown): string[] | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw !== 'string') {
    throw new AppError(400, 'existingImages must be a JSON array string');
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new AppError(400, 'existingImages must be valid JSON');
  }
  if (!Array.isArray(parsed) || !parsed.every((v) => typeof v === 'string')) {
    throw new AppError(400, 'existingImages must be an array of strings');
  }
  return parsed as string[];
}

export async function update(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const { id } = req.params as { id: string };

    // Numeric fields arrive as strings over multipart/form-data; coerce only
    // when present so JSON-only updates (e.g. availability toggles) still parse.
    const rawBody = { ...req.body };
    if (rawBody.price !== undefined) rawBody.price = Number(rawBody.price);
    if (rawBody.stock !== undefined) rawBody.stock = Number(rawBody.stock);

    const data = updateProductSchema.parse(rawBody);
    const imageFiles = req.files as Express.Multer.File[] | undefined;
    const existingImages = parseExistingImages(req.body.existingImages);

    const product = await productService.updateProduct(
      id,
      req.user.userId,
      data,
      imageFiles,
      existingImages
    );
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
