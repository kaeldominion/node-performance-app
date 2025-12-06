# Fix Production Database - Missing Columns and Tables

Your production database on Railway is missing several migrations. Here's how to fix it:

## Quick Fix: Run All Migrations

**Method 1: Using Railway Shell (Recommended)**

1. Go to [railway.app](https://railway.app)
2. Select your **Backend** service
3. Click **"Deployments"** tab
4. Open the most recent deployment
5. Click **"Shell"** button
6. Run:
   ```bash
   cd /app
   npx prisma migrate deploy
   ```

This should apply all pending migrations automatically.

## Method 2: Direct SQL Fix (If Migrations Fail)

If `prisma migrate deploy` doesn't work, you can run the SQL directly:

1. Go to Railway → Your **Postgres** service (not backend)
2. Click **"Data"** tab
3. Click **"Connect"** or **"Query"** button
4. Copy and paste the contents of `backend/scripts/fix-production-database.sql`
5. Run it

## Method 3: Using Railway CLI

```bash
# Install Railway CLI if needed
npm install -g @railway/cli

# Login and link
railway login
railway link

# Run migrations
railway run --service backend npx prisma migrate deploy
```

## What This Fixes

The script fixes:
- ✅ `users.username` column
- ✅ `users.networkCode` column  
- ✅ `users.xp` and `users.level` columns
- ✅ `session_logs.startedAt` (renames from `performedAt`)
- ✅ `session_logs.completedAt`, `createdAt`, `updatedAt`
- ✅ `session_logs.programId`, `weekIndex`, `dayIndex`
- ✅ `session_logs.avgHeartRate`, `maxHeartRate`
- ✅ `notifications` table (creates if missing)
- ✅ All required enums (NotificationType, ActivityType, NetworkStatus)

## Verify It Worked

After running, check Railway logs - you should see fewer errors. The app should work normally.

