# How to Connect to Railway Database and Run SQL

## Step 1: Get Your Database Connection String

1. Go to Railway → Your **Postgres** service
2. Click **"Variables"** tab
3. Find `DATABASE_URL` or `POSTGRES_URL`
4. Copy the connection string (looks like: `postgresql://user:password@host:port/dbname`)

## Step 2: Connect Using psql (Command Line)

```bash
# Install psql if you don't have it (on Mac)
brew install postgresql

# Connect to Railway database
psql "YOUR_DATABASE_URL_HERE"

# Once connected, paste the SQL from fix-production-database.sql
# Then type \q to exit
```

## Step 3: Or Use a GUI Tool

**Option A: DBeaver (Free)**
1. Download DBeaver: https://dbeaver.io/
2. Create new connection → PostgreSQL
3. Paste your Railway DATABASE_URL
4. Connect
5. Open SQL Editor
6. Paste the SQL script
7. Run it

**Option B: TablePlus (Mac)**
1. Download TablePlus: https://tableplus.com/
2. Create new connection → PostgreSQL
3. Paste your Railway DATABASE_URL
4. Connect
5. Open SQL Editor
6. Paste the SQL script
7. Run it

**Option C: pgAdmin (Free)**
1. Download pgAdmin: https://www.pgadmin.org/
2. Add new server
3. Use your Railway DATABASE_URL details
4. Connect
5. Open Query Tool
6. Paste the SQL script
7. Run it

## Step 4: Run the SQL Script

Copy the entire contents of `backend/scripts/fix-production-database.sql` and run it in your SQL client.

