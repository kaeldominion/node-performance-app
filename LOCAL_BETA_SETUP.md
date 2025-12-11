# Local Beta Setup - Quick Start

Let's get your beta environment running locally so you can start developing v2 features.

---

## Step 1: Create Beta Environment Files

### Backend Beta Config

```bash
cd backend
cp .env.beta.example .env.beta
```

Then edit `backend/.env.beta` and update these values:
- `CLERK_SECRET_KEY` - Copy from your production `.env` or use same value
- `OPENAI_API_KEY` - Copy from your production `.env` or use same value
- `JWT_SECRET` - Generate a new one or use same (doesn't matter for local)

**The DATABASE_URL is already set correctly for beta (port 5434)**

### Frontend Beta Config

```bash
cd frontend
cp .env.local.beta.example .env.local.beta
```

Then edit `frontend/.env.local.beta` and update:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Copy from your production `.env.local` or use same value

**The NEXT_PUBLIC_API_URL is already set correctly for beta (localhost:4001)**

---

## Step 2: Start Beta Database

```bash
# From project root
npm run beta:db:up
```

This will:
- Start a new PostgreSQL container: `node-postgres-beta`
- Use port `5434` (production uses `5433`)
- Create database: `node_db_beta`

Verify it's running:
```bash
docker ps | grep node-postgres-beta
```

---

## Step 3: Initialize Beta Database Schema

```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Run migrations (creates all tables)
npm run prisma:migrate

# Optional: Seed with test data
npm run prisma:seed
npm run prisma:seed:exercises
```

---

## Step 4: Start Beta Development Servers

### Option 1: Quick Start (Recommended)

```bash
# From project root
npm run beta:start
```

This starts:
- Backend on `http://localhost:4001`
- Frontend on `http://localhost:3001`
- Database on `localhost:5434`

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
# Load beta env
export $(cat .env.beta | grep -v '^#' | xargs)
PORT=4001 npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
# Copy beta env to .env.local (temporarily)
cp .env.local.beta .env.local
PORT=3001 npm run dev
```

---

## Step 5: Verify It's Working

1. **Check Backend**: Visit `http://localhost:4001` - Should see NestJS welcome or API response
2. **Check Frontend**: Visit `http://localhost:3001` - Should see your app
3. **Check Database**: 
   ```bash
   psql postgresql://node_user_beta:node_password_beta@localhost:5434/node_db_beta -c "\dt"
   ```
   Should show all your tables

---

## Running Both Production and Beta Simultaneously

You can run both at the same time:

**Production:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- Database: `localhost:5433`

**Beta:**
- Frontend: `http://localhost:3001`
- Backend: `http://localhost:4001`
- Database: `localhost:5434`

Just make sure you're on the correct branch:
- Production: `git checkout main` → `npm run dev:start`
- Beta: `git checkout beta` → `npm run beta:start`

---

## Quick Commands Reference

```bash
# Start beta database
npm run beta:db:up

# Stop beta database
npm run beta:db:down

# View beta database logs
npm run beta:db:logs

# Start beta dev servers
npm run beta:start

# Start beta backend only
npm run beta:backend

# Start beta frontend only
npm run beta:frontend
```

---

## Troubleshooting

### Port Already in Use

If you get port conflicts:
```bash
# Check what's using the port
lsof -i :3001  # Frontend
lsof -i :4001  # Backend
lsof -i :5434  # Database

# Kill the process or stop the other environment
```

### Database Connection Issues

```bash
# Verify beta database is running
docker ps | grep node-postgres-beta

# Restart if needed
npm run beta:db:down
npm run beta:db:up
```

### Environment Variables Not Loading

Make sure you:
1. Created `.env.beta` from `.env.beta.example`
2. Created `.env.local.beta` from `.env.local.beta.example`
3. Filled in all required values (especially API keys)

---

## Next Steps

Once beta is running locally:

1. ✅ Test that beta works (`http://localhost:3001`)
2. ✅ Start developing v2 architecture changes
3. ✅ Test changes on beta without affecting production
4. ⏸️ Later: Set up Railway/Vercel beta deployments (when ready)

---

## Summary

**What we're setting up:**
- ✅ Beta database (separate from production)
- ✅ Beta backend config (port 4001)
- ✅ Beta frontend config (port 3001)
- ✅ Beta development environment

**Result:**
- Production: `localhost:3000` (unchanged)
- Beta: `localhost:3001` (new, for v2 development)

Let's get started! 🚀

