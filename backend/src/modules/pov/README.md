# POV Module

## Purpose

Manages point-of-view video reviews for businesses. The module handles:

- POV creation with required video upload
- POV retrieval by ID, business, or user
- current-user POV listing
- likes and unlikes
- comments and comment listing
- POV deletion by the owning author

## Files

| File | Responsibility |
|---|---|
| `routes.ts` | POV routes and upload middleware |
| `controllers/povController.ts` | Multipart coercion, validation, and standardized responses |
| `services/povService.ts` | POV persistence, storage upload, sanitization, likes, comments, and queries |
| `models/index.ts` | POV, comment, and paginated response types |
| `validators/index.ts` | Create POV, create comment, and pagination validation |

## Routes

Mounted under `/api/v1/pov`.

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/` | Create a POV with a required `video` upload | Yes |
| `GET` | `/my` | Get current user's POVs | Yes |
| `GET` | `/:id` | Get one POV | Yes |
| `DELETE` | `/:id` | Delete a POV owned by the current user | Yes |
| `GET` | `/business/:businessId` | Get paginated POVs for a business | Yes |
| `GET` | `/user/:userId` | Get paginated POVs for a user | Yes |
| `POST` | `/:id/like` | Like a POV | Yes |
| `DELETE` | `/:id/like` | Unlike a POV | Yes |
| `POST` | `/:id/comments` | Add a comment | Yes |
| `GET` | `/:id/comments` | Get paginated comments | Yes |

## Validation Rules

| Field | Notes |
|---|---|
| `businessId` | Required UUID |
| `caption` | Optional, max `500` chars |
| `starRating` | Integer `1-5` |
| `recommends` | Boolean |
| `comment.content` | `1-1000` chars |
| `page` / `limit` | Default `1 / 20`, max `100` |

## Implementation Notes

- POV creation expects multipart form data. The controller coerces `starRating` to a number and `recommends` to a boolean before Zod validation.
- A missing `video` file is rejected before service execution.
- Likes and comments update aggregate counts in the service layer.
- Comment and caption text go through backend plain-text sanitization before persistence.
