import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixProgramsColumns() {
  try {
    console.log('Checking if columns exist...');
    
    // Try to query with the columns - if they don't exist, this will fail
    const test = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'programs' 
      AND column_name IN ('createdBy', 'coachId')
    `;
    
    const columns = test as Array<{ column_name: string }>;
    const existingColumns = columns.map(c => c.column_name);
    
    console.log('Existing columns:', existingColumns);
    
    // Add createdBy if missing
    if (!existingColumns.includes('createdBy')) {
      console.log('Adding createdBy column...');
      await prisma.$executeRaw`ALTER TABLE "programs" ADD COLUMN "createdBy" TEXT`;
      console.log('✅ Added createdBy column');
    } else {
      console.log('✅ createdBy column already exists');
    }
    
    // Add coachId if missing
    if (!existingColumns.includes('coachId')) {
      console.log('Adding coachId column...');
      await prisma.$executeRaw`ALTER TABLE "programs" ADD COLUMN "coachId" TEXT`;
      console.log('✅ Added coachId column');
    } else {
      console.log('✅ coachId column already exists');
    }
    
    // Add foreign key if it doesn't exist
    try {
      await prisma.$executeRaw`
        ALTER TABLE "programs" 
        ADD CONSTRAINT "programs_coachId_fkey" 
        FOREIGN KEY ("coachId") REFERENCES "coach_profiles"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE
      `;
      console.log('✅ Added foreign key constraint');
    } catch (error: any) {
      if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
        console.log('✅ Foreign key constraint already exists');
      } else {
        throw error;
      }
    }
    
    console.log('✅ All columns fixed!');
    
  } catch (error: any) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixProgramsColumns()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });

