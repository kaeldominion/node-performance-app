# Vercel Deployment Check

## Why Vercel Might Not Deploy Automatically

### Common Issues:

1. **Root Directory Not Set**
   - Vercel needs to know the frontend is in the `frontend/` folder
   - Check Vercel Dashboard → Project Settings → General → Root Directory
   - Should be set to: `frontend`

2. **Vercel Not Watching the Right Branch**
   - Check Vercel Dashboard → Project Settings → Git
   - Ensure it's connected to the correct GitHub repo
   - Ensure it's watching the `main` branch

3. **Build Errors**
   - Check Vercel Dashboard → Deployments
   - Look for failed builds with error messages
   - Common issues: missing environment variables, build command failures

4. **Manual Deployment Needed**
   - Sometimes Vercel needs a manual trigger
   - Go to Vercel Dashboard → Deployments → "Redeploy"

## Quick Fix Steps

### Step 1: Verify Vercel Configuration

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Find your project
3. Go to **Settings** → **General**
4. Check:
   - ✅ **Root Directory**: Should be `frontend`
   - ✅ **Framework Preset**: Should be `Next.js`
   - ✅ **Build Command**: Should be `npm run build` (or auto-detected)
   - ✅ **Output Directory**: Should be `.next` (or auto-detected)

### Step 2: Check Git Integration

1. Go to **Settings** → **Git**
2. Verify:
   - ✅ Connected to correct GitHub repo
   - ✅ Production Branch: `main`
   - ✅ Auto-deploy on push: **Enabled**

### Step 3: Trigger Manual Deployment

If auto-deploy isn't working:

1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Or click **"Deploy"** → **"Deploy Latest Commit"**

### Step 4: Check Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Verify these are set:
   - `NEXT_PUBLIC_API_URL` = `https://node-performance-app-production.up.railway.app`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = (your Clerk key)

### Step 5: Check Build Logs

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Check the build logs for errors
4. Common issues:
   - Missing environment variables
   - TypeScript errors
   - Missing dependencies

## Force Redeploy

If nothing works, you can force a redeploy by:

1. **Option A: Empty commit**
   ```bash
   git commit --allow-empty -m "Trigger Vercel deployment"
   git push
   ```

2. **Option B: Vercel CLI**
   ```bash
   cd frontend
   npx vercel --prod
   ```

3. **Option C: Vercel Dashboard**
   - Go to Deployments → Click "Redeploy"

## Current Status Check

Run this to see if Vercel is connected:
```bash
cd frontend
npx vercel ls
```

This will show your Vercel projects and their status.

