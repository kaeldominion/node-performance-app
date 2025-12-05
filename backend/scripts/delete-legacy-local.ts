import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteLegacyData() {
  try {
    console.log('🗑️  Deleting legacy programs and workouts...');

    // Get all programs first to count them
    const programs = await prisma.program.findMany({
      select: { id: true, name: true },
    });
    console.log(`Found ${programs.length} programs to delete`);

    // Get all workouts not in programs
    const standaloneWorkouts = await prisma.workout.findMany({
      where: { programId: null },
      select: { id: true, name: true },
    });
    console.log(`Found ${standaloneWorkouts.length} standalone workouts to delete`);

    // Delete standalone workouts first (cascading will handle sections, blocks, etc.)
    const workoutCount = await prisma.workout.deleteMany({
      where: { programId: null },
    });
    console.log(`✅ Deleted ${workoutCount.count} standalone workouts`);

    // Delete all programs (cascading deletes will handle workouts, sections, blocks, etc.)
    const programCount = await prisma.program.deleteMany({});
    console.log(`✅ Deleted ${programCount.count} programs`);

    console.log('✅ Legacy data deletion complete!');
    console.log(`   - Deleted ${programCount.count} programs`);
    console.log(`   - Deleted ${workoutCount.count} standalone workouts`);
  } catch (error) {
    console.error('❌ Error deleting legacy data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

deleteLegacyData();

