# Final Setup Steps

## ✅ Frontend Deployed
- URL: https://node-performance-app-frontend.vercel.app/

## ⏭️ Next Steps

### 1. Update Railway Backend Environment Variable

In Railway → `node-performance-app` service:

1. Go to **Variables** tab
2. Find or add `FRONTEND_URL`
3. Set value to: `https://node-performance-app-frontend.vercel.app`
4. Save (Railway will auto-redeploy)

This enables CORS so your frontend can talk to the backend.

### 2. Verify Backend is Running

Check if backend is accessible:
- Visit: https://node-performance-app-production.up.railway.app/programs
- Should return JSON (may need auth, but should not be 404)

### 3. Verify Database is Seeded

In Railway → Postgres service:
- Go to **Database** → **Data** tab
- Should see tables: `programs`, `workouts`, `workout_sections`, etc.
- Should have data (NØDE Core Weekly program)

### 4. Test the Full App

Visit: https://node-performance-app-frontend.vercel.app/

Should be able to:
- ✅ See the login/register page
- ✅ Register a new account
- ✅ Browse programs
- ✅ View workouts
- ✅ Start a program

## Troubleshooting

**If frontend shows "Loading..." forever:**
- Check browser console for errors
- Verify `NEXT_PUBLIC_API_URL` is set in Vercel
- Check if backend is running (visit backend URL directly)

**If CORS errors:**
- Make sure `FRONTEND_URL` in Railway matches Vercel URL exactly
- Check backend logs in Railway

**If 404 on backend:**
- Backend might still be deploying
- Check Railway deployments tab
- Check logs for errors

