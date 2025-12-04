import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgramsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.program.findMany({
      where: { isPublic: true },
      include: {
        workouts: {
          orderBy: { dayIndex: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.program.findUnique({
      where: { slug },
      include: {
        workouts: {
          orderBy: { dayIndex: 'asc' },
          include: {
            sections: {
              orderBy: { order: 'asc' },
              include: {
                blocks: {
                  orderBy: { order: 'asc' },
                  include: {
                    tierSilver: true,
                    tierGold: true,
                    tierBlack: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async create(createProgramDto: any) {
    return this.prisma.program.create({
      data: createProgramDto,
    });
  }
}

