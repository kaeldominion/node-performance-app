# Vercel Environment Variable Check

## Issue
Frontend showing: "Network Error: Unable to connect to the backend API"

## Root Cause
The frontend needs `NEXT_PUBLIC_API_URL` set in Vercel to point to your Railway backend.

## Fix Steps

### 1. Check Current Environment Variable in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (likely `node-performance-app` or similar)
3. Go to **Settings** → **Environment Variables**
4. Look for `NEXT_PUBLIC_API_URL`

### 2. Set/Update the Environment Variable

**If it doesn't exist or is wrong:**

1. Click **"Add New"** (or edit existing)
2. **Key**: `NEXT_PUBLIC_API_URL`
3. **Value**: `https://node-performance-app-production.up.railway.app`
   - ⚠️ **NO trailing slash**
   - ⚠️ **Must start with `https://`**
4. **Environment**: Select **Production**, **Preview**, and **Development** (or at least Production)
5. Click **Save**

### 3. Redeploy Frontend

After saving the environment variable:

1. Go to **Deployments** tab
2. Click the **three dots (⋯)** on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

**OR** just push a new commit to trigger auto-deployment:
```bash
git commit --allow-empty -m "Trigger Vercel redeploy"
git push origin main
```

### 4. Verify It's Working

After redeployment:

1. Visit your live site (e.g., `https://www.nodeos.app`)
2. Open browser **Developer Tools** (F12)
3. Go to **Console** tab
4. Look for any API errors
5. Go to **Network** tab
6. Try to use the app (login, browse, etc.)
7. Check if requests are going to: `https://node-performance-app-production.up.railway.app`

## Quick Test

You can also test directly in the browser console on your live site:

```javascript
// Check what API URL the frontend is using
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || 'NOT SET - using default localhost:4000');
```

If it shows `NOT SET`, then the environment variable isn't configured in Vercel.

## Common Mistakes

❌ **Wrong**: `https://node-performance-app-production.up.railway.app/` (trailing slash)
✅ **Correct**: `https://node-performance-app-production.up.railway.app`

❌ **Wrong**: `http://node-performance-app-production.up.railway.app` (http instead of https)
✅ **Correct**: `https://node-performance-app-production.up.railway.app`

❌ **Wrong**: Only set for Development environment
✅ **Correct**: Set for Production (and Preview if you want)

## Backend Status

✅ Backend is running and accessible at: `https://node-performance-app-production.up.railway.app`
✅ CORS is configured for: `https://www.nodeos.app` and `https://nodeos.app`
✅ Database is synced and working

The issue is **only** the frontend environment variable configuration.

