# Fix Railway Database Schema

## Problem
The Railway production database is missing the `createdBy` and `coachId` columns in the `programs` table, causing the `/programs` endpoint to fail.

## Solution: Apply Migration to Railway

### Option 1: Use Railway's Database Console (Easiest)

1. **Go to Railway Dashboard**
   - Navigate to your PostgreSQL database service
   - Click on the database service
   - Go to **"Data"** or **"Query"** tab

2. **Run this SQL directly:**
   ```sql
   ALTER TABLE "programs" ADD COLUMN "createdBy" TEXT;
   ALTER TABLE "programs" ADD COLUMN "coachId" TEXT;
   
   -- Add foreign key if coach_profiles table exists
   ALTER TABLE "programs" ADD CONSTRAINT "programs_coachId_fkey" 
     FOREIGN KEY ("coachId") REFERENCES "coach_profiles"("id") 
     ON DELETE SET NULL ON UPDATE CASCADE;
   ```

3. **Verify it worked:**
   ```bash
   curl https://node-performance-app-production.up.railway.app/programs
   ```

### Option 2: Use Railway CLI

1. **Install Railway CLI** (if not installed):
   ```bash
   npm i -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Link to your project:**
   ```bash
   railway link
   ```

4. **Run migration:**
   ```bash
   cd backend
   railway run npx prisma migrate deploy
   ```

### Option 3: Deploy Migration via Git

The migration file has been created locally. To apply it:

1. **Commit and push the migration:**
   ```bash
   git add backend/prisma/migrations/20251205040000_add_program_created_by/
   git commit -m "Add createdBy and coachId to programs table"
   git push
   ```

2. **Railway will auto-deploy**, but you may need to manually run:
   - Go to Railway → Your backend service → Deployments
   - Or set up a deploy hook to run `prisma migrate deploy`

### Quick Fix (Temporary)

If you need an immediate fix and can't access Railway console, you can temporarily modify the service to not use `createdBy`:

But the proper fix is to add the columns to the database.

## Verify Fix

After applying the migration, test:
```bash
curl https://node-performance-app-production.up.railway.app/programs
```

You should get a JSON response with programs, not a 500 error.

