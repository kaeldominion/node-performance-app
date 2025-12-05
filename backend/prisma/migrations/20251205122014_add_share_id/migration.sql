-- AlterTable: Add shareId to workouts
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workouts' AND column_name = 'shareId') THEN
        ALTER TABLE "workouts" ADD COLUMN "shareId" TEXT;
        CREATE UNIQUE INDEX "workouts_shareId_key" ON "workouts"("shareId") WHERE "shareId" IS NOT NULL;
    END IF;
END $$;
