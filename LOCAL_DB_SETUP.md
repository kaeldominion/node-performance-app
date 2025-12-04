# Local Database Setup (Railway Postgres)

Since Railway free plan only allows databases, we'll run migrations locally against your Railway Postgres database.

## Step 1: Get DATABASE_URL from Railway

1. In Railway, go to your **Postgres** service
2. Click **"Variables"** tab
3. Find `DATABASE_URL` or `POSTGRES_URL`
4. Copy the connection string

## Step 2: Create Local .env File

Create `backend/.env`:
```bash
DATABASE_URL="postgresql://user:password@host:port/dbname"
```

## Step 3: Run Migrations Locally

```bash
cd backend
npm install  # Make sure Prisma is installed
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
```

## Step 4: Verify

Check Railway Postgres → Database → Data tab. You should see all tables!

