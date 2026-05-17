# Posts Module

## Purpose

Supports user and business social posts. The module handles:

- post creation with optional media
- post deletion by the owning author
- paginated retrieval by user or business

## Files

| File | Responsibility |
|---|---|
| `routes.ts` | Post routes and upload middleware binding |
| `controllers/postController.ts` | Request parsing and standardized responses |
| `services/postService.ts` | Post creation, sanitization, ownership checks, storage uploads, and retrieval |
| `models/index.ts` | Post DTO and paginated response types |
| `validators/index.ts` | Create-post and pagination validation |

## Routes

Mounted under `/api/v1/posts`.

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/` | Create a post with optional `media[]` upload | Yes |
| `DELETE` | `/:id` | Delete a post owned by the current user | Yes |
| `GET` | `/user/:userId` | Get paginated posts by user | Yes |
| `GET` | `/business/:businessId` | Get paginated posts by business | Yes |

## Validation Rules

| Field | Notes |
|---|---|
| `businessId` | Optional UUID |
| `type` | `TEXT`, `IMAGE`, or `VIDEO` |
| `content` | Optional, max `5000` chars |
| `page` / `limit` | Offset pagination, default `1 / 20`, max `100` |

## Implementation Notes

- The route accepts up to 10 media files through `upload.array('media', 10)`.
- Numeric pagination is parsed from query strings in the validator layer.
- The service is responsible for sanitizing plain-text content before persistence.
- Delete is author-owned; unauthorized delete attempts fail in the service layer.
