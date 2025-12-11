# Vercel Deployment Setup Guide

Complete guide for setting up both **Production** and **Beta** Vercel deployments.

## Overview

You'll have two separate Vercel projects:
- **Production**: Deploys from `main` branch → `nodeos.app`
- **Beta**: Deploys from `beta` branch → `beta.nodeos.app`

---

## Part 1: Production Deployment (Main Branch)

### Step 1: Create Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"** (or **"New Project"**)
3. Import your GitHub repository: `kaeldominion/node-performance-app`
4. Configure project settings:
   - **Project Name**: `node-performance-app` (or your preferred name)
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `frontend` ⚠️ **CRITICAL - Must be set!**
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

### Step 2: Configure Git Integration

1. In project settings, go to **Settings** → **Git**
2. Verify:
   - ✅ **Production Branch**: `main`
   - ✅ **Auto-deploy on push**: **Enabled**
   - ✅ Connected to: `kaeldominion/node-performance-app`

### Step 3: Add Environment Variables

Go to **Settings** → **Environment Variables** and add:

#### Required Variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-production-backend.railway.app` | Production, Preview, Development |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` (your production Clerk key) | Production, Preview, Development |

**Note**: Replace `your-production-backend.railway.app` with your actual Railway backend URL.

### Step 4: Deploy

1. Click **"Deploy"** button
2. Wait for deployment to complete (usually 2-3 minutes)
3. Vercel will provide a URL like: `https://node-performance-app.vercel.app`

### Step 5: Configure Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter: `nodeos.app` (or `www.nodeos.app`)
4. Follow DNS configuration instructions
5. Vercel will automatically provision SSL certificate

### Step 6: Update Railway Backend

After Vercel deployment, update your Railway backend:

1. Go to Railway Dashboard → Your Backend Service
2. Go to **Variables** tab
3. Update `FRONTEND_URL` to your Vercel URL:
   - `https://nodeos.app` (if using custom domain)
   - OR `https://node-performance-app.vercel.app` (Vercel default)
4. Save (Railway will auto-redeploy)

---

## Part 2: Beta Deployment (Beta Branch)

### Step 1: Create Beta Vercel Project

1. In Vercel Dashboard, click **"Add New Project"** again
2. Import the **same** GitHub repository: `kaeldominion/node-performance-app`
3. Configure project settings:
   - **Project Name**: `node-performance-app-beta` (or `nodeos-beta`)
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend` ⚠️ **CRITICAL - Must be set!**
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 2: Configure Git Integration for Beta

1. Go to **Settings** → **Git**
2. Configure:
   - ✅ **Production Branch**: `beta` ⚠️ **Important - Change from main to beta!**
   - ✅ **Auto-deploy on push**: **Enabled**
   - ✅ Connected to: `kaeldominion/node-performance-app`

**Critical**: Make sure the Production Branch is set to `beta`, not `main`!

### Step 3: Add Beta Environment Variables

Go to **Settings** → **Environment Variables** and add:

#### Required Variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-beta-backend.railway.app` | Production, Preview, Development |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` (same or separate Clerk app) | Production, Preview, Development |

**Note**: 
- Replace with your **beta Railway backend URL** (you'll create this separately)
- You can use the same Clerk keys or create a separate Clerk app for beta

### Step 4: Deploy Beta

1. Click **"Deploy"** button
2. Wait for deployment to complete
3. Vercel will provide a URL like: `https://node-performance-app-beta.vercel.app`

### Step 5: Configure Beta Custom Domain

1. Go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter: `beta.nodeos.app`
4. Follow DNS configuration instructions:
   - Add a CNAME record: `beta.nodeos.app` → `cname.vercel-dns.com`
   - Or use Vercel's DNS if you're using Vercel for DNS management
5. Vercel will automatically provision SSL certificate

### Step 6: Update Beta Railway Backend

After beta Vercel deployment, update your beta Railway backend:

1. Go to Railway Dashboard → Your Beta Backend Service
2. Go to **Variables** tab
3. Update `FRONTEND_URL` to:
   - `https://beta.nodeos.app` (if using custom domain)
   - OR `https://node-performance-app-beta.vercel.app` (Vercel default)
4. Save (Railway will auto-redeploy)

---

## Verification Checklist

### Production Deployment ✅

- [ ] Vercel project created: `node-performance-app`
- [ ] Root Directory set to: `frontend`
- [ ] Production Branch: `main`
- [ ] Environment variables added
- [ ] Deployment successful
- [ ] Custom domain configured (optional): `nodeos.app`
- [ ] Railway backend `FRONTEND_URL` updated
- [ ] Test: Visit production URL and verify it works

### Beta Deployment ✅

- [ ] Vercel project created: `node-performance-app-beta`
- [ ] Root Directory set to: `frontend`
- [ ] Production Branch: `beta` ⚠️ **Critical!**
- [ ] Environment variables added (with beta backend URL)
- [ ] Deployment successful
- [ ] Custom domain configured: `beta.nodeos.app`
- [ ] Beta Railway backend `FRONTEND_URL` updated
- [ ] Test: Visit `beta.nodeos.app` and verify it works

---

## DNS Configuration

### For Custom Domains

If you're using custom domains (`nodeos.app` and `beta.nodeos.app`):

#### Option 1: CNAME Records (Recommended)

Add these DNS records in your domain registrar:

```
Type    Name    Value
CNAME   @       cname.vercel-dns.com
CNAME   beta    cname.vercel-dns.com
```

#### Option 2: A Records (If CNAME not supported)

Contact Vercel support or use Vercel's DNS service.

### Vercel DNS (Easiest)

1. In Vercel project → **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain
4. Vercel will provide DNS records to add
5. Add them to your domain registrar

---

## Environment Variables Reference

### Production Environment Variables

```bash
NEXT_PUBLIC_API_URL=https://node-performance-app-production.up.railway.app
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
```

### Beta Environment Variables

```bash
NEXT_PUBLIC_API_URL=https://node-performance-app-beta.up.railway.app
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...  # Same or separate
```

---

## Auto-Deployment

Both projects will automatically deploy when you push to their respective branches:

- **Production**: Auto-deploys on push to `main` branch
- **Beta**: Auto-deploys on push to `beta` branch

### Manual Deployment

If you need to manually trigger a deployment:

1. Go to Vercel Dashboard → Your Project
2. Go to **Deployments** tab
3. Click **"Redeploy"** on latest deployment
4. Or click **"Deploy"** → **"Deploy Latest Commit"**

---

## Troubleshooting

### Build Fails

**Error**: "Cannot find module" or build errors
- ✅ Check **Root Directory** is set to `frontend`
- ✅ Verify `package.json` exists in `frontend/` directory
- ✅ Check build logs in Vercel Dashboard

### Environment Variables Not Working

**Error**: API calls failing or Clerk not working
- ✅ Verify environment variables are set for **all environments** (Production, Preview, Development)
- ✅ Check variable names are exact (case-sensitive)
- ✅ Redeploy after adding/changing variables

### Wrong Branch Deploying

**Error**: Beta project deploying from `main` branch
- ✅ Go to **Settings** → **Git**
- ✅ Change **Production Branch** to `beta`
- ✅ Save and redeploy

### CORS Errors

**Error**: CORS errors when calling backend
- ✅ Verify `FRONTEND_URL` in Railway matches Vercel URL exactly
- ✅ Check backend CORS configuration includes Vercel URL
- ✅ For beta, ensure `beta.nodeos.app` is in backend CORS allowed origins

### Domain Not Working

**Error**: Custom domain not resolving
- ✅ Wait 24-48 hours for DNS propagation
- ✅ Verify DNS records are correct
- ✅ Check SSL certificate status in Vercel
- ✅ Use `dig beta.nodeos.app` to verify DNS

---

## Quick Reference

### Production URLs
- Vercel: `https://node-performance-app.vercel.app`
- Custom: `https://nodeos.app`
- Backend: `https://your-production-backend.railway.app`

### Beta URLs
- Vercel: `https://node-performance-app-beta.vercel.app`
- Custom: `https://beta.nodeos.app`
- Backend: `https://your-beta-backend.railway.app`

### Git Branches
- Production: `main` branch
- Beta: `beta` branch

---

## Next Steps

After setting up Vercel deployments:

1. ✅ Set up Railway backend deployments (separate guide)
2. ✅ Configure Clerk webhooks for both environments
3. ✅ Test both production and beta deployments
4. ✅ Set up monitoring/alerts
5. ✅ Begin v2 development on beta branch

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Check Railway backend is running
4. Verify DNS configuration
5. Review this guide's troubleshooting section

