# Deployment Troubleshooting Guide

## Common Issues and Solutions

### Railway Backend Deployment Failures

#### Issue 1: Build Fails - "Cannot find module"
**Solution**: Ensure Railway is using the correct root directory
1. Go to Railway → Your Backend Service → Settings
2. Check **Root Directory** is set to: `backend`
3. If not, update it and redeploy

#### Issue 2: Database Migration Fails
**Solution**: The railway.json already handles this, but verify:
1. Check Railway → Backend Service → Variables
2. Ensure `DATABASE_URL` is set (should be auto-provided by Postgres service)
3. Check deployment logs for migration errors

#### Issue 3: Prisma Generate Fails
**Solution**: The build command includes `npx prisma generate`, but if it fails:
1. Check that `postinstall` script runs: `prisma generate` (already in package.json)
2. Verify Prisma schema is valid: `cd backend && npx prisma validate`

#### Issue 4: Port Issues
**Solution**: 
1. Railway auto-assigns PORT, but you can set it explicitly
2. In Railway → Variables, add: `PORT=3001`
3. In Railway → Networking, ensure the port matches

### Vercel Frontend Deployment Failures

#### Issue 1: Build Fails - "Cannot find module"
**Solution**: Ensure Vercel root directory is set correctly
1. Go to Vercel Dashboard → Your Project → Settings → General
2. Check **Root Directory** is set to: `frontend`
3. If not, update it and redeploy

#### Issue 2: Environment Variables Missing
**Solution**: Add required environment variables
1. Go to Vercel → Your Project → Settings → Environment Variables
2. Add: `NEXT_PUBLIC_API_URL` = your Railway backend URL
3. Redeploy after adding variables

#### Issue 3: Build Timeout
**Solution**: 
1. Check if build is taking too long
2. Verify all dependencies are in package.json
3. Consider using Vercel's build cache

#### Issue 4: Next.js Build Errors
**Solution**:
1. Test build locally: `cd frontend && npm run build`
2. Fix any TypeScript or linting errors
3. Ensure all imports are correct

## Step-by-Step Deployment

### Backend (Railway)

1. **Create/Verify Railway Project**
   - Go to [railway.app](https://railway.app)
   - Create new project or select existing
   - Add GitHub repo: `kaeldominion/node-performance-app`

2. **Set Root Directory**
   - In Railway service settings, set **Root Directory** to: `backend`

3. **Add PostgreSQL Database**
   - Click "+ New" → "Database" → "PostgreSQL"
   - Railway will auto-provide `DATABASE_URL`

4. **Set Environment Variables** (in Backend Service → Variables):
   ```
   DATABASE_URL=<auto-provided by Railway>
   JWT_SECRET=<generate: openssl rand -base64 32>
   OPENAI_API_KEY=<your-openai-key>
   PORT=3001
   FRONTEND_URL=<will add after Vercel deploy>
   ```

5. **Deploy**
   - Railway will auto-deploy on git push
   - Check logs for migration status
   - Get public URL from Networking tab

### Frontend (Vercel)

1. **Create/Verify Vercel Project**
   - Go to [vercel.com](https://vercel.com)
   - Import GitHub repo: `kaeldominion/node-performance-app`

2. **Set Root Directory**
   - In Project Settings → General
   - Set **Root Directory** to: `frontend`

3. **Set Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-clerk-key>
   ```

4. **Deploy**
   - Vercel will auto-deploy on git push
   - Check build logs for errors

5. **Update Backend FRONTEND_URL**
   - After Vercel deploy, get your frontend URL
   - Update Railway backend variable: `FRONTEND_URL=https://your-frontend.vercel.app`
   - Redeploy backend

## Verification Checklist

- [ ] Backend builds successfully on Railway
- [ ] Database migrations run successfully
- [ ] Backend is accessible at Railway URL
- [ ] Frontend builds successfully on Vercel
- [ ] Frontend environment variables are set
- [ ] Frontend can connect to backend API
- [ ] CORS is configured correctly
- [ ] Authentication works (Clerk)

## Quick Fixes

### If Railway build fails:
```bash
# Test locally first
cd backend
npm install
npx prisma generate
npm run build
npm run start:prod
```

### If Vercel build fails:
```bash
# Test locally first
cd frontend
npm install
npm run build
npm run start
```

### Check deployment logs:
- Railway: Service → Deployments → View Logs
- Vercel: Project → Deployments → Click on deployment → View Logs

## Still Having Issues?

1. Check the deployment logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure root directories are set correctly
4. Test builds locally before deploying
5. Check that all dependencies are in package.json

