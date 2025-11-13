# Docker Setup Guide

This project uses Docker Compose to manage separate development and production environments.

## Environment Files

- **`.env`**: Production environment variables (used by `docker-compose.prod.yml`)
- **`.env.development`**: Development environment variables (used by `docker-compose.dev.yml`)

## Quick Start

### Development Environment

Use the helper script for automatic environment setup:

```bash
# Start services
./dev.sh up --build

# Start in detached mode
./dev.sh up -d --build

# View logs
./dev.sh logs -f

# Stop services
./dev.sh down

# Restart specific service
./dev.sh restart frontend
```

**Access Points:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/v1
- Prisma Studio: http://localhost:5555
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Production Environment

Use the production helper script:

```bash
# Start services
./prod.sh up --build -d

# View logs
./prod.sh logs -f

# Stop services
./prod.sh down
```

**Access Points:**
- Frontend: http://localhost:80 or http://localhost
- Backend API: http://localhost:5000/api/v1
- Prisma Studio: http://localhost:5555

## Manual Docker Compose Commands

If you prefer not to use the helper scripts, you can run Docker Compose manually with environment variable overrides:

### Development

```bash
# Set environment variables and run
FRONTEND_PORT=3000 docker compose -f docker-compose.dev.yml up --build

# Or export them first
export FRONTEND_PORT=3000
docker compose -f docker-compose.dev.yml up --build
```

### Production

```bash
# Production uses default values from .env
docker compose -f docker-compose.prod.yml up --build -d
```

## Why Helper Scripts?

Docker Compose reads the root `.env` file for **variable substitution** (like `${FRONTEND_PORT}`) in the compose file itself, even when using different `env_file` directives. This can cause port conflicts between dev and prod.

The helper scripts (`dev.sh` and `prod.sh`) solve this by:
1. Exporting environment-specific variables before running Docker Compose
2. Ensuring the correct ports are mapped for each environment
3. Providing a consistent interface for managing services

## Port Configuration

### Development Ports
- **Frontend**: `3000` (Vite dev server with hot reload)
- **Backend**: `5000`
- **PostgreSQL**: `5432`
- **Redis**: `6379`
- **Prisma Studio**: `5555`

### Production Ports
- **Frontend**: `80` (Nginx static file server)
- **Backend**: `5000`
- **PostgreSQL**: `5432`
- **Redis**: `6379`
- **Prisma Studio**: `5555`

## Troubleshooting

### Port Already in Use

If you get a port conflict error:

```bash
# Check what's using the port
sudo netstat -tulpn | grep :3000

# Or stop the conflicting service
./dev.sh down
```

### Frontend Not Accessible

1. **Check container status:**
   ```bash
   docker compose -f docker-compose.dev.yml ps
   ```

2. **Check which port is mapped:**
   - Look for the PORTS column
   - Should show `0.0.0.0:3000->3000/tcp` for development

3. **Check logs:**
   ```bash
   ./dev.sh logs frontend
   ```

### Switching Between Environments

Always stop one environment before starting another:

```bash
# Stop development
./dev.sh down

# Start production
./prod.sh up -d --build
```

## Advanced Usage

### Building Only
```bash
./dev.sh build
```

### Rebuilding Specific Service
```bash
./dev.sh build frontend
./dev.sh up -d --no-deps frontend
```

### Viewing Resource Usage
```bash
docker stats
```

### Cleaning Up
```bash
# Remove containers and networks
./dev.sh down

# Remove containers, networks, and volumes (⚠️ deletes data)
./dev.sh down -v

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

