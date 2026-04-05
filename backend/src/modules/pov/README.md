# POV Module

## Module Objective

The POV (Point of View) module handles user-generated video reviews for businesses listed on BuzzMap. Users can record and upload short video reviews that include a star rating (1--5) and a recommendation flag, enabling other users to discover businesses through authentic, first-person perspectives. The module also supports social engagement through likes and comments on POVs.

## Architecture

The module follows the **MVCS (Model-Validator-Controller-Service)** pattern:

```
pov/
├── routes.ts                  # Express router — maps HTTP endpoints to controllers
├── controllers/
│   └── povController.ts       # Request handling, input parsing, response formatting
├── services/
│   └── povService.ts          # Core business logic, Prisma queries, storage operations
├── models/
│   └── index.ts               # TypeScript interfaces (DTOs + response shapes)
├── validators/
│   └── index.ts               # Zod schemas for request validation
└── README.md
```

**Data flow:** `Route → Controller → Validator (Zod) → Service → Prisma / RustFS`

## Files and Responsibilities

| File | Responsibility |
|------|---------------|
| `routes.ts` | Registers all POV endpoints on an Express `Router`. Applies the `authenticate` middleware and the `upload.single('video')` multer middleware for the create endpoint. |
| `controllers/povController.ts` | Extracts and coerces request parameters (multipart form fields arrive as strings). Delegates to service functions and returns standardised JSON responses (`{ status, data }`). Includes an `assertAuthenticated` type-guard for safe user access. |
| `services/povService.ts` | Contains all business logic: CRUD operations on POVs, like/unlike toggling with transactional counter updates, comment creation and retrieval, video upload/deletion via shared storage helpers, and signed URL generation for private video access. |
| `models/index.ts` | Defines `CreatePOVDTO`, `POVResponse`, `CommentResponse`, and a generic `PaginatedResult<T>` interface used across service return types. |
| `validators/index.ts` | Exports Zod schemas: `createPOVSchema` (businessId, caption, starRating, recommends), `createCommentSchema` (content), and `paginationSchema` (page/limit with string-to-number coercion and defaults). |

## API Routes

All routes are prefixed by wherever the module router is mounted (e.g. `/api/v1/povs`). Every endpoint requires authentication.

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/` | Create a new POV with a video upload (`multipart/form-data`) | Yes |
| `DELETE` | `/:id` | Delete a POV (author only) | Yes |
| `GET` | `/:id` | Retrieve a single POV by ID | Yes |
| `GET` | `/business/:businessId` | List POVs for a business (paginated) | Yes |
| `GET` | `/user/:userId` | List POVs by a specific user (paginated) | Yes |
| `POST` | `/:id/like` | Like a POV (idempotent -- re-liking is a no-op) | Yes |
| `DELETE` | `/:id/like` | Unlike a POV (idempotent -- un-liking when not liked is a no-op) | Yes |
| `POST` | `/:id/comments` | Add a comment to a POV | Yes |
| `GET` | `/:id/comments` | List comments on a POV (paginated) | Yes |

### Pagination

Endpoints that return lists accept optional query parameters:

- `page` -- page number (default: `1`, minimum: `1`)
- `limit` -- items per page (default: `20`, minimum: `1`, maximum: `100`)

Paginated responses include: `data`, `total`, `page`, `limit`, `totalPages`.

## Key Logic

### Video Upload to RustFS

Video files are uploaded through `multer` (in-memory storage) and then persisted to an S3-compatible **RustFS** object store via the shared `uploadToStorage` helper. The upload flow:

1. Multer buffers the file in memory, enforcing a configurable max file size and an allowlist of MIME types.
2. The service calls `uploadToStorage(file, 'povs')`, which generates a unique key (`povs/<timestamp>-<random>.<ext>`) and issues a `PutObjectCommand` to the configured bucket.
3. The storage key (not a URL) is persisted in the database as `videoUrl`.

### Signed URLs

Video files are stored privately. When a POV is retrieved, `resolveVideoUrl` generates a **pre-signed URL** (via `@aws-sdk/s3-request-presigner`) that expires in 1 hour by default. This ensures videos are only accessible through authenticated API responses.

### Likes and Unlikes

- Like and unlike operations are **idempotent**: liking an already-liked POV or unliking a non-liked POV silently succeeds without error.
- Both operations use **Prisma transactions** to atomically create/delete the `Like` record and increment/decrement the `likesCount` counter on the POV.
- The `isLiked` field is conditionally included in POV responses when a requesting user ID is available.

### Comments

- Comments are created inside a **Prisma transaction** that also increments the `commentsCount` on the parent POV.
- Comment listings are ordered chronologically (`createdAt: 'asc'`) and paginated.

### Star Ratings and Recommendations

Each POV carries a `starRating` (integer, 1--5) and a `recommends` boolean. These are validated via Zod and coerced from string to their proper types in the controller since they arrive as strings in `multipart/form-data` payloads.

### Multer Configuration

Defined in the shared `upload.ts` module:

- **Storage:** In-memory (`multer.memoryStorage()`).
- **File size limit:** Configurable via `config.maxFileSize`.
- **File type filter:** Only MIME types listed in `config.allowedFileTypes` are accepted. Unsupported types return a `415 Unsupported Media Type` error.

### Authorization

- **Delete** operations verify that the requesting user is the POV author; otherwise a `403 Forbidden` is returned.
- All other write operations (create, like, comment) require authentication but are not role-restricted.

## Dependencies (Shared Modules)

| Shared Module | Usage |
|---------------|-------|
| `shared/middleware/auth.ts` | `authenticate` middleware -- validates JWT and attaches `req.user` |
| `shared/middleware/errorHandler.ts` | `AppError` class for structured HTTP error responses |
| `shared/storage/upload.ts` | `upload` (multer instance), `uploadToStorage`, `deleteFromStorage`, `getSignedUrl` |
| `shared/storage/index.ts` | `getStorage` -- returns the configured S3 client |
| `shared/prisma/index.ts` | `getPrisma` -- returns the shared Prisma client instance |
| `shared/utils/logger.ts` | Structured logger (used for upload and deletion events) |
| `config/index.ts` | Application configuration (bucket name, file size limits, allowed types) |
| `zod` | Schema validation for request payloads and query parameters |
