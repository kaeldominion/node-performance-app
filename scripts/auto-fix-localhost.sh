#!/bin/bash

# NØDE Localhost Auto-Fix Script
# Automatically checks for errors and fixes common issues
#
# Usage:
#   ./scripts/auto-fix-localhost.sh
#   or
#   npm run dev:fix
#
# What it checks and fixes:
#   - Docker is running
#   - Database container is running and accessible
#   - Backend .env file exists and has required variables
#   - Frontend .env.local file exists and has required variables
#   - Prisma client is generated
#   - Database migrations are up to date
#   - Backend server is running on port 4000
#   - Frontend server is running on port 3000
#   - API endpoints are responding
#   - Common errors in server logs
#
# The script will automatically:
#   - Start the database if it's not running
#   - Create missing .env files with defaults
#   - Generate Prisma client if missing
#   - Apply pending migrations
#   - Start backend/frontend servers if they're not running

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
ISSUES_FOUND=0
ISSUES_FIXED=0

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
}

fix_issue() {
    log_success "Fixed: $1"
    ISSUES_FIXED=$((ISSUES_FIXED + 1))
}

# Check if a port is in use
check_port() {
    local port=$1
    lsof -i :$port > /dev/null 2>&1
}

# Check if a URL is responding
check_url() {
    local url=$1
    local timeout=${2:-5}
    curl -s -o /dev/null -w "%{http_code}" --max-time $timeout "$url" 2>/dev/null || echo "000"
}

# Check if Docker is running
check_docker() {
    log_info "Checking Docker..."
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running"
        echo "   Please start Docker Desktop and try again."
        return 1
    fi
    log_success "Docker is running"
    return 0
}

# Check database
check_database() {
    log_info "Checking database..."
    
    if ! docker ps | grep -q node-postgres; then
        log_warning "Database container is not running"
        log_info "Starting database..."
        docker-compose up -d postgres
        log_info "Waiting for database to be ready..."
        sleep 5
        local retries=0
        while ! docker exec node-postgres pg_isready -U node_user -d node_db > /dev/null 2>&1; do
            if [ $retries -ge 10 ]; then
                log_error "Database failed to start after 10 retries"
                return 1
            fi
            sleep 2
            retries=$((retries + 1))
        done
        fix_issue "Database started"
    else
        log_success "Database container is running"
    fi
    
    # Test database connection
    if docker exec node-postgres psql -U node_user -d node_db -c "SELECT 1;" > /dev/null 2>&1; then
        log_success "Database connection successful"
    else
        log_error "Cannot connect to database"
        return 1
    fi
    
    return 0
}

# Check backend environment
check_backend_env() {
    log_info "Checking backend environment..."
    
    cd backend
    
    # Check if .env exists
    if [ ! -f .env ]; then
        log_warning "Backend .env file is missing"
        if [ -f .env.example ]; then
            log_info "Creating .env from .env.example..."
            cp .env.example .env
            fix_issue "Created backend/.env from template"
        else
            log_info "Creating basic .env file..."
            cat > .env << EOF
# Database
DATABASE_URL="postgresql://node_user:node_password@localhost:5433/node_db"

# Server
PORT=4000
FRONTEND_URL="http://localhost:3000"

# JWT (generate with: openssl rand -base64 32)
JWT_SECRET="$(openssl rand -base64 32)"

# OpenAI (optional - add your key)
# OPENAI_API_KEY="your-key-here"

# Clerk (optional - add your key)
# CLERK_SECRET_KEY="your-key-here"
# CLERK_WEBHOOK_SECRET="your-webhook-secret-here"
EOF
            fix_issue "Created basic backend/.env file"
        fi
    else
        log_success "Backend .env file exists"
    fi
    
    # Check for required variables
    source .env 2>/dev/null || true
    
    if [ -z "$DATABASE_URL" ]; then
        log_warning "DATABASE_URL not set in backend/.env"
        if grep -q "DATABASE_URL" .env; then
            log_info "DATABASE_URL exists but may be commented out"
        else
            log_info "Adding DATABASE_URL to .env..."
            echo 'DATABASE_URL="postgresql://node_user:node_password@localhost:5433/node_db"' >> .env
            fix_issue "Added DATABASE_URL to backend/.env"
        fi
    else
        log_success "DATABASE_URL is set"
    fi
    
    cd ..
}

# Check frontend environment
check_frontend_env() {
    log_info "Checking frontend environment..."
    
    cd frontend
    
    # Check if .env.local exists
    if [ ! -f .env.local ]; then
        log_warning "Frontend .env.local file is missing"
        if [ -f .env.example ]; then
            log_info "Creating .env.local from .env.example..."
            cp .env.example .env.local
            fix_issue "Created frontend/.env.local from template"
        else
            log_info "Creating basic .env.local file..."
            cat > .env.local << EOF
# API URL
NEXT_PUBLIC_API_URL="http://localhost:4000"

# Clerk (add your keys)
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-publishable-key"
# CLERK_SECRET_KEY="your-secret-key"
EOF
            fix_issue "Created basic frontend/.env.local file"
        fi
    else
        log_success "Frontend .env.local file exists"
    fi
    
    # Check for API URL
    if ! grep -q "NEXT_PUBLIC_API_URL" .env.local 2>/dev/null; then
        log_warning "NEXT_PUBLIC_API_URL not set in frontend/.env.local"
        log_info "Adding NEXT_PUBLIC_API_URL to .env.local..."
        echo 'NEXT_PUBLIC_API_URL="http://localhost:4000"' >> .env.local
        fix_issue "Added NEXT_PUBLIC_API_URL to frontend/.env.local"
    else
        log_success "NEXT_PUBLIC_API_URL is set"
    fi
    
    cd ..
}

# Check Prisma client
check_prisma() {
    log_info "Checking Prisma client..."
    
    cd backend
    
    if [ ! -d "node_modules/.prisma" ] || [ ! -f "node_modules/.prisma/client/index.js" ]; then
        log_warning "Prisma client not generated"
        log_info "Generating Prisma client..."
        npx prisma generate
        fix_issue "Generated Prisma client"
    else
        log_success "Prisma client is generated"
    fi
    
    cd ..
}

# Check database migrations
check_migrations() {
    log_info "Checking database migrations..."
    
    cd backend
    
    # Check if migrations are up to date
    if npx prisma migrate status > /dev/null 2>&1; then
        local status=$(npx prisma migrate status 2>&1)
        if echo "$status" | grep -q "Database schema is up to date"; then
            log_success "Database migrations are up to date"
        elif echo "$status" | grep -q "following migration have not yet been applied"; then
            log_warning "Pending migrations detected"
            log_info "Applying migrations..."
            npx prisma migrate deploy
            fix_issue "Applied pending migrations"
        else
            log_warning "Migration status unclear, attempting to sync..."
            npx prisma db push --accept-data-loss
            fix_issue "Synced database schema"
        fi
    else
        log_warning "Could not check migration status, pushing schema..."
        npx prisma db push --accept-data-loss
        fix_issue "Pushed database schema"
    fi
    
    cd ..
}

# Check backend server
check_backend() {
    log_info "Checking backend server (port 4000)..."
    
    if check_port 4000; then
        local status=$(check_url "http://localhost:4000" 3)
        if [ "$status" = "200" ] || [ "$status" = "404" ]; then
            log_success "Backend server is running and responding"
            return 0
        else
            log_warning "Backend port is in use but not responding correctly (status: $status)"
        fi
    else
        log_warning "Backend server is not running"
    fi
    
    # Try to start backend
    log_info "Starting backend server..."
    cd backend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        log_info "Installing backend dependencies..."
        npm install
        fix_issue "Installed backend dependencies"
    fi
    
    # Start backend in background
    npm run start:dev > /tmp/node-backend.log 2>&1 &
    local backend_pid=$!
    echo $backend_pid > /tmp/node-backend.pid
    
    log_info "Waiting for backend to start..."
    local retries=0
    while [ $retries -lt 15 ]; do
        sleep 2
        local status=$(check_url "http://localhost:4000" 2)
        if [ "$status" = "200" ] || [ "$status" = "404" ]; then
            log_success "Backend server started successfully"
            fix_issue "Started backend server"
            cd ..
            return 0
        fi
        retries=$((retries + 1))
    done
    
    log_error "Backend failed to start after 30 seconds"
    log_info "Check logs: tail -f /tmp/node-backend.log"
    cd ..
    return 1
}

# Check frontend server
check_frontend() {
    log_info "Checking frontend server (port 3000)..."
    
    if check_port 3000; then
        local status=$(check_url "http://localhost:3000" 3)
        if [ "$status" = "200" ]; then
            log_success "Frontend server is running and responding"
            return 0
        else
            log_warning "Frontend port is in use but not responding correctly (status: $status)"
        fi
    else
        log_warning "Frontend server is not running"
    fi
    
    # Try to start frontend
    log_info "Starting frontend server..."
    cd frontend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        log_info "Installing frontend dependencies..."
        npm install
        fix_issue "Installed frontend dependencies"
    fi
    
    # Start frontend in background
    npm run dev > /tmp/node-frontend.log 2>&1 &
    local frontend_pid=$!
    echo $frontend_pid > /tmp/node-frontend.pid
    
    log_info "Waiting for frontend to start..."
    local retries=0
    while [ $retries -lt 15 ]; do
        sleep 2
        local status=$(check_url "http://localhost:3000" 2)
        if [ "$status" = "200" ]; then
            log_success "Frontend server started successfully"
            fix_issue "Started frontend server"
            cd ..
            return 0
        fi
        retries=$((retries + 1))
    done
    
    log_error "Frontend failed to start after 30 seconds"
    log_info "Check logs: tail -f /tmp/node-frontend.log"
    cd ..
    return 1
}

# Test API endpoints
test_endpoints() {
    log_info "Testing API endpoints..."
    
    # Test backend health
    local backend_status=$(check_url "http://localhost:4000" 5)
    if [ "$backend_status" = "200" ] || [ "$backend_status" = "404" ]; then
        log_success "Backend is reachable"
    else
        log_error "Backend is not reachable (status: $backend_status)"
    fi
    
    # Test frontend
    local frontend_status=$(check_url "http://localhost:3000" 5)
    if [ "$frontend_status" = "200" ]; then
        log_success "Frontend is reachable"
    else
        log_error "Frontend is not reachable (status: $frontend_status)"
    fi
    
    # Test specific API endpoints if backend is up
    if [ "$backend_status" = "200" ] || [ "$backend_status" = "404" ]; then
        # Test public endpoint
        local programs_status=$(check_url "http://localhost:4000/programs" 5)
        if [ "$programs_status" = "200" ]; then
            log_success "Public API endpoint (/programs) is working"
        elif [ "$programs_status" = "401" ]; then
            log_warning "Public API endpoint requires authentication (status: 401)"
        else
            log_warning "Public API endpoint returned status: $programs_status"
        fi
        
        # Test protected endpoint (should return 401 without auth, which is expected)
        local sessions_status=$(check_url "http://localhost:4000/me/sessions/recent" 5)
        if [ "$sessions_status" = "401" ]; then
            log_success "Protected API endpoint is responding (401 = auth required, expected)"
        elif [ "$sessions_status" = "200" ]; then
            log_success "Protected API endpoint is working (authenticated)"
        elif [ "$sessions_status" = "404" ]; then
            log_warning "Protected API endpoint not found (status: 404) - route may be missing"
        else
            log_warning "Protected API endpoint returned unexpected status: $sessions_status"
        fi
        
        # Check for common error patterns in backend logs
        if [ -f /tmp/node-backend.log ]; then
            local auth_errors=$(grep -i "unauthorized\|invalid token\|authentication" /tmp/node-backend.log | tail -3)
            if [ -n "$auth_errors" ] && [ "$sessions_status" = "401" ]; then
                log_info "Authentication errors in logs (expected for unauthenticated requests)"
            fi
        fi
    fi
}

# Check for common errors in logs
check_logs() {
    log_info "Checking for errors in server logs..."
    
    if [ -f /tmp/node-backend.log ]; then
        local backend_errors=$(grep -i "error\|failed\|exception" /tmp/node-backend.log | tail -5)
        if [ -n "$backend_errors" ]; then
            log_warning "Recent backend errors found:"
            echo "$backend_errors" | sed 's/^/   /'
        fi
    fi
    
    if [ -f /tmp/node-frontend.log ]; then
        local frontend_errors=$(grep -i "error\|failed\|exception" /tmp/node-frontend.log | tail -5)
        if [ -n "$frontend_errors" ]; then
            log_warning "Recent frontend errors found:"
            echo "$frontend_errors" | sed 's/^/   /'
        fi
    fi
}

# Main execution
main() {
    echo ""
    echo "🔧 NØDE Localhost Auto-Fix Script"
    echo "=================================="
    echo ""
    
    # Run all checks
    check_docker || exit 1
    check_database || exit 1
    check_backend_env
    check_frontend_env
    check_prisma
    check_migrations
    check_backend
    check_frontend
    test_endpoints
    check_logs
    
    echo ""
    echo "=================================="
    echo "📊 Summary"
    echo "=================================="
    echo "Issues found: $ISSUES_FOUND"
    echo "Issues fixed: $ISSUES_FIXED"
    echo ""
    
    if [ $ISSUES_FOUND -eq 0 ] && [ $ISSUES_FIXED -eq 0 ]; then
        log_success "Everything looks good! Your localhost site should be running."
        echo ""
        echo "🌐 Frontend: http://localhost:3000"
        echo "🔧 Backend:  http://localhost:4000"
    elif [ $ISSUES_FOUND -eq 0 ]; then
        log_success "All issues have been fixed!"
        echo ""
        echo "🌐 Frontend: http://localhost:3000"
        echo "🔧 Backend:  http://localhost:4000"
    else
        log_warning "Some issues could not be automatically fixed."
        echo ""
        echo "Check the logs for more details:"
        echo "  Backend:  tail -f /tmp/node-backend.log"
        echo "  Frontend: tail -f /tmp/node-frontend.log"
    fi
    
    echo ""
}

# Run main function
main

