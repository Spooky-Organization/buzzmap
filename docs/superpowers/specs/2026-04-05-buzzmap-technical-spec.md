# BuzzMap Technical Specification

**Date:** 2026-04-05
**Status:** Approved
**Stack:** Next.js 15 + Express + PostgreSQL + Prisma + Redis + Socket.IO + shadcn/ui + Tailwind CSS

---

## 1. Overview

BuzzMap is a trust-driven marketplace where consumers discover businesses through authentic, real-time video reviews (POVs) shared by real customers. It combines social content (UGC feed), e-commerce (product shelf), and real-time messaging into a single platform targeting East African markets. Target users are men and women aged 16-45.

**Core value proposition:** Kill fake reviews by replacing static text with lived-moment video POVs. Businesses earn visibility through genuine customer experiences.

---

## 2. Project Structure

```
buzzmap/
├── frontend/                    # Next.js 15 + shadcn + Tailwind
│   ├── src/
│   │   ├── app/                 # App Router (pages & layouts)
│   │   │   ├── (auth)/          # Auth route group (login, register)
│   │   │   ├── (customer)/      # Customer routes (feed, search, dashboard)
│   │   │   ├── (business)/      # Business routes (profile, shelf, analytics)
│   │   │   └── api/auth/        # NextAuth route handler
│   │   ├── components/          # All shadcn + custom components
│   │   │   ├── ui/              # shadcn primitives
│   │   │   ├── feed/            # Feed-specific components
│   │   │   ├── messaging/       # Chat components
│   │   │   ├── pov/             # POV player, creation
│   │   │   └── shared/          # Layout, nav, honeycomb patterns
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Utils, socket client, API client
│   │   ├── providers/           # Context providers (auth, socket, theme)
│   │   └── types/               # Shared TypeScript types
│   ├── public/
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   ├── Dockerfile.dev
│   └── Dockerfile.prod
│
├── backend/                     # Express + Prisma + Socket.IO
│   ├── src/
│   │   ├── core/                # App bootstrap, server, centralized routes
│   │   │   ├── app.ts           # Express app setup + middleware
│   │   │   ├── server.ts        # HTTP + Socket.IO server
│   │   │   └── routes.ts        # Centralized route registry
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── models/      # Prisma type re-exports, interfaces
│   │   │   │   ├── controllers/ # Request handlers
│   │   │   │   ├── services/    # Business logic
│   │   │   │   ├── validators/  # Zod schemas
│   │   │   │   └── routes.ts    # Module route definitions
│   │   │   ├── users/
│   │   │   ├── feed/
│   │   │   ├── pov/
│   │   │   ├── messaging/
│   │   │   ├── notifications/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── search/
│   │   │   └── recommendations/
│   │   ├── shared/
│   │   │   ├── prisma/          # Prisma client singleton
│   │   │   ├── redis/           # Redis client singleton
│   │   │   ├── socket/          # Socket.IO singleton + namespace setup
│   │   │   ├── storage/         # RustFS/S3 client singleton
│   │   │   ├── middleware/      # Global middleware (error handler, cors, etc.)
│   │   │   ├── factories/       # User factories (Customer, BusinessOwner)
│   │   │   ├── builders/        # Query builders
│   │   │   └── utils/
│   │   └── config/              # Environment config, constants
│   ├── prisma/
│   │   └── schema.prisma
│   ├── Dockerfile.dev
│   └── Dockerfile.prod
│
├── docker-compose.dev.yml       # Dev: hot-reload, volumes, debug ports
├── docker-compose.prod.yml      # Prod: optimized builds, restart policies
└── docs/
```

---

## 3. Tech Stack & Dependencies

### Frontend

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI Library | shadcn/ui (strict — all UI built from shadcn components) |
| Styling | Tailwind CSS |
| Auth | NextAuth.js v5 |
| Icons | Lucide React |
| Toasts | Sonner |
| Real-time | socket.io-client |
| Forms | React Hook Form + Zod |
| State (client) | Zustand |
| State (server) | TanStack Query (React Query) |
| HTTP Client | Axios |
| Media | react-player (POV video playback) |

### Backend

| Concern | Choice |
|---|---|
| Runtime | Node.js + Express |
| Language | TypeScript (strict mode) |
| ORM | Prisma |
| Database | PostgreSQL |
| Cache/Pub-Sub | Redis |
| Real-time | Socket.IO (server) with Redis adapter |
| Validation | Zod |
| File Storage | RustFS (S3-compatible, via @aws-sdk/client-s3) |
| Auth | NextAuth callbacks + JWT verification middleware |
| Logging | Pino |
| QR Codes | qrcode (npm package) |
| Security Headers | Helmet.js |

### Infrastructure

| Concern | Choice |
|---|---|
| Containers | Docker + Docker Compose (dev & prod) |
| DB | PostgreSQL 16 (container) |
| Cache | Redis 7 (container) |
| Object Storage | RustFS (container) |

### Design Patterns

| Pattern | Usage |
|---|---|
| Singleton | Prisma client, Redis client, Socket.IO instance, RustFS client |
| Factory | CustomerFactory, BusinessOwnerFactory (user registration) |
| Builder | QueryBuilder for complex feed/search queries |
| MVCS | Model → Controller → Service → (Prisma/Redis) per module |

---

## 4. Database Schema

All primary keys are **UUIDs** (`@default(uuid())`). No sequential IDs.

### Users & Auth

- **User** — id (uuid), email, phone, password, name, avatar, role (CUSTOMER | BUSINESS_OWNER), interests[], location, createdAt, updatedAt
- **BusinessProfile** — id (uuid), userId (1:1 → User), businessName, description, category, type (PRODUCTS | SERVICES), location, coordinates, contactInfo, operatingHours, isVerified, qrCode, createdAt, updatedAt

### Content & POV

- **POV** — id (uuid), authorId (→ User), businessId (→ BusinessProfile), videoUrl, thumbnailUrl, caption, starRating (1-5), recommends (boolean), likesCount, commentsCount, createdAt
- **Post** — id (uuid), authorId (→ User), businessId (→ BusinessProfile), type (TEXT | IMAGE | VIDEO), content, mediaUrls[], createdAt
- **Comment** — id (uuid), userId (→ User), povId (→ POV), content, createdAt
- **Like** — id (uuid), userId (→ User), povId (→ POV), createdAt (unique constraint on userId + povId)

### Marketplace

- **Product** — id (uuid), businessId (→ BusinessProfile), name, description, price, currency, images[], stock, category, isAvailable, createdAt, updatedAt
- **Order** — id (uuid), customerId (→ User), status (PENDING | CONFIRMED | COMPLETED | CANCELLED), totalAmount, createdAt, updatedAt
- **OrderItem** — id (uuid), orderId (→ Order), productId (→ Product), quantity, price
- **CartItem** — id (uuid), userId (→ User), productId (→ Product), quantity

### Social

- **Follow** — id (uuid), followerId (→ User), followingId (→ User), createdAt (unique constraint on followerId + followingId)
- **Conversation** — id (uuid), type (DIRECT | GROUP), name (for groups), createdAt, updatedAt
- **ConversationParticipant** — id (uuid), conversationId (→ Conversation), userId (→ User), joinedAt
- **Message** — id (uuid), conversationId (→ Conversation), senderId (→ User), content, mediaUrl, readAt, createdAt

### Platform

- **Notification** — id (uuid), userId (→ User), type (POV_POSTED | ORDER_UPDATE | NEW_FOLLOWER | MESSAGE | FRIEND_JOINED), title, body, data (JSON), read (boolean), createdAt
- **Report** — id (uuid), reporterId (→ User), targetType (POV | USER | BUSINESS), targetId (uuid), reason, status (PENDING | REVIEWED | RESOLVED), createdAt

---

## 5. Database Indexing Strategy

Strategic indexes on high-traffic queries only. No blanket indexing.

### Indexed

| Table | Index | Reason |
|---|---|---|
| User | `email` (unique) | Login lookup |
| User | `phone` (unique) | Phone auth lookup |
| POV | `businessId, createdAt` (composite) | Business profile POV feed |
| POV | `authorId` | User's POV history |
| Product | `businessId, isAvailable` (composite) | Product shelf queries |
| Product | `category` | Category search/filter |
| Order | `customerId, status` (composite) | Customer order history |
| Follow | `followerId, followingId` (unique composite) | Prevent duplicate follows, fast lookup |
| Like | `userId, povId` (unique composite) | Prevent duplicate likes, fast "did I like this?" check |
| Message | `conversationId, createdAt` (composite) | Chat history pagination |
| Notification | `userId, read, createdAt` (composite) | Unread notifications feed |
| CartItem | `userId` | Cart retrieval |

### Not Indexed (by design)

- `Comment.content` — no full-text search on comments in MVP
- `Post.content` — same reasoning
- `Report` table — low volume, admin-only queries
- `ConversationParticipant` — small result sets per conversation
- Any column only used in writes, not reads

New indexes are added based on actual query performance data (slow query logs), not speculation.

---

## 6. Security (OWASP Top 10 Compliance)

Security is built in from day one, not bolted on.

| OWASP Risk | Mitigation |
|---|---|
| **A01: Broken Access Control** | Role-based middleware (CUSTOMER/BUSINESS_OWNER), resource ownership checks on every mutation, centralized permission middleware per route |
| **A02: Cryptographic Failures** | Passwords hashed with bcrypt (rounds from `${BCRYPT_SALT_ROUNDS}`), JWTs signed with RS256 (keys from `${JWT_ACCESS_SECRET}` / `${JWT_REFRESH_SECRET}`), all secrets in env vars never committed, HTTPS enforced in prod |
| **A03: Injection** | Prisma parameterized queries (no raw SQL), Zod validation on every input, sanitize HTML in user content (DOMPurify on frontend, sanitize-html on backend) |
| **A04: Insecure Design** | Rate limiting on auth endpoints (express-rate-limit + Redis store), business can't delete negative POVs (enforced at service layer), users can't POV without being verified clients |
| **A05: Security Misconfiguration** | Helmet.js for HTTP headers, CORS whitelist (`${FRONTEND_URL}` only), disable X-Powered-By, separate dev/prod configs, no default credentials |
| **A06: Vulnerable Components** | npm audit in CI, lock file committed, dependency update automation |
| **A07: Auth Failures** | NextAuth handles session securely, JWT expiry (`${JWT_ACCESS_EXPIRY}` / `${JWT_REFRESH_EXPIRY}`), account lockout after failed attempts, Redis-backed session blacklist |
| **A08: Data Integrity** | Validate file uploads (type, size, magic bytes), signed URLs for RustFS uploads, Content-Security-Policy headers |
| **A09: Logging & Monitoring** | Pino structured logging on all requests, log auth events (login, failed attempts, role changes), audit trail on all sensitive operations |
| **A10: SSRF** | Validate and whitelist external URLs, no user-controlled URLs in server-side fetches, RustFS accessed via internal Docker network only |

### Additional Security Measures

- CSRF protection via NextAuth's built-in CSRF tokens
- Request body size limits (`${MAX_FILE_SIZE}` for uploads)
- SQL injection impossible via Prisma's query engine
- XSS prevention: React's default escaping + CSP headers + sanitization on user-generated HTML
- All inter-service communication within Docker network (not exposed externally)
- Zero hardcoded credentials, ports, or secrets — everything from `.env`

---

## 7. Backend Modules (MVCS)

### Architecture Per Module

```
modules/<name>/
  models/        → TypeScript interfaces, Prisma type re-exports
  controllers/   → Parse request, call service, return response
  services/      → Business logic, validation, calls Prisma/Redis
  validators/    → Zod schemas for request validation
  routes.ts      → Module route definitions
```

### Request Flow

```
Client → Express → Global Middleware (Helmet, CORS, body parser)
→ Centralized Router → Module Route → Validation Middleware (Zod)
→ Auth Middleware (JWT verify) → Controller → Service → Prisma/Redis → Response
```

### MVP Modules

| Module | Responsibility |
|---|---|
| `auth` | Registration (Factory pattern), login, session verification, password reset |
| `users` | Profile CRUD, interests, follow/unfollow, friend detection |
| `feed` | Interest-based POV feed, pagination, sponsored content slot (future) |
| `pov` | Create/delete POV (video upload to RustFS), like, comment, star rating, recommend |
| `messaging` | Conversations (direct + group), send/receive messages, read receipts, media sharing — all via Socket.IO with DB persistence |
| `notifications` | Real-time via Socket.IO, persisted to DB, mark read |
| `products` | Product shelf CRUD, stock management, category filtering |
| `orders` | Cart management, checkout flow (in-app messaging with seller, M-Pesa payments module later) |
| `search` | Search businesses, products, users by keyword + category + location |
| `recommendations` | Star/recommend data aggregation, business ranking |

### Centralized Routes

All module routes imported and registered in `core/routes.ts`:

```typescript
import authRoutes from '../modules/auth/routes';
import userRoutes from '../modules/users/routes';
import feedRoutes from '../modules/feed/routes';
import povRoutes from '../modules/pov/routes';
import messagingRoutes from '../modules/messaging/routes';
import notificationRoutes from '../modules/notifications/routes';
import productRoutes from '../modules/products/routes';
import orderRoutes from '../modules/orders/routes';
import searchRoutes from '../modules/search/routes';

export function registerRoutes(app: Express) {
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/feed', feedRoutes);
  app.use('/api/v1/pov', povRoutes);
  app.use('/api/v1/messaging', messagingRoutes);
  app.use('/api/v1/notifications', notificationRoutes);
  app.use('/api/v1/products', productRoutes);
  app.use('/api/v1/orders', orderRoutes);
  app.use('/api/v1/search', searchRoutes);
}
```

---

## 8. Real-time Architecture (Socket.IO)

### No Polling Policy

Socket.IO eliminates all API polling. Rate limits are reserved for intentional user actions only (login, submit, search). All real-time updates flow through the socket:

- Feed updates → server emits `pov:new`
- Notifications → pushed instantly via socket
- Messages → fully socket-driven
- Order status → server emits `order:statusChanged`

HTTP requests are only for: user-initiated actions and initial page loads.

### Namespaces

| Namespace | Events (Server → Client) | Events (Client → Server) |
|---|---|---|
| `/notifications` | `notification:new`, `notification:read` | `notification:markRead`, `notification:markAllRead` |
| `/messaging` | `message:new`, `message:read`, `conversation:updated` | `message:send`, `message:typing`, `message:read` |
| `/feed` | `pov:new`, `pov:liked`, `pov:commented` | `feed:subscribe` (interests) |

### Connection Flow

1. Client connects with JWT token in `auth` handshake
2. Socket middleware verifies JWT, attaches userId to socket
3. User auto-joins personal room (`user:{userId}`)
4. For messaging — user joins rooms for each conversation (`conv:{conversationId}`)
5. For feed — user joins interest-based rooms (`interest:{category}`)

### Persistence

- All messages persisted to PostgreSQL **before** emitting to recipients
- Notifications persisted to DB, then pushed via socket
- Offline users receive missed events on next connection via DB query
- Redis adapter enables horizontal scaling (multiple server instances share socket state)

---

## 9. Frontend Architecture

### Route Structure (App Router)

```
src/app/
├── (auth)/
│   ├── login/page.tsx
│   ├── register/
│   │   ├── customer/page.tsx
│   │   └── business/page.tsx
│   └── forgot-password/page.tsx
├── (customer)/
│   ├── feed/page.tsx
│   ├── search/page.tsx
│   ├── messages/
│   │   ├── page.tsx                    # Conversations list
│   │   └── [conversationId]/page.tsx   # Chat view
│   ├── pov/create/page.tsx
│   ├── notifications/page.tsx
│   ├── dashboard/page.tsx
│   ├── cart/page.tsx
│   └── orders/page.tsx
├── (business)/
│   ├── dashboard/page.tsx
│   ├── shelf/page.tsx                  # Product management
│   ├── orders/page.tsx
│   ├── posts/create/page.tsx
│   ├── analytics/page.tsx              # Reviews, followers, traffic
│   └── settings/page.tsx
├── business/[id]/page.tsx              # Public business profile
├── user/[id]/page.tsx                  # Public user profile
├── layout.tsx                          # Root layout (providers, nav)
└── page.tsx                            # Landing page (21st.dev later)
```

### Frontend Patterns

| Pattern | Implementation |
|---|---|
| Auth guard | NextAuth middleware — redirect unauthenticated users, role-based route protection |
| Socket provider | React context wrapping socket.io-client, auto-connects on auth, exposes hooks: `useSocket()`, `useNotifications()`, `useMessages()` |
| API client | Centralized Axios instance with JWT interceptor, base URL from `${BACKEND_URL}`, error handling |
| Component rule | **Every UI element is a shadcn component or composed from shadcn primitives** — no custom HTML buttons, inputs, dialogs, etc. |
| Toast | Sonner for all user feedback (success, error, info) |
| Icons | Lucide React exclusively |
| Theme | Tailwind config with custom colors: navy blue (primary), amber (accent), white (contrast) — honeycomb SVG pattern as background element |

### State Management

| Type | Tool |
|---|---|
| Server state | TanStack Query — caching, refetching, optimistic updates |
| Client state | Zustand — cart, socket connection status, UI toggles |
| Auth state | NextAuth `useSession()` hook |

---

## 10. Docker Setup

### Dev Environment (`docker-compose.dev.yml`)

| Service | Base | Hot Reload | Notes |
|---|---|---|---|
| frontend | Node 20 + `next dev` | Volume mount `./frontend/src` → container | HMR enabled |
| backend | Node 20 + `tsx watch` | Volume mount `./backend/src` → container | File watcher restart |
| postgres | postgres:16 | Persistent volume | Healthcheck enabled |
| redis | redis:7-alpine | Persistent volume | Healthcheck enabled |
| rustfs | RustFS | Persistent volume for buckets | API + Console |

- All services on shared Docker network (`buzzmap-network`)
- All ports, credentials, and config from `${ENV_VARS}`
- Backend waits for Postgres + Redis via `depends_on` with healthchecks

### Prod Environment (`docker-compose.prod.yml`)

| Concern | Dev | Prod |
|---|---|---|
| Build | No build, runs source | Multi-stage builds, optimized images |
| Next.js | `next dev` | `next build && next start` |
| Backend | `tsx watch` | `tsc && node dist/` |
| Volumes | Source mounted for hot reload | No source mounts, code baked into image |
| Debugging | Debug ports exposed | No debug ports |
| Restart | `no` | `always` |
| Logging | Console | Pino JSON to stdout |

---

## 11. Environment Configuration

**HARD RULE: Zero hardcoded values.** All ports, credentials, URLs, and configuration flow through `.env`. Code, Docker Compose files, and documentation reference `${ENV_VARS}` only. No fallback values. No defaults in code.

### Required Environment Variables

```
# App
NODE_ENV=
FRONTEND_URL=
BACKEND_URL=
NEXT_PUBLIC_SITE_URL=
FRONTEND_BIND_HOST=
BACKEND_BIND_HOST=

# Database
DATABASE_HOST=
DATABASE_BIND_HOST=
DATABASE_PORT=
DATABASE_NAME=
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_URL=
DATABASE_INTERNAL_PORT=

# Redis
REDIS_HOST=
REDIS_BIND_HOST=
REDIS_PORT=
REDIS_PASSWORD=
REDIS_URL=
REDIS_INTERNAL_PORT=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# JWT
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRY=
JWT_REFRESH_EXPIRY=

# RustFS (S3-compatible)
STORAGE_ENDPOINT=
STORAGE_BIND_HOST=
STORAGE_CONSOLE_BIND_HOST=
STORAGE_PORT=
STORAGE_CONSOLE_PORT=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
STORAGE_BUCKET_NAME=
STORAGE_USE_SSL=

# Socket.IO
SOCKET_CORS_ORIGIN=

# Rate Limiting
RATE_LIMIT_WINDOW_MS=
RATE_LIMIT_MAX_REQUESTS=

# Bcrypt
BCRYPT_SALT_ROUNDS=

# File Upload
MAX_FILE_SIZE=
ALLOWED_FILE_TYPES=

# Server
BACKEND_PORT=
FRONTEND_PORT=

# Logging
LOG_LEVEL=
```

### Enforcement

- Docker Compose uses `${VAR}` syntax for all ports, credentials, and config
- Backend `config/index.ts` validates all required env vars on boot — app crashes immediately if any are missing (no silent fallbacks)
- `.env` is in `.gitignore` — only `.env.example` is committed (with empty values as shown above)
- Documentation references `${VAR_NAME}` — never actual values or ports

---

## 12. Future Modules (Post-MVP)

These are explicitly out of MVP scope but the modular architecture supports plug-and-play integration:

| Module | Description |
|---|---|
| `payments` | M-Pesa integration via Safaricom Daraja API (STK push, C2B, B2C) |
| `ads` | Paid recommendation ads, engagement-weighted feed algorithm, sponsored content |
| `analytics` | Business subscription tier — bulk listing tools, traffic analytics, advertising features |
| `admin` | Platform admin panel — content moderation, business verification, dispute resolution |

---

## 13. Visual Design

| Element | Specification |
|---|---|
| Primary color | Navy Blue — trust and reliability |
| Accent color | Amber — the colour of the bee |
| Contrast | White — for text against navy blue |
| Tagline color | Amber — "for you by you" |
| Pattern | Honeycomb vector pattern used as background/decorative element |
| Landing page | Built with 21st.dev MCP (post-MVP) |

---

## 14. Revenue Model (Informational)

- Recommendation ads (paid promotion on feeds)
- 4% commission on all platform sales (goods and reservations)
- Subscription model for businesses (analytics, bulk listing, advertising tools)
- Everything else is free for MVP

---

## 15. Out of Scope (Business Rules)

- Businesses **cannot** delete POVs showing bad experiences
- Businesses **cannot** accept payment outside the platform
- Businesses **cannot** manufacture/fake POVs
- Users **cannot** leave POVs without being verified clients of the business
