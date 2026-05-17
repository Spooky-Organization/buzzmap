# BuzzMap

**For you, by you.**

A social commerce platform that brings together POV video reviews, local business discovery, marketplace shopping, and real-time messaging -- all in one place. Customers find products through authentic video reviews, while business owners build their digital storefront and reach new audiences organically.

---

## Key Features

- **Dual Registration** -- sign up as a Customer or Business Owner, each with tailored dashboards and permissions
- **POV Video Reviews** -- record and share point-of-view video reviews with star ratings
- **Interest-Based Feed** -- personalized content feed driven by your selected interests
- **Trending Discovery** -- surface trending reviews, products, and businesses in real time
- **Business Product Shelf & Marketplace** -- business owners list products; customers browse and shop
- **Cart & Order Management** -- full shopping cart, checkout flow, and order tracking
- **Real-Time Notifications** -- instant updates via Socket.IO for orders, follows, and interactions
- **In-App Messaging** -- direct and group conversations between users
- **Search & Recommendations** -- find businesses, products, and creators with smart suggestions
- **Social Graph** -- follow/unfollow users and businesses to curate your feed

---

## Tech Stack

| Category | Technologies |
|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, NextAuth v5, TanStack Query, Zustand, Socket.IO Client, Framer Motion |
| **Backend** | Express 5, TypeScript, Prisma v7, PostgreSQL 16, Redis 7, Socket.IO, Pino, Zod, Helmet |
| **Storage** | RustFS (S3-compatible) via AWS SDK v3 |
| **Infrastructure** | Docker, Docker Compose, Nginx (production reverse proxy) |

---

## Architecture

BuzzMap is organized as a **monorepo** with two primary applications:

- **`frontend/`** -- Next.js App Router with route groups (`(auth)`, `(customer)`, `business`) for role-based layouts
- **`backend/`** -- Express API using a **modular MVCS (Model-View-Controller-Service)** pattern with 12 domain modules

### Backend Modules

| Module | Responsibility |
|---|---|
| `auth` | Registration, login, JWT tokens, MFA, sessions |
| `users` | User profiles, preferences, account management |
| `business` | Business profiles, settings, follow/unfollow |
| `feed` | Personalized and trending content feeds |
| `posts` | Content creation, likes, comments |
| `pov` | POV video reviews with ratings |
| `products` | Product catalog and business shelf |
| `orders` | Cart, checkout, order lifecycle |
| `messaging` | Direct and group messaging |
| `notifications` | Real-time notification delivery |
| `search` | Full-text search across entities |
| `recommendations` | Interest-based content suggestions |

---

## Project Structure

```
buzzmap/
├── frontend/                  # Next.js 16 application
│   ├── src/
│   │   └── app/               # App Router (route groups, pages, layouts)
│   ├── public/                # Static assets
│   ├── Dockerfile.dev
│   └── Dockerfile.prod
├── backend/                   # Express API
│   ├── src/
│   │   ├── modules/           # 11 domain modules (MVCS pattern)
│   │   └── ...                # Core server setup, config, shared utilities
│   ├── prisma/                # Prisma schema and migrations
│   ├── Dockerfile.dev
│   └── Dockerfile.prod
├── docker-compose.dev.yml     # Development environment
├── docker-compose.prod.yml    # Production environment
├── .env.example               # Environment variable template
└── .gitignore
```

---

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js 20+](https://nodejs.org/) (for local development outside Docker)

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/Matthew-kabiu/Buzzmap.git
   cd Buzzmap
   ```

2. **Create your environment file**

   ```bash
   cp .env.example .env.dev
   ```

3. **Fill in the environment variables** -- open `.env.dev` and provide values for database credentials, JWT secrets, storage keys, and other configuration (see [Environment Variables](#environment-variables) below).

4. **Start the development stack**

   ```bash
   docker compose --env-file .env.dev -f docker-compose.dev.yml up --build
   ```

5. **Access the application**
   - Frontend: use the URL defined by `FRONTEND_URL`
   - Backend API: use the URL defined by `BACKEND_URL`
   - RustFS Console: construct the console URL from `STORAGE_ENDPOINT` and `STORAGE_CONSOLE_PORT`

---

## Environment Variables

All configuration is managed through a single `.env` file at the project root. See `.env.example` for the full template.

| Category | Variables |
|---|---|
| **App** | `NODE_ENV`, `FRONTEND_URL`, `BACKEND_URL`, `NEXT_PUBLIC_SITE_URL`, `FRONTEND_BIND_HOST`, `BACKEND_BIND_HOST` |
| **Database** | `DATABASE_HOST`, `DATABASE_BIND_HOST`, `DATABASE_PORT`, `DATABASE_INTERNAL_PORT`, `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_URL` |
| **Redis** | `REDIS_HOST`, `REDIS_BIND_HOST`, `REDIS_PORT`, `REDIS_INTERNAL_PORT`, `REDIS_PASSWORD`, `REDIS_URL` |
| **Authentication** | `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRY`, `JWT_REFRESH_EXPIRY` |
| **Storage (RustFS)** | `STORAGE_ENDPOINT`, `STORAGE_BIND_HOST`, `STORAGE_CONSOLE_BIND_HOST`, `STORAGE_PORT`, `STORAGE_CONSOLE_PORT`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`, `STORAGE_BUCKET_NAME`, `STORAGE_USE_SSL` |
| **Socket.IO** | `SOCKET_CORS_ORIGIN` |
| **Security** | `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`, `BCRYPT_SALT_ROUNDS` |
| **Uploads** | `MAX_FILE_SIZE`, `ALLOWED_FILE_TYPES` |
| **Server** | `BACKEND_PORT`, `FRONTEND_PORT` |
| **Logging** | `LOG_LEVEL` |
| **Seed** | `RUN_DB_SEED`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_NAME`, `SEED_ADMIN_PASSWORD`, `SEED_SAMPLE_DATA`, `SEED_SAMPLE_PASSWORD` |

---

## Docker Services

| Service | Image / Build | Purpose |
|---|---|---|
| **frontend** | `./frontend` (Dockerfile) | Next.js application |
| **backend** | `./backend` (Dockerfile) | Express API server |
| **postgres** | `postgres:16-alpine` | Primary database |
| **redis** | `redis:7-alpine` | Session store, caching, rate limiting |
| **rustfs** | `minio/minio:latest` | S3-compatible object storage for media |

All services communicate over a shared `buzzmap-network` bridge and use health checks to manage startup order.

---

## Development

The development stack uses `docker-compose.dev.yml`:

- **Hot reload** -- source directories (`src/`, `public/`, `prisma/`) are bind-mounted into containers
- **Named volumes** for `node_modules` to avoid host/container conflicts
- **Env-controlled port bindings** for direct access to Postgres, Redis, and the RustFS console
- Backend runs via `tsx watch` for instant TypeScript reloading
- Backend startup runs Prisma migrations first and then runs `prisma db seed` when `RUN_DB_SEED=true`
- Kenyan demo data can be added on startup by setting `SEED_SAMPLE_DATA=true`; sample passwords live in `.env.dev`, not in code

```bash
# Start
docker compose --env-file .env.dev -f docker-compose.dev.yml up --build

# Stop
docker compose --env-file .env.dev -f docker-compose.dev.yml down

# Reset volumes (full clean)
docker compose --env-file .env.dev -f docker-compose.dev.yml down -v
```

Sample data notes:

- The seed keeps the existing admin path and adds Kenyan demo users, businesses, products, POVs, follows, orders, conversations, and notifications on top.
- Demo account emails are stable for repeatable local testing, while the admin and sample passwords are read from `SEED_ADMIN_PASSWORD` and `SEED_SAMPLE_PASSWORD`.
- The seeded businesses currently represent Nairobi, Mombasa, and Eldoret contexts to match the intended market.

---

## Production

The production stack uses `docker-compose.prod.yml`:

- **Multi-stage Docker builds** for optimized, minimal images
- **Automatic restarts** (`restart: always`) on all services
- **Redis AOF persistence** enabled for durability
- Internal-only networking for Postgres, Redis, and RustFS (no exposed ports)
- Environment loaded from `.env.prod`

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

---

## API Documentation

All backend API routes are served under the `/api/v1/` prefix.

```
Base URL: ${BACKEND_URL}/api/v1/
```

Route groups include:

| Prefix | Module |
|---|---|
| `/api/v1/auth` | Authentication and registration |
| `/api/v1/users` | User profiles and settings |
| `/api/v1/feed` | Content feeds |
| `/api/v1/posts` | Posts and interactions |
| `/api/v1/pov` | POV video reviews |
| `/api/v1/products` | Product catalog |
| `/api/v1/orders` | Orders and order management |
| `/api/v1/cart` | Shopping cart |
| `/api/v1/business` | Business profiles and follows |
| `/api/v1/messaging` | Conversations |
| `/api/v1/notifications` | Notification streams |
| `/api/v1/search` | Search |
| `/api/v1/recommendations` | Recommendations |

For detailed route documentation, see [`backend/README.md`](./backend/README.md).

---

## License

This is proprietary software. All rights reserved. See [LICENSE](./LICENSE) for details.
