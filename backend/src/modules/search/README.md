# Search Module

## Purpose

Provides authenticated search endpoints for businesses, products, users, and an aggregate search shortcut.

## Files

| File | Responsibility |
|---|---|
| `routes.ts` | Search routes and `GET`-only method restrictions |
| `controllers/searchController.ts` | Query parsing and standardized responses |
| `services/searchService.ts` | Prisma-backed search queries and result shaping |
| `models/index.ts` | Search result DTOs and paginated result types |
| `validators/index.ts` | Aggregate and typed search query validation |

## Routes

Mounted under `/api/v1/search`.

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/` | Aggregate search across businesses, products, and users | Yes |
| `GET` | `/businesses` | Business search | Yes |
| `GET` | `/products` | Product search | Yes |
| `GET` | `/users` | User search | Yes |

Unsupported methods on `/`, `/businesses`, and `/products` return explicit `405` responses through `methodNotAllowed(...)`.

## Query Parameters

### Aggregate Search

| Field | Notes |
|---|---|
| `q` | Optional keyword, `1-200` chars when present |
| `category` | Optional category |
| `location` | Optional location |

The aggregate endpoint always fans out to fixed first-page slices:

- businesses: page `1`, limit `10`
- products: page `1`, limit `10`
- users: page `1`, limit `10`

### Typed Search Endpoints

| Endpoint | Parameters |
|---|---|
| `/businesses` | `keyword`, `category`, `location`, `page`, `limit` |
| `/products` | `keyword`, `category`, `minPrice`, `maxPrice`, `page`, `limit` |
| `/users` | `keyword`, `page`, `limit` |

## Implementation Notes

- Business and product searches use case-insensitive partial matches.
- Product search filters to available products.
- User search is name-based.
- Paginated endpoints use offset pagination with `page` and `limit`.
