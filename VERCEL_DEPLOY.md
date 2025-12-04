# Deploy Frontend to Vercel

## Backend URL
✅ Your backend is live at: `https://node-backend-production-fb8b.up.railway.app`

## Step 1: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository: `kaeldominion/node-performance-app`
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend` ⚠️ **IMPORTANT!**
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

## Step 2: Add Environment Variable

Before deploying, add this environment variable:

- **Name**: `NEXT_PUBLIC_API_URL`
- **Value**: `https://node-backend-production-fb8b.up.railway.app`

## Step 3: Deploy

Click **"Deploy"** and wait for it to complete.

## Step 4: Update Railway Backend

After Vercel deployment, get your Vercel URL (e.g., `https://node-performance-app.vercel.app`)

Then in Railway:
1. Go to **node-backend** service → **Variables**
2. Update `FRONTEND_URL` to your Vercel URL
3. Redeploy backend (or it will auto-redeploy)

## Step 5: Test

Visit your Vercel URL and test:
- ✅ Register/Login
- ✅ Browse programs
- ✅ View workouts
- ✅ Start a program

## Troubleshooting

**CORS errors?**
- Make sure `FRONTEND_URL` in Railway matches your Vercel URL exactly
- Check backend logs in Railway

**API not found?**
- Verify `NEXT_PUBLIC_API_URL` is set in Vercel
- Check that backend is running (visit backend URL directly)

