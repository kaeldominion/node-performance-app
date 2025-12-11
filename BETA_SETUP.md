# Beta Environment Setup Guide

This guide explains how to set up and work with the beta environment for v2 development.

## Overview

The beta environment allows you to:
- Develop v2 architecture changes safely without affecting production
- Run both production and beta locally simultaneously (different ports)
- Deploy to `beta.nodeos.app` separately from production
- Test new AI generation, workout database, and live deck architectures

## Architecture

### Git Structure
- **`main` branch**: Production code (deployed to `nodeos.app`)
- **`beta` branch**: Beta/v2 code (deployed to `beta.nodeos.app`)

### Local Development Ports
- **Production**: Frontend `localhost:3000`, Backend `localhost:4000`, DB `localhost:5433`
- **Beta**: Frontend `localhost:3001`, Backend `localhost:4001`, DB `localhost:5434`

### Deployments
- **Production**: Railway + Vercel projects pointing to `main` branch
- **Beta**: Separate Railway + Vercel projects pointing to `beta` branch

## Initial Setup

### 1. Switch to Beta Branch

```bash
git checkout beta
```

If the beta branch doesn't exist yet:
```bash
git checkout -b beta
```

### 2. Set Up Beta Local Database

```bash
# Start beta PostgreSQL container
npm run beta:db:up

# Verify it's running
docker ps | grep node-postgres-beta
```

### 3. Configure Environment Variables

#### Backend
```bash
cd backend
cp .env.beta.example .env.beta
# Edit .env.beta and fill in your values
```

Required values in `backend/.env.beta`:
- `DATABASE_URL`: Already set for local beta (port 5434)
- `PORT`: 4001 (beta backend port)
- `FRONTEND_URL`: http://localhost:3001
- `CLERK_SECRET_KEY`: Your Clerk secret key
- `OPENAI_API_KEY`: Your OpenAI API key

#### Frontend
```bash
cd frontend
cp .env.local.beta.example .env.local.beta
# Edit .env.local.beta and fill in your values
```

Required values in `frontend/.env.local.beta`:
- `NEXT_PUBLIC_API_URL`: http://localhost:4001
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key

### 4. Initialize Beta Database

```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Run migrations (creates schema)
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed
npm run prisma:seed:exercises
```

## Running Beta Locally

### Option 1: Quick Start Script (Recommended)

```bash
# From project root
npm run beta:start
```

This will:
- Start beta PostgreSQL container
- Start backend on `localhost:4001`
- Start frontend on `localhost:3001`

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
# Load beta env file
export $(cat .env.beta | grep -v '^#' | xargs)
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
# Copy beta env to .env.local
cp .env.local.beta .env.local
PORT=3001 npm run dev
```

**Terminal 3 - Database (if not already running):**
```bash
npm run beta:db:up
```

## Working with Beta

### Switching Between Production and Beta

**Work on Production:**
```bash
git checkout main
npm run dev:start  # Uses ports 3000, 4000, 5433
```

**Work on Beta:**
```bash
git checkout beta
npm run beta:start  # Uses ports 3001, 4001, 5434
```

### Running Both Simultaneously

You can run both production and beta at the same time:
- Production: `localhost:3000` (frontend), `localhost:4000` (backend)
- Beta: `localhost:3001` (frontend), `localhost:4001` (backend)

Just make sure you're on the correct branch for each terminal.

## Beta Deployment Setup

### Railway (Backend)

1. **Create New Railway Project**: `node-performance-app-beta`
2. **Connect GitHub Repo**: Point to `beta` branch
3. **Set Root Directory**: `backend`
4. **Add PostgreSQL Database**: Create new database service
5. **Configure Environment Variables**:
   - `DATABASE_URL`: From beta PostgreSQL service
   - `PORT`: 3001 (or auto-assigned)
   - `FRONTEND_URL`: `https://beta.nodeos.app`
   - `CLERK_SECRET_KEY`: Your Clerk secret
   - `OPENAI_API_KEY`: Your OpenAI key
   - `JWT_SECRET`: New secret (different from production)

### Vercel (Frontend)

1. **Create New Vercel Project**: `node-performance-app-beta`
2. **Connect GitHub Repo**: Point to `beta` branch
3. **Set Root Directory**: `frontend`
4. **Configure Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: Beta Railway backend URL
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key

### Domain Configuration

1. **Add DNS Record**: `beta.nodeos.app` → Point to beta Vercel deployment
2. **SSL**: Vercel will automatically provision SSL certificate

## Database Management

### Beta Database Commands

```bash
# Start beta database
npm run beta:db:up

# Stop beta database
npm run beta:db:down

# View beta database logs
npm run beta:db:logs

# Connect to beta database (psql)
psql postgresql://node_user_beta:node_password_beta@localhost:5434/node_db_beta
```

### Reset Beta Database

```bash
# Stop and remove containers/volumes
npm run beta:db:down
docker volume rm node-performance-app_postgres_data_beta

# Start fresh
npm run beta:db:up
cd backend
npm run prisma:migrate
npm run prisma:seed
```

## Development Workflow

### Making Changes to Beta

1. **Ensure you're on beta branch**:
   ```bash
   git checkout beta
   git status
   ```

2. **Make your changes** (AI generation, workout DB, live deck, etc.)

3. **Test locally**:
   ```bash
   npm run beta:start
   # Test at http://localhost:3001
   ```

4. **Commit to beta branch**:
   ```bash
   git add .
   git commit -m "feat: new AI generation architecture"
   git push origin beta
   ```

5. **Deploy**: Railway and Vercel will auto-deploy from `beta` branch

### Merging Changes from Main to Beta

To get production updates into beta:

```bash
git checkout beta
git merge main
# Resolve any conflicts
git push origin beta
```

### Merging Beta to Main (When Ready)

When beta is ready to become production:

```bash
git checkout main
git merge beta
git push origin main
```

## Switchover Strategies

When beta is ready to replace production:

### Option 1: DNS Switch (Simplest)
1. Point `nodeos.app` DNS to beta deployment
2. Point old production to backup domain
3. **Pros**: Instant, clean cutover
4. **Cons**: All-or-nothing, no gradual rollout

### Option 2: Feature Flags (Recommended)
1. Add feature flag system (LaunchDarkly, or custom)
2. Route users to beta based on flags
3. Gradually increase beta traffic
4. **Pros**: Gradual rollout, easy rollback
5. **Cons**: More complex setup

### Option 3: Gradual Migration
1. Keep both environments running
2. Migrate users in batches
3. Eventually sunset old production
4. **Pros**: Safest, allows A/B testing
5. **Cons**: Most complex, higher costs

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Check what's using the port
lsof -i :3001  # Frontend
lsof -i :4001  # Backend
lsof -i :5434  # Database

# Kill the process or use different ports
```

### Database Connection Issues

```bash
# Verify beta database is running
docker ps | grep node-postgres-beta

# Check database logs
npm run beta:db:logs

# Restart database
npm run beta:db:down
npm run beta:db:up
```

### Environment Variables Not Loading

Make sure you've:
1. Copied `.env.beta.example` to `.env.beta` (backend)
2. Copied `.env.local.beta.example` to `.env.local.beta` (frontend)
3. Filled in all required values

### CORS Errors

The backend CORS is configured to allow:
- `http://localhost:3001` (beta local)
- `https://beta.nodeos.app` (beta production)

If you see CORS errors, check `backend/src/main.ts` CORS configuration.

## File Structure

```
node-performance-app/
├── backend/
│   ├── .env                    # Production local
│   ├── .env.beta.example       # Beta env template
│   └── .env.beta               # Beta local (gitignored)
├── frontend/
│   ├── .env.local              # Production local
│   ├── .env.local.beta.example # Beta env template
│   └── .env.local.beta         # Beta local (gitignored)
├── docker-compose.yml          # Production database
├── docker-compose.beta.yml     # Beta database
└── scripts/
    ├── dev-start.sh            # Production dev script
    └── dev-start-beta.sh       # Beta dev script
```

## Next Steps

1. ✅ Set up beta local environment (this guide)
2. 🔄 Deploy beta to Railway + Vercel
3. 🔄 Configure `beta.nodeos.app` domain
4. 🔄 Begin v2 architecture development:
   - AI generation redesign
   - Workout database improvements
   - Live deck enhancements
5. 🔄 Test thoroughly in beta
6. 🔄 Plan switchover strategy
7. 🔄 Execute switchover when ready

## Support

If you encounter issues:
1. Check this guide
2. Review error logs
3. Verify environment variables
4. Check database connection
5. Ensure you're on the correct git branch

