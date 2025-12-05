# Add isRecommended Column Migration

## Problem
The database is missing the `isRecommended` column that exists in the Prisma schema, causing workout creation to fail.

## Solution
A migration has been created to add the `isRecommended` column to the `workouts` table.

## Run Migration on Production (Railway)

### Option 1: Using Railway CLI
```bash
# Connect to Railway
railway link

# Run the migration
railway run npx prisma migrate deploy
```

### Option 2: Using Railway Dashboard
1. Go to Railway Dashboard → Your Backend Service
2. Go to **Deployments** tab
3. Click on the latest deployment
4. Open the **Shell** or **Logs** tab
5. Run:
```bash
npx prisma migrate deploy
```

### Option 3: Direct SQL (if migrations don't work)
1. Go to Railway Dashboard → Your Postgres Database
2. Go to **Data** tab → **Query** tab
3. Run this SQL:
```sql
ALTER TABLE "workouts" ADD COLUMN IF NOT EXISTS "isRecommended" BOOLEAN NOT NULL DEFAULT false;
```

## Verify Migration
After running the migration, verify it worked:
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'workouts' AND column_name = 'isRecommended';
```

Should return:
- column_name: `isRecommended`
- data_type: `boolean`
- column_default: `false`

## Local Development
If you're running locally, the migration should already be applied. If not:
```bash
cd backend
npx prisma migrate deploy
```

## Note
The migration file is located at:
`backend/prisma/migrations/20251208000000_add_is_recommended_to_workouts/migration.sql`

