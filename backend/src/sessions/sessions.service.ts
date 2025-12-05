import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { GamificationService } from '../gamification/gamification.service';
import { AchievementsService } from '../gamification/achievements.service';
import { ActivityService } from '../activity/activity.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    private gamificationService: GamificationService,
    private achievementsService: AchievementsService,
    private activityService: ActivityService,
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: string, createSessionDto: CreateSessionDto) {
    const session = await this.prisma.sessionLog.create({
      data: {
        userId,
        ...createSessionDto,
      },
      include: {
        workout: {
          select: {
            id: true,
            name: true,
            displayCode: true,
          },
        },
        user: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    });

    // Log activity
    const userName = session.user?.username ? `@${session.user.username}` : session.user?.name || 'Someone';
    const workoutName = session.workout?.name || 'a workout';
    
    const activityLog = await this.activityService.createActivity(
      userId,
      'SESSION_STARTED',
      `${userName} started ${workoutName}`,
      {
        entityType: 'session',
        entityId: session.id,
        metadata: {
          workoutId: session.workoutId,
          workoutName: session.workout?.name,
        },
      },
    ).catch(() => null);

    // Notify friends
    await this.notifyFriends(userId, 'FRIEND_WORKOUT_STARTED', {
      workoutName,
      activityLogId: activityLog?.id,
    }).catch(() => {});

    return session;
  }

  async update(id: string, userId: string, updateDto: UpdateSessionDto) {
    const session = await this.prisma.sessionLog.findUnique({
      where: { id, userId },
      include: { workout: true },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const wasCompleted = session.completed;
    const updateData: any = {
      ...updateDto,
      completedAt: updateDto.completed ? new Date() : (session.completedAt || null),
    };

    const updatedSession = await this.prisma.sessionLog.update({
      where: { id, userId },
      data: updateData,
      include: { workout: true },
    });

    // Award XP if workout was just completed
    if (updateDto.completed && !wasCompleted && updatedSession.workout) {
      try {
        const workoutXP = await this.gamificationService.calculateWorkoutXP(
          userId,
          updatedSession.workout,
          {
            completed: true,
            rpe: updateDto.rpe,
            durationSec: updateDto.durationSec,
          },
        );

        const result = await this.gamificationService.awardXP(
          userId,
          workoutXP,
          'Workout completed',
        );

        // Also check for streak bonus
        const streakXP = await this.gamificationService.calculateStreakXP(userId);
        if (streakXP > 0) {
          await this.gamificationService.awardXP(userId, streakXP, 'Streak bonus');
        }

        // Return level up info in metadata
        const returnData: any = {
          ...updatedSession,
          _gamification: {
            xpAwarded: workoutXP + streakXP,
            leveledUp: result.leveledUp,
            newLevel: result.newLevel,
            newXP: result.xp,
          },
        };

        // Log activity for completion
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, username: true },
        });
        const userName = user?.username ? `@${user.username}` : user?.name || 'Someone';
        const workoutName = updatedSession.workout?.name || 'a workout';
        
        const activityLog = await this.activityService.createActivity(
          userId,
          'SESSION_COMPLETED',
          `${userName} completed ${workoutName}${updateDto.rpe ? ` (RPE: ${updateDto.rpe})` : ''}`,
          {
            entityType: 'session',
            entityId: updatedSession.id,
            metadata: {
              workoutId: updatedSession.workoutId,
              workoutName: updatedSession.workout?.name,
              rpe: updateDto.rpe,
              durationSec: updateDto.durationSec,
            },
          },
        ).catch(() => null);

        // Notify friends
        await this.notifyFriends(userId, 'FRIEND_WORKOUT_COMPLETED', {
          workoutName,
          rpe: updateDto.rpe,
          activityLogId: activityLog?.id,
        }).catch(() => {});

        // Check for level up and notify friends
        if (result.leveledUp) {
          await this.activityService.createActivity(
            userId,
            'USER_LEVEL_UP',
            `${userName} reached Level ${result.newLevel}`,
            {
              entityType: 'user',
              entityId: userId,
              metadata: { level: result.newLevel },
            },
          ).catch(() => {});

          await this.notifyFriends(userId, 'FRIEND_LEVEL_UP', {
            level: result.newLevel,
          }).catch(() => {});
        }

        // Check for newly earned achievements
        try {
          const achievementResults = await this.achievementsService.checkAchievements(userId);
          const newlyEarned = achievementResults
            .filter(r => r.newlyEarned)
            .map(r => r.achievement);
          
          if (newlyEarned.length > 0) {
            returnData._achievements = newlyEarned;
          }
        } catch (error) {
          console.error('Error checking achievements:', error);
          // Don't fail if achievement check fails
        }

        return returnData;
      } catch (error) {
        console.error('Error awarding XP:', error);
        // Don't fail the session update if XP fails
      }
    }

    return updatedSession;
  }

  /**
   * Notify user's network connections about activity
   */
  private async notifyFriends(
    userId: string,
    notificationType: 'FRIEND_WORKOUT_STARTED' | 'FRIEND_WORKOUT_COMPLETED' | 'FRIEND_LEVEL_UP',
    metadata: any,
  ) {
    // Get user's network connections
    const connections = await this.prisma.network.findMany({
      where: {
        OR: [
          { requesterId: userId, status: 'ACCEPTED' },
          { addresseeId: userId, status: 'ACCEPTED' },
        ],
      },
    });

    // Get friend user IDs
    const friendIds = connections.map((conn) =>
      conn.requesterId === userId ? conn.addresseeId : conn.requesterId,
    );

    if (friendIds.length === 0) return;

    // Create notifications for friends (rate-limited: max 1 per hour per friend per type)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    for (const friendId of friendIds) {
      // Check if we've already notified this friend recently
      const recentNotification = await this.prisma.notification.findFirst({
        where: {
          userId: friendId,
          type: notificationType,
          createdAt: { gte: oneHourAgo },
        },
      });

      if (!recentNotification) {
        await this.notificationsService.createNotification(
          friendId,
          notificationType,
          undefined,
        ).catch(() => {});
      }
    }
  }

  async findRecent(userId: string, limit: number = 10) {
    return this.prisma.sessionLog.findMany({
      where: { userId },
      include: {
        workout: {
          select: {
            id: true,
            name: true,
            displayCode: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });
  }

  async findByWorkout(userId: string, workoutId: string) {
    return this.prisma.sessionLog.findMany({
      where: { userId, workoutId },
      orderBy: { startedAt: 'desc' },
    });
  }
}

