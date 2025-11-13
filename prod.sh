#!/bin/bash
# Production Environment Startup Script
# This script sets production-specific variables before starting Docker Compose

# Export production-specific variables for docker-compose substitution
export FRONTEND_PORT=80
export BACKEND_PORT=5000
export POSTGRES_PORT=5432
export REDIS_PORT=6379
export PRISMA_STUDIO_PORT=5555

# Run docker-compose with production configuration
docker compose -f docker-compose.prod.yml "$@"

