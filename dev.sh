#!/bin/bash
# Development Environment Startup Script
# This script sets development-specific variables before starting Docker Compose

# Export development-specific variables for docker-compose substitution
export FRONTEND_PORT=3000
export BACKEND_PORT=5000
export POSTGRES_PORT=5432
export REDIS_PORT=6379
export PRISMA_STUDIO_PORT=5555

# Run docker-compose with development configuration
docker compose -f docker-compose.dev.yml "$@"

