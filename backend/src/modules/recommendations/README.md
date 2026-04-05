# Recommendations Module

## Module Objective

Provides business analytics and recommendation rankings for the BuzzMap platform. This module aggregates review data to compute business statistics and produces a scored ranking of top businesses using a weighted composite algorithm.

## Architecture

This module follows the **MVCS (Model-View-Controller-Service)** pattern:

```
routes.ts --> controllers/ --> services/ --> Prisma ORM
                  |
            (inline Zod schemas)
```

- **Routes** define HTTP endpoints and apply authentication middleware.
- **Controllers** handle request parsing, input validation (via inline Zod schemas), and response formatting.
- **Services** contain the core recommendation logic, including stats aggregation, score computation, and ranking.
- **Models** define TypeScript interfaces for business statistics and ranking result types.

## Files & Responsibilities

| File | Responsibility |
|------|---------------|
| `routes.ts` | Registers `GET` endpoints under the recommendations prefix and applies the `authenticate` middleware |
| `controllers/recommendationController.ts` | Validates path parameters and query strings using inline Zod schemas, delegates to the service layer, and returns standardized JSON responses |
| `services/recommendationService.ts` | Aggregates review data from `Pov` records, computes business statistics (avg rating, recommendation %, follower count), and ranks businesses using a weighted composite score |
| `models/index.ts` | Exports `BusinessStats` and `TopBusinessResult` interfaces |

## API Routes

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| `GET` | `/business/:id/stats` | Retrieve aggregated statistics for a single business | Yes |
| `GET` | `/top` | Get a ranked list of top businesses by composite score | Yes |

All endpoints return a standardized response:

```json
{
  "status": "success",
  "data": { }
}
```

### Query & Path Parameters

**Business Stats:** `id` (UUID, path parameter) -- The business profile ID.

**Top Businesses:** `category` (optional), `limit` (default: 10, max: 50)

## Key Logic

### Business Stats Aggregation

The `getBusinessStats` endpoint computes the following metrics for a single business:

| Metric | Computation |
|--------|------------|
| `avgRating` | Mean of all `starRating` values from associated `Pov` records, rounded to 2 decimal places. Returns `null` if no reviews exist. |
| `recommendationPercentage` | Percentage of `Pov` records where `recommends` is `true`, rounded to 2 decimal places. Returns `null` if no reviews exist. |
| `reviewCount` | Total number of `Pov` records linked to the business. |
| `followerCount` | Number of `Follow` records where `followingId` matches the business owner's `userId`. |

Returns a `404` error if the business profile does not exist.

### Top Businesses Scoring Algorithm

The `getTopBusinesses` endpoint ranks businesses using a weighted composite score:

```
score = (avgRating / 5) * 0.60 + (recommendationPercentage / 100) * 0.40
```

| Component | Weight | Normalization |
|-----------|--------|--------------|
| Average star rating | 60% | Divided by 5 (max star rating) to produce a 0-1 value |
| Recommendation percentage | 40% | Divided by 100 to produce a 0-1 value |

The final score is rounded to 4 decimal places and ranges from 0 to 1.

### Minimum Review Threshold

Businesses must have at least **1 review** (`MIN_REVIEW_THRESHOLD = 1`) to be eligible for the top businesses ranking. Businesses with zero reviews are excluded entirely from results. This prevents unreviewed businesses from appearing in recommendations.

### Ranking Process

1. Fetch all businesses matching the optional `category` filter (case-insensitive partial match).
2. Filter out businesses below the minimum review threshold.
3. Compute `avgRating`, `recommendationPercentage`, and `score` for each remaining business.
4. Sort by `score` in descending order.
5. Return the top N results as specified by the `limit` parameter.

## Dependencies

| Dependency | Purpose |
|-----------|---------|
| `express` | HTTP routing and middleware |
| `zod` | Request parameter validation and type coercion |
| `@prisma/client` | Database queries via `getPrisma()` singleton |
| `../../shared/middleware/auth.js` | `authenticate` middleware for JWT verification |
| `../../shared/middleware/errorHandler.js` | `AppError` class for standardized error responses and 404 handling |
| `../../shared/utils/logger.js` | Structured debug logging for recommendation operations |
