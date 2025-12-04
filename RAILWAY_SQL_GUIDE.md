# How to Run SQL on Railway - Multiple Methods

## Method 1: Railway Database Service (Easiest if Available)

1. **Go to Railway Dashboard** → Your Project
2. **Find your PostgreSQL service** (not the backend, the actual database)
3. Look for one of these tabs:
   - **"Data"** tab
   - **"Query"** tab  
   - **"Console"** tab
   - **"Connect"** tab (might have a query interface)
4. If you see a SQL editor, paste:
   ```sql
   ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "createdBy" TEXT;
   ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "coachId" TEXT;
   ```

## Method 2: Use Railway CLI (Recommended)

1. **Install Railway CLI:**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login:**
   ```bash
   railway login
   ```

3. **Link to your project:**
   ```bash
   cd backend
   railway link
   ```
   (Select your Railway project when prompted)

4. **Connect to database and run SQL:**
   ```bash
   railway connect postgres
   ```
   Then paste the SQL commands above.

   OR run directly:
   ```bash
   railway run psql $DATABASE_URL -c "ALTER TABLE programs ADD COLUMN IF NOT EXISTS \"createdBy\" TEXT;"
   railway run psql $DATABASE_URL -c "ALTER TABLE programs ADD COLUMN IF NOT EXISTS \"coachId\" TEXT;"
   ```

## Method 3: Use Prisma Migrate (Best for Production)

1. **Install Railway CLI** (if not installed):
   ```bash
   npm i -g @railway/cli
   ```

2. **Link to project:**
   ```bash
   cd backend
   railway link
   ```

3. **Run migration:**
   ```bash
   railway run npx prisma migrate deploy
   ```

## Method 4: Connect with External Tool

1. **Get Database Connection String:**
   - Go to Railway → PostgreSQL service → Variables
   - Copy the `DATABASE_URL` value

2. **Use a database client:**
   - **pgAdmin** (GUI)
   - **DBeaver** (GUI)
   - **TablePlus** (Mac GUI)
   - **psql** (command line)

3. **Connect and run:**
   ```sql
   ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "createdBy" TEXT;
   ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "coachId" TEXT;
   ```

## Method 5: Temporary Migration Script (If All Else Fails)

We can create a one-time script that runs on backend startup to add the columns if they don't exist.

Let me know which method you'd like to try, or if you can't find any of these options!

