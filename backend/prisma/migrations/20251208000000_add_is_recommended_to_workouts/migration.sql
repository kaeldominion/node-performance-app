-- AlterTable
ALTER TABLE "workouts" ADD COLUMN IF NOT EXISTS "isRecommended" BOOLEAN NOT NULL DEFAULT false;


