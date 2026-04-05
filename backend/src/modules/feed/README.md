# Feed Module

## Objective

The Feed module delivers POV (Point of View) video content to authenticated users through two distinct feed strategies: a **personalized feed** tailored to user interests and a **trending feed** surfacing popular content from the past seven days. It is the primary content-discovery surface of the BuzzMap platform.

## Architecture

The module follows the **MVCS (Model-View-Controller-Service)** pattern with an additional **Builder** layer for query construction:

```
routes.ts                   // Route definitions + middleware binding
  -> controllers/           // Request parsing, validation, response shaping
    -> services/            // Business logic, data retrieval orchestration
      -> FeedQueryBuilder   // Composable Prisma query construction (Builder pattern)
        -> Prisma ORM       // Database access
```

**Why the Builder pattern?** `FeedQueryBuilder` encapsulates all query concerns (filtering, sorting, pagination, timeframes) behind a chainable API, keeping the service layer free of raw Prisma query assembly. Each feed strategy composes different builder methods while sharing the same pagination and include logic.

## Files & Responsibilities

| File | Responsibility |
|------|---------------|
| `routes.ts` | Registers `GET /` and `GET /trending` behind the `authenticate` middleware. |
| `controllers/feedController.ts` | Validates query params via Zod, asserts authentication, delegates to the service, and returns standardized JSON responses. |
| `services/feedService.ts` | Contains `getPersonalizedFeed` and `getTrending` business logic. Fetches user interests, configures the `FeedQueryBuilder`, and executes Prisma queries. |
| `models/index.ts` | TypeScript interfaces (`FeedPOV`, `FeedAuthor`, `FeedBusiness`, `PaginatedFeedResult`) defining the shape of feed response data. |
| `validators/index.ts` | Zod schema (`feedQuerySchema`) for query parameter validation: `cursor`, `limit` (1-100), and `interests` (comma-separated string). |

## API Routes

| Method | Path | Description | Auth Required |
|--------|------|-------------|:---:|
| `GET` | `/feed` | Returns a personalized feed based on the authenticated user's interests. Falls back to a chronological feed when no interests are configured. | Yes |
| `GET` | `/feed/trending` | Returns trending POVs sorted by `likesCount` descending, limited to content created within the past 7 days. | Yes |

### Query Parameters

| Parameter | Type | Required | Constraints | Description |
|-----------|------|:---:|-------------|-------------|
| `cursor` | `string` | No | Valid POV ID | Cursor for pagination; the ID of the last item from the previous page. |
| `limit` | `string` (parsed to int) | No | 1 - 100, default 20 | Number of items per page. |
| `interests` | `string` | No | Comma-separated values | Interest filter (defined in validator; the personalized endpoint sources interests from the user record). |

### Response Shape

```json
{
  "status": "success",
  "data": {
    "data": [
      {
        "id": "string",
        "authorId": "string",
        "businessId": "string",
        "videoUrl": "string",
        "thumbnailUrl": "string | null",
        "caption": "string | null",
        "starRating": "number",
        "recommends": "boolean",
        "likesCount": "number",
        "commentsCount": "number",
        "createdAt": "ISO 8601",
        "author": { "id": "string", "name": "string", "avatar": "string | null" },
        "business": { "id": "string", "businessName": "string" }
      }
    ],
    "nextCursor": "string | null"
  }
}
```

## Key Logic

### FeedQueryBuilder

Located at `shared/builders/FeedQueryBuilder.ts`, this class constructs Prisma `findMany` arguments through a chainable API:

| Method | Effect |
|--------|--------|
| `filterByInterests(interests)` | Adds a `where` clause filtering POVs whose associated business `category` is in the provided list. |
| `paginate(cursor?, limit?)` | Configures cursor-based pagination (`skip: 1, cursor: { id }`) and page size. |
| `sortByTrending()` | Overrides the default `createdAt desc` ordering with `likesCount desc`. |
| `withinTimeframe(ms)` | Restricts results to POVs with `createdAt >= (now - ms)`. |
| `build()` | Returns the final Prisma query object, including `author` and `business` relation includes. |

### Interest-Based Personalization

1. The service fetches the authenticated user's `interests` array from the database.
2. If interests exist, `FeedQueryBuilder.filterByInterests()` filters POVs to those whose linked business has a matching `category`.
3. If no interests are set, the feed degrades gracefully to a reverse-chronological listing of all POVs.

### Trending Algorithm

Trending is defined as POVs with the highest `likesCount` created within the last **7 days** (`TRENDING_TIMEFRAME_MS`). The builder chains `sortByTrending()` and `withinTimeframe()` to produce this query.

### Cursor-Based Pagination

The module uses Prisma's native cursor pagination:

- The client sends the `id` of the last received item as the `cursor` query parameter.
- The builder translates this into `{ skip: 1, cursor: { id: cursor } }`, skipping the cursor record itself.
- `nextCursor` in the response is the `id` of the last item in the current page, or `null` when there are no further pages (i.e., the returned item count is less than the requested limit).

## Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| `FeedQueryBuilder` | `shared/builders/FeedQueryBuilder.ts` | Prisma query construction for feed endpoints. |
| `getPrisma` | `shared/prisma/index.ts` | Singleton Prisma client accessor. |
| `authenticate` | `shared/middleware/auth.ts` | JWT authentication middleware applied to all feed routes. |
| `AppError` | `shared/middleware/errorHandler.ts` | Standardized application error class used in the controller's auth assertion. |
| `zod` | External package | Runtime query parameter validation and transformation. |
