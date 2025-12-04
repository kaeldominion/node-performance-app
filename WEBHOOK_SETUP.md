# Clerk Webhook Setup Guide

## Step 1: Find Your Railway Backend URL

1. Go to [Railway Dashboard](https://railway.app)
2. Select your backend service (usually named `node-backend` or similar)
3. Go to **Settings** tab
4. Scroll to **Networking** section
5. You'll see your public URL (e.g., `https://node-performance-app-production.up.railway.app`)
6. **Copy this URL** - you'll need it for the webhook endpoint

## Step 2: Configure Webhook in Clerk Dashboard

1. **Go to Clerk Dashboard**
   - Visit: https://dashboard.clerk.com
   - Sign in and select your application

2. **Navigate to Webhooks**
   - In the left sidebar, click **"Webhooks"**
   - You'll see a list of webhook endpoints (probably empty if this is your first)

3. **Create New Endpoint**
   - Click **"+ Add Endpoint"** or **"Create Endpoint"** button
   - A form will appear

4. **Enter Endpoint URL**
   - In the **"Endpoint URL"** field, enter:
     ```
     https://YOUR-RAILWAY-URL.com/webhooks/clerk
     ```
   - Replace `YOUR-RAILWAY-URL.com` with your actual Railway URL from Step 1
   - Example: `https://node-performance-app-production.up.railway.app/webhooks/clerk`

5. **Subscribe to Events**
   - You'll see a section called **"Subscribe to events"** or **"Events"**
   - It will show a list of checkboxes for different events
   - **Check these three boxes:**
     - ☑ `user.created`
     - ☑ `user.updated`
     - ☑ `user.deleted`
   - You can leave other events unchecked for now

6. **Save the Endpoint**
   - Click **"Create"** or **"Save"** button
   - Clerk will create the endpoint and generate a signing secret

7. **Copy the Signing Secret**
   - After creating, you'll see a **"Signing Secret"** (starts with `whsec_`)
   - **Copy this secret** - you'll need it for Railway

## Step 3: Add Webhook Secret to Railway

1. Go back to Railway Dashboard
2. Select your backend service
3. Go to **Variables** tab
4. Click **"+ New Variable"**
5. Add:
   - **Name**: `CLERK_WEBHOOK_SECRET`
   - **Value**: Paste the signing secret you copied (starts with `whsec_`)
6. Click **"Add"**
7. Railway will automatically redeploy with the new variable

## Step 4: Test the Webhook

1. Go to Clerk Dashboard → Users
2. Create a test user (or use an existing one)
3. Check Railway logs to see if the webhook was received
4. Check your database to verify the user was synced

## Troubleshooting

**Webhook not receiving events?**
- Verify the endpoint URL is correct (must end with `/webhooks/clerk`)
- Check Railway logs for errors
- Make sure `CLERK_WEBHOOK_SECRET` is set in Railway
- Verify the backend is running and accessible

**Getting 401/403 errors?**
- Make sure the webhook secret matches in both Clerk and Railway
- Check that the webhook endpoint is publicly accessible (not behind auth)

**User not syncing to database?**
- Check backend logs for webhook processing errors
- Verify the webhook controller is receiving events
- Check database connection in Railway

