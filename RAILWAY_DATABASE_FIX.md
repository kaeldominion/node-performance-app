# Fix Production Database - Missing Columns and Tables

Your production database on Railway is missing several migrations. Here's how to fix it:

## Quick Fix: Run All Migrations

**Method 1: Using Railway CLI (Recommended)**

1. Install Railway CLI (if you haven't):
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Link to your project:
   ```bash
   railway link
   ```
   (Select your project when prompted)

4. Run the migration:
   ```bash
   railway run --service node-performance-app npx prisma migrate deploy
   ```
   
   Or if your service is named differently:
   ```bash
   railway run --service backend npx prisma migrate deploy
   ```

This should apply all pending migrations automatically.

## Method 2: Direct SQL Fix (Easiest - No CLI Needed)

This is the **easiest method** - just run SQL directly on your database:

1. Go to [railway.app](https://railway.app)
2. Select your **Postgres** service (the database, not the backend)
3. Click the **"Data"** tab at the top
4. Click **"Query"** button (or look for a SQL query interface)
5. Copy the entire contents of `backend/scripts/fix-production-database.sql` from your repo
6. Paste it into the query box
7. Click **"Run"** or **"Execute"**

This will add all missing columns and tables in one go.

## Method 3: Redeploy (Automatic Migration)

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

