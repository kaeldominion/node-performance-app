# Auto-Fix on Next Deploy

I've updated your `railway.json` to automatically fix the failed migration on the next deploy.

## What I Changed

The start command now:
1. Tries to resolve the failed migration (ignores errors if already resolved)
2. Uses `db push` to sync schema (adds missing columns)
3. Starts the app normally

## Next Steps

1. **Trigger a redeploy** in Railway:
   - Go to Railway Dashboard → Your Backend Service
   - Click **"Deployments"** tab
   - Click **three dots (⋯)** on latest deployment → **"Redeploy"**

2. **Watch the logs** - you should see:
   - Migration resolution attempt
   - Schema push (adding columns)
   - App starting

3. **Test:**
   ```bash
   curl https://node-performance-app-production.up.railway.app/programs
   ```

## After It Works

Once the columns are added and the app works, you can change the start command back to:
```json
"startCommand": "npx prisma migrate deploy && npm run start:prod"
```

But for now, the auto-fix version will handle the failed migration gracefully.

