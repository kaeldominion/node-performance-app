import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  async createScheduledWorkout(
    userId: string,
    data: {
      workoutId?: string;
      programId?: string;
      scheduledDate: Date;
      duration?: number;
      notes?: string;
    },
  ) {
    // Get the highest order for the same day
    const startOfDay = new Date(data.scheduledDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(data.scheduledDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingScheduled = await this.prisma.scheduledWorkout.findMany({
      where: {
        userId,
        scheduledDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { order: 'desc' },
      take: 1,
    });

    const order = existingScheduled.length > 0 ? existingScheduled[0].order + 1 : 0;

    return this.prisma.scheduledWorkout.create({
      data: {
        userId,
        workoutId: data.workoutId,
        programId: data.programId,
        scheduledDate: data.scheduledDate,
        duration: data.duration,
        notes: data.notes,
        order,
      },
      include: {
        workout: {
          include: {
            sections: {
              orderBy: { order: 'asc' },
              take: 1, // Just get count
            },
          },
        },
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

  async scheduleProgram(
    userId: string,
    programId: string,
    startDate: Date,
    startTime?: string, // HH:mm format
  ) {
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
      include: {
        workouts: {
          orderBy: { dayIndex: 'asc' },
        },
      },
    });

    if (!program) {
      throw new Error('Program not found');
    }

    const scheduledWorkouts = [];
    const [hours, minutes] = startTime ? startTime.split(':').map(Number) : [9, 0];

    for (const workout of program.workouts) {
      const workoutDate = new Date(startDate);
      workoutDate.setDate(workoutDate.getDate() + (workout.dayIndex || 0));
      workoutDate.setHours(hours, minutes, 0, 0);

      const scheduled = await this.createScheduledWorkout(userId, {
        programId,
        workoutId: workout.id,
        scheduledDate: workoutDate,
        duration: 60, // Default 60 minutes
      });

      scheduledWorkouts.push(scheduled);
    }

    return scheduledWorkouts;
  }

  async getSchedule(userId: string, startDate?: Date, endDate?: Date) {
    try {
      const start = startDate || new Date();
      start.setHours(0, 0, 0, 0);
      const end = endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      end.setHours(23, 59, 59, 999);

      console.log('getSchedule called:', {
        userId,
        start: start.toISOString(),
        end: end.toISOString(),
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      });

      const scheduled = await this.prisma.scheduledWorkout.findMany({
        where: {
          userId,
          scheduledDate: {
            gte: start,
            lte: end,
          },
          // Only show incomplete workouts for upcoming sessions
          isCompleted: false,
        },
        include: {
          workout: {
            select: {
              id: true,
              name: true,
              displayCode: true,
              archetype: true,
              sections: {
                select: {
                  id: true,
                },
              },
            },
          },
          program: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: [
          { scheduledDate: 'asc' },
          { order: 'asc' },
        ],
      });

      console.log(`Found ${scheduled.length} scheduled workouts for user ${userId}`);
      scheduled.forEach((sw) => {
        console.log(`- ${sw.workout?.name || sw.program?.name || 'Unknown'}: ${sw.scheduledDate.toISOString()}, completed: ${sw.isCompleted}`);
      });

      return scheduled;
    } catch (error: any) {
      // If table doesn't exist yet, return empty array
      if (error.code === 'P2021' || error.message?.includes('does not exist')) {
        return [];
      }
      throw error;
    }
  }

  async updateScheduledWorkout(
    userId: string,
    id: string,
    data: {
      scheduledDate?: Date;
      duration?: number;
      notes?: string;
      order?: number;
    },
  ) {
    // Verify ownership
    const existing = await this.prisma.scheduledWorkout.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Scheduled workout not found');
    }

    return this.prisma.scheduledWorkout.update({
      where: { id },
      data,
      include: {
        workout: {
          select: {
            id: true,
            name: true,
            displayCode: true,
            archetype: true,
          },
        },
        program: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async deleteScheduledWorkout(userId: string, id: string) {
    const existing = await this.prisma.scheduledWorkout.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Scheduled workout not found');
    }

    return this.prisma.scheduledWorkout.delete({
      where: { id },
    });
  }

  async reorderScheduledWorkouts(
    userId: string,
    updates: Array<{ id: string; scheduledDate: Date; order: number }>,
  ) {
    const transactions = updates.map((update) =>
      this.prisma.scheduledWorkout.updateMany({
        where: {
          id: update.id,
          userId,
        },
        data: {
          scheduledDate: update.scheduledDate,
          order: update.order,
        },
      }),
    );

    await Promise.all(transactions);
    return { success: true };
  }
}

