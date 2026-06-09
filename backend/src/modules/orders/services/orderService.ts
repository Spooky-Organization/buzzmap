import { getPrisma } from '../../../shared/prisma/index.js';
import { AppError } from '../../../shared/middleware/errorHandler.js';
import { notificationService } from '../../notifications/services/notificationService.js';
import { NotificationType } from '../../notifications/models/index.js';
import type {
  CartItemResponse,
  OrderResponse,
  PaginatedOrdersResult,
} from '../models/index.js';

// ─── Selects ──────────────────────────────────────────────────────────────────

const cartItemSelect = {
  id: true,
  quantity: true,
  product: {
    select: {
      id: true,
      name: true,
      price: true,
      currency: true,
      images: true,
      businessId: true,
      business: {
        select: {
          businessName: true,
        },
      },
    },
  },
} as const;

const orderItemSelect = {
  id: true,
  quantity: true,
  price: true,
  product: {
    select: {
      id: true,
      name: true,
      price: true,
      businessId: true,
      business: {
        select: {
          businessName: true,
        },
      },
    },
  },
} as const;

const orderSelect = {
  id: true,
  customerId: true,
  customer: {
    select: {
      name: true,
    },
  },
  status: true,
  totalAmount: true,
  createdAt: true,
  items: { select: orderItemSelect },
} as const;

function mapCartItem(item: {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    currency: string;
    images: string[];
    businessId: string;
    business: {
      businessName: string;
    };
  };
}): CartItemResponse {
  return {
    id: item.id,
    quantity: item.quantity,
    product: {
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      currency: item.product.currency,
      images: item.product.images,
      businessId: item.product.businessId,
      businessName: item.product.business.businessName,
    },
  };
}

function mapOrderItem(item: {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    businessId: string;
    business: {
      businessName: string;
    };
  };
}): OrderResponse['items'][number] {
  return {
    id: item.id,
    productId: item.product.id,
    productName: item.product.name,
    businessId: item.product.businessId,
    businessName: item.product.business.businessName,
    quantity: item.quantity,
    price: item.price,
  };
}

function mapCustomerOrder(order: {
  id: string;
  customerId: string;
  customer: { name: string };
  status: OrderResponse['status'];
  totalAmount: number;
  createdAt: Date;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      businessId: string;
      business: {
        businessName: string;
      };
    };
  }>;
}): OrderResponse {
  const items = order.items.map(mapOrderItem);
  const businessNames = Array.from(new Set(items.map((item) => item.businessName)));

  return {
    id: order.id,
    customerId: order.customerId,
    customerName: order.customer.name,
    status: order.status,
    totalAmount: order.totalAmount,
    businessName: businessNames.join(', '),
    items,
    createdAt: order.createdAt,
  };
}

function mapBusinessOrder(
  order: {
    id: string;
    customerId: string;
    customer: { name: string };
    status: OrderResponse['status'];
    totalAmount: number;
    createdAt: Date;
    items: Array<{
      id: string;
      quantity: number;
      price: number;
      product: {
        id: string;
        name: string;
        businessId: string;
        business: {
          businessName: string;
        };
      };
    }>;
  },
  businessId: string
): OrderResponse {
  const items = order.items
    .filter((item) => item.product.businessId === businessId)
    .map(mapOrderItem);

  const businessNames = Array.from(new Set(items.map((item) => item.businessName)));
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    id: order.id,
    customerId: order.customerId,
    customerName: order.customer.name,
    status: order.status,
    totalAmount,
    businessName: businessNames.join(', '),
    items,
    createdAt: order.createdAt,
  };
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

/**
 * Add a product to the user's cart.
 * If the item already exists the quantity is incremented.
 * Validates product existence, availability, and stock.
 */
export async function addToCart(
  userId: string,
  productId: string,
  quantity: number
): Promise<CartItemResponse> {
  const prisma = getPrisma();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, isAvailable: true, stock: true },
  });

  if (!product) {
    throw new AppError(404, 'Product not found.');
  }

  if (!product.isAvailable) {
    throw new AppError(400, 'Product is not available.');
  }

  // Check whether the item already sits in the cart
  const existing = await prisma.cartItem.findFirst({
    where: { userId, productId },
    select: { id: true, quantity: true },
  });

  const newQuantity = existing ? existing.quantity + quantity : quantity;

  if (newQuantity > product.stock) {
    throw new AppError(
      400,
      `Insufficient stock. Only ${product.stock} unit(s) available.`
    );
  }

  let cartItem;

  if (existing) {
    cartItem = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQuantity },
      select: cartItemSelect,
    });
  } else {
    cartItem = await prisma.cartItem.create({
      data: { userId, productId, quantity },
      select: cartItemSelect,
    });
  }

  return mapCartItem(cartItem);
}

/**
 * Remove a cart item.  Only the owner may remove their own items.
 */
export async function removeFromCart(
  userId: string,
  cartItemId: string
): Promise<void> {
  const prisma = getPrisma();

  const item = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    select: { userId: true },
  });

  if (!item) {
    throw new AppError(404, 'Cart item not found.');
  }

  if (item.userId !== userId) {
    throw new AppError(403, 'You are not authorised to remove this cart item.');
  }

  await prisma.cartItem.delete({ where: { id: cartItemId } });
}

/**
 * Return all cart items for the user with full product details.
 */
export async function getCart(userId: string): Promise<CartItemResponse[]> {
  const prisma = getPrisma();

  const items = await prisma.cartItem.findMany({
    where: { userId },
    select: cartItemSelect,
  });

  return items.map(mapCartItem);
}

/**
 * Update the quantity of a cart item.  Validates stock before saving.
 */
export async function updateCartQuantity(
  userId: string,
  cartItemId: string,
  quantity: number
): Promise<CartItemResponse> {
  const prisma = getPrisma();

  const item = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    select: { userId: true, product: { select: { stock: true, isAvailable: true } } },
  });

  if (!item) {
    throw new AppError(404, 'Cart item not found.');
  }

  if (item.userId !== userId) {
    throw new AppError(403, 'You are not authorised to update this cart item.');
  }

  if (!item.product.isAvailable) {
    throw new AppError(400, 'Product is no longer available.');
  }

  if (quantity > item.product.stock) {
    throw new AppError(
      400,
      `Insufficient stock. Only ${item.product.stock} unit(s) available.`
    );
  }

  const updated = await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
    select: cartItemSelect,
  });

  return mapCartItem(updated);
}

// ─── Orders ───────────────────────────────────────────────────────────────────

/**
 * Atomically create an order from the user's current cart:
 *  1. Load cart items with current product prices.
 *  2. Validate availability and stock for every item.
 *  3. Inside a Prisma transaction:
 *     a. Create the Order record.
 *     b. Create an OrderItem for each cart item (snapshotting price).
 *     c. Decrement product stock.
 *     d. Delete all cart items for the user.
 */
export async function createOrderFromCart(
  userId: string
): Promise<OrderResponse> {
  const prisma = getPrisma();

  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    select: {
      id: true,
      quantity: true,
      product: {
        select: {
          id: true,
          price: true,
          stock: true,
          isAvailable: true,
          name: true,
          businessId: true,
          business: {
            select: {
              userId: true,
              businessName: true,
            },
          },
        },
      },
    },
  });

  if (cartItems.length === 0) {
    throw new AppError(400, 'Your cart is empty.');
  }

  // Pre-flight validation outside the transaction for clear error messages
  for (const item of cartItems) {
    if (!item.product.isAvailable) {
      throw new AppError(
        400,
        `Product "${item.product.name}" is no longer available.`
      );
    }
    if (item.quantity > item.product.stock) {
      throw new AppError(
        400,
        `Insufficient stock for "${item.product.name}". Only ${item.product.stock} unit(s) available.`
      );
    }
  }

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        customerId: userId,
        totalAmount,
        items: {
          create: cartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      select: orderSelect,
    });

    // Decrement stock for each product
    await Promise.all(
      cartItems.map((item) =>
        tx.product.update({
          where: { id: item.product.id },
          data: { stock: { decrement: item.quantity } },
        })
      )
    );

    // Clear the cart
    await tx.cartItem.deleteMany({ where: { userId } });

    return createdOrder;
  });

  const businessNotifications = new Map<
    string,
    { businessName: string; subtotal: number; itemCount: number }
  >();

  for (const item of cartItems) {
    const existing = businessNotifications.get(item.product.business.userId);
    const lineTotal = item.product.price * item.quantity;
    if (existing) {
      existing.subtotal += lineTotal;
      existing.itemCount += item.quantity;
      continue;
    }

    businessNotifications.set(item.product.business.userId, {
      businessName: item.product.business.businessName,
      subtotal: lineTotal,
      itemCount: item.quantity,
    });
  }

  await Promise.all(
    Array.from(businessNotifications.entries()).map(([userId, summary]) =>
      notificationService.createNotification(
        userId,
        NotificationType.ORDER_UPDATE,
        'New order received',
        `${summary.itemCount} item(s) were ordered from ${summary.businessName}.`,
        {
          orderId: order.id,
          status: order.status,
          subtotal: summary.subtotal,
          businessName: summary.businessName,
          notificationTarget: 'business-orders',
        }
      )
    )
  );

  return mapCustomerOrder(order);
}

/**
 * Paginated order history for a customer.
 */
export async function getCustomerOrders(
  userId: string,
  page: number,
  limit: number
): Promise<PaginatedOrdersResult> {
  const prisma = getPrisma();
  const skip = (page - 1) * limit;

  const [total, orders] = await Promise.all([
    prisma.order.count({ where: { customerId: userId } }),
    prisma.order.findMany({
      where: { customerId: userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: orderSelect,
    }),
  ]);

  return {
    data: orders.map(mapCustomerOrder),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Paginated orders that contain products belonging to the business owner.
 */
export async function getBusinessOrders(
  userId: string,
  page: number,
  limit: number
): Promise<PaginatedOrdersResult> {
  const prisma = getPrisma();
  const skip = (page - 1) * limit;

  // Resolve the business profile for this owner
  const business = await prisma.businessProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!business) {
    throw new AppError(404, 'Business profile not found.');
  }

  const where = {
    items: {
      some: {
        product: { businessId: business.id },
      },
    },
  };

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: orderSelect,
    }),
  ]);

  return {
    data: orders.map((order) => mapBusinessOrder(order, business.id)),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Update the status of an order.
 * Only the business owner whose products are in the order may update status.
 */
export async function updateOrderStatus(
  orderId: string,
  userId: string,
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
): Promise<OrderResponse> {
  const prisma = getPrisma();

  const business = await prisma.businessProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!business) {
    throw new AppError(404, 'Business profile not found.');
  }

  // Verify this order contains at least one product from this business
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      items: {
        select: {
          product: { select: { businessId: true } },
        },
      },
    },
  });

  if (!order) {
    throw new AppError(404, 'Order not found.');
  }

  const ownsProduct = order.items.some(
    (item) => item.product.businessId === business.id
  );

  if (!ownsProduct) {
    throw new AppError(
      403,
      'You are not authorised to update the status of this order.'
    );
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    select: orderSelect,
  });

  const refreshed = await prisma.order.findUnique({
    where: { id: updated.id },
    select: orderSelect,
  });

  if (!refreshed) {
    throw new AppError(404, 'Order not found after update.');
  }

  const notificationOrder = mapBusinessOrder(refreshed, business.id);

  await notificationService.createNotification(
    refreshed.customerId,
    NotificationType.ORDER_UPDATE,
    'Order status updated',
    `Your order${notificationOrder.businessName ? ` from ${notificationOrder.businessName}` : ''} is now ${status}.`,
    {
      orderId: refreshed.id,
      status,
      businessName: notificationOrder.businessName,
      notificationTarget: 'customer-orders',
    }
  );

  return notificationOrder;
}

/**
 * Get a single order by ID.
 * Accessible by the customer who placed it or a business owner whose products
 * are in the order.
 */
export async function getOrder(
  orderId: string,
  userId: string,
  role: string
): Promise<OrderResponse> {
  const prisma = getPrisma();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      ...orderSelect,
      items: {
        select: {
          ...orderItemSelect,
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              businessId: true,
              business: {
                select: {
                  businessName: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new AppError(404, 'Order not found.');
  }

  // Customer: must own the order
  if (role === 'CUSTOMER') {
    if (order.customerId !== userId) {
      throw new AppError(403, 'You are not authorised to view this order.');
    }
    return mapCustomerOrder(order);
  }

  // Business owner: must have at least one product in the order
  const business = await prisma.businessProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!business) {
    throw new AppError(403, 'You are not authorised to view this order.');
  }

  const ownsProduct = order.items.some(
    (item) => item.product.businessId === business.id
  );

  if (!ownsProduct) {
    throw new AppError(403, 'You are not authorised to view this order.');
  }

  return mapBusinessOrder(order, business.id);
}
