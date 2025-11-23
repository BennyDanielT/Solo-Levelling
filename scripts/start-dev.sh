#!/bin/sh

# Solo Leveling App - Development Startup Script
# This script handles database initialization and app startup

echo "🚀 Starting Solo Leveling App..."

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB connection..."
until npx prisma db push --accept-data-loss 2>/dev/null; do
  echo "⏳ MongoDB not ready yet, waiting 5 seconds..."
  sleep 5
done

echo "✅ Database connection established!"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🎮 Starting Next.js development server..."
npm run dev 