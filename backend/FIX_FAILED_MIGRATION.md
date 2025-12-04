# Fix Failed Migration on Railway

## Problem
The migration `20251205040000_add_program_created_by` failed and is stuck in a "failed" state in Prisma's migration history.

## Solution: Resolve the Failed Migration

### Step 1: Mark Migration as Rolled Back

You need to tell Prisma that the failed migration was rolled back, then we can apply it again.

**Using Railway CLI:**

```bash
# Install Railway CLI if needed
npm i -g @railway/cli

# Login and link
railway login
cd backend
railway link

# Mark the failed migration as rolled back
railway run npx prisma migrate resolve --rolled-back 20251205040000_add_program_created_by
```

### Step 2: Check if Columns Already Exist

The migration might have partially succeeded. Check if the columns exist:

```bash
railway run psql $DATABASE_URL -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'programs' AND column_name IN ('createdBy', 'coachId');"
```

### Step 3: Apply the Fixed Migration

I've updated the migration SQL to use `IF NOT EXISTS` checks. Now:

1. **Commit the updated migration:**
   ```bash
   git add backend/prisma/migrations/20251205040000_add_program_created_by/migration.sql
   git commit -m "Fix migration to handle existing columns"
   git push
   ```

2. **Redeploy on Railway** (or run):
   ```bash
   railway run npx prisma migrate deploy
   ```

### Alternative: Manual Fix (If Above Doesn't Work)

If the columns already exist but the migration is marked as failed:

1. **Manually add columns if missing:**
   ```bash
   railway run psql $DATABASE_URL -c "ALTER TABLE programs ADD COLUMN IF NOT EXISTS \"createdBy\" TEXT;"
   railway run psql $DATABASE_URL -c "ALTER TABLE programs ADD COLUMN IF NOT EXISTS \"coachId\" TEXT;"
   ```

2. **Mark migration as applied:**
   ```bash
   railway run npx prisma migrate resolve --applied 20251205040000_add_program_created_by
   ```

3. **Test:**
   ```bash
   curl https://node-performance-app-production.up.railway.app/programs
   ```

## Quick Fix Script

If you want to do it all at once:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and link
railway login
cd backend
railway link

# Fix the migration state
railway run npx prisma migrate resolve --rolled-back 20251205040000_add_program_created_by

# Apply the fixed migration
railway run npx prisma migrate deploy
```

