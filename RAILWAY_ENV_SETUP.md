# Railway Environment Variables Setup

## Required Environment Variables

Your backend needs these environment variables set in Railway:

### 1. JWT_SECRET (REQUIRED)
**This is critical for authentication to work!**

1. Go to Railway Dashboard → Your Backend Service → Variables tab
2. Click "New Variable"
3. Add:
   - **Key**: `JWT_SECRET`
   - **Value**: Generate a strong random string (you can use: `openssl rand -base64 32`)
   - **Apply to**: All environments

### 2. FRONTEND_URL (Recommended)
1. Add variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://node-performance-app-frontend.vercel.app`
   - **Apply to**: All environments

### 3. OPENAI_API_KEY (Optional - for AI features)
If you want to use AI workout generation:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key

## After Adding Variables

1. Railway will automatically redeploy your backend
2. Wait for deployment to complete
3. Try registering again at: `https://node-performance-app-frontend.vercel.app/auth/register`

## Quick Test

After setting JWT_SECRET, test registration:
```bash
curl -X POST https://node-performance-app-production.up.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'
```

You should get back an `access_token` instead of a 500 error.

