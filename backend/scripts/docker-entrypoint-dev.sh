#!/bin/sh
set -e

echo "🚀 Starting development server..."

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Use Prisma db push for development - creates DB and schema if needed
# This is lightweight and perfect for development templates
echo "📊 Setting up database schema..."
npx prisma db push --accept-data-loss || true

# Seed the database with test users
echo "🌱 Seeding database with test users..."
npx ts-node prisma/seed.ts || echo "⚠️  Seed skipped (may already exist or DB not ready)"

echo "✅ Database setup complete!"
echo "🚀 Starting development server with hot reload..."

# Start the development server
exec npm run dev

