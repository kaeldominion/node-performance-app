import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_USERS = [
  {
    email: 'demo1@nodeos.app',
    name: 'Alex Strong',
    username: 'alexstrong',
    xp: 2500,
    level: 12,
  },
  {
    email: 'demo2@nodeos.app',
    name: 'Jordan Elite',
    username: 'jordanelite',
    xp: 5800,
    level: 18,
  },
  {
    email: 'demo3@nodeos.app',
    name: 'Sam Power',
    username: 'sampower',
    xp: 1200,
    level: 8,
  },
  {
    email: 'demo4@nodeos.app',
    name: 'Casey Endurance',
    username: 'caseyendurance',
    xp: 4200,
    level: 15,
  },
  {
    email: 'demo5@nodeos.app',
    name: 'Morgan Beast',
    username: 'morganbeast',
    xp: 8500,
    level: 25,
  },
];

async function main() {
  console.log('🎭 Creating demo users...');

  // Get some existing workouts to assign to demo users
  const workouts = await prisma.workout.findMany({
    take: 10,
  });

  if (workouts.length === 0) {
    console.log('⚠️  No workouts found. Please seed the database first.');
    return;
  }

  const createdUsers = [];

  for (const demoUser of DEMO_USERS) {
    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: demoUser.email },
    });

    if (!user) {
      // Create user
      user = await prisma.user.create({
        data: {
          email: demoUser.email,
          passwordHash: await bcrypt.hash('demo123', 10), // Demo password
          name: demoUser.name,
          username: demoUser.username,
          xp: demoUser.xp,
          level: demoUser.level,
          role: 'HOME_USER',
        },
      });

      // Create user profile
      await prisma.userProfile.create({
        data: {
          userId: user.id,
          trainingLevel: 'INTERMEDIATE',
          primaryGoal: 'HYBRID',
          equipment: ['barbell', 'dumbbells', 'kettlebell', 'rower'],
          daysPerWeek: 4,
        },
      });

      console.log(`✅ Created user: ${demoUser.name} (${demoUser.email})`);
    } else {
      // Update existing user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          xp: demoUser.xp,
          level: demoUser.level,
          name: demoUser.name,
          username: demoUser.username,
        },
      });
      console.log(`📝 Updated user: ${demoUser.name} (${demoUser.email})`);
    }

    createdUsers.push(user);

    // Create sessions for this user (varying amounts based on level)
    const sessionCount = Math.floor(demoUser.level * 3.5); // More sessions for higher levels
    const existingSessions = await prisma.sessionLog.count({
      where: { userId: user.id },
    });

    if (existingSessions < sessionCount) {
      const sessionsToCreate = sessionCount - existingSessions;
      const sessions = [];

      // Create sessions spread over the last 60 days
      for (let i = 0; i < sessionsToCreate; i++) {
        const daysAgo = Math.floor(Math.random() * 60);
        const startedAt = new Date();
        startedAt.setDate(startedAt.getDate() - daysAgo);
        startedAt.setHours(Math.floor(Math.random() * 12) + 6, Math.floor(Math.random() * 60), 0, 0);

        const workout = workouts[Math.floor(Math.random() * workouts.length)];
        const durationSec = 1800 + Math.floor(Math.random() * 1800); // 30-60 minutes
        const completedAt = new Date(startedAt);
        completedAt.setSeconds(completedAt.getSeconds() + durationSec);
        const rpe = 5 + Math.floor(Math.random() * 5); // RPE 5-10

        sessions.push({
          userId: user.id,
          workoutId: workout.id,
          startedAt,
          completedAt,
          durationSec,
          completed: true,
          rpe,
          metrics: {
            volume: Math.floor(Math.random() * 5000) + 1000,
            weights: {
              'Barbell Squat': 100 + Math.floor(Math.random() * 50),
              'Deadlift': 150 + Math.floor(Math.random() * 50),
            },
          },
        });
      }

      // Insert sessions in batches
      for (const session of sessions) {
        await prisma.sessionLog.create({ data: session });
      }

      console.log(`   Created ${sessionsToCreate} sessions for ${demoUser.name}`);
    }

    // Award some achievements (if achievements table exists)
    try {
      const achievements = await prisma.achievement.findMany();
      if (achievements.length > 0) {
        // Award a few random achievements
        const achievementsToAward = achievements.slice(0, Math.min(5, achievements.length));
        for (const achievement of achievementsToAward) {
          const existing = await prisma.userAchievement.findUnique({
            where: {
              userId_achievementId: {
                userId: user.id,
                achievementId: achievement.id,
              },
            },
          });

          if (!existing) {
            await prisma.userAchievement.create({
              data: {
                userId: user.id,
                achievementId: achievement.id,
                metadata: { value: Math.floor(Math.random() * 100) },
              },
            });
          }
        }
        console.log(`   Awarded achievements to ${demoUser.name}`);
      }
    } catch (error) {
      // Achievements table doesn't exist yet, skip
      console.log(`   Skipping achievements (table not created yet)`);
    }
  }

  console.log(`\n✅ Demo users created/updated!`);
  console.log(`\n📋 Demo User Credentials:`);
  console.log(`   All users have password: demo123`);
  DEMO_USERS.forEach((user, idx) => {
    console.log(`   ${idx + 1}. ${user.name} - ${user.email} (Level ${user.level})`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Failed to create demo users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

