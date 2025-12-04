# Fix Vercel Clerk Middleware Error

## The Problem
Vercel is throwing a middleware error because Clerk isn't properly configured.

## Solution: Add Environment Variable to Vercel

### Step 1: Add Clerk Publishable Key to Vercel

1. **Go to Vercel Dashboard** → Your Frontend Project
2. **Click "Settings"** → **"Environment Variables"**
3. **Click "+ Add New"**
4. **Add:**
   - **Name**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - **Value**: `pk_test_Y3VycmVudC12dWx0dXJlLTc1LmNsZXJrLmFjY291bnRzLmRldiQ`
   - **Environment**: Production, Preview, Development (select all)
5. **Click "Save"**

### Step 2: Redeploy

1. **Go to "Deployments"** tab
2. **Click three dots (⋯)** on latest deployment
3. **Click "Redeploy"**

## What I Fixed

I've updated the middleware and layout to:
- Gracefully handle missing Clerk key (won't crash)
- Only protect routes if Clerk is configured
- Show a warning instead of crashing

## Verify It Works

After redeploying with the environment variable:
1. Visit your Vercel URL
2. Should load without 500 error
3. Clerk auth should work on `/auth/login` and `/auth/register`

## If Still Getting Errors

Check Vercel logs:
1. Go to Vercel → Your Project → **"Deployments"**
2. Click on the deployment
3. Check **"Functions"** or **"Logs"** tab
4. Look for specific error messages

