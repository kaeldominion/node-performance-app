-- Add username column to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username") WHERE "username" IS NOT NULL;
