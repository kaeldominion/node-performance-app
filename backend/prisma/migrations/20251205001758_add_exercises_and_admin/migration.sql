-- AlterTable: Add isAdmin to users
ALTER TABLE "users" ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateEnum
CREATE TYPE "ExerciseCategory" AS ENUM ('STRENGTH', 'MIXED', 'SKILL', 'ENGINE', 'CORE', 'MOBILITY');

-- CreateEnum
CREATE TYPE "MovementPattern" AS ENUM ('HORIZONTAL_PUSH', 'HORIZONTAL_PULL', 'VERTICAL_PUSH', 'VERTICAL_PULL', 'SQUAT', 'HINGE', 'LUNGE', 'CARRY', 'LOC0MOTION', 'FULL_BODY', 'CORE_ANTI_EXTENSION', 'CORE_ROTATION', 'BREATH_MOBILITY');

-- CreateEnum
CREATE TYPE "SpaceRequirement" AS ENUM ('SPOT', 'OPEN_AREA', 'LANE_5M', 'LANE_10M', 'RUN_ROUTE');

-- CreateEnum
CREATE TYPE "ImpactLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "TypicalUse" AS ENUM ('PRIMARY', 'ASSISTANCE', 'CONDITIONING', 'WARMUP', 'FINISHER', 'FLOWSTATE');

-- CreateTable
CREATE TABLE "exercises" (
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
    "typicalUse" "TypicalUse"[] NOT NULL,
    "suitableArchetypes" "WorkoutArchetype"[] NOT NULL,
    "indoorFriendly" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_tiers" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "tier" "Tier" NOT NULL,
    "description" TEXT,
    "typicalReps" TEXT,

    CONSTRAINT "exercise_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exercises_exerciseId_key" ON "exercises"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "exercise_tiers_exerciseId_tier_key" ON "exercise_tiers"("exerciseId", "tier");

-- AddForeignKey
ALTER TABLE "exercise_tiers" ADD CONSTRAINT "exercise_tiers_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
