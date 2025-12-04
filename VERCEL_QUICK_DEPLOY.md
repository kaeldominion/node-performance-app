# Quick Vercel Deployment

## Step 1: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import GitHub repo: `kaeldominion/node-performance-app`
4. Configure:
   - **Framework**: Next.js (auto-detected)
   - **Root Directory**: `frontend` ⚠️ **CRITICAL!**
   - **Build Command**: `npm run build` (auto)
   - **Output Directory**: `.next` (auto)

## Step 2: Add Environment Variable

**Before clicking Deploy**, add environment variable:

- **Name**: `NEXT_PUBLIC_API_URL`
- **Value**: `https://node-performance-app-production.up.railway.app`

(We'll update this if Railway gives a different URL)

## Step 3: Deploy

Click **"Deploy"** and wait (usually 2-3 minutes)

## Step 4: Get Your Vercel URL

After deployment, Vercel will give you a URL like:
- `https://node-performance-app.vercel.app`
- Or a custom domain if you set one up

## Step 5: Update Railway Backend

Once you have your Vercel URL:

1. Go to Railway → `node-performance-app` service
2. Go to **Variables** tab
3. Find `FRONTEND_URL`
4. Update it to your Vercel URL (e.g., `https://node-performance-app.vercel.app`)
5. Save (Railway will auto-redeploy)

## Step 6: Test

Visit your Vercel URL and test:
- ✅ Register/Login
- ✅ Browse programs
- ✅ View workouts

