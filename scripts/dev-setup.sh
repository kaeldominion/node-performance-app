#!/bin/bash

# NØDE Local Development Setup Script
set -e

echo "🚀 Setting up NØDE local development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start PostgreSQL
echo "📦 Starting PostgreSQL database..."
docker-compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5
until docker exec node-postgres pg_isready -U node_user -d node_db > /dev/null 2>&1; do
    echo "   Still waiting..."
    sleep 2
done
echo "✅ Database is ready!"

# Setup backend
echo "🔧 Setting up backend..."
cd backend

# Copy .env.example to .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating backend .env file..."
    cp .env.example .env
    echo "✅ Backend .env created. Please update with your API keys."
else
    echo "✅ Backend .env already exists."
fi

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
else
    echo "✅ Backend dependencies already installed."
fi

# Generate Prisma client
echo "🔨 Generating Prisma client..."
npx prisma generate

# Sync database schema (use db push for local dev - faster and simpler)
echo "🗄️  Syncing database schema..."
npx prisma db push --accept-data-loss

# Seed database (optional - uncomment if you want to seed)
# echo "🌱 Seeding database..."
# npm run prisma:seed
# npm run prisma:seed:exercises

cd ..

# Setup frontend
echo "🎨 Setting up frontend..."
cd frontend

# Copy .env.example to .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating frontend .env.local file..."
    cp .env.example .env.local
    echo "✅ Frontend .env.local created. Please update with your Clerk keys."
else
    echo "✅ Frontend .env.local already exists."
fi

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
else
    echo "✅ Frontend dependencies already installed."
fi

cd ..

echo ""
echo "✨ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update backend/.env with your OPENAI_API_KEY"
echo "2. Update frontend/.env.local with your Clerk keys"
echo "3. Run 'npm run dev' in both backend and frontend directories"
echo ""
echo "🚀 To start development:"
echo "   Terminal 1: cd backend && npm run start:dev"
echo "   Terminal 2: cd frontend && npm run dev"
echo ""
echo "🛑 To stop database: docker-compose down"

