# Database Setup Guide

## Step 1: Get Database Connection String from Railway

1. In Railway, go to your **Postgres** service
2. Click on the **"Variables"** tab
3. Find `DATABASE_URL` or `POSTGRES_URL`
4. Copy the connection string (it looks like: `postgresql://user:password@host:port/dbname`)

## Step 2: Set Up Environment Variables

### Option A: Local Development
Create `backend/.env` file:
```bash
DATABASE_URL="postgresql://user:password@host:port/dbname"
JWT_SECRET="your-secret-key-here"
OPENAI_API_KEY="your-openai-key"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

### Option B: Railway (Production)
Add these in Railway → Your Backend Service → Variables:
- `DATABASE_URL` (already set by Railway Postgres)
- `JWT_SECRET` (generate a random string)
- `OPENAI_API_KEY` (your OpenAI key)
- `PORT` (usually 3001, or auto-assigned)
- `FRONTEND_URL` (add after Vercel deploy)

## Step 3: Run Migrations

### Local:
```bash
cd backend
npx prisma migrate dev --name init
```

### Railway (Production):
After deploying, in Railway's backend service:
1. Go to **Deploy Logs** or use **Railway CLI**
2. Run: `npx prisma migrate deploy`
3. Then: `npm run prisma:seed`

Or add to Railway's start command:
```json
{
  "scripts": {
    "deploy": "prisma generate && prisma migrate deploy && npm run build && npm run start:prod"
  }
}
```

## Step 4: Seed Database

After migrations, seed with NØDE programs:
```bash
npm run prisma:seed
```

This will create:
- NØDE Core Weekly program (all 6 archetypes)
- Villa Zeno Hybrid program
- All workout examples

## Step 5: Verify

Check your Railway database - you should now see tables:
- users
- user_profiles
- programs
- workouts
- workout_sections
- exercise_blocks
- tier_prescriptions
- user_programs
- session_logs

