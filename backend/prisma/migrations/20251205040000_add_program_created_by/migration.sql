-- AlterTable
ALTER TABLE "programs" ADD COLUMN "createdBy" TEXT;
ALTER TABLE "programs" ADD COLUMN "coachId" TEXT;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "coach_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

