# Clerk Keys Setup Guide

## ✅ Quick Setup (Using Existing Keys)

I've already set up the keys in your environment files:

### Frontend (`.env.local`)
- **Location**: `/frontend/.env.local`
- **Key**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = `pk_test_Y3VycmVudC12dWx0dXJlLTc1LmNsZXJrLmFjY291bnRzLmRldiQ`

### Backend (`.env`)
- **Location**: `/backend/.env`
- **Key**: `CLERK_SECRET_KEY` = `sk_test_3uh0SucPiM85Of9MRiAprMZ1cMsaaFxzrfEQYLdBcD`

## 🔄 Restart Your Dev Server

After setting up the keys, **restart your Next.js dev server**:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd frontend
npm run dev
```

## 🔑 How to Get Your Own Clerk Keys

If you want to use your own Clerk account (recommended for production):

### Step 1: Create Clerk Account
1. Go to https://clerk.com
2. Sign up for a free account (10,000 MAU free tier)
3. Create a new application

### Step 2: Get API Keys
1. Go to **Clerk Dashboard** → https://dashboard.clerk.com
2. Select your application
3. Navigate to **API Keys** (left sidebar)
4. Copy the keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

### Step 3: Update Environment Files

**Frontend** (`frontend/.env.local`):
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

**Backend** (`backend/.env`):
```bash
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
CLERK_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

### Step 4: Set Up Webhook (For Production)

1. In Clerk Dashboard → **Webhooks**
2. Click **"+ Add Endpoint"**
3. Enter your backend URL:
   ```
   https://your-backend-url.com/webhooks/clerk
   ```
4. Subscribe to events:
   - ☑ `user.created`
   - ☑ `user.updated`
   - ☑ `user.deleted`
5. Click **"Create"**
6. Copy the **Signing Secret** (starts with `whsec_`)
7. Add it to your backend `.env` as `CLERK_WEBHOOK_SECRET`

## 🧪 Test the Setup

1. **Restart your dev server**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Visit the site**: http://localhost:3000

3. **Try registering a user**: http://localhost:3000/auth/register

4. **Check the console** for any errors

## 📝 Notes

- **Test keys** (starts with `pk_test_` or `sk_test_`) are for development
- **Live keys** (starts with `pk_live_` or `sk_live_`) are for production
- The `.env.local` file is gitignored and won't be committed
- Always use test keys for local development
- Never commit secret keys to version control

## ✅ Verification

After setup, you should see:
- ✅ No Clerk errors in the browser console
- ✅ The landing page loads correctly
- ✅ You can access `/auth/register` and `/auth/login`
- ✅ User registration/login works

If you see errors, check:
1. The keys are correct (no extra spaces)
2. The dev server was restarted after adding keys
3. The keys match the environment (test vs live)

