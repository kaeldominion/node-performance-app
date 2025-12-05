import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityType } from '@prisma/client';

@Injectable()
export class DemoActivityService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate demo activities for the last N days
   */
  async generateDemoActivities(days: number = 7) {
    // Get all users
    const users = await this.prisma.user.findMany({
      select: { id: true, name: true, username: true },
      take: 20, // Limit to first 20 users to avoid too many activities
    });

    if (users.length === 0) {
      console.log('No users found, skipping demo activity generation');
      return { message: 'No users found', count: 0 };
    }

    const activities: any[] = [];
    const now = new Date();
    const workoutNames = [
      'PR1ME Strength',
      'FORGE Supersets',
      'ENGIN3 Hybrid',
      'CIRCUIT X MetCon',
      'CAPAC1TY Endurance',
      'FLOWSTATE Recovery',
      'Upper Body Power',
      'Lower Body Strength',
      'Full Body Circuit',
      'Cardio Blast',
    ];

    const programNames = [
      'NØDE Core Weekly',
      'Villa Zeno Hybrid',
      'Strength Builder',
      'Hybrid Performance',
    ];

    // Generate activities for each day
    for (let day = 0; day < days; day++) {
      const dayDate = new Date(now);
      dayDate.setDate(dayDate.getDate() - day);
      dayDate.setHours(0, 0, 0, 0);

      // Generate 5-15 activities per day, spread throughout the day
      const activitiesPerDay = Math.floor(Math.random() * 10) + 5;

      for (let i = 0; i < activitiesPerDay; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const userName = user.username ? `@${user.username}` : user.name || 'Someone';

        // Random hour between 6 AM and 10 PM
        const hour = Math.floor(Math.random() * 16) + 6;
        const minute = Math.floor(Math.random() * 60);
        const activityTime = new Date(dayDate);
        activityTime.setHours(hour, minute, 0, 0);

        // Random activity type
        const activityTypes: ActivityType[] = [
          'USER_REGISTERED',
          'WORKOUT_CREATED',
          'SESSION_STARTED',
          'SESSION_COMPLETED',
          'NETWORK_CONNECTED',
          'USER_LEVEL_UP',
          'PROGRAM_STARTED',
        ];

        const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];

        let message = '';
        let metadata: any = {};

        switch (type) {
          case 'USER_REGISTERED':
            message = `New user ${userName} joined`;
            break;
          case 'WORKOUT_CREATED':
            const workoutName = workoutNames[Math.floor(Math.random() * workoutNames.length)];
            message = `${userName} created workout: ${workoutName}`;
            metadata = { workoutName };
            break;
          case 'SESSION_STARTED':
            const startedWorkout = workoutNames[Math.floor(Math.random() * workoutNames.length)];
            message = `${userName} started ${startedWorkout}`;
            metadata = { workoutName: startedWorkout };
            break;
          case 'SESSION_COMPLETED':
            const completedWorkout = workoutNames[Math.floor(Math.random() * workoutNames.length)];
            const rpe = Math.floor(Math.random() * 5) + 5; // RPE 5-10
            message = `${userName} completed ${completedWorkout} (RPE: ${rpe})`;
            metadata = { workoutName: completedWorkout, rpe };
            break;
          case 'NETWORK_CONNECTED':
            const otherUser = users[Math.floor(Math.random() * users.length)];
            if (otherUser.id !== user.id) {
              const otherUserName = otherUser.username
                ? `@${otherUser.username}`
                : otherUser.name || 'Someone';
              message = `${userName} connected with ${otherUserName}`;
            } else {
              continue; // Skip if same user
            }
            break;
          case 'USER_LEVEL_UP':
            const level = Math.floor(Math.random() * 20) + 2; // Level 2-21
            message = `${userName} reached Level ${level}`;
            metadata = { level };
            break;
          case 'PROGRAM_STARTED':
            const programName = programNames[Math.floor(Math.random() * programNames.length)];
            message = `${userName} started program: ${programName}`;
            metadata = { programName };
            break;
        }

        activities.push({
          userId: user.id,
          type,
          message,
          metadata,
          createdAt: activityTime,
        });
      }
    }

    // Insert activities in batches
    let inserted = 0;
    const batchSize = 50;
    for (let i = 0; i < activities.length; i += batchSize) {
      const batch = activities.slice(i, i + batchSize);
      await this.prisma.activityLog.createMany({
        data: batch,
        skipDuplicates: true,
      });
      inserted += batch.length;
    }

    return {
      message: `Generated ${inserted} demo activities for the last ${days} days`,
      count: inserted,
    };
  }

  /**
   * Add a few recent demo activities (for keeping feed active)
   */
  async addRecentDemoActivities(count: number = 5) {
    const users = await this.prisma.user.findMany({
      select: { id: true, name: true, username: true },
      take: 10,
    });

    if (users.length === 0) {
      return { message: 'No users found', count: 0 };
    }

    const activities: any[] = [];
    const now = new Date();
    const workoutNames = [
      'PR1ME Strength',
      'FORGE Supersets',
      'ENGIN3 Hybrid',
      'CIRCUIT X MetCon',
      'CAPAC1TY Endurance',
    ];

    for (let i = 0; i < count; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const userName = user.username ? `@${user.username}` : user.name || 'Someone';

      // Random time in the last 2 hours
      const minutesAgo = Math.floor(Math.random() * 120);
      const activityTime = new Date(now.getTime() - minutesAgo * 60 * 1000);

      const activityTypes: ActivityType[] = [
        'SESSION_STARTED',
        'SESSION_COMPLETED',
        'WORKOUT_CREATED',
        'NETWORK_CONNECTED',
      ];

      const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      let message = '';
      let metadata: any = {};

      switch (type) {
        case 'SESSION_STARTED':
          const startedWorkout = workoutNames[Math.floor(Math.random() * workoutNames.length)];
          message = `${userName} started ${startedWorkout}`;
          metadata = { workoutName: startedWorkout };
          break;
        case 'SESSION_COMPLETED':
          const completedWorkout = workoutNames[Math.floor(Math.random() * workoutNames.length)];
          const rpe = Math.floor(Math.random() * 5) + 5;
          message = `${userName} completed ${completedWorkout} (RPE: ${rpe})`;
          metadata = { workoutName: completedWorkout, rpe };
          break;
        case 'WORKOUT_CREATED':
          const workoutName = workoutNames[Math.floor(Math.random() * workoutNames.length)];
          message = `${userName} created workout: ${workoutName}`;
          metadata = { workoutName };
          break;
        case 'NETWORK_CONNECTED':
          const otherUser = users[Math.floor(Math.random() * users.length)];
          if (otherUser.id !== user.id) {
            const otherUserName = otherUser.username
              ? `@${otherUser.username}`
              : otherUser.name || 'Someone';
            message = `${userName} connected with ${otherUserName}`;
          } else {
            continue;
          }
          break;
      }

      activities.push({
        userId: user.id,
        type,
        message,
        metadata,
        createdAt: activityTime,
      });
    }

    await this.prisma.activityLog.createMany({
      data: activities,
      skipDuplicates: true,
    });

    return {
      message: `Added ${activities.length} recent demo activities`,
      count: activities.length,
    };
  }

  /**
   * Clean up old demo activities (older than specified days)
   */
  async cleanupOldDemoActivities(days: number = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const result = await this.prisma.activityLog.deleteMany({
      where: {
        createdAt: { lt: cutoff },
      },
    });

    return {
      message: `Cleaned up ${result.count} old demo activities`,
      deleted: result.count,
    };
  }
}

