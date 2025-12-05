# AI Workout Generation Network Error - Fix Guide

## Problem
Users are experiencing "Network Error" when trying to generate AI workouts. The error occurs at the "Generating workout structure & exercise selection..." step.

## Changes Made

### 1. Added Timeout Configuration
- **Frontend**: Added 120-second timeout to axios client to prevent hanging requests
- **Backend**: Added 120-second timeout to OpenAI client

### 2. Improved Error Handling
- **Backend**: Better error messages for:
  - Missing/invalid OpenAI API key
  - Rate limiting
  - Network/timeout errors
  - API errors
- **Frontend**: Better error messages for network errors with API URL information

### 3. Better Error Messages
- Errors now show specific failure reasons instead of generic "Network Error"
- Network errors show the configured API URL for debugging

## What to Check

### 1. Verify OpenAI API Key (Most Common Issue)

**In Railway Backend:**
1. Go to Railway Dashboard → Your Backend Service → **Variables**
2. Check if `OPENAI_API_KEY` is set
3. If missing, add it:
   - Key: `OPENAI_API_KEY`
   - Value: Your OpenAI API key (starts with `sk-`)
4. **Redeploy** the backend after adding

**Test:**
```bash
# Check if backend can access OpenAI
curl -X POST https://your-backend-url.railway.app/ai/generate-workout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"goal":"HYBRID","trainingLevel":"INTERMEDIATE","equipment":["dumbbells"],"availableMinutes":60}'
```

### 2. Verify API URL Configuration

**In Vercel Frontend:**
1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Check `NEXT_PUBLIC_API_URL`:
   - Should be: `https://node-performance-app-production.up.railway.app`
   - **NO trailing slash**
3. If wrong, update and **redeploy**

**Test:**
Open browser console on your live site and check:
```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
// Should show your Railway backend URL
```

### 3. Verify Backend is Running

**Check Backend Status:**
1. Visit: `https://node-performance-app-production.up.railway.app/programs`
2. Should return JSON (may need auth, but should not be 404 or connection error)

**Check Railway Logs:**
1. Go to Railway Dashboard → Your Backend Service → **Deployments**
2. Check latest deployment logs for errors
3. Look for OpenAI API errors or missing environment variables

### 4. Verify CORS Configuration

**In Railway Backend:**
1. Check `FRONTEND_URL` environment variable
2. Should match your Vercel frontend URL exactly:
   - `https://node-performance-app-frontend.vercel.app`
3. **No trailing slash**

### 5. Check Network Connectivity

**Test from Browser Console:**
```javascript
// Test if backend is reachable
fetch('https://node-performance-app-production.up.railway.app/programs')
  .then(r => r.json())
  .then(data => console.log('✅ Backend reachable:', data))
  .catch(err => console.error('❌ Backend unreachable:', err));
```

## Common Error Messages and Solutions

### "OpenAI API key is missing or invalid"
- **Solution**: Add `OPENAI_API_KEY` to Railway backend environment variables

### "Network Error: Unable to connect to the backend API"
- **Solution**: 
  - Check `NEXT_PUBLIC_API_URL` in Vercel
  - Verify backend is running in Railway
  - Check CORS configuration

### "Request timed out"
- **Solution**: 
  - OpenAI API might be slow, try again
  - Check if OpenAI API is experiencing issues
  - Verify network connection

### "OpenAI API rate limit exceeded"
- **Solution**: Wait a few minutes and try again

## Quick Fix Checklist

- [ ] `OPENAI_API_KEY` is set in Railway backend
- [ ] `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- [ ] `FRONTEND_URL` is set correctly in Railway
- [ ] Backend is running (check Railway deployments)
- [ ] Frontend is redeployed after environment variable changes
- [ ] Backend is redeployed after environment variable changes

## Testing After Fix

1. Go to your live site
2. Navigate to AI Workout Builder
3. Fill in workout parameters
4. Click "Generate Workout"
5. Should see progress through all steps without errors

## Still Not Working?

1. **Check Browser Console**: Look for specific error messages
2. **Check Railway Logs**: Look for backend errors
3. **Test API Directly**: Use curl or Postman to test the endpoint
4. **Verify OpenAI Account**: Make sure your OpenAI API key has credits/quota

## Notes

- AI workout generation can take 20-30 seconds
- The timeout is set to 120 seconds to accommodate slow responses
- Network errors are now more descriptive to help with debugging

