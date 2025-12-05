import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { GamificationService } from '../gamification/gamification.service';

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    private gamificationService: GamificationService,
  ) {}

  async create(userId: string, createSessionDto: CreateSessionDto) {
    return this.prisma.sessionLog.create({
      data: {
        userId,
        ...createSessionDto,
      },
    });
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
        return {
          ...updatedSession,
          _gamification: {
            xpAwarded: workoutXP + streakXP,
            leveledUp: result.leveledUp,
            newLevel: result.newLevel,
            newXP: result.xp,
          },
        };
      } catch (error) {
        console.error('Error awarding XP:', error);
        // Don't fail the session update if XP fails
      }
    }

    return updatedSession;
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

