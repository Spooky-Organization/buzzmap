# Docker Setup Guide

This project uses Docker Compose to manage separate development and production environments.

## Environment Files

- **`.env.prod`**: Production environment variables (used by `docker-compose.prod.yml`)
- **`.env.development`**: Development environment variables (used by `docker-compose.dev.yml`)

## Quick Start

### Development Environment

Use the helper script for automatic environment setup:

```bash
# Start all services (automatically builds and runs in detached mode)
./dev.sh start

# Start specific service
./dev.sh start frontend

# View logs (all services)
./dev.sh logs

# Follow logs in real-time
./dev.sh logs -f

# View logs for specific service
./dev.sh logs backend

# Stop all services
./dev.sh stop

# Stop specific service
./dev.sh stop frontend

# Restart all services
./dev.sh restart

# Restart specific service
./dev.sh restart frontend

# Check service status
./dev.sh status

# Show help
./dev.sh help
```

**Access Points:**
- Frontend: http://localhost:3014
- Backend API: http://localhost:5000/api/v1
- PostgreSQL: localhost:5432 (backend only; bind to 127.0.0.1 if you need host access)
- Redis: localhost:6379

### Production Environment

Use the production helper script:

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

# Stop all services
./prod.sh stop

# Restart services
./prod.sh restart

# Check service status
./prod.sh status

# Show help
./prod.sh help
```

**Access Points:**
- Frontend: http://localhost:3014
- Backend API: http://localhost:5001/api/v1
- Prisma Studio is not exposed. To inspect the database, run it locally (see [Accessing the database](#accessing-the-database)).

## Manual Docker Compose Commands

If you prefer not to use the helper scripts, you can run Docker Compose manually with the `--env-file` flag:

### Development

```bash
# Use --env-file to specify the development environment
docker compose --env-file .env.development -f docker-compose.dev.yml up --build -d
```

### Production

```bash
# Use --env-file to specify the production environment
docker compose --env-file .env.prod -f docker-compose.prod.yml up --build -d
```

## Why Helper Scripts?

Docker Compose automatically loads `.env` for **variable substitution** (like `${FRONTEND_PORT}`) in the compose file. This can cause conflicts when running dev and prod environments.

The helper scripts (`dev.sh` and `prod.sh`) solve this by:
1. Using `--env-file` to explicitly load the correct environment file
2. Ensuring the correct ports are mapped for each environment
3. Providing a consistent interface for managing services

## Port Configuration

### Development Ports
- **Frontend**: `3014` (Vite dev server with hot reload)
- **Backend**: `5000`
- **PostgreSQL**: `5432`
- **Redis**: `6379`

### Production Ports
- **Frontend**: `3014` (Nginx static file server)
- **Backend**: `5001`
- **PostgreSQL**: `5432`
- **Redis**: `6379`

## Redis for SSE and Caching

Redis is used for:
- **SSE Connection Management**: Tracks active SSE connections per user
- **Session Caching**: User sessions cached with 7-day TTL
- **Query Caching**: API responses cached with 1-minute TTL
- **Rate Limiting**: Redis-backed rate limiters

### Redis Connection Limits

The application implements Redis connection pooling and limits:
- Default pool size: 10 connections
- Max connections per user: 5
- SSE heartbeat: 30 seconds

### Performance Considerations

- SSE connections are lightweight but persistent
- Each user can have up to 5 SSE connections across streams
- Redis SCAN is used instead of KEYS for production safety
- Connection limits prevent resource exhaustion

## Accessing the database

Prisma Studio is not run as a Docker service and is not exposed. To view or edit data:

- **With Docker running (dev or prod):** From your machine, in the `backend` directory, run:
  ```bash
  cd backend
  DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DBNAME" npx prisma studio
  ```
  Use the same `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` as in your `.env.development` or `.env.prod`. Then open http://localhost:5555.

- **Remote server:** SSH tunnel to the host, then use the command above with `127.0.0.1` (e.g. `ssh -L 5432:127.0.0.1:5432 user@server`).

## Troubleshooting

### Port Already in Use

If you get a port conflict error:

```bash
# Check what's using the port
sudo netstat -tulpn | grep :3014

# Or stop the conflicting service
./dev.sh stop
```

### Frontend Not Accessible

1. **Check container status:**
   ```bash
   docker compose -f docker-compose.dev.yml ps
   ```

2. **Check which port is mapped:**
   - Look for the PORTS column
   - Should show `0.0.0.0:3014->3000/tcp` for development

3. **Check logs:**
   ```bash
   ./dev.sh logs frontend
   ```

### Switching Between Environments

Always stop one environment before starting another:

```bash
# Stop development
./dev.sh stop

# Start production
./prod.sh start
```

## Advanced Usage

### Building Only
```bash
./dev.sh build
```

### Rebuilding Specific Service
```bash
./dev.sh build frontend
./dev.sh start frontend
```

### Viewing Resource Usage
```bash
docker stats
```

### Additional Commands

```bash
# Open shell in a service container
./dev.sh shell backend

# Execute command in a service container
./dev.sh exec backend npm run db:migrate

# Clean up (removes containers, networks, and volumes - ⚠️ deletes data)
./dev.sh clean
```

### Cleaning Up
```bash
# Remove containers and networks
./dev.sh down

# Remove containers, networks, and volumes (⚠️ deletes data)
./dev.sh clean

# Remove all unused Docker resources
docker system prune -a
```

## Environment Variable Priority

1. **Helper script exports** (highest priority)
2. **docker-compose.yml environment section**
3. **env_file directive** (`.env.development` or `.env`)
4. **Default values in docker-compose.yml** (e.g., `${FRONTEND_PORT:-3000}`)

## See Also

- [Environment Setup Documentation](docs/ENVIRONMENT_SETUP.md) - Comprehensive environment guide
- [API Documentation](docs/API_DOCUMENTATION.md) - Backend API endpoints
- [Frontend README](frontend/README.md) - Frontend setup and architecture
- [Backend README](backend/README.md) - Backend structure and guidelines

---

**© <span id="copyright-year"></span> Matthew Makundi, Founder [SpookieLabsInc](https://www.spookielabsinc.site)**

*All rights reserved.*

