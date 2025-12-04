# Railway Deployment Guide (Hobby Plan)

Now that you're on the paid plan, let's deploy the backend!

## Step 1: Deploy Backend Service

1. In Railway, go to your project
2. Click **"+ New"** → **"GitHub Repo"**
3. Select your `node-performance-app` repository
4. **Important**: Set **Root Directory** to `backend`
5. Railway will auto-detect it's a Node.js app and start deploying

## Step 2: Connect to Postgres Database

1. In your **node-backend** service, go to **"Variables"** tab
2. Railway should auto-detect your Postgres service
3. If not, click **"+ New Variable"** and add:
   - Name: `DATABASE_URL`
   - Value: (Railway should provide this automatically, or use the internal URL from Postgres service)

## Step 3: Add Other Environment Variables

In **node-backend** → **Variables**, add:

- `JWT_SECRET` - Generate a random string (e.g., use: `openssl rand -base64 32`)
- `OPENAI_API_KEY` - Your OpenAI API key
- `PORT` - `3001` (or leave auto-assigned)
- `FRONTEND_URL` - We'll add this after Vercel deploy (for now use `http://localhost:3000`)

## Step 4: Set Deploy Command (Optional but Recommended)

In **node-backend** → **Settings** → **Deploy Command**:
```bash
npm run db:setup && npm run start:prod
```

This will automatically run migrations and seed on every deploy.

## Step 5: Deploy and Verify

1. Railway will automatically deploy when you connect the repo
2. Check **Deployments** tab to see progress
3. Once deployed, check **Logs** to see if migrations ran successfully
4. Verify database: Go to **Postgres** → **Database** → **Data** tab - you should see tables!

## Step 6: Get Your Backend URL

1. In **node-backend** service, go to **Settings**
2. Under **Networking**, you'll see your public URL
3. Copy this URL - you'll need it for Vercel frontend deployment

