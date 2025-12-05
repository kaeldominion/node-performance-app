import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkoutsService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const workout = await this.prisma.workout.findUnique({
      where: { id },
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
    });

    if (!workout) return null;

    // Transform tierPrescriptions array to tierSilver, tierGold, tierBlack
    return {
      ...workout,
      sections: workout.sections.map((section) => ({
        ...section,
        blocks: section.blocks.map((block) => ({
          ...block,
          tierSilver: block.tierPrescriptions.find((t) => t.tier === 'SILVER') || null,
          tierGold: block.tierPrescriptions.find((t) => t.tier === 'GOLD') || null,
          tierBlack: block.tierPrescriptions.find((t) => t.tier === 'BLACK') || null,
          tierPrescriptions: undefined, // Remove from response
        })),
      })),
    };
  }

  async findByShareId(shareId: string) {
    const workout = await this.prisma.workout.findFirst({
      where: { shareId },
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
    });

    if (!workout) return null;

    // Transform tierPrescriptions array to tierSilver, tierGold, tierBlack
    return {
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
    };
  }

  async create(createWorkoutDto: any) {
    const { sections, ...workoutData } = createWorkoutDto;

    // Generate shareId if not provided
    const shareId = workoutData.shareId || `share_${Math.random().toString(36).substring(2, 15)}`;

    const workout = await this.prisma.workout.create({
      data: {
        ...workoutData,
        shareId,
        sections: {
          create: sections.map((section: any) => ({
            ...section,
            blocks: {
              create: section.blocks?.map((block: any) => {
                const { tierSilver, tierGold, tierBlack, ...blockData } = block;
                const tierPrescriptions = [];
                if (tierSilver) tierPrescriptions.push({ ...tierSilver, tier: 'SILVER' });
                if (tierGold) tierPrescriptions.push({ ...tierGold, tier: 'GOLD' });
                if (tierBlack) tierPrescriptions.push({ ...tierBlack, tier: 'BLACK' });
                
                return {
                  ...blockData,
                  tierPrescriptions: tierPrescriptions.length > 0 ? { create: tierPrescriptions } : undefined,
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
                tierPrescriptions: true,
              },
            },
          },
        },
      },
    });

    // Transform response to match expected format
    return {
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
    };
  }
}

