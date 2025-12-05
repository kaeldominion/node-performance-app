-- AlterTable: Add distance and distanceUnit to tier_prescriptions
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tier_prescriptions' AND column_name = 'distance') THEN
        ALTER TABLE "tier_prescriptions" ADD COLUMN "distance" INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tier_prescriptions' AND column_name = 'distanceUnit') THEN
        ALTER TABLE "tier_prescriptions" ADD COLUMN "distanceUnit" TEXT;
    END IF;
END $$;

