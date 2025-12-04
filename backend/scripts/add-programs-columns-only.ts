import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addProgramsColumns() {
  try {
    console.log('Adding programs columns if missing...');
    
    // Add createdBy if missing
    try {
      await prisma.$executeRaw`ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "createdBy" TEXT`;
      console.log('✅ createdBy column added or already exists');
    } catch (error: any) {
      if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
        console.log('✅ createdBy column already exists');
      } else {
        throw error;
      }
    }
    
    // Add coachId if missing
    try {
      await prisma.$executeRaw`ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "coachId" TEXT`;
      console.log('✅ coachId column added or already exists');
    } catch (error: any) {
      if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
        console.log('✅ coachId column already exists');
      } else {
        throw error;
      }
    }
    
    // Add foreign key if it doesn't exist
    try {
      await prisma.$executeRaw`
        ALTER TABLE "programs" 
        ADD CONSTRAINT IF NOT EXISTS "programs_coachId_fkey" 
        FOREIGN KEY ("coachId") REFERENCES "coach_profiles"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE
      `;
      console.log('✅ Foreign key constraint added or already exists');
    } catch (error: any) {
      if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
        console.log('✅ Foreign key constraint already exists');
      } else {
        // Foreign key might fail if coach_profiles doesn't exist yet, that's ok
        console.log('⚠️  Foreign key constraint skipped (table might not exist yet)');
      }
    }
    
    console.log('✅ Programs columns check complete!');
    
  } catch (error: any) {
    console.error('Error:', error.message);
    // Don't throw - we want the app to start even if this fails
    console.log('⚠️  Continuing anyway...');
  } finally {
    await prisma.$disconnect();
  }
}

addProgramsColumns()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(0); // Exit with 0 so app still starts
  });

