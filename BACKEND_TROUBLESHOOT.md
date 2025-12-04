# Backend 502 Error - Troubleshooting

## Issue
Backend is returning 502 "Application failed to respond" even though deployment shows as ACTIVE.

## Check Railway Logs

1. In Railway, go to your `node-performance-app` service
2. Click **"View logs"** on the ACTIVE deployment
3. Look for:
   - ✅ "NØDE Backend running on http://localhost:3001" - Service started
   - ❌ Error messages - Service crashed
   - ❌ "Running migrations..." - Still setting up
   - ❌ Port binding errors

## Common Issues & Fixes

### Issue 1: Service Crashed on Startup
**Symptoms**: Logs show error then stop
**Fix**: Check for:
- Missing environment variables
- Database connection errors
- Prisma errors

### Issue 2: Port Mismatch
**Symptoms**: Service starts but Railway can't connect
**Fix**: 
- Check `PORT` environment variable (should be `3001` or auto)
- Verify Railway is routing to correct port

### Issue 3: Migrations Failed
**Symptoms**: Logs show Prisma errors
**Fix**:
- Check `DATABASE_URL` is correct
- Verify database is accessible
- May need to run migrations manually

### Issue 4: Deploy Command Issue
**Symptoms**: Build succeeds but service doesn't start
**Fix**:
- Check **Settings** → **Start Command**
- Should be: `npm run start:prod`
- Or: `node dist/main`

## Quick Fix Steps

1. **Check Logs** - See what error is happening
2. **Verify Environment Variables** - All required vars are set
3. **Check Database Connection** - DATABASE_URL is correct
4. **Redeploy** - Sometimes a fresh deploy fixes it

## Manual Database Setup (If Needed)

If migrations didn't run, use Railway shell:
1. Go to service → **Deployments** → Latest → **Shell**
2. Run:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   npm run prisma:seed
   ```

