import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkExerciseBlocks() {
  try {
    // Get recent workout with warmup section
    const workout = await prisma.workout.findFirst({
      where: {
        sections: {
          some: {
            type: 'WARMUP'
          }
        }
      },
      include: {
        sections: {
          where: {
            type: 'WARMUP'
          },
          include: {
            blocks: {
              take: 4,
              orderBy: { order: 'asc' }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!workout || !workout.sections[0]) {
      console.log('No workout found with WARMUP section');
      return;
    }

    console.log('\n=== WORKOUT BLOCKS DATA ===\n');
    console.log(`Workout: ${workout.name}`);
    console.log(`Created: ${workout.createdAt}\n`);

    workout.sections[0].blocks.forEach((block, idx) => {
      console.log(`\n--- Block ${idx + 1}: ${block.exerciseName} ---`);
      console.log(`shortDescription: ${block.shortDescription ? `"${block.shortDescription}"` : 'NULL'}`);
      console.log(`longDescription: ${block.longDescription ? `"${block.longDescription.substring(0, 80)}..."` : 'NULL'}`);
      console.log(`description (legacy): ${block.description ? `"${block.description.substring(0, 80)}..."` : 'NULL'}`);
      console.log(`shortDescription length: ${block.shortDescription?.length || 0}`);
      console.log(`longDescription length: ${block.longDescription?.length || 0}`);
      console.log(`description length: ${block.description?.length || 0}`);
    });

    // Also check a few more recent workouts
    console.log('\n\n=== CHECKING 5 MORE RECENT WORKOUTS ===\n');
    const moreWorkouts = await prisma.workout.findMany({
      where: {
        sections: {
          some: {
            type: 'WARMUP',
            blocks: {
              some: {}
            }
          }
        }
      },
      include: {
        sections: {
          where: {
            type: 'WARMUP'
          },
          include: {
            blocks: {
              take: 1,
              orderBy: { order: 'asc' }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    moreWorkouts.forEach((w, workoutIdx) => {
      if (w.sections[0]?.blocks[0]) {
        const block = w.sections[0].blocks[0];
        console.log(`\nWorkout ${workoutIdx + 1}: ${w.name}`);
        console.log(`  Exercise: ${block.exerciseName}`);
        console.log(`  Has shortDescription: ${!!block.shortDescription}`);
        console.log(`  Has longDescription: ${!!block.longDescription}`);
        console.log(`  Has description: ${!!block.description}`);
      }
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExerciseBlocks();

