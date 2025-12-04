-- AlterTable
-- Use IF NOT EXISTS to prevent errors if columns already exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'createdBy') THEN
        ALTER TABLE "programs" ADD COLUMN "createdBy" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'coachId') THEN
        ALTER TABLE "programs" ADD COLUMN "coachId" TEXT;
    END IF;
END $$;

-- AddForeignKey (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'programs_coachId_fkey'
    ) THEN
        ALTER TABLE "programs" ADD CONSTRAINT "programs_coachId_fkey" 
        FOREIGN KEY ("coachId") REFERENCES "coach_profiles"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

