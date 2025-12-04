-- CreateEnum
CREATE TYPE "TrainingLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE');

-- CreateEnum
CREATE TYPE "TrainingGoal" AS ENUM ('STRENGTH', 'HYPERTROPHY', 'HYBRID', 'CONDITIONING', 'FAT_LOSS', 'LONGEVITY');

-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('SILVER', 'GOLD', 'BLACK');

-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('WARMUP', 'EMOM', 'AMRAP', 'FOR_TIME', 'FINISHER', 'COOLDOWN', 'WAVE', 'SUPERSET', 'CIRCUIT', 'CAPACITY', 'FLOW', 'OTHER');

-- CreateEnum
CREATE TYPE "WorkoutArchetype" AS ENUM ('PR1ME', 'FORGE', 'ENGIN3', 'CIRCUIT_X', 'CAPAC1TY', 'FLOWSTATE');

-- CreateEnum
CREATE TYPE "ProgramCycle" AS ENUM ('BASE', 'LOAD', 'INTENSIFY', 'DELOAD', 'PEAK', 'RESET');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trainingLevel" "TrainingLevel" NOT NULL,
    "primaryGoal" "TrainingGoal",
    "equipment" TEXT[],
    "daysPerWeek" INTEGER,
    "notes" TEXT,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "level" "TrainingLevel",
    "goal" "TrainingGoal",
    "durationWeeks" INTEGER,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "currentCycle" "ProgramCycle",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workouts" (
    "id" TEXT NOT NULL,
    "programId" TEXT,
    "name" TEXT NOT NULL,
    "displayCode" TEXT,
    "dayIndex" INTEGER,
    "archetype" "WorkoutArchetype",
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_sections" (
    "id" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "SectionType" NOT NULL,
    "order" INTEGER NOT NULL,
    "durationSec" INTEGER,
    "emomWorkSec" INTEGER,
    "emomRestSec" INTEGER,
    "emomRounds" INTEGER,
    "note" TEXT,

    CONSTRAINT "workout_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_blocks" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "label" TEXT,
    "exerciseName" TEXT NOT NULL,
    "description" TEXT,
    "repScheme" TEXT,
    "distance" INTEGER,
    "distanceUnit" TEXT,

    CONSTRAINT "exercise_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tier_prescriptions" (
    "id" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "tier" "Tier" NOT NULL,
    "load" TEXT,
    "targetReps" INTEGER,
    "notes" TEXT,

    CONSTRAINT "tier_prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_programs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "currentWeek" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationSec" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "rpe" INTEGER,
    "notes" TEXT,
    "metrics" JSONB,

    CONSTRAINT "session_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "programs_slug_key" ON "programs"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tier_prescriptions_blockId_tier_key" ON "tier_prescriptions"("blockId", "tier");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_sections" ADD CONSTRAINT "workout_sections_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_blocks" ADD CONSTRAINT "exercise_blocks_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "workout_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tier_prescriptions" ADD CONSTRAINT "tier_prescriptions_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "exercise_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_programs" ADD CONSTRAINT "user_programs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_programs" ADD CONSTRAINT "user_programs_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_logs" ADD CONSTRAINT "session_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_logs" ADD CONSTRAINT "session_logs_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

