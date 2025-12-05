-- Add exercise variations and image fields
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "weightRanges" JSONB;
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "durationRanges" JSONB;
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "intensityLevels" JSONB;
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "repRanges" JSONB;
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "tempoOptions" JSONB;
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "equipmentVariations" JSONB;
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "movementVariations" JSONB;
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "imageGeneratedAt" TIMESTAMP(3);

