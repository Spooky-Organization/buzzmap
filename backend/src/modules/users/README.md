# Users Module

## Module Objective

The Users module manages user profile operations and social graph functionality for BuzzMap. It provides authenticated endpoints for viewing and updating profiles, managing user interests, and handling follow/unfollow relationships including mutual-follow (friend) detection.

## Architecture

This module follows the **MVCS (Model-Validator-Controller-Service)** pattern:

```
routes.ts
  -> controllers/userController.ts   (request parsing, validation, response formatting)
    -> services/userService.ts        (business logic, database access via Prisma)
    -> validators/index.ts            (Zod schemas for input validation)
    -> models/index.ts                (TypeScript interfaces / DTOs)
```

- **Routes** define endpoint mappings and apply the shared `authenticate` middleware to all routes.
- **Controllers** parse and validate incoming requests, delegate to services, and return standardized JSON responses (`{ status, data }`).
- **Services** contain all business logic and Prisma queries. They enforce domain rules such as self-follow prevention, duplicate follow detection, and phone uniqueness.
- **Models** export TypeScript interfaces that define DTOs and response shapes.
- **Validators** export Zod schemas used by controllers to validate request bodies and query parameters.

## Files & Responsibilities

| File | Responsibility |
|------|---------------|
| `routes.ts` | Registers all `/users` endpoints; applies `authenticate` middleware globally to the router. |
| `controllers/userController.ts` | Parses request params/body/query, runs Zod validation, calls service functions, and formats HTTP responses. Contains an `assertAuthenticated` type guard for safe `req.user` access. |
| `services/userService.ts` | Implements all business logic: profile retrieval (full and public), profile updates, interest management, follow/unfollow operations, paginated follower/following lists, and mutual-follow friend detection. |
| `models/index.ts` | Defines TypeScript interfaces: `UpdateProfileDTO`, `UpdateInterestsDTO`, `BusinessProfileSummary`, `UserProfileResponse`, `PublicUserProfileResponse`, `FollowerEntry`, `FollowingEntry`, and `PaginatedResult<T>`. |
| `validators/index.ts` | Exports Zod schemas: `updateProfileSchema` (name, avatar, location, phone), `updateInterestsSchema` (non-empty string array), and `paginationSchema` (page/limit with string-to-int coercion and defaults). |

## API Routes

All routes are prefixed by the parent router mount path (e.g., `/api/v1/users`). Every route requires a valid JWT via the `authenticate` middleware.

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| `GET` | `/me` | Retrieve the authenticated user's full profile (includes email, business profile, follower/following/POV counts). | Yes |
| `PATCH` | `/me` | Update the authenticated user's profile fields (name, avatar, location, phone). | Yes |
| `PATCH` | `/me/interests` | Replace the authenticated user's interests array. | Yes |
| `GET` | `/me/followers` | List users who follow the authenticated user (paginated). | Yes |
| `GET` | `/me/following` | List users the authenticated user follows (paginated). | Yes |
| `GET` | `/me/friends` | List mutual follows (users who follow each other). | Yes |
| `GET` | `/:id` | Retrieve a public profile for any user by ID (excludes email). | Yes |
| `POST` | `/:id/follow` | Follow a user by ID. Returns `201`. | Yes |
| `DELETE` | `/:id/follow` | Unfollow a user by ID. Returns `200`. | Yes |

## Key Logic

### Profile Management

- **Full profile** (`getProfile`): Returns all user fields including `email`, associated `businessProfile`, and aggregate counts for followers, following, and POVs.
- **Public profile** (`getPublicProfile`): Same shape but excludes `email`, used when viewing other users.
- **Profile update** (`updateProfile`): Supports partial updates via optional fields. Enforces phone number uniqueness across users before persisting changes.

### Interest Management

- **Update interests** (`updateInterests`): Replaces the user's entire `interests` array. Validated to require at least one interest via Zod (`z.array(z.string()).min(1)`).

### Follow / Unfollow

- **Follow** (`followUser`): Creates a `Follow` record. Guards against self-follows (`400`) and duplicate follows (`409`). Verifies the target user exists (`404`).
- **Unfollow** (`unfollowUser`): Deletes the `Follow` record. Guards against self-unfollow (`400`) and returns `404` if the follow relationship does not exist.

### Friend Detection

- **Mutual follows** (`detectFriends`): Queries for all users where a bidirectional follow relationship exists -- the authenticated user follows them AND they follow the authenticated user back. Returns full public profiles for each friend. Implemented as a single Prisma query using nested relation filters.

### Pagination

- Follower and following lists support cursor-free offset pagination via `page` and `limit` query parameters.
- Defaults: `page = 1`, `limit = 20`. Maximum limit is `100`.
- Response includes `total`, `page`, `limit`, and `totalPages` metadata alongside the `data` array.

## Dependencies

| Shared Module | Usage |
|---------------|-------|
| `shared/middleware/auth.ts` | `authenticate` middleware -- extracts and verifies JWT, attaches `req.user` with `userId` and `role`. |
| `shared/middleware/errorHandler.ts` | `AppError` class -- used to throw structured HTTP errors (400, 401, 404, 409) that the global error handler serializes. |
| `shared/prisma/index.ts` | `getPrisma()` -- returns the singleton Prisma client instance for all database operations. |
| `zod` | Runtime request validation for profile updates, interest updates, and pagination query parameters. |
