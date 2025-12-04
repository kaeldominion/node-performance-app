# Manual Fix via Railway Dashboard

Since Railway CLI can't connect to the database, let's fix this manually through Railway's web interface.

## Option 1: Railway Database Console (If Available)

1. **Go to Railway Dashboard** → Your PostgreSQL service
2. Look for one of these tabs:
   - **"Data"** tab
   - **"Query"** tab
   - **"Console"** tab
   - **"Connect"** tab
3. If you see a SQL editor, run:
   ```sql
   ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "createdBy" TEXT;
   ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "coachId" TEXT;
   ```

## Option 2: Railway Backend Shell

1. **Go to Railway Dashboard** → Your Backend Service
2. Click **"Deployments"** tab
3. Find your latest deployment
4. Click the **three dots (⋯)** → **"Shell"** or **"Open Shell"**
5. In the shell, run:
   ```bash
   npx prisma db push --accept-data-loss
   ```

## Option 3: Trigger Redeploy with Fixed Start Command

1. **Go to Railway Dashboard** → Your Backend Service → **Settings**
2. Look for **"Start Command"** or **"Deploy Command"**
3. Temporarily change it to:
   ```bash
   npx prisma migrate resolve --applied 20251205040000_add_program_created_by || true && npx prisma db push --accept-data-loss && npm run start:prod
   ```
4. **Redeploy** the service
5. After it works, change the command back to normal

## Option 4: Use Railway's Public Database URL

If Railway has a public connection string available:

1. **Go to Railway Dashboard** → PostgreSQL service → **Variables**
2. Look for a public URL or external connection string
3. Temporarily set `DATABASE_URL` in your backend service to use the public URL
4. Run the commands
5. Change it back

## Simplest: Just Add Columns Manually

If none of the above work, the absolute simplest is to just add the columns manually via SQL in Railway's database console, then mark the migration as applied later.

The SQL is:
```sql
ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "createdBy" TEXT;
ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "coachId" TEXT;
```

Then test:
```bash
curl https://node-performance-app-production.up.railway.app/programs
```

