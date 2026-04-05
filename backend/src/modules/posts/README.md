# Posts Module

## Objective

The Posts module handles the creation, retrieval, and deletion of user-generated posts within BuzzMap. Posts can be standalone (customer posts) or associated with a business profile. The module supports three content types (`TEXT`, `IMAGE`, `VIDEO`) and integrates with RustFS for media file storage.

## Architecture

This module follows the **MVCS (Model-View-Controller-Service)** pattern:

```
routes.ts                    --> Entry point; maps HTTP verbs to controllers
controllers/postController   --> Request parsing, validation, response formatting
services/postService         --> Core business logic, database + storage operations
models/index                 --> TypeScript interfaces (DTOs, response shapes)
validators/index             --> Zod schemas for input validation
```

All routes are protected by the shared `authenticate` middleware. Media uploads are handled by the shared `upload` middleware (Multer), accepting up to 10 files per request.

## Files & Responsibilities

| File | Responsibility |
|------|---------------|
| `routes.ts` | Defines Express routes, applies `authenticate` and `upload` middleware |
| `controllers/postController.ts` | Validates request payloads via Zod schemas, delegates to the service layer, returns JSON responses |
| `services/postService.ts` | Creates/deletes posts, uploads media to RustFS, enforces author-only deletion, implements offset pagination |
| `models/index.ts` | Exports `CreatePostDTO`, `PostResponse`, `PaginatedPostsResult`, and related interfaces |
| `validators/index.ts` | Exports `createPostSchema` and `postPaginationSchema` (Zod) |

## API Routes

All routes are prefixed by the parent router mount path (e.g. `/api/v1/posts`).

| Method | Path | Description | Auth Required |
|--------|------|-------------|:------------:|
| `POST` | `/` | Create a new post (with optional media upload, up to 10 files) | Yes |
| `DELETE` | `/:id` | Delete a post (author-only) | Yes |
| `GET` | `/user/:userId` | Get all posts by a specific user (paginated) | Yes |
| `GET` | `/business/:businessId` | Get all posts linked to a business profile (paginated) | Yes |

## Key Logic

### Post Types

Posts are classified by the `PostType` enum defined in the Prisma schema:

- **TEXT** -- Text-only content
- **IMAGE** -- Post with image attachments
- **VIDEO** -- Post with video attachments

The `type` field is required on creation and validated against `z.enum(['TEXT', 'IMAGE', 'VIDEO'])`.

### Media Upload

- Media files are accepted via `multipart/form-data` on the `media` field.
- Up to **10 files** can be attached per post (enforced by `upload.array('media', 10)`).
- Files are uploaded to RustFS under the `posts/` folder using the shared `uploadToStorage` utility.
- The resulting URLs are stored in the `mediaUrls` array on the post record.

### Author-Only Deletion

Deletion is restricted to the original author. The service layer fetches the post, compares `post.authorId` against the authenticated `userId`, and returns a `403` if they do not match. A `404` is returned if the post does not exist.

### Offset Pagination

List endpoints (`/user/:userId` and `/business/:businessId`) support offset-based pagination via query parameters:

| Parameter | Default | Constraints |
|-----------|---------|-------------|
| `page` | `1` | Integer, minimum 1 |
| `limit` | `20` | Integer, minimum 1, maximum 100 |

Responses include a `PaginatedPostsResult` envelope:

```json
{
  "status": "success",
  "data": {
    "data": [ ... ],
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

Results are ordered by `createdAt` descending (newest first).

### Business Validation

When a `businessId` is provided during post creation, the service verifies the business profile exists before creating the post. A `404` is thrown if the business is not found.

## Dependencies

| Shared Module | Usage |
|---------------|-------|
| `shared/middleware/auth` | `authenticate` -- JWT-based route protection |
| `shared/middleware/errorHandler` | `AppError` -- Standardised error class for HTTP error responses |
| `shared/storage/upload` | `upload` (Multer middleware) and `uploadToStorage` (RustFS client) |
| `shared/prisma` | `getPrisma` -- Returns the Prisma client instance for database operations |
| `@prisma/client` | `PostType` enum |
| `zod` | Request body and query parameter validation schemas |
