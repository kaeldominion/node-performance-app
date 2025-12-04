# Run Commands on Railway (Not Locally!)

## Important: Use `railway run`!

You need to run commands **on Railway**, not locally. The local environment doesn't have access to Railway's database.

## Step 1: Resolve the Failed Migration

```bash
cd backend
railway run npx prisma migrate resolve --applied 20251205040000_add_program_created_by
```

Notice the `railway run` prefix - this runs the command **on Railway**, not on your local machine.

## Step 2: Fix the Columns

```bash
railway run npm run fix:programs-columns
```

Again, using `railway run` so it executes in Railway's environment.

## Step 3: Test

```bash
curl https://node-performance-app-production.up.railway.app/programs
```

## Alternative: Use Prisma db push

If the script still has issues, use Prisma's `db push` which is simpler:

```bash
railway run npx prisma db push
```

This will sync your schema directly to the database without using migrations.

## Key Point

- ❌ `npm run fix:programs-columns` - Runs locally (won't work)
- ✅ `railway run npm run fix:programs-columns` - Runs on Railway (correct!)

Always use `railway run` when you want to execute commands in Railway's environment!

