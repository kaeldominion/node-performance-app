#!/bin/bash
# Railway Database Setup Script
# Run this after your backend is deployed to Railway

echo "🚀 Setting up NØDE database..."

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Run migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

# Seed database
echo "🌱 Seeding database with NØDE programs..."
npm run prisma:seed

echo "✅ Database setup complete!"
echo ""
echo "Your database now has:"
echo "  - NØDE Core Weekly program (6 archetypes)"
echo "  - Villa Zeno Hybrid program"
echo "  - All workout examples"

