-- Add tempo and loadPercentage to exercise_blocks
ALTER TABLE "exercise_blocks" 
ADD COLUMN IF NOT EXISTS "tempo" TEXT,
ADD COLUMN IF NOT EXISTS "loadPercentage" TEXT;
