import { type Request, type Response, type NextFunction } from 'express';
import { AppError } from '../../../shared/middleware/errorHandler.js';
import {
  addToCartSchema,
  updateCartQuantitySchema,
  updateOrderStatusSchema,
  orderPaginationSchema,
} from '../validators/index.js';
import * as orderService from '../services/orderService.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function assertAuthenticated(
  req: Request
): asserts req is Request & { user: { userId: string; role: string } } {
  if (!req.user || typeof (req.user as { userId?: unknown }).userId !== 'string') {
    throw new AppError(401, 'Authentication required.');
  }
}

// ─── Cart handlers ────────────────────────────────────────────────────────────

export async function addToCart(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);

    const { productId, quantity } = addToCartSchema.parse(req.body);
    const item = await orderService.addToCart(req.user.userId, productId, quantity);

    res.status(201).json({ status: 'success', data: item });
  } catch (err) {
    next(err);
  }
}

export async function getCart(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);

    const items = await orderService.getCart(req.user.userId);

    res.status(200).json({ status: 'success', data: items });
  } catch (err) {
    next(err);
  }
}

export async function updateCartQuantity(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);

    const { id } = req.params as { id: string };
    const { quantity } = updateCartQuantitySchema.parse(req.body);

    const item = await orderService.updateCartQuantity(
      req.user.userId,
      id,
      quantity
    );

    res.status(200).json({ status: 'success', data: item });
  } catch (err) {
    next(err);
  }
}

export async function removeFromCart(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);

    const { id } = req.params as { id: string };
    await orderService.removeFromCart(req.user.userId, id);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// ─── Order handlers ───────────────────────────────────────────────────────────

export async function createOrder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);

    const order = await orderService.createOrderFromCart(req.user.userId);

    res.status(201).json({ status: 'success', data: order });
  } catch (err) {
    next(err);
  }
}

export async function getMyOrders(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);

    const { page, limit } = orderPaginationSchema.parse(req.query);
    const result = await orderService.getCustomerOrders(
      req.user.userId,
      page,
      limit
    );

    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

export async function getBusinessOrders(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);

    const { page, limit } = orderPaginationSchema.parse(req.query);
    const result = await orderService.getBusinessOrders(
      req.user.userId,
      page,
      limit
    );

    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

export async function getOrder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);

    const { id } = req.params as { id: string };
    const order = await orderService.getOrder(id, req.user.userId, req.user.role);

    res.status(200).json({ status: 'success', data: order });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertAuthenticated(req);

    const { id } = req.params as { id: string };
    const { status } = updateOrderStatusSchema.parse(req.body);

    const order = await orderService.updateOrderStatus(
      id,
      req.user.userId,
      status
    );

    res.status(200).json({ status: 'success', data: order });
  } catch (err) {
    next(err);
  }
}
