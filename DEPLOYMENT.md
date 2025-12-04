# Deployment Guide

## Overview

NØDE Performance App consists of:
- **Frontend**: Next.js app → Deploy to Vercel
- **Backend**: NestJS API → Deploy to Railway/Render
- **Database**: PostgreSQL → Use Supabase, Railway, or Neon

## Frontend Deployment (Vercel)

### Option 1: Deploy via Vercel Dashboard

1. **Push your code to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Initial commit - NØDE Performance App"
   git push origin main
   ```

2. **Create new Vercel project**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - **Important**: Set the **Root Directory** to `frontend`
   - Framework Preset: Next.js (auto-detected)

3. **Environment Variables**:
   Add these in Vercel project settings:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   ```

4. **Deploy**: Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
cd frontend
npm i -g vercel
vercel login
vercel
```

Follow the prompts. When asked for environment variables, add:
- `NEXT_PUBLIC_API_URL` = your backend URL

## Backend Deployment (Railway - Recommended)

### Why Railway?
- Easy PostgreSQL setup
- Simple NestJS deployment
- Automatic HTTPS
- Environment variable management

### Steps:

1. **Create Railway account**: [railway.app](https://railway.app)

2. **Create new project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - **Important**: Set the **Root Directory** to `backend`

3. **Add PostgreSQL database**:
   - In Railway project, click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway will provide `DATABASE_URL` automatically

4. **Configure environment variables**:
   In Railway project settings, add:
   ```
   DATABASE_URL=<auto-provided by Railway>
   JWT_SECRET=<generate a strong random string>
   OPENAI_API_KEY=<your-openai-api-key>
   PORT=3001
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

5. **Deploy**:
   - Railway will auto-detect NestJS
   - It will run: `npm install`, `npm run build`, `npm start`
   - **Important**: Add a build script in `package.json` if missing

6. **Run migrations**:
   After first deployment, in Railway:
   - Go to your backend service
   - Open "Deploy Logs"
   - Run: `npx prisma migrate deploy`
   - Run: `npm run prisma:seed`

7. **Get your backend URL**:
   - Railway provides a URL like: `https://your-app.railway.app`
   - Update `FRONTEND_URL` in Railway with your Vercel URL
   - Update `NEXT_PUBLIC_API_URL` in Vercel with your Railway URL

## Alternative: Backend on Render

1. **Create account**: [render.com](https://render.com)

2. **New Web Service**:
   - Connect GitHub repo
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`

3. **Add PostgreSQL**:
   - New → PostgreSQL
   - Copy the connection string

4. **Environment Variables** (same as Railway)

## Database Setup

### Option 1: Railway PostgreSQL (Easiest)
- Included with Railway deployment
- Auto-configured `DATABASE_URL`

### Option 2: Supabase (Free tier available)
1. Create project at [supabase.com](https://supabase.com)
2. Get connection string from Settings → Database
3. Use as `DATABASE_URL`

### Option 3: Neon (Serverless PostgreSQL)
1. Create project at [neon.tech](https://neon.tech)
2. Copy connection string
3. Use as `DATABASE_URL`

## Post-Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway/Render
- [ ] Database created and migrations run
- [ ] Seed data loaded (`npm run prisma:seed`)
- [ ] Environment variables configured in both services
- [ ] CORS configured (backend `FRONTEND_URL` matches Vercel URL)
- [ ] Test authentication flow
- [ ] Test workout player
- [ ] Test AI workout generation

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in backend matches your Vercel URL exactly
- Check backend CORS configuration in `main.ts`

### Database Connection
- Verify `DATABASE_URL` is correct
- For Railway: Use the internal database URL for better performance
- Run migrations: `npx prisma migrate deploy`

### Build Errors
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs in deployment platform

### API Not Found
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend is running and accessible
- Test backend URL directly in browser

## Quick Deploy Script

For Railway backend, you can add this to `backend/package.json`:

```json
{
  "scripts": {
    "railway:deploy": "prisma generate && prisma migrate deploy && npm run build && npm run start:prod"
  }
}
```

## Environment Variables Summary

### Frontend (Vercel)
- `NEXT_PUBLIC_API_URL` - Backend API URL

### Backend (Railway/Render)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `OPENAI_API_KEY` - OpenAI API key
- `PORT` - Server port (usually 3001)
- `FRONTEND_URL` - Frontend URL for CORS

