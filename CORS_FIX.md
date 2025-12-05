# CORS Fix for www.nodeos.app

## Problem
The frontend is running on `https://www.nodeos.app` but the backend CORS configuration doesn't allow this origin, causing all API requests to fail with CORS errors.

## Solution Applied
Updated `backend/src/main.ts` to include:
- `https://www.nodeos.app`
- `https://nodeos.app`

## Next Steps

### 1. Update Railway Environment Variable
Go to Railway Dashboard → Your Backend Service → Variables:
- Update `FRONTEND_URL` to: `https://www.nodeos.app`
- Or add both: `https://www.nodeos.app,https://nodeos.app`

### 2. Redeploy Backend
After updating the environment variable, Railway will auto-redeploy. Wait for deployment to complete.

### 3. Test
After redeployment, try generating a workout again. The CORS errors should be resolved.

## Verification
After redeploying, check the browser console - you should no longer see:
```
Access to XMLHttpRequest ... has been blocked by CORS policy
```

## Note
The code change I made will allow both `www.nodeos.app` and `nodeos.app` domains, but you should also update the `FRONTEND_URL` environment variable in Railway to match your actual frontend domain.

