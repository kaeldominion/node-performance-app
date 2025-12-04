# Railway Deployment Troubleshooting

## Error: "There was an error deploying from source"

This usually means Railway can't find the service or the root directory is wrong.

## Solution: Recreate the Service

Since Railway's free plan had limitations and we're now on paid, let's set it up fresh:

### Step 1: Delete Current Service (if needed)

1. In Railway, go to your `node-backend` service
2. Click the three dots (⋯) → **"Delete Service"**
3. Confirm deletion

### Step 2: Create New Backend Service

1. In your Railway project, click **"+ New"**
2. Select **"GitHub Repo"**
3. Choose `kaeldominion/node-performance-app`
4. **IMPORTANT**: Before clicking "Deploy", look for **"Root Directory"** or **"Source"** setting
5. Set Root Directory to: `backend`
6. Click **"Deploy"**

### Step 3: Configure Environment Variables

After deployment starts, go to **Variables** tab and add:

- `DATABASE_URL` - Should auto-detect from Postgres service
- `JWT_SECRET` - `9ZTly3FLABny4aZlz6DzXf9g5okrYxb5F16DXIiR4Is=`
- `OPENAI_API_KEY` - Your OpenAI key
- `PORT` - `3001` (or leave auto)
- `FRONTEND_URL` - `http://localhost:3000` (update after Vercel)

### Step 4: Set Deploy Command

In **Settings** → **Deploy Command**, set:
```bash
npm run db:setup && npm run start:prod
```

### Step 5: Generate Public Domain

1. Go to **Networking** tab
2. Click **"Generate Domain"**
3. Set port to `3001`
4. Copy the URL

## Alternative: Check Service Settings

If you want to keep the current service:

1. Go to **Settings** tab
2. Look for **"Source"** section
3. Check **"Root Directory"** - should be `backend`
4. If it's `frontend` or empty, change it to `backend`
5. Save and redeploy

