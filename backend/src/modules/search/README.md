# Search Module

## Module Objective

Provides full-text search capabilities across the BuzzMap platform, enabling authenticated users to discover businesses, products, and other users through keyword-based queries with filtering and pagination support.

## Architecture

This module follows the **MVCS (Model-View-Controller-Service)** pattern:

```
routes.ts --> controllers/ --> services/ --> Prisma ORM
                  |                              |
            validators/                     models/
```

- **Routes** define HTTP endpoints and apply authentication middleware.
- **Controllers** handle request parsing, input validation (via Zod schemas), and response formatting.
- **Services** contain the core search logic, constructing Prisma queries and shaping results.
- **Models** define TypeScript interfaces for search result types and pagination.
- **Validators** define Zod schemas for query parameter validation and type coercion.

## Files & Responsibilities

| File | Responsibility |
|------|---------------|
| `routes.ts` | Registers `GET` endpoints under the search prefix and applies the `authenticate` middleware |
| `controllers/searchController.ts` | Validates incoming query parameters using Zod schemas, delegates to the service layer, and returns standardized JSON responses |
| `services/searchService.ts` | Builds Prisma `where` clauses from filter parameters, executes paginated queries, and computes derived fields (e.g., `avgRating`) |
| `models/index.ts` | Exports `BusinessSearchResult`, `ProductSearchResult`, `UserSearchResult`, and `PaginatedResult<T>` interfaces |
| `validators/index.ts` | Exports Zod schemas (`searchBusinessesSchema`, `searchProductsSchema`, `searchUsersSchema`) with shared pagination fields, string-to-number coercion, and input constraints |

## API Routes

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| `GET` | `/businesses` | Search business profiles by keyword, category, and/or location | Yes |
| `GET` | `/products` | Search products by keyword, category, and/or price range | Yes |
| `GET` | `/users` | Search users by name keyword | Yes |

All endpoints return a standardized response:

```json
{
  "status": "success",
  "data": {
    "data": [],
    "total": 0,
    "page": 1,
    "limit": 20,
    "totalPages": 0
  }
}
```

### Query Parameters

**Business Search:** `keyword`, `category`, `location`, `page` (default: 1), `limit` (default: 20, max: 100)

**Product Search:** `keyword`, `category`, `minPrice`, `maxPrice`, `page` (default: 1), `limit` (default: 20, max: 100)

**User Search:** `keyword`, `page` (default: 1), `limit` (default: 20, max: 100)

## Key Logic

### Case-Insensitive Search

All text-based filters use Prisma's `{ contains: value, mode: 'insensitive' }` to perform case-insensitive partial matching. This applies to business name, description, category, location, product name, product description, and user name fields.

### Business Search with Computed Fields

Business search results include two computed fields that are not stored in the database:

- **`avgRating`** -- Calculated on the fly from associated `Pov` records (`starRating`). Rounded to two decimal places. Returns `null` if no reviews exist.
- **`reviewCount`** -- The total number of `Pov` records linked to the business.

### Product Availability Filtering

Product search automatically filters to `isAvailable: true`, ensuring only currently available products appear in results. Price range filtering supports open-ended ranges (min only, max only, or both).

### User Search

User search matches against the `name` field only and returns results sorted alphabetically (`name: 'asc'`), unlike business and product searches which sort by `createdAt: 'desc'`.

### Pagination

All search endpoints share a consistent pagination implementation using `skip`/`take` with Prisma. The total count and result set are fetched concurrently via `Promise.all` for performance. Pagination parameters are validated and coerced from query strings via shared Zod fields.

## Dependencies

| Dependency | Purpose |
|-----------|---------|
| `express` | HTTP routing and middleware |
| `zod` | Query parameter validation and type coercion |
| `@prisma/client` | Database queries via `getPrisma()` singleton |
| `../../shared/middleware/auth.js` | `authenticate` middleware for JWT verification |
| `../../shared/middleware/errorHandler.js` | `AppError` class for standardized error responses |
| `../../shared/utils/logger.js` | Structured debug logging for search operations |
