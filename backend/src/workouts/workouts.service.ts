import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkoutsService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.workout.findUnique({
      where: { id },
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
    });
  }

  async create(createWorkoutDto: any) {
    const { sections, ...workoutData } = createWorkoutDto;

    return this.prisma.workout.create({
      data: {
        ...workoutData,
        sections: {
          create: sections.map((section: any) => ({
            ...section,
            blocks: {
              create: section.blocks?.map((block: any) => {
                const { tierSilver, tierGold, tierBlack, ...blockData } = block;
                return {
                  ...blockData,
                  tierSilver: tierSilver
                    ? { create: { ...tierSilver, tier: 'SILVER' } }
                    : undefined,
                  tierGold: tierGold
                    ? { create: { ...tierGold, tier: 'GOLD' } }
                    : undefined,
                  tierBlack: tierBlack
                    ? { create: { ...tierBlack, tier: 'BLACK' } }
                    : undefined,
                };
              }),
            },
          })),
        },
      },
      include: {
        sections: {
          include: {
            blocks: {
              include: {
                tierSilver: true,
                tierGold: true,
                tierBlack: true,
              },
            },
          },
        },
      },
    });
  }
}

