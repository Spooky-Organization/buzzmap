# Orders Module

## Purpose

Owns the shopping cart and order lifecycle for BuzzMap. It exposes:

- cart item creation, retrieval, update, and removal
- order creation from the current cart
- customer order history
- business-owner order views
- business-owner order status updates

## Files

| File | Responsibility |
|---|---|
| `routes.ts` | Main cart and order routes under the orders module |
| `cartRoutes.ts` | Alternate cart-only router using `/items/:id` for item mutation paths |
| `controllers/orderController.ts` | Request parsing, auth assertion, and standardized responses |
| `services/orderService.ts` | Cart persistence, order creation, order queries, and status transitions |
| `models/index.ts` | Cart, order, item, and pagination types |
| `validators/index.ts` | Cart payload, order status, and pagination validation |

## Routes

Mounted under `/api/v1/orders`.

### Cart

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/cart` | Add an item to the cart | Yes |
| `GET` | `/cart` | Get the current user's cart | Yes |
| `PATCH` | `/cart/:id` | Update cart item quantity | Yes |
| `DELETE` | `/cart/:id` | Remove a cart item | Yes |

### Orders

| Method | Path | Description | Auth | Role |
|---|---|---|---|---|
| `POST` | `/` | Create an order from the current cart | Yes | Any |
| `POST` | `/checkout` | Alias for order creation from the current cart | Yes | Any |
| `GET` | `/` | Get the current user's orders | Yes | Any |
| `GET` | `/my` | Alias for the current user's orders | Yes | Any |
| `GET` | `/business` | Get orders for the current business owner | Yes | `BUSINESS_OWNER` |
| `GET` | `/:id` | Get a single order visible to the current actor | Yes | Any |
| `PATCH` | `/:id/status` | Update order status | Yes | `BUSINESS_OWNER` |

## Validation Rules

- `addToCart` requires a valid product UUID and quantity `>= 1`
- cart quantity updates require quantity `>= 1`
- order status is limited to `PENDING`, `CONFIRMED`, `COMPLETED`, or `CANCELLED`
- order list endpoints support `page` and `limit`

## Implementation Notes

- `DELETE /cart/:id` returns `204 No Content`.
- Customer and business order listings are distinct service paths.
- `cartRoutes.ts` exists as a secondary cart router and uses `/items/:id` for mutation paths; the main mounted order router still uses `/cart/:id`.
