# Clerk Development vs Production Environment

## The Issue

Clerk has **separate environments** (Development and Production) with **different API keys**. If your Clerk app is in Development mode but Vercel is trying to use production keys, it will fail.

## Solution: Use Production Keys

### Step 1: Create Production Instance in Clerk

1. **Go to Clerk Dashboard** → Your App
2. **Click the environment selector** (where it says "Development")
3. **Click "Create production instance"**
4. Clerk will create a production environment

### Step 2: Get Production Keys

1. **Switch to Production** environment in Clerk Dashboard
2. **Go to "API Keys"**
3. **Copy the Production keys:**
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_live_...`)
   - `CLERK_SECRET_KEY` (starts with `sk_live_...`)

### Step 3: Update Vercel Environment Variables

1. **Go to Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. **Update `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`:**
   - Change from `pk_test_...` (development) to `pk_live_...` (production)
   - Make sure it's enabled for **Production** environment
3. **Save**

### Step 4: Update Railway Environment Variables

1. **Go to Railway Dashboard** → Your Backend Service → **Variables**
2. **Update `CLERK_SECRET_KEY`:**
   - Change from `sk_test_...` (development) to `sk_live_...` (production)
3. **Save** (Railway will auto-redeploy)

### Step 5: Update Webhook (Important!)

1. **In Clerk Dashboard (Production environment)** → **Webhooks**
2. **Create a new webhook endpoint:**
   - URL: `https://node-performance-app-production.up.railway.app/webhooks/clerk`
   - Subscribe to: `user.created`, `user.updated`, `user.deleted`
3. **Copy the webhook signing secret**
4. **Add to Railway** as `CLERK_WEBHOOK_SECRET`

### Step 6: Redeploy

1. **Vercel**: Redeploy your frontend
2. **Railway**: Should auto-redeploy when you update variables

## Key Differences

| Environment | Publishable Key | Secret Key | Use Case |
|------------|----------------|------------|----------|
| **Development** | `pk_test_...` | `sk_test_...` | Local dev, testing |
| **Production** | `pk_live_...` | `sk_live_...` | Live apps, Vercel |

## Why This Matters

- **Development keys** work for local development
- **Production keys** are required for deployed apps (Vercel, Railway)
- Using dev keys in production can cause middleware errors and auth failures

## Quick Check

After updating, test:
```bash
curl https://your-vercel-app.vercel.app
```

Should load without 500 error!

