import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserProgramsService {
  constructor(private prisma: PrismaService) {}

  async startProgram(userId: string, programId: string, startDate: Date) {
    // Deactivate other active programs
    await this.prisma.userProgram.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    return this.prisma.userProgram.create({
      data: {
        userId,
        programId,
        startDate,
      },
      include: {
        program: {
          include: {
            workouts: {
              orderBy: { dayIndex: 'asc' },
            },
          },
        },
      },
    });
  }

  async getActiveProgram(userId: string) {
    return this.prisma.userProgram.findFirst({
      where: { userId, isActive: true },
      include: {
        program: {
          include: {
            workouts: {
              orderBy: [
                { weekIndex: 'asc' },
                { dayIndex: 'asc' },
              ],
            },
          },
        },
      },
    });
  }

  async getSchedule(userId: string, startDate?: Date, endDate?: Date) {
    const activeProgram = await this.getActiveProgram(userId);
    if (!activeProgram) {
      return { schedule: [], progress: { completed: 0, total: 0, percentage: 0 } };
    }

    const schedule = [];
    const programStart = new Date(activeProgram.startDate);
    programStart.setHours(0, 0, 0, 0);
    
    const start = startDate || new Date();
    start.setHours(0, 0, 0, 0);
    const end = endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days
    end.setHours(23, 59, 59, 999);

    // Get all workouts ordered by weekIndex then dayIndex
    const allWorkouts = activeProgram.program.workouts.sort((a, b) => {
      if (a.weekIndex !== b.weekIndex) {
        return (a.weekIndex || 0) - (b.weekIndex || 0);
      }
      return (a.dayIndex || 0) - (b.dayIndex || 0);
    });

    // Check if this is a multi-week program (has weekIndex)
    const hasWeeks = allWorkouts.some(w => w.weekIndex !== null && w.weekIndex !== undefined);
    
    // Get completed sessions for progress tracking
    const completedSessions = await this.prisma.sessionLog.findMany({
      where: {
        userId,
        programId: activeProgram.programId,
        completed: true,
      },
      select: {
        workoutId: true,
        weekIndex: true,
        dayIndex: true,
      },
    });

    const completedWorkoutIds = new Set(completedSessions.map(s => s.workoutId));

    if (hasWeeks) {
      // Multi-week program: schedule by weekIndex and dayIndex
      const maxWeek = Math.max(...allWorkouts.map(w => w.weekIndex || 1));
      
      for (const workout of allWorkouts) {
        const weekIndex = workout.weekIndex || 1;
        const dayIndex = workout.dayIndex || 1;
        
        // Calculate date: start + (weekIndex - 1) * 7 days + (dayIndex - 1) days
        const workoutDate = new Date(programStart);
        workoutDate.setDate(workoutDate.getDate() + (weekIndex - 1) * 7 + (dayIndex - 1));
        
        if (workoutDate >= start && workoutDate <= end) {
          schedule.push({
            date: workoutDate.toISOString(),
            workout: {
              id: workout.id,
              name: workout.name,
              displayCode: workout.displayCode,
              archetype: workout.archetype,
              dayIndex: workout.dayIndex,
              weekIndex: workout.weekIndex,
            },
            completed: completedWorkoutIds.has(workout.id),
          });
        }
      }
    } else {
      // Single-week or 4-day program: schedule by dayIndex only
      const maxDayIndex = Math.max(...allWorkouts.map(w => w.dayIndex || 0));
      
      for (let day = 0; day < allWorkouts.length; day++) {
        const workout = allWorkouts[day];
        const workoutDate = new Date(programStart);
        workoutDate.setDate(workoutDate.getDate() + day);
        
        if (workoutDate >= start && workoutDate <= end) {
          schedule.push({
            date: workoutDate.toISOString(),
            workout: {
              id: workout.id,
              name: workout.name,
              displayCode: workout.displayCode,
              archetype: workout.archetype,
              dayIndex: workout.dayIndex,
            },
            completed: completedWorkoutIds.has(workout.id),
          });
        }
      }
    }

    // Calculate progress
    const totalWorkouts = allWorkouts.length;
    const completedCount = completedWorkoutIds.size;
    const progress = {
      completed: completedCount,
      total: totalWorkouts,
      percentage: totalWorkouts > 0 ? Math.round((completedCount / totalWorkouts) * 100) : 0,
    };

    return {
      schedule: schedule.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      progress,
    };
  }
}

