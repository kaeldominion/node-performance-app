# Deployment Checklist

## Pre-Deployment

### Backend Schema Fix
The Prisma schema has been updated with the NØDE framework. Before deploying:

1. **Database Migration**: Run migrations on your production database
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

2. **Seed Database**: After migration, seed with NØDE programs
   ```bash
   npm run prisma:seed
   ```

### Environment Variables

#### Backend (Railway/Render)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Strong random string
- `OPENAI_API_KEY` - Your OpenAI API key
- `PORT` - 3001 (or auto-assigned)
- `FRONTEND_URL` - Your Vercel frontend URL

#### Frontend (Vercel)
- `NEXT_PUBLIC_API_URL` - Your backend URL (Railway/Render)

## Deployment Steps

### 1. Deploy Backend First
1. Push code to GitHub
2. Deploy to Railway/Render
3. Run migrations: `npx prisma migrate deploy`
4. Seed database: `npm run prisma:seed`
5. Get backend URL

### 2. Deploy Frontend
1. Deploy to Vercel
2. Set `NEXT_PUBLIC_API_URL` environment variable
3. Update backend `FRONTEND_URL` with Vercel URL

### 3. Test
- [ ] Register new user
- [ ] Browse programs (should see "NØDE Core Weekly" with 6 archetypes)
- [ ] Start a program
- [ ] View workout player
- [ ] Test AI workout generation

## Schema Notes

The Prisma schema uses a one-to-one relationship pattern for tier prescriptions:
- Each ExerciseBlock can have optional tierSilver, tierGold, tierBlack
- Each TierPrescription belongs to one ExerciseBlock via a specific tier relation
- This allows clean access like `block.tierSilver.load` in the code

If you encounter Prisma relation errors locally, they should resolve in production with proper Prisma version.

