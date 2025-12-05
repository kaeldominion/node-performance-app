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

  async findRecommended() {
    const workouts = await this.prisma.workout.findMany({
      where: { isRecommended: true },
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
      orderBy: { createdAt: 'desc' },
    });

    return workouts.map((workout) => ({
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
    }));
  }

  async toggleRecommended(id: string, isRecommended: boolean) {
    return this.prisma.workout.update({
      where: { id },
      data: { isRecommended },
    });
  }

  async findByUser(userId: string) {
    // Get workouts from user's sessions (workouts they've done)
    const sessions = await this.prisma.sessionLog.findMany({
      where: { userId },
      select: { workoutId: true },
      distinct: ['workoutId'],
    });

    const workoutIds = sessions.map(s => s.workoutId).filter(Boolean);

    if (workoutIds.length === 0) {
      return [];
    }

    const workouts = await this.prisma.workout.findMany({
      where: { id: { in: workoutIds } },
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
      orderBy: { createdAt: 'desc' },
    });

    return workouts.map((workout) => ({
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
    }));
  }

  async delete(userId: string, workoutId: string) {
    // Verify the workout belongs to the user (check if they have a session with it)
    const session = await this.prisma.sessionLog.findFirst({
      where: {
        userId,
        workoutId,
      },
    });

    if (!session) {
      throw new Error('Workout not found or you do not have permission to delete it');
    }

    // Delete the workout (cascade will handle related data)
    return this.prisma.workout.delete({
      where: { id: workoutId },
    });
  }

  async generateShareLink(userId: string, workoutId: string) {
    // Verify the workout belongs to the user
    const session = await this.prisma.sessionLog.findFirst({
      where: {
        userId,
        workoutId,
      },
    });

    if (!session) {
      throw new Error('Workout not found or you do not have permission to share it');
    }

    // Generate or update shareId
    const shareId = `share_${Math.random().toString(36).substring(2, 15)}`;
    
    const workout = await this.prisma.workout.update({
      where: { id: workoutId },
      data: { shareId },
      select: { shareId: true },
    });

    return {
      shareId: workout.shareId,
      shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/workouts/share/${workout.shareId}`,
    };
  }
}

