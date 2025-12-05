#!/bin/bash

# Quick start script for local development
set -e

echo "🚀 Starting NØDE local development environment..."

# Check if database is running
if ! docker ps | grep -q node-postgres; then
    echo "📦 Starting PostgreSQL..."
    docker-compose up -d postgres
    sleep 3
fi

# Start backend in background
echo "🔧 Starting backend..."
cd backend
npm run start:dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Development servers started!"
echo "   Backend: http://localhost:4000"
echo "   Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait

