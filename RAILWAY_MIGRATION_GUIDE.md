# How to Run Prisma Migrations on Railway

## Method 1: Automatic (Easiest) - Redeploy Your Service

Railway is configured to automatically run migrations when your service starts. The easiest way is to just redeploy:

1. Go to [railway.app](https://railway.app) and log in
2. Select your **Backend** service (not the database)
3. Click on **"Deployments"** tab (or **"Settings"** → **"Deploy"**)
4. Click **"Redeploy"** or **"Deploy Latest"**
5. Wait for deployment to complete
6. The migration should run automatically during startup

## Method 2: Using Railway Web Shell (Recommended for Manual Run)

1. Go to [railway.app](https://railway.app) and log in
2. Select your **Backend** service
3. Click on the **"Deployments"** tab
4. Find the most recent deployment and click on it
5. Click the **"Shell"** button (or look for a terminal/console icon)
6. In the shell that opens, run:
   ```bash
   cd /app
   npx prisma migrate deploy
   ```
7. Wait for it to complete - you should see "All migrations have been successfully applied"

## Method 3: Using Railway CLI

1. Install Railway CLI (if you haven't):
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Link to your project:
   ```bash
   railway link
   ```
   (Select your project when prompted)

4. Run the migration:
   ```bash
   railway run --service backend npx prisma migrate deploy
   ```

## Method 4: Direct Database Connection (Advanced)

If the above methods don't work, you can connect directly to the database:

1. Go to Railway → Your **Postgres** service (not backend)
2. Click **"Data"** tab
3. Click **"Connect"** or **"Query"** button
4. Run this SQL directly:
   ```sql
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" TEXT;
   CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username") WHERE "username" IS NOT NULL;
   ```

## Verify Migration Worked

After running the migration, you can verify it worked by:

1. Going to your backend service in Railway
2. Opening the Shell (Method 2 above)
3. Running:
   ```bash
   cd /app
   npx prisma migrate status
   ```
4. You should see all migrations listed as "Applied"

## Troubleshooting

- **If migration fails**: Check the Railway logs for error messages
- **If "command not found"**: Make sure you're in the `/app` directory in the shell
- **If connection errors**: Verify `DATABASE_URL` is set in your Railway backend service variables
