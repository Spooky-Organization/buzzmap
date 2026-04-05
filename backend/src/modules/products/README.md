# Products Module

## Objective

The Products module enables business owners to manage their product catalog on BuzzMap. It provides full CRUD operations, stock management, availability toggling, image uploads to RustFS with signed URL retrieval, and category-based discovery. Visibility rules ensure that only available products are exposed to the public, while business owners retain full visibility over their own inventory.

## Architecture

This module follows the **MVCS (Model-Validator-Controller-Service)** pattern:

```
products/
├── routes.ts                       # Route definitions & middleware wiring
├── controllers/
│   └── productController.ts        # Request parsing, validation, response formatting
├── services/
│   └── productService.ts           # Business logic, ownership checks, storage I/O
├── models/
│   └── index.ts                    # TypeScript DTOs and response interfaces
├── validators/
│   └── index.ts                    # Zod schemas for input validation
└── README.md
```

**Data flow:** Route -> Middleware (auth, authorize, upload) -> Controller (validate) -> Service (business logic, Prisma, RustFS) -> Response

## Files & Responsibilities

| File | Layer | Responsibility |
|------|-------|----------------|
| `routes.ts` | Routing | Defines all product endpoints, applies `authenticate`, `authorize('BUSINESS_OWNER')`, and `upload.array('images', 10)` middleware as needed. |
| `controllers/productController.ts` | Controller | Parses and validates request input via Zod schemas, coerces multipart form-data types, delegates to the service layer, and returns standardized JSON responses. |
| `services/productService.ts` | Service | Core business logic: ownership verification, image upload to RustFS, signed URL generation, Prisma queries, stock arithmetic, availability toggling, and visibility filtering. |
| `models/index.ts` | Model (DTOs) | Defines `CreateProductDTO`, `UpdateProductDTO`, `ProductResponse`, and `PaginatedResult<T>` interfaces. |
| `validators/index.ts` | Validation | Zod schemas for `createProductSchema`, `updateProductSchema`, `updateStockSchema`, and `productQuerySchema` (pagination with defaults). |

## API Routes

All routes are prefixed by the parent router mount path (e.g., `/api/v1/products`).

| Method | Path | Description | Auth | Role |
|--------|------|-------------|------|------|
| `POST` | `/` | Create a new product with up to 10 image uploads | Yes | `BUSINESS_OWNER` |
| `PATCH` | `/:id` | Update product fields (name, description, price, stock, category, availability) | Yes | `BUSINESS_OWNER` |
| `DELETE` | `/:id` | Delete a product | Yes | `BUSINESS_OWNER` |
| `GET` | `/business/:businessId` | List products for a given business (paginated) | Yes | Any |
| `GET` | `/category/:category` | List available products by category (paginated) | Yes | Any |
| `PATCH` | `/:id/stock` | Increment or decrement product stock by a quantity | Yes | `BUSINESS_OWNER` |
| `PATCH` | `/:id/availability` | Toggle the `isAvailable` flag on a product | Yes | `BUSINESS_OWNER` |

## Key Logic

### CRUD Operations

- **Create:** Accepts multipart form-data. Numeric fields (`price`, `stock`) are coerced from strings before validation. The product is linked to the authenticated user's `BusinessProfile`.
- **Update:** Accepts a partial payload; the Zod schema enforces that at least one field must be provided. Only the product owner can update.
- **Delete:** Hard-deletes the product record after ownership verification.

### Ownership Enforcement

Every mutating operation (`update`, `delete`, `updateStock`, `toggleAvailability`) calls `getOwnedProduct()`, which:

1. Fetches the product by ID (404 if missing).
2. Resolves the requesting user's `BusinessProfile` (403 if none exists).
3. Confirms `product.businessId` matches the user's business (403 if mismatched).

### Stock Management

The `PATCH /:id/stock` endpoint accepts a `quantity` integer (positive or negative) and uses Prisma's `{ increment: quantity }` for atomic stock adjustments, avoiding race conditions from concurrent updates.

### Image Uploads to RustFS

- Images are handled via `upload.array('images', 10)` middleware (Multer).
- Each file is uploaded to RustFS under the `products/` prefix using `uploadToStorage()`.
- Raw object keys are stored in the database, not URLs.
- On read, `resolveImageUrls()` generates signed URLs via `getSignedUrl()` for each stored key, ensuring time-limited access.

### Category Filtering

`GET /category/:category` queries products matching the given category string. Only products with `isAvailable: true` are returned. Results are paginated and sorted by `createdAt` descending.

### Visibility Rules

- **Business owners viewing their own business:** See all products, including unavailable ones (`isAvailable: false`). The service detects ownership by comparing the requesting user's `BusinessProfile.id` against the target `businessId`.
- **All other users (public view):** Only see products where `isAvailable: true`.
- **Category queries:** Always filter to available products only, regardless of the requester.

### Pagination

All list endpoints support `page` (default `1`) and `limit` (default `20`, max `100`) query parameters. Responses include `total`, `page`, `limit`, and `totalPages` metadata.

### Validation Constraints

| Field | Rules |
|-------|-------|
| `name` | 1-200 characters |
| `description` | 1-2000 characters |
| `price` | Positive number |
| `currency` | Exactly 3 characters (optional, defaults to `KES`) |
| `stock` | Non-negative integer |
| `category` | 1-100 characters |
| `quantity` (stock update) | Any integer (positive to add, negative to subtract) |

## Dependencies

| Shared Module | Usage |
|---------------|-------|
| `shared/middleware/auth.ts` | `authenticate` middleware for JWT verification |
| `shared/middleware/authorize.ts` | `authorize('BUSINESS_OWNER')` role-based access control |
| `shared/middleware/errorHandler.ts` | `AppError` class for standardized error responses |
| `shared/storage/upload.ts` | `upload` (Multer instance), `uploadToStorage` (RustFS upload), `getSignedUrl` (signed URL generation) |
| `shared/prisma/index.ts` | `getPrisma()` for database client access |
| `shared/utils/logger.ts` | Structured logging via `logger` (Pino) |
| `zod` | Runtime input validation |
