-- Comprehensive script to fix all missing columns and tables in production database
-- Run this directly on Railway database if migrations fail

-- 1. Add username column to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username") WHERE "username" IS NOT NULL;

-- 2. Fix session_logs: Rename performedAt to startedAt and add missing columns
DO $$ 
BEGIN
    -- Rename performedAt to startedAt if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'session_logs' AND column_name = 'performedAt') THEN
        ALTER TABLE "session_logs" RENAME COLUMN "performedAt" TO "startedAt";
    END IF;
    
    -- Add startedAt if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'session_logs' AND column_name = 'startedAt') THEN
        ALTER TABLE "session_logs" ADD COLUMN "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    -- Add completedAt if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'session_logs' AND column_name = 'completedAt') THEN
        ALTER TABLE "session_logs" ADD COLUMN "completedAt" TIMESTAMP(3);
    END IF;
    
    -- Add createdAt if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'session_logs' AND column_name = 'createdAt') THEN
        ALTER TABLE "session_logs" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    -- Add updatedAt if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'session_logs' AND column_name = 'updatedAt') THEN
        ALTER TABLE "session_logs" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    -- Add programId if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'session_logs' AND column_name = 'programId') THEN
        ALTER TABLE "session_logs" ADD COLUMN "programId" TEXT;
    END IF;
    
    -- Add weekIndex if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'session_logs' AND column_name = 'weekIndex') THEN
        ALTER TABLE "session_logs" ADD COLUMN "weekIndex" INTEGER;
    END IF;
    
    -- Add dayIndex if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'session_logs' AND column_name = 'dayIndex') THEN
        ALTER TABLE "session_logs" ADD COLUMN "dayIndex" INTEGER;
    END IF;
    
    -- Add avgHeartRate if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'session_logs' AND column_name = 'avgHeartRate') THEN
        ALTER TABLE "session_logs" ADD COLUMN "avgHeartRate" INTEGER;
    END IF;
    
    -- Add maxHeartRate if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'session_logs' AND column_name = 'maxHeartRate') THEN
        ALTER TABLE "session_logs" ADD COLUMN "maxHeartRate" INTEGER;
    END IF;
END $$;

-- 3. Create NotificationType enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NotificationType') THEN
        CREATE TYPE "NotificationType" AS ENUM (
            'NETWORK_REQUEST',
            'NETWORK_ACCEPTED',
            'NETWORK_REJECTED',
            'FRIEND_WORKOUT_STARTED',
            'FRIEND_WORKOUT_COMPLETED',
            'FRIEND_WORKOUT_CREATED',
            'FRIEND_STATS_IMPROVED',
            'FRIEND_LEVEL_UP',
            'FRIEND_LEADERBOARD_ENTRY'
        );
    END IF;
END $$;

-- 4. Create ActivityType enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ActivityType') THEN
        CREATE TYPE "ActivityType" AS ENUM (
            'USER_REGISTERED',
            'USER_LEVEL_UP',
            'WORKOUT_CREATED',
            'WORKOUT_COMPLETED',
            'WORKOUT_SHARED',
            'PROGRAM_STARTED',
            'PROGRAM_COMPLETED',
            'ACHIEVEMENT_EARNED',
            'NETWORK_CONNECTION',
            'NETWORK_REQUEST_SENT',
            'NETWORK_REQUEST_ACCEPTED'
        );
    END IF;
END $$;

-- 5. Create NetworkStatus enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NetworkStatus') THEN
        CREATE TYPE "NetworkStatus" AS ENUM ('PENDING', 'ACCEPTED', 'BLOCKED');
    END IF;
END $$;

-- 6. Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "networkId" TEXT,
    "activityLogId" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- 7. Create indexes for notifications if they don't exist
CREATE INDEX IF NOT EXISTS "notifications_userId_read_idx" ON "notifications"("userId", "read");
CREATE INDEX IF NOT EXISTS "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- 8. Add foreign keys for notifications if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_userId_fkey'
    ) THEN
        ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 9. Add networkCode to users if it doesn't exist
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "networkCode" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "users_networkCode_key" ON "users"("networkCode") WHERE "networkCode" IS NOT NULL;

-- 10. Add xp and level to users if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'xp') THEN
        ALTER TABLE "users" ADD COLUMN "xp" INTEGER NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'level') THEN
        ALTER TABLE "users" ADD COLUMN "level" INTEGER NOT NULL DEFAULT 1;
    END IF;
END $$;

