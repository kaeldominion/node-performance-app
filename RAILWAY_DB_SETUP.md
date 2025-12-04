# Railway Database Setup - Quick Guide

## Current Status
✅ Postgres database created in Railway  
⏳ Need to run migrations to create tables

## Quick Setup (Choose One Method)

### Method 1: Railway Web Interface (Easiest)

1. **In Railway, go to your Backend service** (not Postgres)
2. Click **"Settings"** tab
3. Scroll to **"Deploy Command"** or **"Start Command"**
4. Update the start command to:
   ```bash
   npm run db:setup && npm run start:prod
   ```
   OR if Railway has a separate deploy command:
   ```bash
   npm run db:setup
   ```

5. **Redeploy** your backend service
6. Check the deploy logs - you should see:
   - "Generating Prisma Client..."
   - "Running migrations..."
   - "Seeding database..."

### Method 2: Railway CLI (If you have it installed)

```bash
# Install Railway CLI if needed
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run npx prisma migrate deploy

# Seed database
railway run npm run prisma:seed
```

### Method 3: Manual via Railway Shell

1. In Railway, go to your **Backend service**
2. Click **"Deployments"** → Find your latest deployment
3. Click the **three dots** → **"Shell"** or **"Open Shell"**
4. Run these commands:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   npm run prisma:seed
   ```

## Verify It Worked

After running migrations, go back to your **Postgres** service in Railway:
1. Click **"Database"** tab → **"Data"** tab
2. You should now see tables instead of "You have no tables":
   - ✅ users
   - ✅ user_profiles
   - ✅ programs
   - ✅ workouts
   - ✅ workout_sections
   - ✅ exercise_blocks
   - ✅ tier_prescriptions
   - ✅ user_programs
   - ✅ session_logs

## Troubleshooting

**If migrations fail:**
- Check that `DATABASE_URL` is set in your Backend service variables
- Make sure it's pointing to your Postgres service
- Check deploy logs for error messages

**If seed fails:**
- Make sure migrations completed successfully first
- Check that Prisma Client was generated
- Look for specific error in deploy logs

## Next Steps After Database Setup

Once tables are created:
1. ✅ Database is ready
2. ⏭️ Deploy frontend to Vercel
3. ⏭️ Connect frontend and backend URLs
4. ⏭️ Test the app!

