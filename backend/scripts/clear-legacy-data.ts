import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteIfExists(model: string, deleteFn: () => Promise<{ count: number }>) {
  try {
    const result = await deleteFn();
    return result.count;
  } catch (error: any) {
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      console.log(`   ⚠ Table for ${model} does not exist, skipping...`);
      return 0;
    }
    throw error;
  }
}

async function clearLegacyData() {
  console.log('🗑️  Starting to clear legacy data...\n');

  try {
    // 1. Delete ScheduledWorkouts (references workouts and programs)
    console.log('Deleting scheduled workouts...');
    const deletedScheduled = await deleteIfExists('ScheduledWorkout', () => 
      prisma.scheduledWorkout.deleteMany({})
    );
    console.log(`   ✓ Deleted ${deletedScheduled} scheduled workouts\n`);

    // 2. Delete SessionLogs (references workouts)
    console.log('Deleting session logs...');
    const deletedSessions = await deleteIfExists('SessionLog', () => 
      prisma.sessionLog.deleteMany({})
    );
    console.log(`   ✓ Deleted ${deletedSessions} session logs\n`);

    // 3. Delete UserPrograms (references programs)
    console.log('Deleting user programs...');
    const deletedUserPrograms = await deleteIfExists('UserProgram', () => 
      prisma.userProgram.deleteMany({})
    );
    console.log(`   ✓ Deleted ${deletedUserPrograms} user programs\n`);

    // 4. Delete Workouts (sections, blocks, tierPrescriptions will cascade)
    console.log('Deleting workouts...');
    const deletedWorkouts = await deleteIfExists('Workout', () => 
      prisma.workout.deleteMany({})
    );
    console.log(`   ✓ Deleted ${deletedWorkouts} workouts\n`);

    // 5. Delete Programs
    console.log('Deleting programs...');
    const deletedPrograms = await deleteIfExists('Program', () => 
      prisma.program.deleteMany({})
    );
    console.log(`   ✓ Deleted ${deletedPrograms} programs\n`);

    // 6. Delete ExerciseTiers (references exercises, will cascade)
    console.log('Deleting exercise tiers...');
    const deletedTiers = await deleteIfExists('ExerciseTier', () => 
      prisma.exerciseTier.deleteMany({})
    );
    console.log(`   ✓ Deleted ${deletedTiers} exercise tiers\n`);

    // 7. Delete Exercises
    console.log('Deleting exercises...');
    const deletedExercises = await deleteIfExists('Exercise', () => 
      prisma.exercise.deleteMany({})
    );
    console.log(`   ✓ Deleted ${deletedExercises} exercises\n`);

    console.log('✅ Successfully cleared all legacy data!');
    console.log('\nSummary:');
    console.log(`   - Scheduled Workouts: ${deletedScheduled}`);
    console.log(`   - Session Logs: ${deletedSessions}`);
    console.log(`   - User Programs: ${deletedUserPrograms}`);
    console.log(`   - Workouts: ${deletedWorkouts}`);
    console.log(`   - Programs: ${deletedPrograms}`);
    console.log(`   - Exercise Tiers: ${deletedTiers}`);
    console.log(`   - Exercises: ${deletedExercises}`);

  } catch (error) {
    console.error('❌ Error clearing legacy data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearLegacyData()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed to clear legacy data:', error);
    process.exit(1);
  });

