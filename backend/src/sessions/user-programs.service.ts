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
              orderBy: { dayIndex: 'asc' },
            },
          },
        },
      },
    });
  }

  async getSchedule(userId: string, startDate?: Date, endDate?: Date) {
    const activeProgram = await this.getActiveProgram(userId);
    if (!activeProgram) {
      return [];
    }

    const schedule = [];
    const programStart = new Date(activeProgram.startDate);
    programStart.setHours(0, 0, 0, 0);
    
    const start = startDate || new Date();
    start.setHours(0, 0, 0, 0);
    const end = endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    end.setHours(23, 59, 59, 999);

    // Generate schedule for the next 30 days to cover all workouts
    const allWorkouts = activeProgram.program.workouts;
    const maxDayIndex = Math.max(...allWorkouts.map(w => w.dayIndex || 0));
    
    for (let day = 0; day <= maxDayIndex + 7; day++) {
      const workoutDate = new Date(programStart);
      workoutDate.setDate(workoutDate.getDate() + day);
      
      if (workoutDate >= start && workoutDate <= end) {
        const workout = allWorkouts.find(w => (w.dayIndex || 0) === (day % (maxDayIndex + 1)));
        if (workout) {
          schedule.push({
            date: workoutDate.toISOString(),
            workout: {
              id: workout.id,
              name: workout.name,
              displayCode: workout.displayCode,
            },
          });
        }
      }
    }

    return schedule.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}

