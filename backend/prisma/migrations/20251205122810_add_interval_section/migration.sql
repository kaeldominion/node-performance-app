-- Add INTERVAL to SectionType enum
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'INTERVAL' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'SectionType')
    ) THEN
        ALTER TYPE "SectionType" ADD VALUE 'INTERVAL';
    END IF;
END $$;

-- Add interval fields to workout_sections
ALTER TABLE "workout_sections" 
ADD COLUMN IF NOT EXISTS "intervalWorkSec" INTEGER,
ADD COLUMN IF NOT EXISTS "intervalRestSec" INTEGER,
ADD COLUMN IF NOT EXISTS "intervalRounds" INTEGER;
