#!/bin/bash

# Quick start script for beta local development
set -e

echo "🚀 Starting NØDE BETA local development environment..."

# Check if database is running
if ! docker ps | grep -q node-postgres-beta; then
    echo "📦 Starting PostgreSQL (Beta)..."
    docker-compose -f docker-compose.beta.yml up -d postgres-beta
    sleep 3
fi

# Load beta environment variables
export NODE_ENV=development
export BETA_MODE=true

# Start backend in background with beta env
echo "🔧 Starting backend (Beta)..."
cd backend
if [ -f .env.beta ]; then
    # Use beta env file
    export $(cat .env.beta | grep -v '^#' | xargs)
fi
PORT=${PORT:-4001} npm run start:dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend (Beta)..."
cd frontend
if [ -f .env.local.beta ]; then
    # Copy beta env to .env.local temporarily
    cp .env.local.beta .env.local
fi
PORT=3001 npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Beta development servers started!"
echo "   Backend: http://localhost:4001"
echo "   Frontend: http://localhost:3001"
echo "   Database: localhost:5434"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait

