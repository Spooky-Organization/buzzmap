# Feed Module

## Purpose

Serves authenticated POV discovery feeds. The module exposes:

- a personalized feed based on the current user's saved interests
- a trending feed based on recent engagement

## Files

| File | Responsibility |
|---|---|
| `routes.ts` | Registers authenticated feed endpoints |
| `controllers/feedController.ts` | Parses query params and returns standardized responses |
| `services/feedService.ts` | Builds personalized and trending feed results |
| `models/index.ts` | Feed DTO and pagination types |
| `validators/index.ts` | Query validation for `cursor` and `limit` |

The service delegates query construction to `shared/builders/FeedQueryBuilder.ts`.

## Routes

Mounted under `/api/v1/feed`.

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/` | Personalized feed for the current user | Yes |
| `GET` | `/trending` | Trending POV feed | Yes |

## Query Parameters

| Field | Type | Notes |
|---|---|---|
| `cursor` | `string` | Optional cursor ID for pagination |
| `limit` | `string -> number` | Optional, `1-100` |

`interests` is still accepted by the validator but the personalized service currently sources interests from the authenticated user record, not directly from the query string.

## Implementation Notes

- Personalized feed loads `user.interests` and filters POVs by matching business categories.
- If the user has no interests, the feed falls back to a reverse-chronological listing.
- Trending feed uses a fixed 7-day window and sorts by `likesCount` descending.
- Pagination is cursor-based. The response contains `data` and `nextCursor`.

## Response Shape

```json
{
  "status": "success",
  "data": {
    "data": [],
    "nextCursor": "string | null"
  }
}
```
