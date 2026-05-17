#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy

if [ "${RUN_DB_SEED:-true}" = "true" ]; then
  echo "Running database seed..."
  npx prisma db seed
else
  echo "Skipping database seed because RUN_DB_SEED is not true."
fi

echo "Starting application..."
exec "$@"
