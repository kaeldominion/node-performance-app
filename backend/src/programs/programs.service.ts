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
    const program = await this.prisma.program.findUnique({
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
                    tierPrescriptions: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!program) return null;

    // Transform tierPrescriptions to tierSilver, tierGold, tierBlack
    return {
      ...program,
      workouts: program.workouts.map((workout) => ({
        ...workout,
        sections: workout.sections.map((section) => ({
          ...section,
          blocks: section.blocks.map((block) => ({
            ...block,
            tierSilver: block.tierPrescriptions.find((t) => t.tier === 'SILVER') || null,
            tierGold: block.tierPrescriptions.find((t) => t.tier === 'GOLD') || null,
            tierBlack: block.tierPrescriptions.find((t) => t.tier === 'BLACK') || null,
            tierPrescriptions: undefined,
          })),
        })),
      })),
    };
  }

  async create(createProgramDto: any) {
    return this.prisma.program.create({
      data: createProgramDto,
    });
  }
}

