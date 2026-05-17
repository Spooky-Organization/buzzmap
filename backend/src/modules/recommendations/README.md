# Recommendations Module

## Purpose

Provides analytics and business ranking endpoints derived from POV review data.

The module currently exposes:

- business stats for the current business owner
- business stats for any business profile by ID
- top-business ranking by weighted score

## Files

| File | Responsibility |
|---|---|
| `routes.ts` | Recommendation routes behind authentication |
| `controllers/recommendationController.ts` | Inline Zod validation and standardized responses |
| `services/recommendationService.ts` | Stats aggregation and weighted ranking logic |
| `models/index.ts` | Stats and ranking result types |

## Routes

Mounted under `/api/v1/recommendations`.

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/business/stats` | Get stats for the current business owner | Yes |
| `GET` | `/business/:id/stats` | Get stats for a specific business profile | Yes |
| `GET` | `/top` | Get ranked top businesses | Yes |

## Query and Path Parameters

| Field | Location | Notes |
|---|---|---|
| `id` | path | Business profile UUID |
| `category` | query | Optional filter for top businesses |
| `limit` | query | Default `10`, max `50` |

## Implementation Notes

- Business stats include `avgRating`, `recommendationPercentage`, `reviewCount`, and `followerCount`.
- `getMyBusinessStats` resolves the business profile through the authenticated owner.
- Top-business score is computed as:

```text
score = (avgRating / 5) * 0.60 + (recommendationPercentage / 100) * 0.40
```

- Only businesses meeting the module's minimum review threshold are included in ranking results.
