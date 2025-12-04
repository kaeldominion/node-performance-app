# Simple Fix for Programs Columns

Since `psql` isn't available, we'll use a Node.js script instead.

## Step 1: Resolve the Failed Migration

First, mark the migration as applied (we'll fix the columns with a script):

```bash
cd backend
railway link  # (if not already linked)
railway run npx prisma migrate resolve --applied 20251205040000_add_program_created_by
```

## Step 2: Run the Fix Script

I've created a script that will check and add the columns if they're missing:

```bash
railway run npm run fix:programs-columns
```

This script will:
- Check if `createdBy` and `coachId` columns exist
- Add them if they don't exist
- Add the foreign key constraint if needed
- Handle errors gracefully

## Step 3: Test

```bash
curl https://node-performance-app-production.up.railway.app/programs
```

## Alternative: If Script Doesn't Work

If the script fails, you can manually mark the migration as applied and the columns will be added on the next schema sync:

```bash
# Just mark as applied
railway run npx prisma migrate resolve --applied 20251205040000_add_program_created_by

# Then trigger a redeploy - Railway will run migrations on start
# Or manually run:
railway run npx prisma db push
```

The `db push` command will sync your schema to the database without using migrations.

