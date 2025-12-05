-- This migration was already applied to the database
-- Recreated to resolve migration drift

-- CreateTable (already exists, but included for reference)
CREATE TABLE IF NOT EXISTS "scheduled_workouts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workoutId" TEXT,
    "programId" TEXT,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_workouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (already exists)
CREATE INDEX IF NOT EXISTS "scheduled_workouts_userId_scheduledDate_idx" ON "scheduled_workouts"("userId", "scheduledDate");

-- AddForeignKey (already exists - using DO block to avoid errors)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'scheduled_workouts_userId_fkey') THEN
        ALTER TABLE "scheduled_workouts" ADD CONSTRAINT "scheduled_workouts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'scheduled_workouts_workoutId_fkey') THEN
        ALTER TABLE "scheduled_workouts" ADD CONSTRAINT "scheduled_workouts_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'scheduled_workouts_programId_fkey') THEN
        ALTER TABLE "scheduled_workouts" ADD CONSTRAINT "scheduled_workouts_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

