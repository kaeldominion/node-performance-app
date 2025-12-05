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

async function main() {
  console.log('🗑️  Starting cleanup of ALL workouts and exercises...\n');

  try {
    // Delete in order to respect foreign key constraints
    
    // 1. Delete workout favorites (references workouts)
    console.log('Deleting workout favorites...');
    const deletedFavorites = await deleteIfExists('WorkoutFavorite', () => 
      prisma.workoutFavorite.deleteMany({})
    );
    console.log(`   ✓ Deleted ${deletedFavorites} workout favorites\n`);

    // 2. Delete workout ratings (references workouts)
    console.log('Deleting workout ratings...');
    const deletedRatings = await deleteIfExists('WorkoutRating', () => 
      prisma.workoutRating.deleteMany({})
    );
    console.log(`   ✓ Deleted ${deletedRatings} workout ratings\n`);

    // 3. Delete scheduled workouts (references workouts)
    console.log('Deleting scheduled workouts...');
    const deletedScheduled = await deleteIfExists('ScheduledWorkout', () => 
      prisma.scheduledWorkout.deleteMany({})
    );
    console.log(`   ✓ Deleted ${deletedScheduled} scheduled workouts\n`);

    // 4. Delete session logs (references workouts)
    console.log('Deleting session logs...');
    const deletedSessions = await deleteIfExists('SessionLog', () => 
      prisma.sessionLog.deleteMany({})
    );
    console.log(`   ✓ Deleted ${deletedSessions} session logs\n`);

    // 5. Delete user programs (references programs)
    console.log('Deleting user programs...');
    const deletedUserPrograms = await deleteIfExists('UserProgram', () => 
      prisma.userProgram.deleteMany({})
    );
    console.log(`   ✓ Deleted ${deletedUserPrograms} user programs\n`);

    // 6. Delete workouts (sections, blocks, tierPrescriptions will cascade)
    console.log('Deleting ALL workouts...');
    const deletedWorkouts = await deleteIfExists('Workout', () => 
      prisma.workout.deleteMany({})
    );
    console.log(`   ✓ Deleted ${deletedWorkouts} workouts\n`);

    // 7. Delete programs
    console.log('Deleting ALL programs...');
    const deletedPrograms = await deleteIfExists('Program', () => 
      prisma.program.deleteMany({})
    );
    console.log(`   ✓ Deleted ${deletedPrograms} programs\n`);

    // 8. Delete workout templates
    console.log('Deleting workout templates...');
    const deletedTemplates = await deleteIfExists('WorkoutTemplate', () => 
      prisma.workoutTemplate.deleteMany({})
    );
    console.log(`   ✓ Deleted ${deletedTemplates} workout templates\n`);

    // 9. Delete exercises (exercise tiers will cascade)
    console.log('Deleting ALL exercises...');
    const deletedExercises = await deleteIfExists('Exercise', () => 
      prisma.exercise.deleteMany({})
    );
    console.log(`   ✓ Deleted ${deletedExercises} exercises\n`);

    console.log('✅ Successfully deleted all legacy workouts and exercises!');
    console.log('\nSummary:');
    console.log(`   - Workout Favorites: ${deletedFavorites}`);
    console.log(`   - Workout Ratings: ${deletedRatings}`);
    console.log(`   - Scheduled Workouts: ${deletedScheduled}`);
    console.log(`   - Session Logs: ${deletedSessions}`);
    console.log(`   - User Programs: ${deletedUserPrograms}`);
    console.log(`   - Workouts: ${deletedWorkouts}`);
    console.log(`   - Programs: ${deletedPrograms}`);
    console.log(`   - Workout Templates: ${deletedTemplates}`);
    console.log(`   - Exercises: ${deletedExercises}`);
    console.log('\n✨ You can now create fresh workouts without legacy data issues!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

main()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed to delete workouts and exercises:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

