# Development Environment Setup Checklist

## ✅ What's Done
- [x] Clerk middleware re-enabled
- [x] Development keys provided
- [x] Backend configured with Clerk guards

## 🔧 What You Need to Verify

### Vercel (Frontend)
1. **Go to Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. **Verify:**
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = `pk_test_Y3VycmVudC12dWx0dXJlLTc1LmNsZXJrLmFjY291bnRzLmRldiQ`
   - Enabled for **Production** environment (yes, even though it's a dev key!)
   - **Save** if you made changes
3. **Redeploy** if you updated the variable

### Railway (Backend)
1. **Go to Railway Dashboard** → Your Backend Service → **Variables**
2. **Verify:**
   - `CLERK_SECRET_KEY` = `sk_test_3uh0SucPiM85Of9MRiAprMZ1cMsaaFxzrfEQYLdBcD`
3. **Save** if you made changes (auto-redeploys)

### Clerk Webhook (Development Environment)
1. **Go to Clerk Dashboard** (make sure you're in **Development** environment)
2. **Navigate to Webhooks**
3. **Create/Verify webhook:**
   - Endpoint: `https://node-performance-app-production.up.railway.app/webhooks/clerk`
   - Subscribe to: `user.created`, `user.updated`, `user.deleted`
4. **Copy webhook secret** and add to Railway as `CLERK_WEBHOOK_SECRET`

## 🧪 Test After Setup

1. **Visit your Vercel URL:**
   ```
   https://your-app.vercel.app
   ```
   Should load without 500 error!

2. **Test login:**
   ```
   https://your-app.vercel.app/auth/login
   ```
   Should show Clerk sign-in form

3. **Test registration:**
   ```
   https://your-app.vercel.app/auth/register
   ```
   Should show Clerk sign-up form

## 📝 Notes

- **Development keys work fine** for deployed apps - they're fully functional
- You can switch to production keys later when you have a custom domain
- The middleware is now re-enabled and should work with development keys

## 🚀 Next Steps

1. Verify environment variables in Vercel and Railway
2. Redeploy Vercel frontend
3. Test the app - should work now!
4. Set up your first admin user via Clerk Dashboard


