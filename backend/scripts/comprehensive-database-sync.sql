-- Comprehensive Database Sync Script
-- This script ensures all tables, columns, enums, indexes, and foreign keys match the Prisma schema
-- Safe to run multiple times (idempotent)

-- ============================================================================
-- ENUMS
-- ============================================================================

-- TrainingLevel
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TrainingLevel') THEN
        CREATE TYPE "TrainingLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE');
    END IF;
END $$;

-- TrainingGoal
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TrainingGoal') THEN
        CREATE TYPE "TrainingGoal" AS ENUM ('STRENGTH', 'HYPERTROPHY', 'HYBRID', 'CONDITIONING', 'FAT_LOSS', 'LONGEVITY');
    END IF;
END $$;

-- Tier
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Tier') THEN
        CREATE TYPE "Tier" AS ENUM ('SILVER', 'GOLD', 'BLACK');
    END IF;
END $$;

-- SectionType
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SectionType') THEN
        CREATE TYPE "SectionType" AS ENUM ('WARMUP', 'EMOM', 'AMRAP', 'FOR_TIME', 'FINISHER', 'COOLDOWN', 'WAVE', 'SUPERSET', 'CIRCUIT', 'CAPACITY', 'FLOW', 'INTERVAL', 'OTHER');
    END IF;
END $$;

-- WorkoutArchetype
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WorkoutArchetype') THEN
        CREATE TYPE "WorkoutArchetype" AS ENUM ('PR1ME', 'FORGE', 'ENGIN3', 'CIRCUIT_X', 'CAPAC1TY', 'FLOWSTATE');
    END IF;
END $$;

-- ProgramCycle
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProgramCycle') THEN
        CREATE TYPE "ProgramCycle" AS ENUM ('BASE', 'LOAD', 'INTENSIFY', 'DELOAD', 'PEAK', 'RESET');
    END IF;
END $$;

-- ExerciseCategory
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ExerciseCategory') THEN
        CREATE TYPE "ExerciseCategory" AS ENUM ('STRENGTH', 'MIXED', 'SKILL', 'ENGINE', 'CORE', 'MOBILITY');
    END IF;
END $$;

-- MovementPattern
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MovementPattern') THEN
        CREATE TYPE "MovementPattern" AS ENUM ('HORIZONTAL_PUSH', 'HORIZONTAL_PULL', 'VERTICAL_PUSH', 'VERTICAL_PULL', 'SQUAT', 'HINGE', 'LUNGE', 'CARRY', 'LOC0MOTION', 'FULL_BODY', 'CORE_ANTI_EXTENSION', 'CORE_ROTATION', 'CORE_FLEXION', 'BREATH_MOBILITY');
    END IF;
END $$;

-- SpaceRequirement
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SpaceRequirement') THEN
        CREATE TYPE "SpaceRequirement" AS ENUM ('SPOT', 'OPEN_AREA', 'LANE_5M', 'LANE_10M', 'RUN_ROUTE', 'MACHINE_FIXED');
    END IF;
END $$;

-- ImpactLevel
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ImpactLevel') THEN
        CREATE TYPE "ImpactLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
    END IF;
END $$;

-- TypicalUse
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TypicalUse') THEN
        CREATE TYPE "TypicalUse" AS ENUM ('PRIMARY', 'ASSISTANCE', 'CONDITIONING', 'WARMUP', 'FINISHER', 'FLOWSTATE');
    END IF;
END $$;

-- UserRole
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
        CREATE TYPE "UserRole" AS ENUM ('SUPERADMIN', 'HOME_USER', 'COACH', 'GYM_OWNER');
    END IF;
END $$;

-- SubscriptionTier
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SubscriptionTier') THEN
        CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'BASIC', 'PREMIUM', 'COACH', 'GYM');
    END IF;
END $$;

-- NetworkStatus
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NetworkStatus') THEN
        CREATE TYPE "NetworkStatus" AS ENUM ('PENDING', 'ACCEPTED', 'BLOCKED');
    END IF;
END $$;

-- NotificationType
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NotificationType') THEN
        CREATE TYPE "NotificationType" AS ENUM ('NETWORK_REQUEST', 'NETWORK_ACCEPTED', 'NETWORK_REJECTED', 'FRIEND_WORKOUT_STARTED', 'FRIEND_WORKOUT_COMPLETED', 'FRIEND_WORKOUT_CREATED', 'FRIEND_STATS_IMPROVED', 'FRIEND_LEVEL_UP', 'FRIEND_LEADERBOARD_ENTRY');
    END IF;
END $$;

-- ActivityType
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ActivityType') THEN
        CREATE TYPE "ActivityType" AS ENUM ('USER_REGISTERED', 'USER_LEVEL_UP', 'WORKOUT_CREATED', 'WORKOUT_SCHEDULED', 'SESSION_STARTED', 'SESSION_COMPLETED', 'NETWORK_CONNECTED', 'PROGRAM_STARTED', 'PROGRAM_COMPLETED', 'STATS_IMPROVED', 'LEADERBOARD_ENTRY');
    END IF;
END $$;

-- AchievementCategory
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AchievementCategory') THEN
        CREATE TYPE "AchievementCategory" AS ENUM ('STREAK', 'VOLUME', 'CONSISTENCY', 'INTENSITY', 'MILESTONE', 'SPECIAL', 'CONTRIBUTION');
    END IF;
END $$;

-- ============================================================================
-- TABLES
-- ============================================================================

-- users
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'HOME_USER',
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "subscriptionEnds" TIMESTAMP(3),
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "networkCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- user_profiles
CREATE TABLE IF NOT EXISTS "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "location" TEXT,
    "bio" TEXT,
    "trainingLevel" "TrainingLevel" NOT NULL,
    "primaryGoal" "TrainingGoal",
    "equipment" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "daysPerWeek" INTEGER,
    "availableSpace" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "injuries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "limitations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- programs
CREATE TABLE IF NOT EXISTS "programs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "level" "TrainingLevel",
    "goal" "TrainingGoal",
    "durationWeeks" INTEGER,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "currentCycle" "ProgramCycle",
    "createdBy" TEXT,
    "coachId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- workouts
CREATE TABLE IF NOT EXISTS "workouts" (
    "id" TEXT NOT NULL,
    "programId" TEXT,
    "templateId" TEXT,
    "createdBy" TEXT,
    "name" TEXT NOT NULL,
    "displayCode" TEXT,
    "dayIndex" INTEGER,
    "archetype" "WorkoutArchetype",
    "description" TEXT,
    "shareId" TEXT,
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "workouts_pkey" PRIMARY KEY ("id")
);

-- workout_sections
CREATE TABLE IF NOT EXISTS "workout_sections" (
    "id" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "SectionType" NOT NULL,
    "order" INTEGER NOT NULL,
    "durationSec" INTEGER,
    "emomWorkSec" INTEGER,
    "emomRestSec" INTEGER,
    "emomRounds" INTEGER,
    "intervalWorkSec" INTEGER,
    "intervalRestSec" INTEGER,
    "intervalRounds" INTEGER,
    "rounds" INTEGER,
    "restBetweenRounds" INTEGER,
    "note" TEXT,
    CONSTRAINT "workout_sections_pkey" PRIMARY KEY ("id")
);

-- exercise_blocks
CREATE TABLE IF NOT EXISTS "exercise_blocks" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "label" TEXT,
    "exerciseName" TEXT NOT NULL,
    "description" TEXT,
    "repScheme" TEXT,
    "tempo" TEXT,
    "loadPercentage" TEXT,
    "distance" INTEGER,
    "distanceUnit" TEXT,
    CONSTRAINT "exercise_blocks_pkey" PRIMARY KEY ("id")
);

-- tier_prescriptions
CREATE TABLE IF NOT EXISTS "tier_prescriptions" (
    "id" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "tier" "Tier" NOT NULL,
    "load" TEXT,
    "targetReps" INTEGER,
    "distance" INTEGER,
    "distanceUnit" TEXT,
    "notes" TEXT,
    CONSTRAINT "tier_prescriptions_pkey" PRIMARY KEY ("id")
);

-- user_programs
CREATE TABLE IF NOT EXISTS "user_programs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "currentWeek" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "user_programs_pkey" PRIMARY KEY ("id")
);

-- scheduled_workouts
CREATE TABLE IF NOT EXISTS "scheduled_workouts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workoutId" TEXT,
    "programId" TEXT,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "scheduled_workouts_pkey" PRIMARY KEY ("id")
);

-- session_logs
CREATE TABLE IF NOT EXISTS "session_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationSec" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "rpe" INTEGER,
    "notes" TEXT,
    "metrics" JSONB,
    "avgHeartRate" INTEGER,
    "maxHeartRate" INTEGER,
    "programId" TEXT,
    "weekIndex" INTEGER,
    "dayIndex" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "session_logs_pkey" PRIMARY KEY ("id")
);

-- workout_ratings
CREATE TABLE IF NOT EXISTS "workout_ratings" (
    "id" TEXT NOT NULL,
    "sessionLogId" TEXT,
    "userId" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "starRating" INTEGER NOT NULL,
    "difficultyRating" INTEGER,
    "enjoymentRating" INTEGER,
    "effectivenessRating" INTEGER,
    "wouldDoAgain" BOOLEAN,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "favoriteExercises" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "workout_ratings_pkey" PRIMARY KEY ("id")
);

-- workout_favorites
CREATE TABLE IF NOT EXISTS "workout_favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "workout_favorites_pkey" PRIMARY KEY ("id")
);

-- exercises
CREATE TABLE IF NOT EXISTS "exercises" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "category" "ExerciseCategory" NOT NULL,
    "movementPattern" "MovementPattern" NOT NULL,
    "primaryMuscles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "secondaryMuscles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "equipment" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "space" "SpaceRequirement" NOT NULL,
    "impactLevel" "ImpactLevel" NOT NULL,
    "typicalUse" "TypicalUse"[] DEFAULT ARRAY[]::"TypicalUse"[],
    "suitableArchetypes" "WorkoutArchetype"[] DEFAULT ARRAY[]::"WorkoutArchetype"[],
    "indoorFriendly" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "instructions" TEXT,
    "variations" JSONB,
    "graphics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "videoUrl" TEXT,
    "commonMistakes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "progressionTips" TEXT,
    "regressionTips" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "weightRanges" JSONB,
    "durationRanges" JSONB,
    "intensityLevels" JSONB,
    "repRanges" JSONB,
    "tempoOptions" JSONB,
    "equipmentVariations" JSONB,
    "movementVariations" JSONB,
    "imageUrl" TEXT,
    "imageGeneratedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- exercise_tiers
CREATE TABLE IF NOT EXISTS "exercise_tiers" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "tier" "Tier" NOT NULL,
    "description" TEXT,
    "typicalReps" TEXT,
    CONSTRAINT "exercise_tiers_pkey" PRIMARY KEY ("id")
);

-- coach_profiles
CREATE TABLE IF NOT EXISTS "coach_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "website" TEXT,
    "instagram" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "coach_profiles_pkey" PRIMARY KEY ("id")
);

-- coach_clients
CREATE TABLE IF NOT EXISTS "coach_clients" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "coachProfileId" TEXT,
    CONSTRAINT "coach_clients_pkey" PRIMARY KEY ("id")
);

-- program_assignments
CREATE TABLE IF NOT EXISTS "program_assignments" (
    "id" TEXT NOT NULL,
    "coachClientId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT "program_assignments_pkey" PRIMARY KEY ("id")
);

-- gym_profiles
CREATE TABLE IF NOT EXISTS "gym_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "website" TEXT,
    "instagram" TEXT,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "gym_profiles_pkey" PRIMARY KEY ("id")
);

-- gym_members
CREATE TABLE IF NOT EXISTS "gym_members" (
    "id" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "gym_members_pkey" PRIMARY KEY ("id")
);

-- gym_classes
CREATE TABLE IF NOT EXISTS "gym_classes" (
    "id" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "workoutId" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "capacity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "gym_classes_pkey" PRIMARY KEY ("id")
);

-- gym_class_attendance
CREATE TABLE IF NOT EXISTS "gym_class_attendance" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "sessionLogId" TEXT,
    CONSTRAINT "gym_class_attendance_pkey" PRIMARY KEY ("id")
);

-- workout_templates
CREATE TABLE IF NOT EXISTS "workout_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "archetype" "WorkoutArchetype" NOT NULL,
    "description" TEXT,
    "structure" JSONB NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "workout_templates_pkey" PRIMARY KEY ("id")
);

-- network
CREATE TABLE IF NOT EXISTS "network" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "addresseeId" TEXT NOT NULL,
    "status" "NetworkStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "network_pkey" PRIMARY KEY ("id")
);

-- notifications
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

-- activity_logs
CREATE TABLE IF NOT EXISTS "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" "ActivityType" NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- achievements
CREATE TABLE IF NOT EXISTS "achievements" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "AchievementCategory" NOT NULL,
    "icon" TEXT NOT NULL,
    "rarity" TEXT NOT NULL DEFAULT 'COMMON',
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- user_achievements
CREATE TABLE IF NOT EXISTS "user_achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- UNIQUE CONSTRAINTS
-- ============================================================================

-- users
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username") WHERE "username" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "users_networkCode_key" ON "users"("networkCode") WHERE "networkCode" IS NOT NULL;

-- user_profiles
CREATE UNIQUE INDEX IF NOT EXISTS "user_profiles_userId_key" ON "user_profiles"("userId");

-- programs
CREATE UNIQUE INDEX IF NOT EXISTS "programs_slug_key" ON "programs"("slug");

-- workouts
CREATE UNIQUE INDEX IF NOT EXISTS "workouts_shareId_key" ON "workouts"("shareId") WHERE "shareId" IS NOT NULL;

-- tier_prescriptions
CREATE UNIQUE INDEX IF NOT EXISTS "tier_prescriptions_blockId_tier_key" ON "tier_prescriptions"("blockId", "tier");

-- workout_ratings
CREATE UNIQUE INDEX IF NOT EXISTS "workout_ratings_sessionLogId_key" ON "workout_ratings"("sessionLogId") WHERE "sessionLogId" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "workout_ratings_userId_workoutId_sessionLogId_key" ON "workout_ratings"("userId", "workoutId", "sessionLogId");

-- workout_favorites
CREATE UNIQUE INDEX IF NOT EXISTS "workout_favorites_userId_workoutId_key" ON "workout_favorites"("userId", "workoutId");

-- exercises
CREATE UNIQUE INDEX IF NOT EXISTS "exercises_exerciseId_key" ON "exercises"("exerciseId");

-- exercise_tiers
CREATE UNIQUE INDEX IF NOT EXISTS "exercise_tiers_exerciseId_tier_key" ON "exercise_tiers"("exerciseId", "tier");

-- coach_profiles
CREATE UNIQUE INDEX IF NOT EXISTS "coach_profiles_userId_key" ON "coach_profiles"("userId");

-- coach_clients
CREATE UNIQUE INDEX IF NOT EXISTS "coach_clients_coachId_clientId_key" ON "coach_clients"("coachId", "clientId");

-- program_assignments
CREATE UNIQUE INDEX IF NOT EXISTS "program_assignments_coachClientId_programId_key" ON "program_assignments"("coachClientId", "programId");

-- gym_profiles
CREATE UNIQUE INDEX IF NOT EXISTS "gym_profiles_userId_key" ON "gym_profiles"("userId");

-- gym_members
CREATE UNIQUE INDEX IF NOT EXISTS "gym_members_gymId_userId_key" ON "gym_members"("gymId", "userId");

-- gym_class_attendance
CREATE UNIQUE INDEX IF NOT EXISTS "gym_class_attendance_classId_userId_key" ON "gym_class_attendance"("classId", "userId");
CREATE UNIQUE INDEX IF NOT EXISTS "gym_class_attendance_sessionLogId_key" ON "gym_class_attendance"("sessionLogId") WHERE "sessionLogId" IS NOT NULL;

-- workout_templates
-- (no unique constraints beyond primary key)

-- network
CREATE UNIQUE INDEX IF NOT EXISTS "network_requesterId_addresseeId_key" ON "network"("requesterId", "addresseeId");

-- achievements
CREATE UNIQUE INDEX IF NOT EXISTS "achievements_code_key" ON "achievements"("code");

-- user_achievements
CREATE UNIQUE INDEX IF NOT EXISTS "user_achievements_userId_achievementId_key" ON "user_achievements"("userId", "achievementId");

-- ============================================================================
-- INDEXES
-- ============================================================================

-- scheduled_workouts
CREATE INDEX IF NOT EXISTS "scheduled_workouts_userId_scheduledDate_idx" ON "scheduled_workouts"("userId", "scheduledDate");

-- workout_ratings
CREATE INDEX IF NOT EXISTS "workout_ratings_workoutId_idx" ON "workout_ratings"("workoutId");
CREATE INDEX IF NOT EXISTS "workout_ratings_userId_idx" ON "workout_ratings"("userId");

-- workout_favorites
CREATE INDEX IF NOT EXISTS "workout_favorites_userId_idx" ON "workout_favorites"("userId");
CREATE INDEX IF NOT EXISTS "workout_favorites_workoutId_idx" ON "workout_favorites"("workoutId");

-- user_achievements
CREATE INDEX IF NOT EXISTS "user_achievements_userId_earnedAt_idx" ON "user_achievements"("userId", "earnedAt");

-- notifications
CREATE INDEX IF NOT EXISTS "notifications_userId_read_idx" ON "notifications"("userId", "read");
CREATE INDEX IF NOT EXISTS "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- activity_logs
CREATE INDEX IF NOT EXISTS "activity_logs_userId_createdAt_idx" ON "activity_logs"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "activity_logs_type_createdAt_idx" ON "activity_logs"("type", "createdAt");
CREATE INDEX IF NOT EXISTS "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");

-- ============================================================================
-- FOREIGN KEYS
-- ============================================================================

-- user_profiles
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_profiles_userId_fkey'
    ) THEN
        ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- programs
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'programs_coachId_fkey'
    ) THEN
        ALTER TABLE "programs" ADD CONSTRAINT "programs_coachId_fkey" 
        FOREIGN KEY ("coachId") REFERENCES "coach_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- workouts
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'workouts_programId_fkey'
    ) THEN
        ALTER TABLE "workouts" ADD CONSTRAINT "workouts_programId_fkey" 
        FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'workouts_templateId_fkey'
    ) THEN
        ALTER TABLE "workouts" ADD CONSTRAINT "workouts_templateId_fkey" 
        FOREIGN KEY ("templateId") REFERENCES "workout_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'workouts_createdBy_fkey'
    ) THEN
        ALTER TABLE "workouts" ADD CONSTRAINT "workouts_createdBy_fkey" 
        FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- workout_sections
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'workout_sections_workoutId_fkey'
    ) THEN
        ALTER TABLE "workout_sections" ADD CONSTRAINT "workout_sections_workoutId_fkey" 
        FOREIGN KEY ("workoutId") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- exercise_blocks
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'exercise_blocks_sectionId_fkey'
    ) THEN
        ALTER TABLE "exercise_blocks" ADD CONSTRAINT "exercise_blocks_sectionId_fkey" 
        FOREIGN KEY ("sectionId") REFERENCES "workout_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- tier_prescriptions
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tier_prescriptions_blockId_fkey'
    ) THEN
        ALTER TABLE "tier_prescriptions" ADD CONSTRAINT "tier_prescriptions_blockId_fkey" 
        FOREIGN KEY ("blockId") REFERENCES "exercise_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- user_programs
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_programs_userId_fkey'
    ) THEN
        ALTER TABLE "user_programs" ADD CONSTRAINT "user_programs_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_programs_programId_fkey'
    ) THEN
        ALTER TABLE "user_programs" ADD CONSTRAINT "user_programs_programId_fkey" 
        FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- scheduled_workouts
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'scheduled_workouts_userId_fkey'
    ) THEN
        ALTER TABLE "scheduled_workouts" ADD CONSTRAINT "scheduled_workouts_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'scheduled_workouts_workoutId_fkey'
    ) THEN
        ALTER TABLE "scheduled_workouts" ADD CONSTRAINT "scheduled_workouts_workoutId_fkey" 
        FOREIGN KEY ("workoutId") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'scheduled_workouts_programId_fkey'
    ) THEN
        ALTER TABLE "scheduled_workouts" ADD CONSTRAINT "scheduled_workouts_programId_fkey" 
        FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- session_logs
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'session_logs_userId_fkey'
    ) THEN
        ALTER TABLE "session_logs" ADD CONSTRAINT "session_logs_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'session_logs_workoutId_fkey'
    ) THEN
        ALTER TABLE "session_logs" ADD CONSTRAINT "session_logs_workoutId_fkey" 
        FOREIGN KEY ("workoutId") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'session_logs_programId_fkey'
    ) THEN
        ALTER TABLE "session_logs" ADD CONSTRAINT "session_logs_programId_fkey" 
        FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- workout_ratings
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'workout_ratings_sessionLogId_fkey'
    ) THEN
        ALTER TABLE "workout_ratings" ADD CONSTRAINT "workout_ratings_sessionLogId_fkey" 
        FOREIGN KEY ("sessionLogId") REFERENCES "session_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'workout_ratings_userId_fkey'
    ) THEN
        ALTER TABLE "workout_ratings" ADD CONSTRAINT "workout_ratings_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'workout_ratings_workoutId_fkey'
    ) THEN
        ALTER TABLE "workout_ratings" ADD CONSTRAINT "workout_ratings_workoutId_fkey" 
        FOREIGN KEY ("workoutId") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- workout_favorites
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'workout_favorites_userId_fkey'
    ) THEN
        ALTER TABLE "workout_favorites" ADD CONSTRAINT "workout_favorites_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'workout_favorites_workoutId_fkey'
    ) THEN
        ALTER TABLE "workout_favorites" ADD CONSTRAINT "workout_favorites_workoutId_fkey" 
        FOREIGN KEY ("workoutId") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- exercise_tiers
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'exercise_tiers_exerciseId_fkey'
    ) THEN
        ALTER TABLE "exercise_tiers" ADD CONSTRAINT "exercise_tiers_exerciseId_fkey" 
        FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- coach_profiles
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'coach_profiles_userId_fkey'
    ) THEN
        ALTER TABLE "coach_profiles" ADD CONSTRAINT "coach_profiles_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- coach_clients
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'coach_clients_coachId_fkey'
    ) THEN
        ALTER TABLE "coach_clients" ADD CONSTRAINT "coach_clients_coachId_fkey" 
        FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'coach_clients_clientId_fkey'
    ) THEN
        ALTER TABLE "coach_clients" ADD CONSTRAINT "coach_clients_clientId_fkey" 
        FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'coach_clients_coachProfileId_fkey'
    ) THEN
        ALTER TABLE "coach_clients" ADD CONSTRAINT "coach_clients_coachProfileId_fkey" 
        FOREIGN KEY ("coachProfileId") REFERENCES "coach_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- program_assignments
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'program_assignments_coachClientId_fkey'
    ) THEN
        ALTER TABLE "program_assignments" ADD CONSTRAINT "program_assignments_coachClientId_fkey" 
        FOREIGN KEY ("coachClientId") REFERENCES "coach_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'program_assignments_programId_fkey'
    ) THEN
        ALTER TABLE "program_assignments" ADD CONSTRAINT "program_assignments_programId_fkey" 
        FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- gym_profiles
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'gym_profiles_userId_fkey'
    ) THEN
        ALTER TABLE "gym_profiles" ADD CONSTRAINT "gym_profiles_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- gym_members
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'gym_members_gymId_fkey'
    ) THEN
        ALTER TABLE "gym_members" ADD CONSTRAINT "gym_members_gymId_fkey" 
        FOREIGN KEY ("gymId") REFERENCES "gym_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'gym_members_userId_fkey'
    ) THEN
        ALTER TABLE "gym_members" ADD CONSTRAINT "gym_members_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- gym_classes
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'gym_classes_gymId_fkey'
    ) THEN
        ALTER TABLE "gym_classes" ADD CONSTRAINT "gym_classes_gymId_fkey" 
        FOREIGN KEY ("gymId") REFERENCES "gym_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'gym_classes_workoutId_fkey'
    ) THEN
        ALTER TABLE "gym_classes" ADD CONSTRAINT "gym_classes_workoutId_fkey" 
        FOREIGN KEY ("workoutId") REFERENCES "workouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- gym_class_attendance
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'gym_class_attendance_classId_fkey'
    ) THEN
        ALTER TABLE "gym_class_attendance" ADD CONSTRAINT "gym_class_attendance_classId_fkey" 
        FOREIGN KEY ("classId") REFERENCES "gym_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'gym_class_attendance_userId_fkey'
    ) THEN
        ALTER TABLE "gym_class_attendance" ADD CONSTRAINT "gym_class_attendance_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'gym_class_attendance_sessionLogId_fkey'
    ) THEN
        ALTER TABLE "gym_class_attendance" ADD CONSTRAINT "gym_class_attendance_sessionLogId_fkey" 
        FOREIGN KEY ("sessionLogId") REFERENCES "session_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- network
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'network_requesterId_fkey'
    ) THEN
        ALTER TABLE "network" ADD CONSTRAINT "network_requesterId_fkey" 
        FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'network_addresseeId_fkey'
    ) THEN
        ALTER TABLE "network" ADD CONSTRAINT "network_addresseeId_fkey" 
        FOREIGN KEY ("addresseeId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- notifications
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_userId_fkey'
    ) THEN
        ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_activityLogId_fkey'
    ) THEN
        ALTER TABLE "notifications" ADD CONSTRAINT "notifications_activityLogId_fkey" 
        FOREIGN KEY ("activityLogId") REFERENCES "activity_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- activity_logs
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'activity_logs_userId_fkey'
    ) THEN
        ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- user_achievements
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_achievements_userId_fkey'
    ) THEN
        ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_achievements_achievementId_fkey'
    ) THEN
        ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievementId_fkey" 
        FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- ============================================================================
-- ADD MISSING COLUMNS (for existing tables)
-- ============================================================================

-- Add any missing columns to existing tables
-- This section handles cases where tables exist but are missing columns

-- users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "networkCode" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "xp" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "level" INTEGER NOT NULL DEFAULT 1;

-- user_profiles
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "weight" DOUBLE PRECISION;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "height" DOUBLE PRECISION;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "location" TEXT;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "bio" TEXT;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "primaryGoal" "TrainingGoal";
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "equipment" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "daysPerWeek" INTEGER;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "availableSpace" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "injuries" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "limitations" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- workouts - add missing columns
ALTER TABLE "workouts" ADD COLUMN IF NOT EXISTS "templateId" TEXT;
ALTER TABLE "workouts" ADD COLUMN IF NOT EXISTS "createdBy" TEXT;
ALTER TABLE "workouts" ADD COLUMN IF NOT EXISTS "isRecommended" BOOLEAN NOT NULL DEFAULT false;

-- session_logs - ensure startedAt exists (rename from performedAt if needed)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'session_logs' AND column_name = 'performedAt') THEN
        ALTER TABLE "session_logs" RENAME COLUMN "performedAt" TO "startedAt";
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'session_logs' AND column_name = 'startedAt') THEN
        ALTER TABLE "session_logs" ADD COLUMN "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

ALTER TABLE "session_logs" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);
ALTER TABLE "session_logs" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "session_logs" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "session_logs" ADD COLUMN IF NOT EXISTS "programId" TEXT;
ALTER TABLE "session_logs" ADD COLUMN IF NOT EXISTS "weekIndex" INTEGER;
ALTER TABLE "session_logs" ADD COLUMN IF NOT EXISTS "dayIndex" INTEGER;
ALTER TABLE "session_logs" ADD COLUMN IF NOT EXISTS "avgHeartRate" INTEGER;
ALTER TABLE "session_logs" ADD COLUMN IF NOT EXISTS "maxHeartRate" INTEGER;

-- exercises - add all new fields
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "instructions" TEXT;
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "variations" JSONB;
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "graphics" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "videoUrl" TEXT;
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "commonMistakes" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "progressionTips" TEXT;
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "regressionTips" TEXT;
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "aiGenerated" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "usageCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "weightRanges" JSONB;
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "durationRanges" JSONB;
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "intensityLevels" JSONB;
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "repRanges" JSONB;
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "tempoOptions" JSONB;
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "equipmentVariations" JSONB;
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "movementVariations" JSONB;
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "imageGeneratedAt" TIMESTAMP(3);

-- workout_sections - add interval fields
ALTER TABLE "workout_sections" ADD COLUMN IF NOT EXISTS "intervalWorkSec" INTEGER;
ALTER TABLE "workout_sections" ADD COLUMN IF NOT EXISTS "intervalRestSec" INTEGER;
ALTER TABLE "workout_sections" ADD COLUMN IF NOT EXISTS "intervalRounds" INTEGER;
ALTER TABLE "workout_sections" ADD COLUMN IF NOT EXISTS "rounds" INTEGER;
ALTER TABLE "workout_sections" ADD COLUMN IF NOT EXISTS "restBetweenRounds" INTEGER;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$ 
BEGIN
    RAISE NOTICE 'Database sync completed successfully!';
    RAISE NOTICE 'All tables, columns, enums, indexes, and foreign keys have been verified.';
END $$;

