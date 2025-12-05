# Railway Migration Guide

## Quick Migration (Recommended)

The easiest way is to use Railway's automatic migration on deploy. The `railway.json` has been updated to run `prisma migrate deploy` automatically.

### Option 1: Automatic Migration (Easiest)

1. **Push your code to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Add XP/level gamification and distance fields to tier prescriptions"
   git push
   ```

2. **Railway will automatically**:
   - Build your backend
   - Run `npx prisma generate`
   - Run `npx prisma migrate deploy` (applies all pending migrations)
   - Start your app

3. **Check the deploy logs** in Railway to verify migrations ran successfully.

### Option 2: Manual Migration via Railway Shell

If automatic migration doesn't work or you want to run it manually:

1. **Go to Railway Dashboard** → Your Backend Service
2. **Click "Deployments"** → Find your latest deployment
3. **Click the three dots (⋯)** → **"Open Shell"**
4. **Run these commands**:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

5. **Verify migrations**:
   ```bash
   npx prisma migrate status
   ```

### Option 3: Manual Migration via Admin Endpoint

You can also trigger migrations via the admin API endpoint:

1. **Get your Clerk admin token** (from your frontend or Clerk dashboard)
2. **Call the migration endpoint**:
   ```bash
   curl -X POST https://your-railway-backend.up.railway.app/admin/migrate \
     -H "Authorization: Bearer YOUR_CLERK_TOKEN"
   ```

## Migrations Being Applied

The following migrations will be applied:

1. **`20251206000000_add_distance_to_tier_prescriptions`**
   - Adds `distance` (INTEGER) and `distanceUnit` (TEXT) to `tier_prescriptions` table
   - Allows tier-specific distances/calories for erg machines

2. **`20251206000001_add_xp_and_level`**
   - Adds `xp` (INTEGER, default: 0) to `users` table
   - Adds `level` (INTEGER, default: 1) to `users` table
   - Enables gamification system

## Verify Migrations Succeeded

After deployment, check:

1. **Railway Deploy Logs** - Should show:
   ```
   ✔ Applied migration: 20251206000000_add_distance_to_tier_prescriptions
   ✔ Applied migration: 20251206000001_add_xp_and_level
   ```

2. **Database Schema** - In Railway Postgres service:
   - Go to "Database" tab → "Data" tab
   - Check `tier_prescriptions` table has `distance` and `distanceUnit` columns
   - Check `users` table has `xp` and `level` columns

3. **Test the API**:
   ```bash
   # Test gamification endpoint
   curl https://your-railway-backend.up.railway.app/gamification/stats \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

## Troubleshooting

### Migration Fails with "Migration Already Applied"

If you see errors about migrations already being applied:
- This is normal if you've run them before
- Railway will skip already-applied migrations automatically
- The `|| true` in the start command ensures the app still starts

### Migration Fails with "Column Already Exists"

If you see errors about columns already existing:
- The migrations use `IF NOT EXISTS` checks, so this shouldn't happen
- If it does, the columns are already there - you're good to go!

### Database Connection Issues

If migrations fail with connection errors:
- Check that `DATABASE_URL` is set in Railway environment variables
- Verify it's pointing to the correct Postgres service
- Check Railway Postgres service is running

## Post-Migration Checklist

- [ ] Migrations applied successfully (check deploy logs)
- [ ] Database schema updated (verify columns exist)
- [ ] Backend starts without errors
- [ ] Gamification endpoint works (`/gamification/stats`)
- [ ] Workout creation works with tier-specific distances
- [ ] XP/level display shows in frontend navbar

## Need Help?

If migrations fail:
1. Check Railway deploy logs for specific error messages
2. Try running migrations manually via Railway Shell (Option 2)
3. Check that all migration files are in `backend/prisma/migrations/`
4. Verify Prisma schema matches the migrations

