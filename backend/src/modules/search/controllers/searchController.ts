import { type Request, type Response, type NextFunction } from 'express';
import { AppError } from '../../../shared/middleware/errorHandler.js';
import {
  searchAllSchema,
  searchBusinessesSchema,
  searchProductsSchema,
  searchUsersSchema,
} from '../validators/index.js';
import * as searchService from '../services/searchService.js';

function assertAuthenticated(
  req: Request
): asserts req is Request & { user: { userId: string; role: string } } {
  if (!req.user || typeof (req.user as { userId?: unknown }).userId !== 'string') {
    throw new AppError(401, 'Authentication required');
  }
}

export async function searchAll(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const { q: keyword, category, location } = searchAllSchema.parse(req.query);

    const [businesses, products, users] = await Promise.all([
      searchService.searchBusinesses(keyword, category, location, 1, 10),
      searchService.searchProducts(keyword, category, undefined, undefined, 1, 10),
      searchService.searchUsers(keyword, 1, 10),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        businesses: businesses.data,
        products: products.data,
        users: users.data,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function searchBusinesses(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const { keyword, category, location, page, limit } =
      searchBusinessesSchema.parse(req.query);
    const result = await searchService.searchBusinesses(
      keyword,
      category,
      location,
      page,
      limit
    );
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

export async function searchProducts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const { keyword, category, minPrice, maxPrice, page, limit } =
      searchProductsSchema.parse(req.query);
    const result = await searchService.searchProducts(
      keyword,
      category,
      minPrice,
      maxPrice,
      page,
      limit
    );
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

export async function getCategories(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const categories = await searchService.getCategories();
    res.status(200).json({ status: 'success', data: { categories } });
  } catch (err) {
    next(err);
  }
}

export async function searchUsers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);
    const { keyword, page, limit } = searchUsersSchema.parse(req.query);
    const result = await searchService.searchUsers(keyword, page, limit);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}
