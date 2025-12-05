-- AlterTable
ALTER TABLE "workouts" ADD COLUMN "createdBy" TEXT;

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

