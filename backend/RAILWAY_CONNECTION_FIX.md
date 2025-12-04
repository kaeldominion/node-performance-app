# Fix Railway Database Connection

## The Problem
Railway can't connect to the database using `postgres.railway.internal:5432`. This usually means:
1. DATABASE_URL isn't set correctly in Railway
2. The database service isn't linked to your backend service

## Quick Fix: Use Prisma db push Instead

Since migrations are having issues, let's use `db push` which is simpler and doesn't require resolving migrations:

```bash
cd backend
railway run npx prisma db push --accept-data-loss
```

This will:
- Sync your schema directly to the database
- Add missing columns (createdBy, coachId)
- Skip the migration system entirely

## Alternative: Check Railway Setup

### Step 1: Verify DATABASE_URL is Set

1. Go to Railway Dashboard → Your Backend Service
2. Click **"Variables"** tab
3. Look for `DATABASE_URL`
4. It should be automatically set by Railway if your database is linked

### Step 2: Link Database to Backend (If Not Linked)

1. In Railway Dashboard → Your Backend Service
2. Go to **"Variables"** tab
3. Click **"+ New Variable"**
4. Railway should show your PostgreSQL service as an option
5. Select it to auto-link

### Step 3: Try Again

After verifying DATABASE_URL:

```bash
railway run npx prisma db push --accept-data-loss
```

## Simplest Solution: Just Use db push

The easiest way is to skip migrations entirely and just push the schema:

```bash
cd backend
railway run npx prisma db push --accept-data-loss
```

This will add any missing columns from your schema directly to the database.

