# Development Mode - Clerk Bypass

When Clerk is down or unavailable, you can continue development using the built-in dev mode bypass.

## How It Works

The app automatically detects when Clerk is unavailable and falls back to a mock authentication system:

1. **Frontend**: Detects Clerk failures and uses a mock user
2. **Backend**: Accepts `dev-mock-token` in development mode
3. **Mock User**: Automatically created with admin privileges for testing

## Enabling Dev Mode

Dev mode is **automatically enabled** when:
- `NODE_ENV=development` (default for `npm run dev`)
- OR `NEXT_PUBLIC_DEV_MODE=true` is set

## Mock User Details

- **ID**: `dev-user-123`
- **Email**: `dev@node.local`
- **Role**: `HOME_USER`
- **Admin**: `true` (for easier testing)

## What Happens

1. **Clerk Unavailable**: After 5 seconds of Clerk not loading, dev mode activates
2. **Mock Token**: Frontend uses `dev-mock-token` for API requests
3. **Backend Bypass**: Backend accepts the mock token and creates/uses the dev user
4. **Full Access**: You can access all features as if you were logged in

## Console Messages

Look for these in your browser console:
- `🔧 DEV MODE: Using mock authentication (Clerk bypass)`
- `⚠️ DEV MODE: Clerk unavailable, using mock user`

## Backend Logs

Look for these in your backend logs:
- `🔧 DEV MODE: Using mock authentication (Clerk bypass)`
- `⚠️ DEV MODE: Clerk verification failed, using mock authentication`

## Important Notes

- **Production**: Dev mode is disabled in production automatically
- **Security**: Mock tokens only work in development
- **Database**: The dev user is created automatically if it doesn't exist
- **Clerk Recovery**: When Clerk comes back online, the app will automatically switch back

## Manual Override

To force dev mode even when Clerk is available (for testing):

```bash
# Frontend
NEXT_PUBLIC_DEV_MODE=true npm run dev

# Backend
DEV_MODE=true npm run start:dev
```

## Testing

1. Start your frontend and backend
2. Wait 5 seconds (or Clerk fails immediately)
3. You should see dev mode messages in console
4. Navigate to `/dashboard` - you should be automatically "logged in"
5. All features should work as normal

## Disabling Dev Mode

To disable dev mode (force Clerk only):

```bash
# Remove or set to false
NEXT_PUBLIC_DEV_MODE=false
DEV_MODE=false
```

