import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createSessionDto: CreateSessionDto) {
    return this.prisma.sessionLog.create({
      data: {
        userId,
        ...createSessionDto,
      },
    });
  }

  async update(id: string, userId: string, updateDto: UpdateSessionDto) {
    return this.prisma.sessionLog.update({
      where: { id, userId },
      data: updateDto,
    });
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

