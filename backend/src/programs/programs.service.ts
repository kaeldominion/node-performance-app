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
    const { workouts, ...programData } = createProgramDto;

    // Generate slug from name if not provided
    const slug = programData.slug || 
      programData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') + 
      `-${Math.random().toString(36).substring(2, 9)}`;

    // If workouts are provided, create program with nested workouts
    if (workouts && Array.isArray(workouts) && workouts.length > 0) {
      const program = await this.prisma.program.create({
        data: {
          ...programData,
          slug,
          workouts: {
            create: workouts.map((workout: any) => {
              const { sections, ...workoutData } = workout;
              return {
                ...workoutData,
                // Note: createdBy not set here as this endpoint doesn't require auth
                // Workouts created via this endpoint won't appear in user's "my workouts"
                sections: {
                  create: sections?.map((section: any) => {
                    const { blocks, ...sectionData } = section;
                    return {
                      ...sectionData,
                      blocks: {
                        create: blocks?.map((block: any) => {
                          const { tierSilver, tierGold, tierBlack, ...blockData } = block;
                          const tierPrescriptions = [];
                          if (tierSilver) tierPrescriptions.push({ ...tierSilver, tier: 'SILVER' });
                          if (tierGold) tierPrescriptions.push({ ...tierGold, tier: 'GOLD' });
                          if (tierBlack) tierPrescriptions.push({ ...tierBlack, tier: 'BLACK' });
                          
                          return {
                            ...blockData,
                            tierPrescriptions: tierPrescriptions.length > 0 ? { create: tierPrescriptions } : undefined,
                          };
                        }) || [],
                      },
                    };
                  }) || [],
                },
              };
            }),
          },
        },
        include: {
          workouts: {
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
          },
        },
      });

      // Transform response to match expected format (tierPrescriptions -> tierSilver/tierGold/tierBlack)
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

    // If no workouts, just create the program
    return this.prisma.program.create({
      data: {
        ...programData,
        slug,
      },
    });
  }

  async createWithWorkouts(data: {
    name: string;
    description?: string;
    level?: string;
    goal?: string;
    durationWeeks?: number;
    cycle?: string;
    workouts: any[];
    createdBy?: string;
  }) {
    const { workouts, ...programData } = data;
    
    // Generate slug from name
    const slug = programData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      + '-' + Date.now().toString(36);

    return this.prisma.program.create({
      data: {
        ...programData,
        level: programData.level as any, // Cast to TrainingLevel enum
        goal: programData.goal as any, // Cast to TrainingGoal enum
        slug,
        workouts: {
          create: workouts.map((workout) => {
            const { sections, ...workoutData } = workout;
            return {
              ...workoutData,
              createdBy: data.createdBy, // Set createdBy for all workouts in the program
              sections: {
                create: sections.map((section: any) => {
                  const { blocks, ...sectionData } = section;
                  return {
                    ...sectionData,
                    blocks: {
                      create: blocks.map((block: any) => {
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
                  };
                }),
              },
            };
          }),
        },
      },
      include: {
        workouts: {
          orderBy: [
            { dayIndex: 'asc' },
          ],
        },
      },
    });
  }
}

