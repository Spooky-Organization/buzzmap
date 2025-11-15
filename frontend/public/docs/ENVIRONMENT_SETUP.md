# Environment Setup Documentation

## Overview

This Authentication Template supports two distinct environments: **Development** and **Production**. Each environment is configured with Docker Compose to orchestrate multiple services including frontend, backend, database, cache, and development tools.

## Table of Contents

1. [Environment Architecture](#environment-architecture)
2. [Development Environment](#development-environment)
3. [Production Environment](#production-environment)
4. [Service Integration](#service-integration)
5. [Environment Variables](#environment-variables)
6. [Network Configuration](#network-configuration)
7. [Volume Management](#volume-management)
8. [Health Checks](#health-checks)
9. [Port Configuration](#port-configuration)
10. [Build Process](#build-process)
11. [Deployment Guide](#deployment-guide)

---

## Environment Architecture

### Service Overview

Both environments consist of the following services:

| Service | Purpose | Development | Production |
|---------|---------|-------------|------------|
| **Frontend** | React application UI | Vite dev server (hot reload) | Nginx (static files) |
| **Backend** | Express.js API server | Node.js with hot reload | Compiled Node.js |
| **PostgreSQL** | Primary database | Postgres 15 Alpine | Postgres 15 Alpine |
| **Redis** | Cache & session store | Redis 7 Alpine | Redis 7 Alpine |
| **Prisma Studio** | Database GUI tool | Available | Available |

### Environment Comparison

| Feature | Development | Production |
|---------|-------------|------------|
| **Hot Reload** | ✅ Enabled | ❌ Disabled |
| **Source Code Mounting** | ✅ Volume mounts | ❌ Built into image |
| **Build Optimization** | ⚠️ Minimal | ✅ Multi-stage builds |
| **Resource Limits** | ❌ None | ✅ Configured |
| **Debugging Tools** | ✅ Full access | ⚠️ Limited |
| **Error Messages** | ✅ Verbose | ⚠️ Sanitized |

---

## Development Environment

### Purpose

The development environment is optimized for **fast iteration**, **hot reloading**, and **debugging**. Source code is mounted as volumes, allowing changes to reflect immediately without rebuilding containers.

### Configuration Files

- **Docker Compose**: `docker-compose.dev.yml`
- **Environment File**: `.env.development`
- **Backend Dockerfile**: `backend/Dockerfile.dev`
- **Frontend Dockerfile**: `frontend/Dockerfile.dev`

### Service Details

#### Frontend Service

**Container**: `frontend_service_dev`  
**Image**: Built from `frontend/Dockerfile.dev`  
**Base Image**: `node:20-alpine`

**Features**:
- ✅ Vite dev server with Hot Module Replacement (HMR)
- ✅ Source code mounted as volumes for live updates
- ✅ Polling enabled for Docker volume compatibility
- ✅ Environment variables available at runtime

**Ports**:
- `3000:3000` (Vite dev server)

**Volume Mounts**:
```yaml
- ./frontend/src:/app/src:rw                    # Source code (read-write)
- ./frontend/public:/app/public:ro              # Static assets (read-only)
- ./frontend/vite.config.ts:/app/vite.config.ts:ro
- ./frontend/tsconfig.json:/app/tsconfig.json:ro
- ./frontend/tailwind.config.js:/app/tailwind.config.js:ro
- ./frontend/postcss.config.js:/app/postcss.config.js:ro
- ./frontend/.eslintrc.cjs:/app/.eslintrc.cjs:ro
- ./frontend/package.json:/app/package.json:ro
- ./frontend/.env:/app/.env:ro
- /app/node_modules                            # Anonymous volume (excluded)
- /app/dist                                     # Anonymous volume (excluded)
```

**Environment Variables**:
- `NODE_ENV=development`
- `VITE_API_BASE_URL=http://localhost:5000/api/v1` (runtime)
- `VITE_APP_NAME=Authentication Template`
- `VITE_ENVIRONMENT=development`

**Health Check**:
- Endpoint: `http://localhost:3000`
- Interval: 30s
- Timeout: 10s
- Start Period: 10s
- Retries: 3

**Dependencies**:
- Waits for `backend` service to be healthy

#### Backend Service

**Container**: `backend_service_dev`  
**Image**: Built from `backend/Dockerfile.dev`  
**Base Image**: `node:20-alpine`

**Features**:
- ✅ TypeScript compilation with `ts-node-dev`
- ✅ Hot reload with nodemon/ts-node-dev
- ✅ Source code mounted as volumes
- ✅ Prisma migrations run automatically
- ✅ Logs directory mounted for debugging

**Ports**:
- `5000:5000` (Express API server)

**Volume Mounts**:
```yaml
- ./backend/auth_module/src:/app/auth_module/src:rw  # Source code (read-write)
- ./backend/package.json:/app/package.json:ro
- ./backend/tsconfig.json:/app/tsconfig.json:ro
- ./backend/prisma:/app/prisma:rw                  # Prisma schema (read-write)
- ./backend/scripts:/app/scripts:ro
- ./backend/nodemon.json:/app/nodemon.json:ro
- ./backend/core/app.ts:/app/core/app.ts:ro
- ./backend/core/server.ts:/app/core/server.ts:ro
- /app/node_modules                                  # Anonymous volume (excluded)
- ./backend/volumes/logs:/app/logs:rw               # Logs directory
```

**Environment Variables**:
- `NODE_ENV=development`
- `PORT=5000`
- `DATABASE_URL=postgresql://user:pass@postgres:5432/db`
- `REDIS_HOST=redis`
- `REDIS_PORT=6379`
- Plus all variables from `.env.development`

**Health Check**:
- Endpoint: `http://localhost:5000/api/health`
- Interval: 30s
- Timeout: 10s
- Start Period: 40s
- Retries: 3

**Dependencies**:
- Waits for `postgres` and `redis` services to be healthy

#### PostgreSQL Service

**Container**: `backend_postgres_dev`  
**Image**: `postgres:15-alpine`

**Ports**:
- `5432:5432` (PostgreSQL)

**Volumes**:
- `postgres_data_dev:/var/lib/postgresql/data` (persistent data)

**Health Check**:
- Command: `pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}`
- Interval: 10s
- Timeout: 5s
- Retries: 5

#### Redis Service

**Container**: `backend_redis_dev`  
**Image**: `redis:7-alpine`

**Ports**:
- `6379:6379` (Redis)

**Volumes**:
- `redis_data_dev:/data` (persistent data)

**Command**: `redis-server --requirepass ${REDIS_PASSWORD}`

**Health Check**:
- Command: `redis-cli --raw incr ping`
- Interval: 10s
- Timeout: 3s
- Retries: 5

#### Prisma Studio Service

**Container**: `prisma_studio_dev`  
**Image**: Built from `backend/Dockerfile.dev`

**Ports**:
- `5555:5555` (Prisma Studio web interface)

**Volume Mounts**:
- `./backend/prisma:/app/prisma:ro` (Prisma schema)
- `./backend/package.json:/app/package.json:ro`

**Command**: `npx prisma generate && npx prisma studio --hostname 0.0.0.0 --port 5555`

**Dependencies**:
- Waits for `postgres` service to be healthy

### Network Configuration

**Network Name**: `backend_network_dev`  
**Driver**: `bridge`

All services communicate through this isolated network using service names as hostnames:
- Frontend → Backend: `http://backend:5000`
- Backend → PostgreSQL: `postgres:5432`
- Backend → Redis: `redis:6379`

### Starting Development Environment

Use the helper script for simplified commands:

```bash
# Start all services (automatically builds and runs in detached mode)
./dev.sh start

# Start specific service
./dev.sh start frontend

# View logs
./dev.sh logs

# Follow logs in real-time
./dev.sh logs -f

# View logs for specific service
./dev.sh logs backend

# Stop services
./dev.sh stop

# Restart services
./dev.sh restart

# Check service status
./dev.sh status

# Clean up (removes containers, networks, and volumes - ⚠️ deletes data)
./dev.sh clean
```

Or use Docker Compose directly:

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up --build

# Start in detached mode
docker-compose -f docker-compose.dev.yml up -d --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose -f docker-compose.dev.yml down -v
```

### Access Points

- **Frontend**: http://localhost:3014
- **Backend API**: http://localhost:5000/api/v1
- **API Health Check**: http://localhost:5000/api/health
- **Prisma Studio**: http://localhost:5555
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

---

## Production Environment

### Purpose

The production environment is optimized for **performance**, **security**, and **resource efficiency**. Applications are built into Docker images with multi-stage builds, minimizing image size and attack surface.

### Configuration Files

- **Docker Compose**: `docker-compose.prod.yml`
- **Environment File**: `.env`
- **Backend Dockerfile**: `backend/Dockerfile.prod`
- **Frontend Dockerfile**: `frontend/Dockerfile.prod`

### Service Details

#### Frontend Service

**Container**: `frontend_service_prod`  
**Image**: Built from `frontend/Dockerfile.prod`  
**Base Image**: `nginx:alpine` (production stage)

**Build Process**:
1. **Builder Stage** (`node:20-alpine`):
   - Installs all dependencies
   - Builds React application with Vite
   - Embeds `VITE_*` environment variables at build time
2. **Production Stage** (`nginx:alpine`):
   - Copies built static files from builder
   - Configures Nginx with custom config
   - Sets up caching and security headers

**Features**:
- ✅ Static file serving via Nginx
- ✅ Gzip compression enabled
- ✅ Security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- ✅ Static asset caching (1 year)
- ✅ SPA routing support (all routes serve index.html)
- ✅ Health check endpoint at `/health`

**Ports**:
- `80:80` (HTTP)

**Volume Mounts**:
- None (everything built into image)

**Build Arguments** (passed during build):
```yaml
VITE_API_BASE_URL: ${VITE_API_BASE_URL:-http://localhost:5000/api/v1}
VITE_APP_NAME: ${VITE_APP_NAME:-Authentication Template}
VITE_ENVIRONMENT: production
```

**Environment Variables**:
- `NODE_ENV=production`

**Health Check**:
- Endpoint: `http://localhost:80/health`
- Interval: 30s
- Timeout: 10s
- Start Period: 10s
- Retries: 3

**Resource Limits**:
- CPU Limit: 0.5 cores
- Memory Limit: 256MB
- CPU Reservation: 0.25 cores
- Memory Reservation: 128MB

#### Backend Service

**Container**: `backend_service_prod`  
**Image**: Built from `backend/Dockerfile.prod`  
**Base Image**: `node:20-alpine` (production stage)

**Build Process**:
1. **Builder Stage** (`node:20-alpine`):
   - Installs all dependencies (including dev dependencies)
   - Generates Prisma client
   - Compiles TypeScript to JavaScript
   - Creates optimized build in `/dist`
2. **Production Stage** (`node:20-alpine`):
   - Installs only production dependencies
   - Copies compiled code from builder
   - Copies Prisma client and schema
   - Minimal runtime image

**Features**:
- ✅ Compiled TypeScript (no runtime compilation)
- ✅ Production dependencies only
- ✅ Prisma migrations run automatically on startup
- ✅ Logs directory mounted for persistence

**Ports**:
- `5000:5000` (Express API server)

**Volume Mounts**:
```yaml
- ./backend/prisma:/app/prisma:ro              # Prisma schema (read-only)
- ./backend/volumes/logs:/app/logs:rw          # Logs directory
```

**Environment Variables**:
- `NODE_ENV=production`
- `PORT=5000`
- Plus all variables from `.env`

**Health Check**:
- Endpoint: `http://localhost:5000/api/health`
- Interval: 30s
- Timeout: 10s
- Start Period: 40s
- Retries: 3

**Resource Limits**:
- CPU Limit: 2 cores
- Memory Limit: 1GB
- CPU Reservation: 0.5 cores
- Memory Reservation: 512MB

**Dependencies**:
- Waits for `postgres` and `redis` services to be healthy

#### PostgreSQL Service

**Container**: `backend_postgres_prod`  
**Image**: `postgres:15-alpine`

**Ports**:
- `5432:5432` (PostgreSQL)

**Volumes**:
- `postgres_data_prod:/var/lib/postgresql/data` (persistent data)

**Health Check**:
- Command: `pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}`
- Interval: 10s
- Timeout: 5s
- Retries: 5

**Resource Limits**:
- CPU Limit: 2 cores
- Memory Limit: 2GB
- CPU Reservation: 0.5 cores
- Memory Reservation: 512MB

#### Redis Service

**Container**: `backend_redis_prod`  
**Image**: `redis:7-alpine`

**Ports**:
- `6379:6379` (Redis)

**Volumes**:
- `redis_data_prod:/data` (persistent data)

**Command**: `redis-server --requirepass ${REDIS_PASSWORD} --maxmemory 256mb --maxmemory-policy allkeys-lru`

**Health Check**:
- Command: `redis-cli --raw incr ping`
- Interval: 10s
- Timeout: 3s
- Retries: 5

**Resource Limits**:
- CPU Limit: 1 core
- Memory Limit: 512MB
- CPU Reservation: 0.25 cores
- Memory Reservation: 256MB

#### Prisma Studio Service

**Container**: `prisma_studio_prod`  
**Image**: Built from `backend/Dockerfile.prod`

**Ports**:
- `5555:5555` (Prisma Studio web interface)

**Volume Mounts**:
- `./backend/prisma:/app/prisma:ro` (Prisma schema)
- `./backend/package.json:/app/package.json:ro`

**Command**: `npx prisma generate && npx prisma studio --hostname 0.0.0.0 --port 5555`

**Resource Limits**:
- CPU Limit: 0.5 cores
- Memory Limit: 256MB
- CPU Reservation: 0.25 cores
- Memory Reservation: 128MB

**Dependencies**:
- Waits for `postgres` service to be healthy

### Network Configuration

**Network Name**: `backend_network_prod`  
**Driver**: `bridge`

All services communicate through this isolated network using service names as hostnames.

### Starting Production Environment

Use the helper script for simplified commands:

```bash
# Start all services (automatically builds and runs in detached mode)
./prod.sh start

# Start specific service
./prod.sh start frontend

# View logs
./prod.sh logs

# Follow logs in real-time
./prod.sh logs -f

# View logs for specific service
./prod.sh logs backend

# Stop services
./prod.sh stop

# Restart services
./prod.sh restart

# Check service status
./prod.sh status

# Clean up (removes containers, networks, and volumes - ⚠️ deletes data)
./prod.sh clean
```

Or use Docker Compose directly:

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up --build -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose -f docker-compose.prod.yml down -v
```

### Access Points

- **Frontend**: http://localhost:3014
- **Backend API**: http://localhost:5001/api/v1
- **API Health Check**: http://localhost:5001/api/health
- **Prisma Studio**: http://localhost:5556
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

---

## Service Integration

### Frontend ↔ Backend Communication

#### Development Mode

**Browser → Backend**:
- Browser makes requests to `http://localhost:5000/api/v1`
- Uses exposed port on host machine
- CORS configured to allow `http://localhost:3000`

**Frontend Container → Backend Container**:
- Internal communication via Docker network
- Frontend can access backend at `http://backend:5000` (server-side only)
- Not used in typical React SPA (browser makes direct requests)

#### Production Mode

**Browser → Backend**:
- Browser makes requests to configured API URL (from `VITE_API_BASE_URL`)
- Typically: `https://api.example.com/api/v1` or `http://backend:5000/api/v1`
- CORS configured based on `CORS_ORIGIN` environment variable

**Frontend Container → Backend Container**:
- If using reverse proxy, frontend container can access backend via `http://backend:5000`
- Otherwise, browser makes direct requests to backend

### Backend ↔ Database Communication

**Both Environments**:
- Backend connects to PostgreSQL using service name: `postgres:5432`
- Connection string: `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}`
- Prisma handles connection pooling and migrations

### Backend ↔ Redis Communication

**Both Environments**:
- Backend connects to Redis using service name: `redis:6379`
- Authentication via `REDIS_PASSWORD`
- Used for session storage, caching, and rate limiting

### Service Dependencies

```
┌─────────────┐
│  Frontend   │
└──────┬──────┘
       │ (depends on)
       ▼
┌─────────────┐
│   Backend   │
└──────┬──────┘
       │ (depends on)
       ├──────────────┐
       ▼              ▼
┌─────────────┐  ┌─────────────┐
│  PostgreSQL │  │    Redis    │
└─────────────┘  └─────────────┘
       ▲
       │ (depends on)
       │
┌─────────────┐
│   Prisma    │
│   Studio    │
└─────────────┘
```

---

## Environment Variables

### Frontend Variables

#### Development

**Runtime Variables** (available in browser):
- `VITE_API_BASE_URL`: Backend API base URL
  - Default: `http://localhost:5000/api/v1`
  - Set in: `.env.development` or `docker-compose.dev.yml` → `environment`
- `VITE_APP_NAME`: Application name
  - Default: `Authentication Template`
  - Set in: `.env.development` or `docker-compose.dev.yml` → `environment`
- `VITE_ENVIRONMENT`: Environment identifier
  - Value: `development`
  - Set in: `.env.development` or `docker-compose.dev.yml` → `environment`

**Note**: In development, Vite variables are available at runtime because the dev server reads them from the environment. They can be set in `.env.development` and will be picked up by docker-compose.

#### Production

**Build-Time Variables** (embedded in JavaScript bundle):
- `VITE_API_BASE_URL`: Backend API base URL
  - Set via: `.env` file (read by docker-compose) → `docker-compose.prod.yml` → `build.args`
  - Or: `frontend/.env` file (copied during build)
  - **IMPORTANT**: Update this with your production API URL before building
- `VITE_APP_NAME`: Application name
  - Set via: `.env` file → `docker-compose.prod.yml` → `build.args`
- `VITE_ENVIRONMENT`: Environment identifier
  - Value: `production`
  - Set via: `.env` file → `docker-compose.prod.yml` → `build.args`

**Note**: In production, Vite variables are embedded at build time. They are read from `.env` and passed as build arguments. Changing them requires rebuilding the image.

### Backend Variables

#### Common Variables (Both Environments)

**Database**:
- `DATABASE_URL`: Full PostgreSQL connection string
- `POSTGRES_HOST`: Database host (default: `postgres`)
- `POSTGRES_PORT`: Database port (default: `5432`)
- `POSTGRES_DB`: Database name
- `POSTGRES_USER`: Database user
- `POSTGRES_PASSWORD`: Database password

**Redis**:
- `REDIS_HOST`: Redis host (default: `redis`)
- `REDIS_PORT`: Redis port (default: `6379`)
- `REDIS_PASSWORD`: Redis password

**Server**:
- `NODE_ENV`: Environment (`development` or `production`)
- `PORT`: Server port (default: `5000`)

**Application URLs**:
- `APP_URL`: Base application URL
- `FRONTEND_URL`: Frontend URL (for CORS, email links)
- `CORS_ORIGIN`: Allowed CORS origins

**JWT**:
- `JWT_SECRET`: Secret for access tokens
- `JWT_REFRESH_SECRET`: Secret for refresh tokens
- `JWT_EXPIRES_IN`: Access token expiration (default: `15m`)
- `JWT_REFRESH_EXPIRES_IN`: Refresh token expiration (default: `7d`)

**Email** (Resend):
- `RESEND_API_KEY`: Resend API key
- `RESEND_FROM_EMAIL`: Sender email address
- `RESEND_FROM_NAME`: Sender name

**Rate Limiting**:
- `RATE_LIMIT_WINDOW_MS`: Time window in milliseconds (default: `900000` = 15min)
- `RATE_LIMIT_MAX_REQUESTS`: Max requests per window (default: `100`)

**Frontend Port**:
- `FRONTEND_PORT`: Port for frontend service (default: `3000` for dev, `80` for prod)

### Environment File Locations

**Development**:
- Root: `.env.development`
- Frontend: `frontend/.env` (optional, for local overrides)

**Production**:
- Root: `.env`
- Frontend: `frontend/.env` (used during build for `VITE_*` variables)

### Variable Priority

**Backend**:
1. `docker-compose.yml` → `environment` (highest priority)
2. `.env.development` or `.env` file
3. Default values in code

**Frontend (Development)**:
1. `docker-compose.dev.yml` → `environment` (reads from `.env.development`)
2. `.env.development` file (root level)
3. `frontend/.env` file (optional, for local overrides)
4. Default values

**Frontend (Production)**:
1. `docker-compose.prod.yml` → `build.args` (reads from `.env`)
2. `.env` file (root level)
3. `frontend/.env` file (copied during build)
4. Default values in Dockerfile

---

## Network Configuration

### Development Network

**Name**: `backend_network_dev`  
**Driver**: `bridge`  
**Scope**: Isolated to development containers

**Services Connected**:
- `frontend_service_dev`
- `backend_service_dev`
- `backend_postgres_dev`
- `backend_redis_dev`
- `prisma_studio_dev`

**Internal Communication**:
- Services communicate using container names as hostnames
- Example: `http://backend:5000`, `postgres:5432`, `redis:6379`

### Production Network

**Name**: `backend_network_prod`  
**Driver**: `bridge`  
**Scope**: Isolated to production containers

**Services Connected**:
- `frontend_service_prod`
- `backend_service_prod`
- `backend_postgres_prod`
- `backend_redis_prod`
- `prisma_studio_prod`

**Internal Communication**:
- Same as development - services use container names

### External Access

**Port Mapping**:
- Development and production use different port mappings
- Ports are exposed on host machine for external access
- Internal communication uses Docker network (no port mapping needed)

---

## Volume Management

### Development Volumes

#### Named Volumes (Persistent)

- `postgres_data_dev`: PostgreSQL database files
- `redis_data_dev`: Redis data files

#### Bind Mounts (Source Code)

**Frontend**:
- Source code mounted for hot reload
- Configuration files mounted for live updates
- `node_modules` excluded (anonymous volume)

**Backend**:
- Source code mounted for hot reload
- Prisma schema mounted for migrations
- Logs directory mounted for debugging
- `node_modules` excluded (anonymous volume)

### Production Volumes

#### Named Volumes (Persistent)

- `postgres_data_prod`: PostgreSQL database files
- `redis_data_prod`: Redis data files

#### Bind Mounts (Minimal)

**Frontend**:
- None (everything built into image)

**Backend**:
- `./backend/prisma:/app/prisma:ro` (read-only, for migrations)
- `./backend/volumes/logs:/app/logs:rw` (logs persistence)

### Volume Backup

**Important**: Named volumes contain persistent data. To backup:

```bash
# Backup PostgreSQL
docker run --rm -v postgres_data_dev:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data

# Backup Redis
docker run --rm -v redis_data_dev:/data -v $(pwd):/backup alpine tar czf /backup/redis_backup.tar.gz /data
```

---

## Health Checks

### Purpose

Health checks ensure services are running correctly and ready to accept requests. Docker Compose uses health checks to determine service dependencies.

### Frontend Health Checks

**Development**:
- Endpoint: `http://localhost:3000`
- Checks if Vite dev server is responding

**Production**:
- Endpoint: `http://localhost:80/health`
- Custom Nginx endpoint returning `200 OK`

### Backend Health Checks

**Both Environments**:
- Endpoint: `http://localhost:5000/api/health`
- Checks if Express API is responding
- Start period: 40s (allows time for migrations)

### Database Health Checks

**PostgreSQL**:
- Command: `pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}`
- Checks database readiness

**Redis**:
- Command: `redis-cli --raw incr ping`
- Checks Redis connectivity

### Health Check Configuration

```yaml
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:PORT/endpoint"]
  interval: 30s      # Check every 30 seconds
  timeout: 10s       # Timeout after 10 seconds
  retries: 3          # Retry 3 times before marking unhealthy
  start_period: 10s   # Grace period before starting checks
```

---

## Port Configuration

### Development Ports

| Service | Container Port | Host Port | Access |
|---------|---------------|-----------|--------|
| Frontend | 3000 | 3014 | http://localhost:3014 |
| Backend | 5000 | 5000 | http://localhost:5000 |
| PostgreSQL | 5432 | 5432 | localhost:5432 |
| Redis | 6379 | 6379 | localhost:6379 |
| Prisma Studio | 5555 | 5555 | http://localhost:5555 |

### Production Ports

| Service | Container Port | Host Port | Access |
|---------|---------------|-----------|--------|
| Frontend | 80 | 3014 | http://localhost:3014 |
| Backend | 5000 | 5001 | http://localhost:5001 |
| PostgreSQL | 5432 | 5432 | localhost:5432 |
| Redis | 6379 | 6379 | localhost:6379 |
| Prisma Studio | 5555 | 5556 | http://localhost:5556 |

### Port Customization

Ports can be customized via environment variables:

**Development** (`.env.development`):
```bash
# Service Ports
FRONTEND_PORT=3014
BACKEND_PORT=5000
POSTGRES_PORT=5432
REDIS_PORT=6379
PRISMA_STUDIO_PORT=5555

# Frontend Environment Variables
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME=Authentication Template
VITE_ENVIRONMENT=development
```

**Production** (`.env`):
```bash
# Service Ports
FRONTEND_PORT=3014
BACKEND_PORT=5001
POSTGRES_PORT=5432
REDIS_PORT=6379
PRISMA_STUDIO_PORT=5556

# Frontend Environment Variables (Build-time)
# IMPORTANT: Update VITE_API_BASE_URL with your production API URL
VITE_API_BASE_URL=https://api-authtemplate.spookielabsinc.site/api/v1
VITE_APP_NAME=Authentication Template
VITE_ENVIRONMENT=production
```

---

## Build Process

### Development Build

**Frontend**:
```bash
# Build happens automatically when starting
docker-compose -f docker-compose.dev.yml up --build

# Process:
# 1. Install dependencies (npm ci)
# 2. Copy source code
# 3. Start Vite dev server
```

**Backend**:
```bash
# Build happens automatically when starting
docker-compose -f docker-compose.dev.yml up --build

# Process:
# 1. Install dependencies (npm ci)
# 2. Generate Prisma client
# 3. Copy source code
# 4. Start dev server with hot reload
```

### Production Build

**Frontend**:
```bash
# Multi-stage build
docker-compose -f docker-compose.prod.yml build frontend

# Stage 1 (Builder):
# 1. Install all dependencies
# 2. Copy source code and .env
# 3. Set VITE_* environment variables
# 4. Build React app (npm run build)
# 5. Output: /app/dist

# Stage 2 (Production):
# 1. Use nginx:alpine base image
# 2. Copy built files from builder
# 3. Copy nginx.conf
# 4. Configure Nginx
# 5. Final image: ~50MB
```

**Backend**:
```bash
# Multi-stage build
docker-compose -f docker-compose.prod.yml build backend

# Stage 1 (Builder):
# 1. Install all dependencies (including dev)
# 2. Generate Prisma client
# 3. Copy source code
# 4. Compile TypeScript (npm run build)
# 5. Output: /app/dist

# Stage 2 (Production):
# 1. Use node:20-alpine base image
# 2. Install only production dependencies
# 3. Copy compiled code from builder
# 4. Copy Prisma client and schema
# 5. Final image: ~200MB
```

### Build Optimization

**Layer Caching**:
- Package files (`package.json`) copied first
- Dependencies installed before source code
- Changes to source code don't invalidate dependency layer

**Multi-Stage Builds**:
- Builder stage includes dev dependencies
- Production stage only includes runtime dependencies
- Significantly reduces final image size

**Build Arguments**:
- Frontend uses build args for `VITE_*` variables
- Allows customization without rebuilding entire image

---

## Deployment Guide

### Prerequisites

1. **Docker** (20.10+)
2. **Docker Compose** (2.0+)
3. **Environment Files**:
   - `.env.development` (for development)
   - `.env` (for production)

### Development Deployment

1. **Prepare Environment**:
   ```bash
   # Copy example environment file
   cp .env.example .env.development
   
   # Edit with your values
   nano .env.development
   
   # Ensure frontend variables are set:
   # - VITE_API_BASE_URL: Backend API URL (default: http://localhost:5000/api/v1)
   # - VITE_APP_NAME: Application name
   # - FRONTEND_PORT: Frontend port (default: 3000)
   ```

2. **Start Services**:
   ```bash
   # Using helper script (recommended)
   ./dev.sh start
   
   # Or using Docker Compose directly
   docker-compose -f docker-compose.dev.yml up --build -d
   ```

3. **Verify Services**:
   ```bash
   # Check service status
   ./dev.sh status
   
   # Check logs
   ./dev.sh logs -f
   ```

4. **Access Applications**:
   - Frontend: http://localhost:3014
   - Backend: http://localhost:5000/api/v1
   - Prisma Studio: http://localhost:5555

### Production Deployment

1. **Prepare Environment**:
   ```bash
   # Copy example environment file
   cp .env.example .env
   
   # Edit with production values
   nano .env
   
   # IMPORTANT: Update frontend variables before building:
   # - VITE_API_BASE_URL: Production API URL (e.g., https://api.example.com/api/v1)
   # - VITE_APP_NAME: Application name
   # - VITE_ENVIRONMENT: Must be "production"
   # - FRONTEND_PORT: Frontend port (default: 80)
   # 
   # Note: VITE_* variables are embedded at build time, so changes require rebuild
   ```

2. **Build Images**:
   ```bash
   # Using helper script (recommended)
   ./prod.sh build
   
   # Or build specific service
   ./prod.sh build frontend
   
   # Or using Docker Compose directly
   docker-compose -f docker-compose.prod.yml build
   ```

3. **Start Services**:
   ```bash
   # Using helper script (recommended)
   ./prod.sh start
   
   # Or using Docker Compose directly
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

4. **Verify Deployment**:
   ```bash
   # Check service status
   ./prod.sh status
   
   # Check health
   curl http://localhost:3014/health      # Frontend
   curl http://localhost:5001/api/health   # Backend
   
   # View logs
   ./prod.sh logs -f
   ```

5. **Monitor Services**:
   ```bash
   # View resource usage
   docker stats
   
   # View service logs
   ./prod.sh logs -f backend
   ```

### Updating Services

**Development**:
```bash
# Changes to source code are reflected immediately (hot reload)
# To restart services:
./dev.sh restart

# Or restart specific service
./dev.sh restart backend
```

**Production**:
```bash
# Rebuild and restart
./prod.sh start

# Or restart without rebuild
./prod.sh restart

# Or restart specific service
./prod.sh restart backend
```

### Scaling Services

**Production** (example):
```yaml
# In docker-compose.prod.yml
services:
  backend:
    deploy:
      replicas: 3  # Run 3 instances
```

**Note**: For true scaling, consider using Docker Swarm or Kubernetes.

### Backup and Recovery

**Database Backup**:
```bash
# Development
docker exec backend_postgres_dev pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} > backup.sql

# Production
docker exec backend_postgres_prod pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} > backup.sql
```

**Database Restore**:
```bash
# Development
docker exec -i backend_postgres_dev psql -U ${POSTGRES_USER} ${POSTGRES_DB} < backup.sql

# Production
docker exec -i backend_postgres_prod psql -U ${POSTGRES_USER} ${POSTGRES_DB} < backup.sql
```

### Troubleshooting

**Services Not Starting**:
```bash
# Check logs
./dev.sh logs

# Check specific service
./dev.sh logs backend

# Check service status
./dev.sh status
```

**Port Conflicts**:
- Check if ports are already in use: `netstat -tulpn | grep :PORT`
- Change port in environment file or docker-compose.yml

**Database Connection Issues**:
- Verify `DATABASE_URL` is correct
- Check PostgreSQL is healthy: `docker-compose ps postgres`
- Check network connectivity: `docker network inspect backend_network_dev`

**Build Failures**:
- Clear Docker cache: `docker system prune -a`
- Rebuild without cache: `docker-compose build --no-cache`

---

## Best Practices

### Development

1. ✅ Use volume mounts for source code (hot reload)
2. ✅ Keep `.env.development` in version control (with secrets excluded)
3. ✅ Use health checks to ensure services start in correct order
4. ✅ Monitor logs during development
5. ✅ Use Prisma Studio for database inspection

### Production

1. ✅ Never commit `.env` files with secrets
2. ✅ Use multi-stage builds for smaller images
3. ✅ Set resource limits to prevent resource exhaustion
4. ✅ Use health checks for service monitoring
5. ✅ Enable logging and monitoring
6. ✅ Regular database backups
7. ✅ Use HTTPS in production (configure reverse proxy)
8. ✅ Review and update security headers
9. ✅ Monitor resource usage
10. ✅ Keep Docker images updated

---

## Security Considerations

### Development

- ⚠️ Exposed ports on localhost
- ⚠️ Verbose error messages
- ⚠️ Debug tools enabled
- ✅ Isolated Docker network

### Production

- ✅ Minimal exposed ports
- ✅ Resource limits configured
- ✅ Security headers in Nginx
- ✅ Environment variables for secrets
- ✅ Read-only volume mounts where possible
- ⚠️ Ensure `.env` files are not committed
- ⚠️ Use secrets management in production
- ⚠️ Configure firewall rules
- ⚠️ Use HTTPS (via reverse proxy)

---

## Conclusion

This environment setup provides:

- **Development**: Fast iteration with hot reloading and debugging tools
- **Production**: Optimized, secure, and scalable deployment

Both environments use Docker Compose for orchestration, ensuring consistency between development and production. The multi-stage builds and resource limits optimize production deployments, while volume mounts and hot reloading optimize development workflows.

For questions or issues, refer to:
- [API Documentation](./API_DOCUMENTATION.md)
- [Frontend Plan](./Frontend%20Plan.md)
- [Backend README](../backend/README.md)

---

**© <span id="copyright-year"></span> Matthew Makundi, Founder [SpookieLabsInc](https://www.spookielabsinc.site)**

*All rights reserved.*

