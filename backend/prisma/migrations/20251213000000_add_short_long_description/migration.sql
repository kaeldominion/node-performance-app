-- AlterTable
ALTER TABLE "exercise_blocks" ADD COLUMN IF NOT EXISTS "shortDescription" TEXT;
ALTER TABLE "exercise_blocks" ADD COLUMN IF NOT EXISTS "longDescription" TEXT;

