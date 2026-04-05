# Orders Module

## Objective

The orders module manages the full customer purchase lifecycle: shopping cart management and order placement. It provides cart CRUD operations with real-time stock validation, atomic order creation from the cart contents, paginated order history for both customers and business owners, and business-owner-scoped status management.

## Architecture

This module follows the **MVCS (Model-View-Controller-Service)** pattern:

```
orders/
├── models/index.ts           # TypeScript interfaces (DTOs & response types)
├── validators/index.ts       # Zod schemas for request validation
├── controllers/orderController.ts  # HTTP layer (parse, delegate, respond)
├── services/orderService.ts  # Business logic & Prisma queries
└── routes.ts                 # Express route definitions
```

- **Models** define the shape of data flowing through the module (DTOs in, response types out).
- **Validators** enforce request contracts at the controller boundary using Zod.
- **Controllers** handle HTTP concerns only: authenticate, validate, call the service, and return a response.
- **Services** contain all business logic, database access, and transactional operations.
- **Routes** wire endpoints to controllers and apply shared middleware (authentication, authorization).

## Files & Responsibilities

| File | Responsibility |
|------|---------------|
| `routes.ts` | Registers all cart and order endpoints; applies `authenticate` and `authorize` middleware. |
| `controllers/orderController.ts` | Parses and validates incoming requests, delegates to the service layer, and formats HTTP responses. Includes an `assertAuthenticated` helper for type-safe user access. |
| `services/orderService.ts` | Core business logic: cart upsert with stock checks, atomic order creation inside a Prisma transaction, paginated queries, role-based order access, and status updates with ownership verification. |
| `models/index.ts` | TypeScript interfaces for `CartItemResponse`, `OrderItemResponse`, `OrderResponse`, `PaginatedOrdersResult`, and the `AddToCartDTO`. |
| `validators/index.ts` | Zod schemas: `addToCartSchema`, `updateCartQuantitySchema`, `updateOrderStatusSchema`, `orderPaginationSchema`. Also exports inferred types for each schema. |

## API Routes

All routes are prefixed by wherever this router is mounted (e.g. `/api/v1/orders`).

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| `POST` | `/cart` | Add a product to the cart (creates or increments quantity) | Authenticated user |
| `GET` | `/cart` | Retrieve all items in the current user's cart | Authenticated user |
| `PATCH` | `/cart/:id` | Update the quantity of a specific cart item | Authenticated user |
| `DELETE` | `/cart/:id` | Remove an item from the cart | Authenticated user |
| `POST` | `/` | Create an order from the current cart contents | Authenticated user |
| `GET` | `/` | List the authenticated customer's orders (paginated) | Authenticated user |
| `GET` | `/business` | List orders containing the business owner's products (paginated) | Authenticated `BUSINESS_OWNER` |
| `GET` | `/:id` | Get a single order by ID | Authenticated user (ownership verified) |
| `PATCH` | `/:id/status` | Update order status | Authenticated `BUSINESS_OWNER` (ownership verified) |

## Key Logic

### Cart Management with Upsert

When adding a product to the cart, the service checks whether a `CartItem` for that user and product already exists. If it does, the quantity is incremented rather than creating a duplicate entry. Stock and availability are validated before any write.

### Order Creation from Cart (Single Transaction)

`createOrderFromCart` converts the entire cart into an order atomically using `prisma.$transaction`. Within the transaction:

1. An `Order` record is created with the calculated total.
2. An `OrderItem` is created for each cart item, snapshotting the product price at the time of purchase.
3. Product stock is decremented for every item via `stock: { decrement: quantity }`.
4. All `CartItem` records for the user are deleted.

If any step fails, the entire transaction rolls back.

### Stock Validation & Decrement

Stock is checked at multiple points:
- **Adding to cart** -- verifies requested quantity (cumulative if item exists) does not exceed `product.stock`.
- **Updating cart quantity** -- re-validates against current stock.
- **Pre-flight before order creation** -- validates every cart item against live stock and availability before entering the transaction.
- **Inside the transaction** -- stock is decremented atomically.

### Total Calculation from Live Prices

The order total is computed at order-creation time by summing `product.price * quantity` across all cart items. Each `OrderItem` stores the price at the moment of purchase, preserving a historical record even if the product price changes later.

### Business Order Filtering

Business owners see only orders that contain at least one product belonging to their business. The service resolves the owner's `BusinessProfile`, then queries orders where `items.some.product.businessId` matches.

### Status Management

Order status transitions (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`) are restricted to business owners who have at least one product in the order. Ownership is verified by checking the order's items against the business profile before allowing the update.

### Single Order Access Control

`getOrder` uses role-based logic:
- **Customers** may only view orders where `customerId` matches their user ID.
- **Business owners** may view any order that contains at least one of their products.

## Dependencies

| Dependency | Source | Usage |
|------------|--------|-------|
| `authenticate` | `shared/middleware/auth.js` | JWT-based authentication middleware applied to all routes. |
| `authorize` | `shared/middleware/authorize.js` | Role-based authorization middleware (used for `BUSINESS_OWNER`-only routes). |
| `AppError` | `shared/middleware/errorHandler.js` | Standardized error class for consistent HTTP error responses. |
| `getPrisma` | `shared/prisma/index.js` | Provides the Prisma client instance for all database operations. |
| `zod` | `zod` (npm) | Runtime request validation and type inference. |
| `@prisma/client` | `@prisma/client` (npm) | Provides the `OrderStatus` enum used in model types. |
