# Login Troubleshooting Guide

## Most Common Issue: API URL Not Set

The frontend needs to know where the backend is. Check this first:

### 1. Verify Vercel Environment Variable

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Look for: `NEXT_PUBLIC_API_URL`
3. It should be set to: `https://node-performance-app-production.up.railway.app`
4. **If it's missing or wrong:**
   - Click "Add New"
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://node-performance-app-production.up.railway.app`
   - Apply to: All environments (Production, Preview, Development)
   - Click "Save"
   - **Redeploy** your frontend (or it will auto-redeploy)

### 2. Test Login After Setting API URL

**Test Credentials:**
- Email: `testuser@example.com`
- Password: `Test123!`

### 3. Check Browser Console

After Vercel redeploys, try logging in and:
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try logging in
4. Look for any errors - they'll show the actual problem

Common errors you might see:
- `Network Error` → API URL is wrong or CORS issue
- `401 Unauthorized` → Wrong password
- `404 Not Found` → API URL is wrong
- `CORS error` → Backend CORS not configured correctly

### 4. Quick Test

After setting the environment variable and redeploying, you can test if the frontend can reach the backend:

Open browser console on your frontend and run:
```javascript
fetch('https://node-performance-app-production.up.railway.app/programs')
  .then(r => r.json())
  .then(data => console.log('✅ Backend reachable:', data))
  .catch(err => console.error('❌ Backend unreachable:', err));
```

If this works, the API URL is correct. If it fails, check:
- Is the backend URL correct?
- Is CORS configured on the backend?
- Is the backend actually running?

### 5. Alternative: Register a New Account

If login still doesn't work, try registering a new account:
1. Go to: `https://node-performance-app-frontend.vercel.app/auth/register`
2. Register with a new email
3. You'll be automatically logged in after registration

---

**Backend Status:**
- ✅ Backend is running
- ✅ Login API works (tested)
- ✅ Registration API works (tested)
- ✅ CORS is configured

The issue is most likely the frontend API URL not being set in Vercel.

