# Clerk Integration - Final Setup Checklist

## ✅ Completed
- [x] Clerk packages installed (backend & frontend)
- [x] Backend guards and webhook controller created
- [x] Frontend ClerkProvider and SignIn/SignUp components
- [x] All controllers updated to use ClerkAuthGuard
- [x] Database migration for programs table
- [x] Clerk API keys provided

## 🔧 Remaining Steps

### 1. Environment Variables

**Frontend (Vercel):**
- [ ] Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = `pk_test_Y3VycmVudC12dWx0dXJlLTc1LmNsZXJrLmFjY291bnRzLmRldiQ`
- [ ] Redeploy frontend

**Backend (Railway):**
- [ ] Add `CLERK_SECRET_KEY` = `sk_test_3uh0SucPiM85Of9MRiAprMZ1cMsaaFxzrfEQYLdBcD`
- [ ] Add `CLERK_WEBHOOK_SECRET` = (get from Clerk Dashboard after creating webhook)

### 2. Clerk Webhook Setup

1. **Go to Clerk Dashboard** → https://dashboard.clerk.com
2. **Navigate to Webhooks** (left sidebar)
3. **Click "+ Add Endpoint"**
4. **Enter Endpoint URL:**
   ```
   https://node-performance-app-production.up.railway.app/webhooks/clerk
   ```
5. **Subscribe to events:**
   - ☑ `user.created`
   - ☑ `user.updated`
   - ☑ `user.deleted`
6. **Click "Create"**
7. **Copy the Signing Secret** (starts with `whsec_`)
8. **Add to Railway** as `CLERK_WEBHOOK_SECRET`

### 3. Test Authentication

1. **Start local dev** (or test on deployed frontend):
   ```bash
   cd frontend
   npm run dev
   ```

2. **Visit:** `http://localhost:3000/auth/register`
3. **Create a test account**
4. **Check Railway logs** to verify webhook received
5. **Check database** to verify user was created

### 4. Configure User Roles (Optional)

When creating users, you can set public metadata in Clerk:
- `role`: "HOME_USER", "COACH", "GYM_OWNER", or "SUPERADMIN"
- `isAdmin`: true or false

This can be done via:
- Clerk Dashboard → Users → Edit User → Metadata
- Or via Clerk API when creating users

## 🎯 Quick Test Commands

```bash
# Test backend
curl https://node-performance-app-production.up.railway.app/programs

# Test webhook endpoint (should return method not allowed for GET)
curl https://node-performance-app-production.up.railway.app/webhooks/clerk

# Test frontend (after deploying)
curl https://your-frontend.vercel.app
```

## 📝 Notes

- The webhook automatically syncs Clerk users to your database
- User roles are stored in Clerk's public metadata
- The `AuthContext` wrapper maintains compatibility with existing code
- All protected routes now use Clerk authentication

## 🚀 You're Almost Done!

Once you:
1. Add environment variables to Vercel and Railway
2. Set up the webhook in Clerk Dashboard
3. Test user registration

Your Clerk integration will be complete! 🎉

