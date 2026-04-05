# BuzzMap Backend

REST API and real-time server for BuzzMap -- a location-aware social platform connecting customers with local businesses through video reviews (POVs), product listings, orders, and messaging.

Built with **Express 5**, **TypeScript 6**, and **Prisma v7** on **Node 22**.

---

## Tech Stack

| Layer           | Technology                                      |
| --------------- | ----------------------------------------------- |
| Runtime         | Node.js 22 (Alpine in Docker)                   |
| Framework       | Express 5                                        |
| Language        | TypeScript 6 (`NodeNext` module resolution)      |
| ORM             | Prisma v7 with PostgreSQL                        |
| Real-time       | Socket.IO 4 with Redis adapter                   |
| Cache / Pub-Sub | Redis via ioredis                                |
| Auth            | JWT (access + refresh tokens), bcrypt             |
| Validation      | Zod 4                                             |
| Object Storage  | S3-compatible (RustFS / MinIO) via AWS SDK v3     |
| File Upload     | Multer (memory storage)                           |
| Logging         | Pino (with pino-pretty in development)            |
| Rate Limiting   | express-rate-limit with optional Redis store      |
| Security        | Helmet, CORS                                      |

---

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma            # Database schema (17 models, 8 enums)
├── prisma.config.ts             # Prisma v7 URL configuration
├── src/
│   ├── index.ts                 # Bootstrap: init singletons, register routes, start server
│   ├── config/
│   │   └── index.ts             # Env var validation and typed config object
│   ├── core/
│   │   ├── app.ts               # Express app setup (helmet, cors, body parsers, health check)
│   │   ├── server.ts            # HTTP server + Socket.IO instance creation
│   │   └── routes.ts            # Central route registration for all modules
│   ├── shared/
│   │   ├── middleware/
│   │   │   ├── auth.ts          # JWT authentication middleware (Bearer token)
│   │   │   ├── authorize.ts     # Role-based authorization middleware
│   │   │   ├── errorHandler.ts  # Global error handler (AppError, ZodError, Prisma errors)
│   │   │   └── rateLimiter.ts   # Rate limiter factory (in-memory or Redis-backed)
│   │   ├── prisma/
│   │   │   └── index.ts         # PrismaClient singleton (init / get / disconnect)
│   │   ├── redis/
│   │   │   └── index.ts         # ioredis singleton (init / get / disconnect)
│   │   ├── socket/
│   │   │   └── index.ts         # Socket.IO singleton (set / get)
│   │   ├── storage/
│   │   │   ├── index.ts         # S3Client singleton for RustFS/MinIO
│   │   │   └── upload.ts        # Multer config + upload/delete/getSignedUrl helpers
│   │   ├── builders/
│   │   │   └── FeedQueryBuilder.ts  # Builder pattern for Prisma POV feed queries
│   │   ├── factories/
│   │   │   ├── CustomerFactory.ts       # Creates CUSTOMER users
│   │   │   └── BusinessOwnerFactory.ts  # Creates BUSINESS_OWNER users + BusinessProfile (transactional)
│   │   └── utils/
│   │       └── logger.ts        # Pino logger instance
│   └── modules/
│       ├── auth/                # Authentication (register, login)
│       ├── users/               # User profiles and social graph
│       ├── pov/                 # Video reviews (POVs) with likes and comments
│       ├── feed/                # Personalized and trending POV feeds
│       ├── posts/               # Text/image/video posts by users and businesses
│       ├── products/            # Product catalog management (BUSINESS_OWNER only)
│       ├── orders/              # Cart and order management
│       ├── notifications/       # Notification CRUD + real-time Socket.IO delivery
│       ├── messaging/           # Conversations and messages + real-time Socket.IO
│       ├── search/              # Search across businesses, products, and users
│       └── recommendations/     # Business stats and top-business rankings
├── Dockerfile.dev               # Development image (tsx watch)
├── Dockerfile.prod              # Production image (multi-stage tsc build)
├── package.json
└── tsconfig.json
```

Each module follows the same internal structure:

```
modules/<name>/
├── controllers/<name>Controller.ts   # Request handling
├── services/<name>Service.ts         # Business logic
├── models/index.ts                   # TypeScript types and interfaces
├── validators/index.ts               # Zod schemas for request validation
├── routes.ts                         # Express router
└── socket.ts                         # (notifications, messaging only)
```

---

## Architecture

### MVCS Pattern (Models, Validators, Controllers, Services)

Every module separates concerns into four layers:

- **Models** -- TypeScript interfaces and types describing data shapes used within the module.
- **Validators** -- Zod schemas that validate incoming request bodies and query parameters. Validation failures surface as `ZodError`, caught by the global error handler and returned as `422`.
- **Controllers** -- Thin request handlers that parse validated input and delegate to services.
- **Services** -- Business logic layer that interacts with Prisma, Redis, Storage, and Socket.IO through shared singletons.

### Design Patterns

| Pattern     | Usage                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------- |
| **Singleton** | Prisma, Redis, Socket.IO, and S3 clients are initialized once at startup and accessed via `get*()` functions throughout the codebase. |
| **Factory**   | `CustomerFactory` and `BusinessOwnerFactory` encapsulate user creation logic, including password hashing and (for business owners) transactional creation of both `User` and `BusinessProfile` records. |
| **Builder**   | `FeedQueryBuilder` provides a chainable API to construct Prisma `findMany` arguments for POV feeds with filters (interests, timeframe), sorting (chronological or trending), and cursor-based pagination. |

---

## Shared Layer

### Singletons

| Singleton     | Module                    | Description                                                                                                                  |
| ------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Prisma**    | `shared/prisma`           | `PrismaClient` instance. Call `initPrisma()` at startup, then `getPrisma()` anywhere.                                        |
| **Redis**     | `shared/redis`            | ioredis `Redis` instance connected via `REDIS_URL`. Also backs the Socket.IO Redis adapter and optional Redis rate limiter.  |
| **Socket.IO** | `shared/socket`           | `Server` instance. Set via `setIO()` at startup, retrieved with `getIO()` by services that need to emit events.              |
| **Storage**   | `shared/storage/index.ts` | AWS SDK `S3Client` configured for RustFS/MinIO with path-style access. Initialized via `initStorage()`.                      |

### Middleware

| Middleware         | Description                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| **authenticate**   | Extracts and verifies a JWT Bearer token from the `Authorization` header. Attaches `req.user` with `userId` and `role`.    |
| **authorize**      | Role-based access control. Accepts a list of allowed roles and rejects requests from users without a matching role.         |
| **errorHandler**   | Global Express error handler. Formats `ZodError` (422), `AppError` (custom status), Prisma errors (P2002 -> 409, P2025 -> 404), and unexpected errors (500 with stack in development). |
| **rateLimiter**    | Factory functions to create rate limiters. `createRateLimiter()` uses in-memory storage; `createRateLimiterWithRedis()` uses a Redis-backed store for distributed rate limiting. Both respect `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS` from config. |

### Storage Helpers (`shared/storage/upload.ts`)

- **`upload`** -- Multer instance with memory storage, file size limits from `MAX_FILE_SIZE`, and MIME type filtering from `ALLOWED_FILE_TYPES`.
- **`uploadToStorage(file, folder)`** -- Uploads a multer file buffer to the S3 bucket under the given folder prefix. Returns the storage key.
- **`deleteFromStorage(key)`** -- Deletes an object by key.
- **`getSignedUrl(key, expiresIn?)`** -- Generates a pre-signed read URL (default 1 hour expiry).

### Factories

- **`CustomerFactory.create(input)`** -- Hashes the password with bcrypt and creates a `User` record with role `CUSTOMER`.
- **`BusinessOwnerFactory.create(input)`** -- Runs a Prisma `$transaction` to atomically create both a `User` (role `BUSINESS_OWNER`) and a linked `BusinessProfile`.

### Builders

- **`FeedQueryBuilder`** -- Chainable builder for constructing Prisma `POV.findMany()` arguments:
  - `.filterByInterests(interests)` -- Filter by business category.
  - `.withinTimeframe(ms)` -- Restrict to recent POVs (default 7 days).
  - `.sortByTrending()` -- Order by `likesCount` descending.
  - `.paginate(cursor, limit)` -- Cursor-based pagination (default 20 per page).
  - `.build()` -- Returns the final Prisma query arguments with author and business includes.

---

## Modules Overview

| Module              | Description                                                    | Route Prefix                |
| ------------------- | -------------------------------------------------------------- | --------------------------- |
| **auth**            | Customer and business owner registration, login                | `/api/v1/auth`              |
| **users**           | User profiles, interests, follow/unfollow, friends             | `/api/v1/users`             |
| **pov**             | Video reviews (POVs) with likes and comments                   | `/api/v1/pov`               |
| **feed**            | Personalized and trending POV feeds                            | `/api/v1/feed`              |
| **posts**           | Text, image, and video posts for users and businesses          | `/api/v1/posts`             |
| **products**        | Product catalog CRUD (business owners only for writes)         | `/api/v1/products`          |
| **orders**          | Shopping cart management and order lifecycle                    | `/api/v1/orders`            |
| **notifications**   | Notification listing, read status, unread count                | `/api/v1/notifications`     |
| **messaging**       | Conversations, messages, participants                          | `/api/v1/messaging`         |
| **search**          | Search across businesses, products, and users                  | `/api/v1/search`            |
| **recommendations** | Business stats and top-business rankings                       | `/api/v1/recommendations`   |

---

## API Routes

### Auth (`/api/v1/auth`)

| Method | Path                  | Auth | Description                   |
| ------ | --------------------- | ---- | ----------------------------- |
| POST   | `/register/customer`  | No   | Register a customer account   |
| POST   | `/register/business`  | No   | Register a business account   |
| POST   | `/login`              | No   | Login and receive JWT tokens  |

### Users (`/api/v1/users`)

All routes require authentication.

| Method | Path              | Description                        |
| ------ | ----------------- | ---------------------------------- |
| GET    | `/me`             | Get current user profile           |
| PATCH  | `/me`             | Update current user profile        |
| PATCH  | `/me/interests`   | Update current user interests      |
| GET    | `/me/followers`   | List users following me            |
| GET    | `/me/following`   | List users I follow                |
| GET    | `/me/friends`     | List mutual follow relationships   |
| GET    | `/:id`            | Get user by ID                     |
| POST   | `/:id/follow`     | Follow a user                      |
| DELETE | `/:id/follow`     | Unfollow a user                    |

### POV (`/api/v1/pov`)

All routes require authentication.

| Method | Path                      | Description                         |
| ------ | ------------------------- | ----------------------------------- |
| POST   | `/`                       | Create a POV (video upload)         |
| DELETE | `/:id`                    | Delete a POV                        |
| GET    | `/:id`                    | Get a single POV                    |
| GET    | `/business/:businessId`   | Get POVs for a business             |
| GET    | `/user/:userId`           | Get POVs by a user                  |
| POST   | `/:id/like`               | Like a POV                          |
| DELETE | `/:id/like`               | Unlike a POV                        |
| POST   | `/:id/comments`           | Add a comment to a POV              |
| GET    | `/:id/comments`           | Get comments for a POV              |

### Feed (`/api/v1/feed`)

All routes require authentication.

| Method | Path         | Description                                    |
| ------ | ------------ | ---------------------------------------------- |
| GET    | `/`          | Get personalized feed based on user interests  |
| GET    | `/trending`  | Get trending POVs by likes count               |

### Posts (`/api/v1/posts`)

All routes require authentication.

| Method | Path                      | Description                         |
| ------ | ------------------------- | ----------------------------------- |
| POST   | `/`                       | Create a post (up to 10 media files)|
| DELETE | `/:id`                    | Delete a post                       |
| GET    | `/user/:userId`           | Get posts by a user                 |
| GET    | `/business/:businessId`   | Get posts by a business             |

### Products (`/api/v1/products`)

All routes require authentication. Write operations restricted to `BUSINESS_OWNER` role.

| Method | Path                      | Auth Role        | Description                     |
| ------ | ------------------------- | ---------------- | ------------------------------- |
| POST   | `/`                       | BUSINESS_OWNER   | Create a product (up to 10 images) |
| PATCH  | `/:id`                    | BUSINESS_OWNER   | Update product details          |
| DELETE | `/:id`                    | BUSINESS_OWNER   | Delete a product                |
| GET    | `/business/:businessId`   | Any              | List products by business       |
| GET    | `/category/:category`     | Any              | List products by category       |
| PATCH  | `/:id/stock`              | BUSINESS_OWNER   | Update product stock            |
| PATCH  | `/:id/availability`       | BUSINESS_OWNER   | Toggle product availability     |

### Orders (`/api/v1/orders`)

All routes require authentication. Business-specific routes restricted to `BUSINESS_OWNER` role.

| Method | Path              | Auth Role        | Description                     |
| ------ | ----------------- | ---------------- | ------------------------------- |
| POST   | `/cart`            | Any              | Add item to cart                |
| GET    | `/cart`            | Any              | Get current cart                |
| PATCH  | `/cart/:id`        | Any              | Update cart item quantity        |
| DELETE | `/cart/:id`        | Any              | Remove item from cart           |
| POST   | `/`               | Any              | Create order from cart          |
| GET    | `/`               | Any              | Get my orders                   |
| GET    | `/business`       | BUSINESS_OWNER   | Get orders for my business      |
| GET    | `/:id`            | Any              | Get order details               |
| PATCH  | `/:id/status`     | BUSINESS_OWNER   | Update order status             |

### Notifications (`/api/v1/notifications`)

All routes require authentication.

| Method | Path              | Description                         |
| ------ | ----------------- | ----------------------------------- |
| GET    | `/`               | List notifications                  |
| GET    | `/unread-count`   | Get count of unread notifications   |
| PATCH  | `/:id/read`       | Mark a notification as read         |
| PATCH  | `/read-all`       | Mark all notifications as read      |

### Messaging (`/api/v1/messaging`)

All routes require authentication.

| Method | Path                                          | Description                        |
| ------ | --------------------------------------------- | ---------------------------------- |
| POST   | `/conversations`                              | Create a conversation              |
| GET    | `/conversations`                              | List my conversations              |
| GET    | `/conversations/:id/messages`                 | Get messages in a conversation     |
| PATCH  | `/conversations/:id/read`                     | Mark conversation as read          |
| POST   | `/conversations/:id/participants`             | Add participant to conversation    |
| DELETE | `/conversations/:id/participants/:userId`     | Remove participant                 |
| POST   | `/conversations/:id/messages`                 | Send message (with optional media) |

### Search (`/api/v1/search`)

All routes require authentication.

| Method | Path            | Description              |
| ------ | --------------- | ------------------------ |
| GET    | `/businesses`   | Search businesses        |
| GET    | `/products`     | Search products          |
| GET    | `/users`        | Search users             |

### Recommendations (`/api/v1/recommendations`)

All routes require authentication.

| Method | Path                    | Description                          |
| ------ | ----------------------- | ------------------------------------ |
| GET    | `/business/:id/stats`   | Get recommendation stats for a business |
| GET    | `/top`                  | Get top-ranked businesses            |

### Health Check

| Method | Path       | Auth | Description          |
| ------ | ---------- | ---- | -------------------- |
| GET    | `/health`  | No   | Returns `{ status: "ok" }` for Docker healthcheck |

---

## Socket.IO Namespaces

Both namespaces require JWT authentication via the `token` field in `socket.handshake.auth`.

### `/notifications`

Each user joins a personal room `user:<userId>` on connection.

| Event (Client -> Server)      | Payload              | Description                               |
| ----------------------------- | -------------------- | ----------------------------------------- |
| `notification:markRead`       | `notificationId`     | Mark a single notification as read        |
| `notification:markAllRead`    | --                   | Mark all notifications as read            |

| Event (Server -> Client)      | Payload              | Description                               |
| ----------------------------- | -------------------- | ----------------------------------------- |
| `notification:readConfirmed`  | Updated notification | Confirms single notification marked read  |
| `notification:allReadConfirmed` | Result object      | Confirms all notifications marked read    |
| `notification:error`          | `{ event, message }` | Error response                            |

### `/messaging`

On connection, each user automatically joins all their conversation rooms (`conv:<conversationId>`).

| Event (Client -> Server) | Payload                              | Description                              |
| ------------------------ | ------------------------------------ | ---------------------------------------- |
| `message:send`           | `{ conversationId, content? }`       | Send a text message to a conversation    |
| `message:typing`         | `{ conversationId }`                 | Broadcast typing indicator to the room   |
| `message:read`           | `{ conversationId }`                 | Mark conversation messages as read       |

| Event (Server -> Client) | Payload                                  | Description                              |
| ------------------------ | ---------------------------------------- | ---------------------------------------- |
| `message:new`            | New message object                       | Emitted to the room after message persist |
| `message:typing`         | `{ userId, conversationId }`             | Typing indicator broadcast               |
| `message:read`           | Read confirmation                        | Emitted to the room after marking read   |
| `error`                  | `{ message }`                            | Error response                           |

---

## Database

- **ORM**: Prisma v7 with PostgreSQL.
- **Schema location**: `prisma/schema.prisma`.
- **URL configuration**: Managed via `prisma.config.ts` and the `DATABASE_URL` environment variable (Prisma v7 convention).
- **Models (17)**: `User`, `BusinessProfile`, `POV`, `Post`, `Comment`, `Like`, `Product`, `Order`, `OrderItem`, `CartItem`, `Follow`, `Conversation`, `ConversationParticipant`, `Message`, `Notification`, `Report`.
- **Enums (8)**: `Role`, `BusinessType`, `PostType`, `OrderStatus`, `ConversationType`, `NotificationType`, `ReportTargetType`, `ReportStatus`.
- **Roles**: `CUSTOMER` and `BUSINESS_OWNER` with role-based route authorization.
- **Default currency**: KES (Kenyan Shilling).

---

## Configuration

All environment variables are validated at startup in `src/config/index.ts`. If any required variable is missing, the server fails fast with a descriptive error listing the missing keys.

### Required Environment Variables

| Variable                   | Description                                                |
| -------------------------- | ---------------------------------------------------------- |
| `NODE_ENV`                 | `development` or `production`                              |
| `FRONTEND_URL`             | Allowed CORS origin for the frontend                       |
| `BACKEND_URL`              | Public URL of this API                                     |
| `BACKEND_PORT`             | Port the HTTP server listens on                            |
| `DATABASE_URL`             | PostgreSQL connection string                               |
| `REDIS_URL`                | Redis connection URL (used by ioredis)                     |
| `REDIS_HOST`               | Redis host                                                 |
| `REDIS_PORT`               | Redis port                                                 |
| `REDIS_PASSWORD`           | Redis password                                             |
| `NEXTAUTH_SECRET`          | Shared secret with the Next.js frontend (NextAuth)         |
| `JWT_ACCESS_SECRET`        | Secret for signing access tokens                           |
| `JWT_REFRESH_SECRET`       | Secret for signing refresh tokens                          |
| `JWT_ACCESS_EXPIRY`        | Access token TTL (e.g., `15m`)                             |
| `JWT_REFRESH_EXPIRY`       | Refresh token TTL (e.g., `7d`)                             |
| `STORAGE_ENDPOINT`         | RustFS/MinIO host                                          |
| `STORAGE_PORT`             | RustFS/MinIO port                                          |
| `STORAGE_ACCESS_KEY`       | S3-compatible access key                                   |
| `STORAGE_SECRET_KEY`       | S3-compatible secret key                                   |
| `STORAGE_BUCKET_NAME`      | Default bucket name                                        |
| `STORAGE_USE_SSL`          | `true` or `false` for HTTPS to storage                     |
| `SOCKET_CORS_ORIGIN`       | Allowed CORS origin for Socket.IO                          |
| `RATE_LIMIT_WINDOW_MS`     | Rate limit window in milliseconds                          |
| `RATE_LIMIT_MAX_REQUESTS`  | Maximum requests per window                                |
| `BCRYPT_SALT_ROUNDS`       | bcrypt cost factor                                         |
| `MAX_FILE_SIZE`            | Maximum upload file size (bytes, passed to multer/express)  |
| `ALLOWED_FILE_TYPES`       | Comma-separated MIME types (e.g., `image/jpeg,video/mp4`)  |
| `LOG_LEVEL`                | Pino log level (`debug`, `info`, `warn`, `error`)          |

---

## Scripts

| Script          | Command                    | Description                                      |
| --------------- | -------------------------- | ------------------------------------------------ |
| `npm run dev`   | `tsx watch src/index.ts`   | Start dev server with hot reload                 |
| `npm run build` | `tsc`                      | Compile TypeScript to `dist/`                    |
| `npm start`     | `node dist/index.js`       | Run the compiled production build                |

---

## Docker

### Development (`Dockerfile.dev`)

- Base image: `node:22-alpine`
- Installs native build dependencies (`python3`, `make`, `g++`) for bcrypt.
- Runs `prisma generate` during build.
- Starts with `npx tsx watch src/index.ts` for hot reload.
- Source directory is typically volume-mounted from the host.

### Production (`Dockerfile.prod`)

Multi-stage build for a minimal runtime image:

1. **Builder stage**: Installs all dependencies, runs `prisma generate`, compiles TypeScript with `tsc`, then prunes dev dependencies.
2. **Runner stage**: Copies only `dist/`, `node_modules/`, `package.json`, and `prisma/` from the builder. Runs as a non-root `expressjs` user. Starts with `node dist/index.js`.
