# BuzzMap Implementation Plan

**Spec:** `docs/superpowers/specs/2026-04-05-buzzmap-technical-spec.md`
**Date:** 2026-04-05
**Last Updated:** 2026-04-05
**Status:** All 21 tasks complete. Backend TypeScript clean. Frontend builds successfully.

---

## Implementation Notes

- **Next.js 16** was installed (latest at time of scaffolding). The spec originally said 15 but 16 is backwards-compatible with App Router. Key difference: `middleware.ts` is now `proxy.ts`.
- **Prisma v7** — `url = env("DATABASE_URL")` is no longer valid inside the schema `datasource` block. Database URL is configured via `prisma.config.ts` at the project root.
- **shadcn base-nova style** with `base` primitives (not radix). Uses `render` prop instead of `asChild`. Forms use `FieldGroup` + `Field` + `FieldLabel`.
- **Tailwind v4** — theming via `@theme inline` block in `globals.css` using oklch semantic CSS variables. No `tailwind.config.ts`.
- **BuzzMap theme** mapped to shadcn semantic tokens: `--primary` = navy blue (oklch 0.27 0.07 255), `--accent` = amber (oklch 0.795 0.16 75), `--ring` = amber.

---

## Phase 1: Foundation (Tasks 1-4) -- COMPLETE

### Task 1: Project Scaffolding & Docker Setup -- DONE

**Goal:** Create the monorepo structure with both frontend and backend projects, Docker Compose files for dev and prod.

**Steps:**
1. Create `frontend/` — Initialize Next.js 16 with App Router, TypeScript strict mode
2. Install frontend dependencies: shadcn/ui, tailwind, lucide-react, sonner, socket.io-client, react-hook-form, zod, zustand, @tanstack/react-query, axios, next-auth@5, react-player
3. Configure shadcn/ui (init with base-nova style)
4. Configure Tailwind v4 with BuzzMap theme colors via oklch semantic tokens in globals.css
5. Create `backend/` — Initialize Node.js + Express + TypeScript project
6. Install backend dependencies: express, socket.io, @prisma/client, prisma, ioredis, zod, pino, helmet, cors, bcrypt, jsonwebtoken, @aws-sdk/client-s3, qrcode, express-rate-limit, rate-limit-redis, dotenv
7. Create `backend/tsconfig.json` with strict mode
8. Create `.env.example` with all env vars from spec (no values, just keys)
9. Create `.gitignore` (node_modules, .env, .env.prod, dist, .next, etc.)
10. Create `docker-compose.dev.yml` — all services with hot-reload, volumes, healthchecks, all config from `${ENV_VARS}`
11. Create `docker-compose.prod.yml` — multi-stage builds, optimized, restart always, all config from `${ENV_VARS}`
12. Create `frontend/Dockerfile.dev` and `frontend/Dockerfile.prod` (multi-stage standalone)
13. Create `backend/Dockerfile.dev` (tsx watch) and `backend/Dockerfile.prod` (multi-stage tsc)

**Review findings fixed:**
- Hardcoded MinIO console binding replaced with `${STORAGE_CONSOLE_PORT}`
- Minio ports mapped as `${STORAGE_PORT}:${STORAGE_PORT}` with `--address ":${STORAGE_PORT}"`
- Added healthchecks to frontend, backend, and rustfs services in dev compose
- Added `restart: always` to rustfs in prod compose
- Added port mappings for frontend/backend in prod compose
- Added `.env.prod` to `.gitignore`
- Added `dev`, `build`, `start` scripts to `backend/package.json`

**Files created:**
- `frontend/` (Next.js 16 project with shadcn base-nova)
- `backend/` (Express + TypeScript project)
- `docker-compose.dev.yml`, `docker-compose.prod.yml`
- `frontend/Dockerfile.dev`, `frontend/Dockerfile.prod`
- `backend/Dockerfile.dev`, `backend/Dockerfile.prod`
- `.env.example`, `.gitignore`

---

### Task 2: Backend Core — Config, App, Server -- DONE

**Goal:** Set up the Express app core with typed config, centralized routing, and Socket.IO server.

**Implementation details:**
- Config validates all 27 required env vars at startup, throws with clear list of missing keys
- Config exports nested object with numbers parsed, booleans converted, `ALLOWED_FILE_TYPES` split into array
- Error handler covers Zod v4 `.issues` API and Prisma P2002/P2025 codes
- Rate limiter has two variants: `createRateLimiter` (in-memory) and `createRateLimiterWithRedis` (Redis store)
- Logger uses pino-pretty transport in development only

**Review findings fixed:**
- Added `limit: config.maxFileSize` to `express.urlencoded()` parser

**Files created:**
- `backend/src/config/index.ts`
- `backend/src/core/app.ts`
- `backend/src/core/server.ts`
- `backend/src/core/routes.ts`
- `backend/src/shared/middleware/errorHandler.ts`
- `backend/src/shared/middleware/rateLimiter.ts`
- `backend/src/shared/utils/logger.ts`
- `backend/src/index.ts`

---

### Task 3: Shared Singletons — Prisma, Redis, Socket.IO, RustFS -- DONE

**Goal:** Create singleton instances for all shared services using the Singleton pattern.

**Implementation details:**
- All singletons use private instance, public getter (throws if uninitialized), init function
- Config uses nested keys: `config.redis.url`, `config.storage.endpoint`, etc.
- S3 client uses `region: 'us-east-1'` (required by AWS SDK, not used by MinIO/RustFS)
- `index.ts` updated to async `bootstrap()` function initializing all singletons

**Files created:**
- `backend/src/shared/prisma/index.ts`
- `backend/src/shared/redis/index.ts`
- `backend/src/shared/socket/index.ts`
- `backend/src/shared/storage/index.ts`

---

### Task 4: Database Schema — Prisma Models -- DONE

**Goal:** Create the full Prisma schema with all models, UUIDs, enums, relations, and strategic indexes.

**Implementation details:**
- Prisma v7: `url` field removed from `datasource` block (no longer supported)
- `prisma.config.ts` created at backend root with `migrate.url()` reading `DATABASE_URL` from env
- All 9 enums, 16 models, UUID primary keys, all specified indexes
- Schema validated with `npx prisma validate` and client generated with `npx prisma generate`

**Files created:**
- `backend/prisma/schema.prisma`
- `backend/prisma.config.ts`

---

## Phase 2: Auth & Users (Tasks 5-6) -- COMPLETE

### Task 5: Auth Module (Backend) -- DONE

**Goal:** Implement the auth module with MVCS pattern, Factory pattern for user creation.

**Implementation details:**
- CustomerFactory creates user with CUSTOMER role, hashes password with bcrypt
- BusinessOwnerFactory creates user + BusinessProfile atomically in `$transaction`
- Auth service generates JWT access + refresh tokens with secrets/expiry from config
- `authenticate` middleware extracts Bearer token, verifies, attaches `{ userId, role }` to `req.user`
- Global Express type augmentation for `req.user`

**Files created:**
- `backend/src/shared/factories/CustomerFactory.ts`
- `backend/src/shared/factories/BusinessOwnerFactory.ts`
- `backend/src/modules/auth/models/index.ts`
- `backend/src/modules/auth/validators/index.ts`
- `backend/src/modules/auth/services/authService.ts`
- `backend/src/modules/auth/controllers/authController.ts`
- `backend/src/modules/auth/routes.ts`
- `backend/src/shared/middleware/auth.ts`
- `backend/src/shared/middleware/authorize.ts`

---

### Task 6: Users Module (Backend) -- DONE

**Goal:** Implement user profile management, follow/unfollow, interests, friend detection.

**Implementation details:**
- 9 service functions: getProfile, getPublicProfile, updateProfile, updateInterests, followUser, unfollowUser, getFollowers, getFollowing, detectFriends
- Self-follow prevented with 400 error
- Duplicate follow detected via `findUnique` before create (409)
- `detectFriends` uses nested Prisma filter for mutual follows
- `assertAuthenticated` guard type-narrows `req.user`

**Files created:**
- `backend/src/modules/users/models/index.ts`
- `backend/src/modules/users/validators/index.ts`
- `backend/src/modules/users/services/userService.ts`
- `backend/src/modules/users/controllers/userController.ts`
- `backend/src/modules/users/routes.ts`

---

## Phase 3: Content & Feed (Tasks 7-9) -- COMPLETE

### Task 7: POV Module (Backend) -- DONE

**Goal:** Implement POV creation (video upload to RustFS), deletion, likes, comments, star rating, recommendations.

**Implementation details:**
- Multer with `memoryStorage`, file size from config, MIME type filter
- `uploadToStorage`, `deleteFromStorage`, `getSignedUrl` helpers using S3 SDK
- Like/unlike are idempotent (no crash on duplicate), counter updates in `$transaction`
- Comments increment `commentsCount` atomically
- Multipart body coercion for `starRating` (string → number) and `recommends` (string → boolean)
- @aws-sdk/s3-request-presigner installed for signed URLs

**Files created:**
- `backend/src/shared/storage/upload.ts`
- `backend/src/modules/pov/models/index.ts`
- `backend/src/modules/pov/validators/index.ts`
- `backend/src/modules/pov/services/povService.ts`
- `backend/src/modules/pov/controllers/povController.ts`
- `backend/src/modules/pov/routes.ts`

---

### Task 8: Feed Module (Backend) -- DONE

**Goal:** Implement interest-based POV feed with pagination.

**Implementation details:**
- FeedQueryBuilder with `filterByInterests()`, `paginate()`, `sortByTrending()`, `withinTimeframe()`, `build()`
- `getPersonalizedFeed` loads user interests from DB, falls back to chronological when no interests
- `getTrending` uses `sortByTrending()` + 7-day timeframe window
- Cursor-based pagination

**Files created:**
- `backend/src/shared/builders/FeedQueryBuilder.ts`
- `backend/src/modules/feed/models/index.ts`
- `backend/src/modules/feed/validators/index.ts`
- `backend/src/modules/feed/services/feedService.ts`
- `backend/src/modules/feed/controllers/feedController.ts`
- `backend/src/modules/feed/routes.ts`

---

### Task 9: Posts Module (Backend) -- DONE

**Goal:** Implement create/post feature for businesses and customers (text, images, videos).

**Implementation details:**
- Uses Prisma's `PostType` enum for type safety
- Media upload to RustFS via shared `uploadToStorage()` with `upload.array('media', 10)`
- Author-only deletion enforced with 403
- Offset-based pagination for post lists

**Files created:**
- `backend/src/modules/posts/models/index.ts`
- `backend/src/modules/posts/validators/index.ts`
- `backend/src/modules/posts/services/postService.ts`
- `backend/src/modules/posts/controllers/postController.ts`
- `backend/src/modules/posts/routes.ts`

---

## Phase 4: Marketplace (Tasks 10-11) -- COMPLETE

### Task 10: Products Module (Backend) -- DONE

**Goal:** Implement product shelf — CRUD, stock management, category filtering.

**Implementation details:**
- Ownership enforced via `getOwnedProduct()` helper (queries BusinessProfile by userId, cross-checks product's businessId)
- Images uploaded to RustFS under `products/` folder, resolved to signed URLs on read
- `getProductsByBusiness` is smart: business owners see all products (including unavailable), others see only `isAvailable: true`
- `updateProductSchema` uses `.refine` requiring at least one field
- All write routes use `authorize('BUSINESS_OWNER')` middleware

**Files created:**
- `backend/src/modules/products/models/index.ts`
- `backend/src/modules/products/validators/index.ts`
- `backend/src/modules/products/services/productService.ts`
- `backend/src/modules/products/controllers/productController.ts`
- `backend/src/modules/products/routes.ts`

---

### Task 11: Orders Module (Backend) -- DONE

**Goal:** Implement cart management and order flow.

**Implementation details:**
- `addToCart` upserts cart items, checks availability and stock
- `createOrderFromCart` uses single `$transaction`: validates stock, creates Order + OrderItems, decrements product stock, clears cart
- Total calculated from live product prices at checkout time
- Business orders filtered by `items.some.product.businessId`
- `updateOrderStatus` verifies business owns at least one product in the order
- Zod v4 `error` form used (v3 `errorMap` not supported)

**Files created:**
- `backend/src/modules/orders/models/index.ts`
- `backend/src/modules/orders/validators/index.ts`
- `backend/src/modules/orders/services/orderService.ts`
- `backend/src/modules/orders/controllers/orderController.ts`
- `backend/src/modules/orders/routes.ts`

---

## Phase 5: Real-time & Communication (Tasks 12-14) -- COMPLETE

### Task 12: Notifications Module (Backend) -- DONE

**Goal:** Implement real-time notifications via Socket.IO with DB persistence.

**Implementation details:**
- `createNotification` persists to DB then emits `notification:new` to `user:{userId}` room
- Socket namespace `/notifications` with JWT auth middleware via `authService.verifyAccessToken`
- Handles `notification:markRead` and `notification:markAllRead` socket events
- REST endpoints for paginated notification history with optional `read` filter
- Uses `Prisma.JsonNull` for nullable `data` field

**Files created:**
- `backend/src/modules/notifications/models/index.ts`
- `backend/src/modules/notifications/validators/index.ts`
- `backend/src/modules/notifications/services/notificationService.ts`
- `backend/src/modules/notifications/controllers/notificationController.ts`
- `backend/src/modules/notifications/routes.ts`
- `backend/src/modules/notifications/socket.ts`

---

### Task 13: Messaging Module (Backend) -- DONE

**Goal:** Implement in-app messaging — direct + group conversations, read receipts, media sharing.

**Implementation details:**
- `createConversation` deduplicates DIRECT conversations (same two participants)
- `sendMessage` uploads media to RustFS, persists to DB, then emits via Socket.IO
- `getConversations` includes unread count per conversation
- Cursor-based pagination for message history
- Socket namespace `/messaging` with JWT auth, room joining on connect
- `message:typing` is socket-only (no DB persistence)
- `markAsRead` bulk updates + socket emit confirmation

**Files created:**
- `backend/src/modules/messaging/models/index.ts`
- `backend/src/modules/messaging/validators/index.ts`
- `backend/src/modules/messaging/services/messagingService.ts`
- `backend/src/modules/messaging/controllers/messagingController.ts`
- `backend/src/modules/messaging/routes.ts`
- `backend/src/modules/messaging/socket.ts`

---

### Task 14: Search & Recommendations Modules (Backend) -- DONE

**Goal:** Implement search (businesses, products, users) and recommendation data aggregation.

**Implementation details:**
- All searches use Prisma's `contains` with `mode: 'insensitive'` for case-insensitive matching
- Products hard-filter `isAvailable: true`
- Business search computes `avgRating` and `reviewCount` from inline POV aggregation
- `getBusinessStats` aggregates star ratings, recommends, follows
- `getTopBusinesses` uses composite score: 60% rating + 40% recommendation %, with min-review threshold

**Files created:**
- `backend/src/modules/search/` (models, validators, services, controllers, routes)
- `backend/src/modules/recommendations/` (models, services, controllers, routes)

---

## Phase 6: Frontend (Tasks 15-21) -- COMPLETE

### Task 15: Frontend Scaffolding & Providers -- DONE

**Goal:** Set up Next.js providers, API client, socket client, theme, layout.

**Implementation details:**
- BuzzMap brand colors mapped to shadcn semantic tokens in `globals.css` using oklch
- Tailwind v4: `@theme inline` block (no `tailwind.config.ts`)
- NextAuth v5 with Credentials provider, JWT/session callbacks
- Type augmentation targets `@auth/core/jwt` (not `next-auth/jwt` which can't be augmented)
- Next.js 16: `proxy.ts` replaces `middleware.ts` (NextAuth auth handler cast to `NextProxy`)
- Socket provider manages `/notifications` and `/messaging` connections from session token
- TanStack Query with 60s stale time

**Files created:**
- `frontend/src/lib/api.ts`, `socket.ts`, `auth.ts`, `auth-types.ts`
- `frontend/src/providers/` (auth-provider, socket-provider, query-provider, index)
- `frontend/src/app/layout.tsx`, `frontend/src/app/api/auth/[...nextauth]/route.ts`
- `frontend/src/proxy.ts`
- `frontend/.env.example`

---

### Task 16: Frontend Auth Pages -- DONE

**Goal:** Build login, customer registration, business registration, forgot password pages using shadcn components.

**Implementation details:**
- All forms use `FieldGroup` + `Field` + `FieldLabel` (shadcn form pattern)
- Business registration uses `Tabs` for multi-step (Account / Business)
- Business type selection via `ToggleGroup` (PRODUCTS/SERVICES)
- Category selection via `Select` with `SelectGroup`
- Interest selection via Checkbox grid
- Loading states use `Spinner` with `data-icon="inline-start"` on Button
- Semantic color tokens throughout (bg-primary, text-accent, etc.)
- Link buttons use `render` prop (base-ui, not `asChild`)

**Files created:**
- `frontend/src/app/(auth)/layout.tsx`
- `frontend/src/app/(auth)/login/page.tsx`
- `frontend/src/app/(auth)/register/customer/page.tsx`
- `frontend/src/app/(auth)/register/business/page.tsx`
- `frontend/src/app/(auth)/forgot-password/page.tsx`

---

### Task 17: Frontend Customer Pages — Feed, POV, Search -- DONE

**Goal:** Build the customer-facing pages for content consumption and discovery.

**Implementation details:**
- Navbar with DropdownMenu for profile, Badge for unread notifications
- Sidebar using shadcn Sidebar component (SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton)
- POV card uses native `<video>` element (react-player had API compatibility issues)
- POV feed uses TanStack Query `useInfiniteQuery` with cursor-based pagination
- Empty states use shadcn `Empty` component
- Skeleton loading states throughout
- Star rating display with Lucide Star icons
- useNotifications and useMessages hooks listen to socket events

**Post-implementation fixes:**
- Replaced `asChild` with `render` prop on Button links (base-ui convention)
- Removed manual icon sizing classes inside components
- Replaced ReactPlayer with native `<video>` element

**Files created:**
- `frontend/src/components/shared/navbar.tsx`, `app-sidebar.tsx`, `sidebar.tsx`
- `frontend/src/components/feed/pov-card.tsx`, `pov-feed.tsx`
- `frontend/src/app/(customer)/layout.tsx`, `feed/page.tsx`, `search/page.tsx`, `pov/create/page.tsx`
- `frontend/src/hooks/useNotifications.ts`, `useMessages.ts`, `use-notifications.ts`

---

### Task 18: Frontend Customer Pages — Dashboard, Cart, Orders -- DONE

**Goal:** Build customer dashboard, shopping cart, and order history.

**Implementation details:**
- Dashboard with Card grid for recent POVs, active orders, notifications summary
- Cart with quantity controls, total calculation, checkout with Spinner loading
- Orders table with Badge variants for status colors
- Notifications list with unread styling and mark-read actions

**Files created:**
- `frontend/src/app/(customer)/dashboard/page.tsx`
- `frontend/src/app/(customer)/cart/page.tsx`
- `frontend/src/app/(customer)/orders/page.tsx`
- `frontend/src/app/(customer)/notifications/page.tsx`

---

### Task 19: Frontend Messaging Pages -- DONE

**Goal:** Build in-app messaging UI — conversation list and chat view.

**Implementation details:**
- ConversationList with ScrollArea, Avatar+AvatarFallback, unread Badge
- MessageBubble with own/other alignment, semantic colors (bg-accent for own, bg-muted for others)
- ChatView with auto-scroll, typing indicator, message input
- Real-time via socket (message:send, message:new, message:typing)

**Files created:**
- `frontend/src/components/messaging/conversation-list.tsx`, `chat-view.tsx`, `message-bubble.tsx`
- `frontend/src/app/(customer)/messages/page.tsx`
- `frontend/src/app/(customer)/messages/[conversationId]/page.tsx`

---

### Task 20: Frontend Business Pages -- DONE

**Goal:** Build business dashboard, product shelf management, analytics, public business profile.

**Implementation details:**
- Business layout with business-specific sidebar
- Product shelf with Dialog for add/edit forms, DropdownMenu for actions
- Order management table with status update Select
- Analytics page fetches from `/api/v1/recommendations/business/:id/stats`
- Settings page with FieldGroup form for all business profile fields
- Public business profile with Tabs (POVs / Products), follow button
- Public user profile with POV grid and follow button

**Post-implementation fix:**
- Fixed `onValueChange` type error in settings Select (null → empty string fallback)

**Files created:**
- `frontend/src/app/(business)/layout.tsx`, `dashboard/page.tsx`, `shelf/page.tsx`, `orders/page.tsx`, `posts/create/page.tsx`, `analytics/page.tsx`, `settings/page.tsx`
- `frontend/src/app/business/[id]/page.tsx`
- `frontend/src/app/user/[id]/page.tsx`

---

### Task 21: Frontend Landing Page (Placeholder) -- DONE

**Goal:** Create a simple placeholder landing page (21st.dev MCP will be used later for the full design).

**Implementation details:**
- BuzzMap title with semantic primary color
- Tagline "for you by you" in accent color
- CTA buttons to register/login using shadcn Button

**Files created:**
- `frontend/src/app/page.tsx`

---

## Build Verification

| Check | Result |
|---|---|
| Backend `npx tsc --noEmit` | Zero errors |
| Frontend `npx next build` | Compiles successfully, all routes rendered |
| Prisma `npx prisma validate` | Schema valid |
| Prisma `npx prisma generate` | Client generated (v7.6.0) |

## Route Summary

**Backend API routes (all under `/api/v1/`):**
- `/auth` — register/customer, register/business, login
- `/users` — me, profile CRUD, follow/unfollow, friends
- `/pov` — create, delete, like/unlike, comment, get by business/user
- `/feed` — personalized feed, trending
- `/posts` — create, delete, get by user/business
- `/products` — CRUD, stock, availability, by business/category
- `/orders` — cart CRUD, create order, order history, status updates
- `/notifications` — list, unread count, mark read
- `/messaging` — conversations, messages, participants
- `/search` — businesses, products, users
- `/recommendations` — business stats, top businesses

**Frontend routes:**
- `/` — Landing page
- `/login`, `/register/customer`, `/register/business`, `/forgot-password` — Auth
- `/feed`, `/search`, `/pov/create` — Content discovery
- `/dashboard`, `/cart`, `/orders`, `/notifications` — Customer account
- `/messages`, `/messages/[conversationId]` — Messaging
- `/business/dashboard`, `/business/shelf`, `/business/orders`, `/business/posts/create`, `/business/analytics`, `/business/settings` — Business management
- `/business/[id]` — Public business profile
- `/user/[id]` — Public user profile

**Socket.IO namespaces:**
- `/notifications` — notification:new, notification:markRead, notification:markAllRead
- `/messaging` — message:new, message:send, message:typing, message:read
