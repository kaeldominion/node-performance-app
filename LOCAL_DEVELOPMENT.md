# Local Development Setup Guide

This guide will help you set up a local development environment for NØDE, eliminating the need to deploy to see changes.

## Prerequisites

- ✅ Docker Desktop installed and running
- ✅ Node.js 20+ and npm 10+ installed
- ✅ Git installed

## Quick Setup (Automated)

Run the setup script:

```bash
chmod +x scripts/dev-setup.sh
./scripts/dev-setup.sh
```

This will:
1. Start PostgreSQL in Docker
2. Create `.env` files from examples
3. Install all dependencies
4. Run database migrations
5. Generate Prisma client

## Manual Setup

### Step 1: Start PostgreSQL Database

```bash
docker-compose up -d postgres
```

Verify it's running:
```bash
docker ps
```

### Step 2: Backend Setup

```bash
cd backend

# Create .env file
cp .env.example .env

# Edit .env and add your OPENAI_API_KEY
# DATABASE_URL is already set for local development

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) Seed database
npm run prisma:seed
npm run prisma:seed:exercises
```

### Step 3: Frontend Setup

```bash
cd frontend

# Create .env.local file
cp .env.example .env.local

# Edit .env.local and add your Clerk keys:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# CLERK_SECRET_KEY

# Install dependencies
npm install
```

## Running Development Servers

### Option 1: Separate Terminals (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```
Backend will run on `http://localhost:4000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:3000`

### Option 2: Quick Start Script

```bash
chmod +x scripts/dev-start.sh
./scripts/dev-start.sh
```

This starts both servers in the background.

## Environment Variables

### Backend (.env)

Required:
- `DATABASE_URL` - Already set for local (postgresql://node_user:node_password@localhost:5432/node_db)
- `OPENAI_API_KEY` - Your OpenAI API key for workout generation
- `JWT_SECRET` - Any random string (only needed if using JWT auth)
- `FRONTEND_URL` - http://localhost:3000

Optional:
- `CLERK_SECRET_KEY` - Only if testing Clerk webhooks locally
- `CLERK_WEBHOOK_SECRET` - Only if testing Clerk webhooks locally

### Frontend (.env.local)

Required:
- `NEXT_PUBLIC_API_URL` - http://localhost:4000
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key
- `CLERK_SECRET_KEY` - Your Clerk secret key

## Database Management

### View Database in Browser

```bash
cd backend
npx prisma studio
```

This opens Prisma Studio at `http://localhost:5555` where you can view/edit data.

### Run Migrations

```bash
cd backend
npx prisma migrate dev
```

### Reset Database (WARNING: Deletes all data)

```bash
cd backend
npx prisma migrate reset
```

### Seed Database

```bash
cd backend
npm run prisma:seed          # Seed programs
npm run prisma:seed:exercises # Seed exercises
```

## Common Commands

### Stop Database
```bash
docker-compose down
```

### Start Database
```bash
docker-compose up -d postgres
```

### View Database Logs
```bash
docker-compose logs -f postgres
```

### Access Database Shell
```bash
docker exec -it node-postgres psql -U node_user -d node_db
```

## Troubleshooting

### Port Already in Use

If port 5432 is already in use:
1. Change port in `docker-compose.yml`:
   ```yaml
   ports:
     - "5433:5432"  # Change 5433 to any available port
   ```
2. Update `DATABASE_URL` in `backend/.env`:
   ```
   DATABASE_URL="postgresql://node_user:node_password@localhost:5433/node_db?schema=public"
   ```

### Database Connection Failed

1. Check if Docker is running: `docker ps`
2. Check if container is running: `docker ps | grep node-postgres`
3. Check logs: `docker-compose logs postgres`
4. Restart container: `docker-compose restart postgres`

### Prisma Client Out of Sync

```bash
cd backend
npx prisma generate
```

### Clear Everything and Start Fresh

```bash
# Stop and remove containers
docker-compose down -v

# Remove node_modules
rm -rf backend/node_modules frontend/node_modules

# Run setup again
./scripts/dev-setup.sh
```

## Development Workflow

1. **Make code changes** in your editor
2. **Backend auto-reloads** (thanks to `nest start --watch`)
3. **Frontend hot-reloads** (thanks to Next.js dev mode)
4. **See changes instantly** - no deployment needed!

## Database Persistence

Data persists in a Docker volume. To completely reset:

```bash
docker-compose down -v
docker-compose up -d postgres
cd backend
npx prisma migrate deploy
```

## Next Steps

1. ✅ Database is running
2. ✅ Backend is running on port 4000
3. ✅ Frontend is running on port 3000
4. ✅ Open http://localhost:3000 in your browser
5. 🎉 Start coding!

## Notes

- Local database is completely separate from production
- Changes only affect your local environment
- You can safely experiment without affecting production
- No need to push to GitHub to test changes

