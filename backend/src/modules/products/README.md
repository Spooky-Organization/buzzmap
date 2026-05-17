# Products Module

## Purpose

Owns business product listing and inventory operations. The module supports:

- product creation with multiple images
- owner-only updates and deletion
- owner-only stock and availability changes
- paginated business and category listing
- owner-specific "my products" listing

## Files

| File | Responsibility |
|---|---|
| `routes.ts` | Product routes, auth/role middleware, and image upload binding |
| `controllers/productController.ts` | Multipart coercion, validation, and standardized responses |
| `services/productService.ts` | Ownership checks, storage upload, signed image URLs, stock updates, and product queries |
| `models/index.ts` | Product DTOs and paginated result types |
| `validators/index.ts` | Create, update, stock, and pagination validation |

## Routes

Mounted under `/api/v1/products`.

| Method | Path | Description | Auth | Role |
|---|---|---|---|---|
| `POST` | `/` | Create a product with up to 10 `images[]` uploads | Yes | `BUSINESS_OWNER` |
| `PATCH` | `/:id` | Update a product | Yes | `BUSINESS_OWNER` |
| `DELETE` | `/:id` | Delete a product | Yes | `BUSINESS_OWNER` |
| `GET` | `/business` | Get the current business owner's products | Yes | `BUSINESS_OWNER` |
| `GET` | `/business/:businessId` | Get products for a business | Yes | Any |
| `GET` | `/category/:category` | Get available products by category | Yes | Any |
| `PATCH` | `/:id/stock` | Increment or decrement stock | Yes | `BUSINESS_OWNER` |
| `PATCH` | `/:id/availability` | Toggle availability | Yes | `BUSINESS_OWNER` |

## Validation Rules

| Field | Notes |
|---|---|
| `name` | `1-200` chars |
| `description` | `1-2000` chars |
| `price` | Positive number |
| `currency` | Optional 3-char code |
| `stock` | Integer `>= 0` |
| `category` | `1-100` chars |
| `quantity` | Integer, may be negative for stock decrements |

## Implementation Notes

- Create uses multipart form data and coerces `price` and `stock` from strings before validation.
- Product ownership is enforced in the service layer before any mutating operation.
- Product images are stored as storage object keys and resolved to signed URLs on read.
- Public business/category views filter to available products; owner-specific views can include unavailable items.
