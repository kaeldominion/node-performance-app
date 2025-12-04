# Resolve Failed Migration - Step by Step

## The Problem
Prisma won't apply new migrations because `20251205040000_add_program_created_by` is marked as failed.

## Solution: Resolve the Failed Migration

### Step 1: Install Railway CLI (if not installed)

```bash
npm i -g @railway/cli
```

### Step 2: Login and Link

```bash
railway login
cd backend
railway link
# Select your Railway project when prompted
```

### Step 3: Check if Columns Already Exist

First, let's see if the migration partially succeeded:

```bash
railway run psql $DATABASE_URL -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'programs' AND column_name IN ('createdBy', 'coachId');"
```

**If you see `createdBy` and `coachId` in the output:**
- The columns exist! Skip to Step 4B

**If you see no results:**
- The columns don't exist. Skip to Step 4A

### Step 4A: Columns Don't Exist - Mark as Rolled Back

```bash
railway run npx prisma migrate resolve --rolled-back 20251205040000_add_program_created_by
```

Then apply the migration:
```bash
railway run npx prisma migrate deploy
```

### Step 4B: Columns Already Exist - Mark as Applied

Since the columns exist, just mark the migration as applied:

```bash
railway run npx prisma migrate resolve --applied 20251205040000_add_program_created_by
```

### Step 5: Verify It Worked

```bash
curl https://node-performance-app-production.up.railway.app/programs
```

You should get a JSON response, not a 500 error!

## Alternative: If Railway CLI Doesn't Work

If you can't use Railway CLI, you can manually fix it via Railway's web interface:

1. Go to Railway → Your Backend Service → Settings
2. Look for "Custom Start Command" or similar
3. Temporarily change it to:
   ```bash
   npx prisma migrate resolve --applied 20251205040000_add_program_created_by && npx prisma migrate deploy && npm run start:prod
   ```
4. Redeploy
5. Change it back to normal after

## Quick One-Liner (If Columns Exist)

If you're confident the columns already exist:

```bash
railway run npx prisma migrate resolve --applied 20251205040000_add_program_created_by && railway run npx prisma migrate deploy
```

