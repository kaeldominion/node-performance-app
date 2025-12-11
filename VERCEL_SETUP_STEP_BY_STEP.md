# Vercel Setup - Step-by-Step Guide

Follow these steps to configure both Production and Beta deployments.

---

## Prerequisites

- ✅ GitHub repository: `kaeldominion/node-performance-app`
- ✅ `main` branch exists (production)
- ✅ `beta` branch exists (v2 development)
- ✅ Vercel account (sign up at [vercel.com](https://vercel.com) if needed)

---

## Part 1: Production Deployment (Main Branch)

### Step 1: Create Production Project

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"** (or **"New Project"**)
3. You'll see "Import Git Repository"
4. Find and select: **`kaeldominion/node-performance-app`**
5. Click **"Import"**

### Step 2: Configure Project Settings

**Project Name:**
- Enter: `node-performance-app` (or `nodeos-production`)

**Framework Preset:**
- Should auto-detect: **Next.js**
- If not, select: **Next.js**

**Root Directory:**
- ⚠️ **CRITICAL**: Click **"Edit"** next to Root Directory
- Change from `/` to: **`frontend`**
- This tells Vercel where your Next.js app is located

**Build and Output Settings:**
- Build Command: `npm run build` (auto-detected)
- Output Directory: `.next` (auto-detected)
- Install Command: `npm install` (auto-detected)

**DO NOT CLICK DEPLOY YET** - We need to set environment variables first!

### Step 3: Configure Git Integration

Before deploying, configure Git settings:

1. Scroll down to **"Git"** section (or go to Settings after creation)
2. Verify:
   - ✅ **Production Branch**: `main`
   - ✅ **Auto-deploy on push**: Enabled

### Step 4: Add Environment Variables

**Before clicking Deploy**, add environment variables:

1. Scroll to **"Environment Variables"** section
2. Click **"Add"** or **"Add Environment Variable"**

**Add these variables:**

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-production-backend.railway.app` | Production, Preview, Development |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` (your Clerk key) | Production, Preview, Development |

**Important Notes:**
- Replace `your-production-backend.railway.app` with your actual Railway backend URL
- If you don't have the backend URL yet, you can add it later and redeploy
- Make sure to select **all three environments** (Production, Preview, Development)

### Step 5: Deploy Production

1. Click **"Deploy"** button
2. Wait for deployment (usually 2-3 minutes)
3. Vercel will provide a URL like: `https://node-performance-app.vercel.app`

### Step 6: Configure Custom Domain (Optional)

1. After deployment, go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter: `nodeos.app` (or `www.nodeos.app`)
4. Follow DNS instructions:
   - Add CNAME record: `nodeos.app` → `cname.vercel-dns.com`
   - Or use Vercel's DNS if managing DNS through Vercel
5. Wait for DNS propagation (can take up to 48 hours)

---

## Part 2: Beta Deployment (Beta Branch)

### Step 1: Create Beta Project (NEW Project!)

1. In Vercel Dashboard, click **"Add New..."** → **"Project"** again
2. **Important**: This is a NEW project, not modifying the existing one!
3. Find and select: **`kaeldominion/node-performance-app`** (same repo!)
4. Click **"Import"**

### Step 2: Configure Beta Project Settings

**Project Name:**
- Enter: `node-performance-app-beta` (or `nodeos-beta`)

**Framework Preset:**
- Should auto-detect: **Next.js**

**Root Directory:**
- ⚠️ **CRITICAL**: Click **"Edit"** next to Root Directory
- Change from `/` to: **`frontend`**

**Build and Output Settings:**
- Build Command: `npm run build` (auto-detected)
- Output Directory: `.next` (auto-detected)
- Install Command: `npm install` (auto-detected)

**DO NOT CLICK DEPLOY YET** - We need to configure Git and environment variables!

### Step 3: Configure Git Integration for Beta

**⚠️ CRITICAL STEP - This is the key difference!**

1. Scroll to **"Git"** section
2. Find **"Production Branch"** setting
3. **Change from `main` to `beta`** ⚠️
   - This tells Vercel to watch the `beta` branch, not `main`
4. Verify:
   - ✅ **Production Branch**: `beta` (not `main`!)
   - ✅ **Auto-deploy on push**: Enabled

### Step 4: Add Beta Environment Variables

1. Scroll to **"Environment Variables"** section
2. Click **"Add Environment Variable"**

**Add these variables:**

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-beta-backend.railway.app` | Production, Preview, Development |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` (same or separate Clerk app) | Production, Preview, Development |

**Important Notes:**
- Replace with your **beta Railway backend URL** (you'll create this separately)
- If you don't have beta backend yet, add a placeholder and update later
- Make sure to select **all three environments**

### Step 5: Deploy Beta

1. Click **"Deploy"** button
2. Wait for deployment (usually 2-3 minutes)
3. Vercel will provide a URL like: `https://node-performance-app-beta.vercel.app`

### Step 6: Configure Beta Custom Domain

1. Go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter: `beta.nodeos.app`
4. Follow DNS instructions:
   - Add CNAME record: `beta.nodeos.app` → `cname.vercel-dns.com`
5. Wait for DNS propagation

---

## Verification Checklist

### Production Project ✅

- [ ] Project created: `node-performance-app`
- [ ] Root Directory: `frontend`
- [ ] Production Branch: `main`
- [ ] Environment variables added:
  - [ ] `NEXT_PUBLIC_API_URL` (production backend URL)
  - [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] Deployment successful
- [ ] Custom domain configured (optional): `nodeos.app`

### Beta Project ✅

- [ ] Project created: `node-performance-app-beta` (separate project!)
- [ ] Root Directory: `frontend`
- [ ] Production Branch: `beta` ⚠️ **Critical - must be beta!**
- [ ] Environment variables added:
  - [ ] `NEXT_PUBLIC_API_URL` (beta backend URL)
  - [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] Deployment successful
- [ ] Custom domain configured: `beta.nodeos.app`

---

## How to Verify It's Working

### Test Production Deployment:

1. Make a small change on `main` branch:
   ```bash
   git checkout main
   # Make a small change (e.g., update a comment)
   git add .
   git commit -m "test: production deployment"
   git push origin main
   ```

2. Check Vercel Dashboard:
   - Go to `node-performance-app` project
   - Go to **"Deployments"** tab
   - Should see new deployment triggered automatically

### Test Beta Deployment:

1. Make a small change on `beta` branch:
   ```bash
   git checkout beta
   # Make a small change
   git add .
   git commit -m "test: beta deployment"
   git push origin beta
   ```

2. Check Vercel Dashboard:
   - Go to `node-performance-app-beta` project
   - Go to **"Deployments"** tab
   - Should see new deployment triggered automatically

---

## Common Issues & Solutions

### Issue: "Build Failed - Cannot find module"

**Solution:**
- ✅ Verify **Root Directory** is set to `frontend`
- ✅ Check that `frontend/package.json` exists
- ✅ Check build logs in Vercel for specific errors

### Issue: "Wrong branch deploying"

**Solution:**
- ✅ Go to **Settings** → **Git**
- ✅ Verify **Production Branch** is correct:
  - Production project: `main`
  - Beta project: `beta`

### Issue: "Environment variables not working"

**Solution:**
- ✅ Verify variables are set for **all environments** (Production, Preview, Development)
- ✅ Check variable names are exact (case-sensitive)
- ✅ Redeploy after adding/changing variables

### Issue: "API calls failing"

**Solution:**
- ✅ Verify `NEXT_PUBLIC_API_URL` is set correctly
- ✅ Check that backend is running
- ✅ Verify CORS settings in backend allow Vercel URL

---

## Next Steps After Vercel Setup

1. ✅ **Set up Railway backend deployments** (separate guide)
2. ✅ **Update Railway backend `FRONTEND_URL`**:
   - Production backend: Point to `https://nodeos.app` (or Vercel URL)
   - Beta backend: Point to `https://beta.nodeos.app` (or Vercel URL)
3. ✅ **Configure Clerk webhooks** for both environments
4. ✅ **Test both deployments**
5. ✅ **Set up monitoring/alerts**

---

## Quick Reference

### Production URLs:
- Vercel: `https://node-performance-app.vercel.app`
- Custom: `https://nodeos.app` (if configured)

### Beta URLs:
- Vercel: `https://node-performance-app-beta.vercel.app`
- Custom: `https://beta.nodeos.app` (if configured)

### Git Branches:
- Production: `main` branch
- Beta: `beta` branch

---

## Summary

**Key Points:**
1. Create **TWO separate projects** (production and beta)
2. Both connect to **same GitHub repo**
3. **Root Directory**: `frontend` for both
4. **Production Branch**: `main` for production, `beta` for beta
5. **Environment variables**: Different backend URLs for each
6. **Custom domains**: `nodeos.app` and `beta.nodeos.app`

Follow these steps and you'll have both deployments working! 🚀

