# How to Add an Admin User with Clerk

Since we're using Clerk for authentication, admin users are managed through Clerk's dashboard and metadata.

## Method 1: Via Clerk Dashboard (Easiest)

### Step 1: Create or Select User in Clerk

1. **Go to Clerk Dashboard** → https://dashboard.clerk.com
2. **Navigate to "Users"** (left sidebar)
3. Either:
   - **Create a new user**: Click "+ Add User" → Enter email/password
   - **Select existing user**: Click on an existing user

### Step 2: Set Admin Metadata

1. **Click on the user** to open their profile
2. **Go to "Metadata"** tab
3. **Click "Public Metadata"** section
4. **Add these fields:**
   ```json
   {
     "role": "SUPERADMIN",
     "isAdmin": true
   }
   ```
5. **Click "Save"**

### Step 3: Verify Webhook Sync

The webhook should automatically sync this to your database. Check:
- Railway logs to see if webhook received the update
- Your database to verify the user has `role = 'SUPERADMIN'` and `isAdmin = true`

## Method 2: Via Clerk API (Programmatic)

If you want to do it programmatically:

```bash
# Get your Clerk Secret Key from Railway variables
# Then use Clerk API:

curl -X PATCH https://api.clerk.com/v1/users/{user_id}/metadata \
  -H "Authorization: Bearer sk_test_YOUR_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "public_metadata": {
      "role": "SUPERADMIN",
      "isAdmin": true
    }
  }'
```

## Method 3: Direct Database Update (Temporary)

If webhooks aren't working yet, you can temporarily set it directly in the database:

1. **Get the user's email** from Clerk Dashboard
2. **Use Railway CLI or database console:**
   ```sql
   UPDATE users 
   SET "role" = 'SUPERADMIN', "isAdmin" = true 
   WHERE email = 'your-admin@email.com';
   ```

**Note:** This will be overwritten if the webhook runs, so make sure to set it in Clerk too.

## Method 4: Create Admin Script (For Initial Setup)

I can create a script that:
1. Takes an email
2. Finds the user in Clerk
3. Sets their metadata
4. Updates the database

Would you like me to create this script?

## Verify Admin Access

After setting admin, test it:

1. **Login** with that user account
2. **Try accessing** `/admin` routes
3. **Check** if admin features are visible in the UI

## Available Roles

- `HOME_USER` - Regular user (default)
- `COACH` - Coach role
- `GYM_OWNER` - Gym owner role  
- `SUPERADMIN` - Full admin access

## Troubleshooting

**Admin not working?**
- Check Clerk public metadata is set correctly
- Verify webhook synced to database
- Check backend logs for role checks
- Make sure user is logged in with that Clerk account

**Webhook not syncing?**
- Check Railway logs for webhook errors
- Verify `CLERK_WEBHOOK_SECRET` is set in Railway
- Check webhook endpoint is accessible

