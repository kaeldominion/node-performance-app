# Database Migration Workflow Guide

## ⚠️ IMPORTANT: Production Migration Process

**Railway does NOT have a web-based shell or SQL query interface.** Use the methods below.

## Standard Migration Workflow

### Local Development
```bash
cd backend
npx prisma migrate dev --name your_migration_name
```

### Production (Railway)

**Method 1: Automatic (Preferred)**
- Migrations run automatically on deploy via `railway.json`:
  ```json
  "startCommand": "npx prisma migrate deploy || true && npm run start:prod"
  ```
- **BUT**: The `|| true` means failures are silent - always check deploy logs!
- If migrations fail silently, use Method 2 or 3 below.

**Method 2: Using psql (Command Line)**
1. Get public `DATABASE_URL` from Railway:
   - Railway → Postgres service → Variables tab
   - Copy `DATABASE_URL` (must be public, NOT `.railway.internal`)
2. Install psql if needed:
   ```bash
   brew install postgresql@15
   ```
3. Run migrations:
   ```bash
   /opt/homebrew/opt/postgresql@15/bin/psql "YOUR_DATABASE_URL" -f backend/scripts/fix-production-database.sql
   ```
   Or use the helper script:
   ```bash
   cd backend/scripts
   ./run-fix-sql.sh "YOUR_DATABASE_URL"
   ```

**Method 3: Using GUI Tool (Easiest)**
1. Download TablePlus: https://tableplus.com/
2. Create PostgreSQL connection using Railway `DATABASE_URL`
3. Open SQL Editor (Cmd+E)
4. Paste SQL from `backend/scripts/fix-production-database.sql`
5. Run (Cmd+R)

## When Migrations Fail in Production

### Symptoms
- Errors like "column does not exist"
- Errors like "table does not exist"
- `users.username`, `session_logs.startedAt`, `notifications` table missing

### Solution
1. **Check which migrations are missing:**
   - Compare Prisma schema with production database
   - Look for missing columns/tables in error logs

2. **Use the fix script:**
   - File: `backend/scripts/fix-production-database.sql`
   - This script uses `IF NOT EXISTS` checks - safe to run multiple times
   - Fixes common missing schema elements

3. **Run via psql or GUI:**
   ```bash
   /opt/homebrew/opt/postgresql@15/bin/psql "DATABASE_URL" -f backend/scripts/fix-production-database.sql
   ```

## Creating New Migrations

### Standard Process
1. Update `backend/prisma/schema.prisma`
2. Create migration:
   ```bash
   cd backend
   npx prisma migrate dev --name descriptive_name
   ```
3. Commit migration files to git
4. Deploy to Railway
5. **Verify migrations ran** - check deploy logs for errors
6. If migrations failed, use Method 2 or 3 above

### Important Notes
- Always test migrations locally first
- Railway's automatic migration can fail silently (`|| true` in startCommand)
- Always verify migrations actually ran in production
- Keep `fix-production-database.sql` updated with new schema changes

## Railway CLI (Doesn't Work for Migrations)

**DO NOT USE** `railway run` for migrations - it runs locally, not on Railway servers.

## Quick Reference

### Get Database URL
- Railway → Postgres service → Variables → `DATABASE_URL`
- Must be public URL (not `.railway.internal`)

### Run Fix Script
```bash
/opt/homebrew/opt/postgresql@15/bin/psql "DATABASE_URL" -f backend/scripts/fix-production-database.sql
```

### Verify Migrations
- Check Railway deploy logs
- Look for "migrations applied" or errors
- Test app functionality

## Common Issues

**Issue**: "column does not exist" errors
**Fix**: Run `fix-production-database.sql` via psql or GUI

**Issue**: Migrations fail silently
**Fix**: Check deploy logs, manually run migrations via psql/GUI

**Issue**: Can't connect to database
**Fix**: Use public `DATABASE_URL`, not internal `.railway.internal` URL

