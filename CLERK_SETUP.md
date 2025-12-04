# Clerk Authentication Setup Guide

## Overview
NØDE Performance App now uses Clerk for authentication, providing enterprise-grade security, social logins, and user management.

## ✅ Implementation Complete

### What's Been Done:
- ✅ Backend: Clerk guards and webhook controller installed
- ✅ Frontend: ClerkProvider and SignIn/SignUp components integrated
- ✅ All controllers updated to use ClerkAuthGuard
- ✅ API client updated to use Clerk tokens
- ✅ AuthContext wrapper for backward compatibility
- ✅ Middleware for route protection

## Environment Variables Required

### Backend (.env)
```bash
CLERK_SECRET_KEY=sk_test_... # Get from Clerk Dashboard
CLERK_WEBHOOK_SECRET=whsec_... # Optional, for webhook verification
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... # Get from Clerk Dashboard
```

## Setup Steps

1. **Create Clerk Account**
   - Go to https://clerk.com
   - Sign up for free account (10,000 MAU free tier)
   - Create a new application

2. **Get API Keys**
   - In Clerk Dashboard → API Keys
   - Copy `Publishable Key` → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Copy `Secret Key` → `CLERK_SECRET_KEY`

3. **Configure Webhooks** (Important!)
   - In Clerk Dashboard → Webhooks
   - Add endpoint: `https://your-backend-url.com/webhooks/clerk`
   - Subscribe to events:
     - `user.created`
     - `user.updated`
     - `user.deleted`
   - Copy webhook signing secret → `CLERK_WEBHOOK_SECRET` (optional but recommended)

4. **Set User Metadata**
   - Users can be created with metadata via API or dashboard
   - Public metadata fields:
     - `role` (string): HOME_USER, COACH, GYM_OWNER, SUPERADMIN
     - `isAdmin` (boolean): true/false
   - These sync to your database via webhooks

5. **Deploy Environment Variables**
   - Add to Railway (backend): `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`
   - Add to Vercel (frontend): `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

## How It Works

1. **User Signs Up/In**: Clerk handles authentication with their UI components
2. **Webhook Fires**: User data syncs to your database automatically
3. **Token Generated**: Clerk provides JWT token to frontend
4. **API Calls**: Frontend sends token in Authorization header
5. **Backend Verifies**: ClerkAuthGuard verifies token and extracts user info

## Migration Notes

- **Existing users**: Need to create Clerk accounts and link to database
- **User roles**: Stored in Clerk's public metadata, synced to database
- **Database**: Users table still used, synced via webhooks
- **JWT auth**: Completely replaced with Clerk tokens

## Testing

1. Set environment variables in `.env.local` (frontend) and `.env` (backend)
2. Test login flow at `/auth/login`
3. Test registration at `/auth/register`
4. Verify webhook receives user events (check backend logs)
5. Check database sync after user creation

## Next Steps

1. **Get Clerk API keys** from dashboard (https://dashboard.clerk.com)
2. **Add environment variables** to both frontend and backend
3. **Test authentication flow** locally
4. **Configure social logins** (optional) in Clerk dashboard
5. **Set up user metadata** for roles when creating users

## Files Changed

### Backend:
- `src/auth/clerk.guard.ts` - Clerk authentication guard
- `src/auth/clerk-admin.guard.ts` - Admin guard using Clerk
- `src/auth/clerk-webhook.controller.ts` - Webhook handler for user sync
- All controllers updated to use `ClerkAuthGuard` instead of `JwtAuthGuard`

### Frontend:
- `app/layout.tsx` - Added ClerkProvider
- `app/auth/login/page.tsx` - Replaced with Clerk SignIn component
- `app/auth/register/page.tsx` - Replaced with Clerk SignUp component
- `contexts/AuthContext.tsx` - Wrapper for Clerk hooks
- `lib/api.ts` - Updated to use Clerk tokens
- `middleware.ts` - Route protection with Clerk
