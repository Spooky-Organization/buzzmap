#!/bin/bash
# Production Environment Startup Script
# This script sets production-specific variables before starting Docker Compose

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Export production-specific variables for docker-compose substitution
# These values match the production .env file
export FRONTEND_PORT=3014
export BACKEND_PORT=5001
export POSTGRES_PORT=5432
export REDIS_PORT=6379
export PRISMA_STUDIO_PORT=5556

# Docker Compose file
COMPOSE_FILE="docker-compose.prod.yml"

# Function to show usage
show_usage() {
    echo "Usage: $0 [command] [service]"
    echo ""
    echo "Commands:"
    echo "  start [service]    - Start services (with --build flag)"
    echo "  stop [service]     - Stop services"
    echo "  restart [service]  - Restart services"
    echo "  logs [service]     - Show logs (use -f for follow)"
    echo "  status             - Show service status"
    echo "  build [service]    - Build services"
    echo "  down               - Stop and remove containers"
    echo "  clean              - Stop, remove containers and volumes (⚠️ deletes data)"
    echo "  shell [service]    - Open shell in service container"
    echo "  exec [service] [cmd] - Execute command in service container"
    echo ""
    echo "Examples:"
    echo "  $0 start              - Start all services"
    echo "  $0 start frontend     - Start only frontend"
    echo "  $0 logs -f backend    - Follow backend logs"
    echo "  $0 restart backend    - Restart backend service"
    echo "  $0 shell backend      - Open shell in backend container"
    echo ""
}

# Parse command
COMMAND="${1:-help}"
SERVICE="${2:-}"

case "$COMMAND" in
    start)
        if [ -n "$SERVICE" ]; then
            docker compose -f "$COMPOSE_FILE" up -d --build "$SERVICE"
        else
            docker compose -f "$COMPOSE_FILE" up -d --build
        fi
        ;;
    stop)
        if [ -n "$SERVICE" ]; then
            docker compose -f "$COMPOSE_FILE" stop "$SERVICE"
        else
            docker compose -f "$COMPOSE_FILE" stop
        fi
        ;;
    restart)
        if [ -n "$SERVICE" ]; then
            docker compose -f "$COMPOSE_FILE" restart "$SERVICE"
        else
            docker compose -f "$COMPOSE_FILE" restart
        fi
        ;;
    logs)
        if [ "$SERVICE" = "-f" ] || [ "$SERVICE" = "--follow" ]; then
            docker compose -f "$COMPOSE_FILE" logs -f
        elif [ -n "$SERVICE" ]; then
            docker compose -f "$COMPOSE_FILE" logs "$SERVICE"
        else
            docker compose -f "$COMPOSE_FILE" logs
        fi
        ;;
    status|ps)
        docker compose -f "$COMPOSE_FILE" ps
        ;;
    build)
        if [ -n "$SERVICE" ]; then
            docker compose -f "$COMPOSE_FILE" build "$SERVICE"
        else
            docker compose -f "$COMPOSE_FILE" build
        fi
        ;;
    down)
        docker compose -f "$COMPOSE_FILE" down
        ;;
    clean)
        echo "⚠️  WARNING: This will delete all volumes and data!"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            docker compose -f "$COMPOSE_FILE" down -v
        else
            echo "Cancelled."
        fi
        ;;
    shell)
        if [ -z "$SERVICE" ]; then
            echo "Error: Service name required for shell command"
            echo "Available services: frontend, backend, postgres, redis, prisma-studio"
            exit 1
        fi
        docker compose -f "$COMPOSE_FILE" exec "$SERVICE" /bin/sh
        ;;
    exec)
        if [ -z "$SERVICE" ]; then
            echo "Error: Service name and command required"
            echo "Usage: $0 exec <service> <command>"
            exit 1
        fi
        shift 2  # Remove 'exec' and service name
        docker compose -f "$COMPOSE_FILE" exec "$SERVICE" "$@"
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        # If command not recognized, pass it through to docker compose
        docker compose -f "$COMPOSE_FILE" "$@"
        ;;
esac

