# Environment Variables Setup

## Clerk API Keys

I've received your Clerk API keys. Since `.env` files are gitignored (for security), you'll need to add these manually to your local files and deployment platforms.

### Frontend (.env.local)
Create or update `frontend/.env.local`:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y3VycmVudC12dWx0dXJlLTc1LmNsZXJrLmFjY291bnRzLmRldiQ
```

### Backend (.env)
Create or update `backend/.env`:
```bash
CLERK_SECRET_KEY=sk_test_3uh0SucPiM85Of9MRiAprMZ1cMsaaFxzrfEQYLdBcD
```

## Deployment Platforms

### Vercel (Frontend)
1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = `pk_test_Y3VycmVudC12dWx0dXJlLTc1LmNsZXJrLmFjY291bnRzLmRldiQ`
4. Redeploy

### Railway (Backend)
1. Go to your Railway project settings
2. Navigate to Variables
3. Add: `CLERK_SECRET_KEY` = `sk_test_3uh0SucPiM85Of9MRiAprMZ1cMsaaFxzrfEQYLdBcD`
4. Redeploy

## Next Steps

1. **Set up Clerk Webhooks** (Important!)
   - Go to Clerk Dashboard → Webhooks
   - Add endpoint: `https://your-railway-backend-url.com/webhooks/clerk`
   - Subscribe to: `user.created`, `user.updated`, `user.deleted`
   - Copy the webhook secret and add it to Railway as `CLERK_WEBHOOK_SECRET`

2. **Test Authentication**
   - Start your frontend: `cd frontend && npm run dev`
   - Start your backend: `cd backend && npm run start:dev`
   - Visit `http://localhost:3000/auth/register` to test signup
   - Check backend logs to verify webhook is receiving events

3. **Configure User Roles**
   - When creating users, set public metadata:
     - `role`: "HOME_USER", "COACH", "GYM_OWNER", or "SUPERADMIN"
     - `isAdmin`: true or false
   - This can be done via Clerk Dashboard or API

## Security Note

⚠️ These are test keys. For production, you'll need to:
1. Create a production Clerk application
2. Get production keys
3. Update environment variables in production deployments

