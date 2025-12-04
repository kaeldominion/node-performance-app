# ⚠️ IMPORTANT: Fix Vercel API URL

## The Problem

Your frontend is trying to connect to the **WRONG backend URL**:
- ❌ Currently using: `node-backend-production-fb8b.up.railway.app`
- ✅ Should be: `node-performance-app-production.up.railway.app`

## The Fix

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Find `NEXT_PUBLIC_API_URL`
3. **Update it to**: `https://node-performance-app-production.up.railway.app`
4. Make sure there's **NO trailing slash**
5. Click **Save**
6. **Redeploy** your frontend (or wait for auto-redeploy)

## Verify

After redeploying, check the browser console - you should see:
- ✅ API calls going to `node-performance-app-production.up.railway.app`
- ✅ No more CORS errors
- ✅ Login should work!

## Current Backend URLs

- ✅ Correct: `https://node-performance-app-production.up.railway.app`
- ❌ Wrong: `https://node-backend-production-fb8b.up.railway.app` (old/deleted service)

