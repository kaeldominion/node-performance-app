# Easiest Way to Fix Railway Database

## Option 1: Trigger a Redeploy (Easiest!)

Your `railway.json` already has `npx prisma migrate deploy` in the start command, so migrations should run automatically.

1. **Go to Railway Dashboard** → Your Backend Service
2. **Click "Deployments"** tab
3. **Click the three dots (⋯)** on the latest deployment
4. **Click "Redeploy"**
5. **Watch the logs** - you should see:
   ```
   Running migrations...
   Applied migration: 20251205040000_add_program_created_by
   ```
6. **Test:**
   ```bash
   curl https://node-performance-app-production.up.railway.app/programs
   ```

## Option 2: Use Railway CLI (If Redeploy Doesn't Work)

1. **Install Railway CLI:**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login:**
   ```bash
   railway login
   ```

3. **Link to your project:**
   ```bash
   cd backend
   railway link
   ```
   (Select your Railway project when prompted)

4. **Run the migration:**
   ```bash
   railway run npx prisma migrate deploy
   ```

5. **Test:**
   ```bash
   curl https://node-performance-app-production.up.railway.app/programs
   ```

## Option 3: Manual SQL via Railway CLI

If the above don't work:

```bash
# After railway link
railway run psql $DATABASE_URL -c "ALTER TABLE programs ADD COLUMN IF NOT EXISTS \"createdBy\" TEXT;"
railway run psql $DATABASE_URL -c "ALTER TABLE programs ADD COLUMN IF NOT EXISTS \"coachId\" TEXT;"
```

## Why This Should Work

Your `railway.json` file already has:
```json
"startCommand": "npx prisma migrate deploy && npm run start:prod"
```

This means every time Railway starts your backend, it should automatically run migrations. A simple redeploy should fix it!

