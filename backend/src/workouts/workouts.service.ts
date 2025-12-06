import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { ExercisesService } from '../exercises/exercises.service';
import { autoFixDatabase } from '../../scripts/auto-fix-database';

@Injectable()
export class WorkoutsService implements OnModuleInit {
  private readonly logger = new Logger(WorkoutsService.name);
  constructor(
    private prisma: PrismaService,
    private activityService: ActivityService,
    private notificationsService: NotificationsService,
    private usersService: UsersService,
    private exercisesService: ExercisesService,
  ) {}

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

    // Enrich blocks with exercise data (images, variations, etc.)
    const enrichedBlocks = await Promise.all(
      workout.sections.flatMap((section) =>
        section.blocks.map(async (block) => {
          try {
            const exerciseData = await this.exercisesService.findByExerciseName(block.exerciseName);
            return {
              ...block,
              tierSilver: block.tierPrescriptions.find((t) => t.tier === 'SILVER') || null,
              tierGold: block.tierPrescriptions.find((t) => t.tier === 'GOLD') || null,
              tierBlack: block.tierPrescriptions.find((t) => t.tier === 'BLACK') || null,
              tierPrescriptions: undefined, // Remove from response
              exerciseImageUrl: exerciseData?.imageUrl || null,
              exerciseInstructions: exerciseData?.instructions || null,
              exerciseVariations: exerciseData ? {
                weightRanges: exerciseData.weightRanges,
                durationRanges: exerciseData.durationRanges,
                intensityLevels: exerciseData.intensityLevels,
                repRanges: exerciseData.repRanges,
                tempoOptions: exerciseData.tempoOptions,
                equipmentVariations: exerciseData.equipmentVariations,
                movementVariations: exerciseData.movementVariations,
              } : null,
            };
          } catch (error) {
            console.error(`Error enriching exercise data for ${block.exerciseName}:`, error);
            // Return block without exercise data if lookup fails
            return {
              ...block,
              tierSilver: block.tierPrescriptions.find((t) => t.tier === 'SILVER') || null,
              tierGold: block.tierPrescriptions.find((t) => t.tier === 'GOLD') || null,
              tierBlack: block.tierPrescriptions.find((t) => t.tier === 'BLACK') || null,
              tierPrescriptions: undefined,
              exerciseImageUrl: null,
              exerciseInstructions: null,
              exerciseVariations: null,
            };
          }
        })
      )
    );

    // Reconstruct sections with enriched blocks
    let blockIndex = 0;
    return {
      ...workout,
      sections: workout.sections.map((section) => ({
        ...section,
        blocks: section.blocks.map(() => {
          const enrichedBlock = enrichedBlocks[blockIndex];
          blockIndex++;
          return enrichedBlock;
        }),
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

    // Enrich blocks with exercise data (images, variations, etc.)
    const enrichedBlocks = await Promise.all(
      workout.sections.flatMap((section) =>
        section.blocks.map(async (block) => {
          try {
            const exerciseData = await this.exercisesService.findByExerciseName(block.exerciseName);
            return {
              ...block,
              tierSilver: block.tierPrescriptions.find((t) => t.tier === 'SILVER') || null,
              tierGold: block.tierPrescriptions.find((t) => t.tier === 'GOLD') || null,
              tierBlack: block.tierPrescriptions.find((t) => t.tier === 'BLACK') || null,
              tierPrescriptions: undefined, // Remove from response
              exerciseImageUrl: exerciseData?.imageUrl || null,
              exerciseInstructions: exerciseData?.instructions || null,
              exerciseVariations: exerciseData ? {
                weightRanges: exerciseData.weightRanges,
                durationRanges: exerciseData.durationRanges,
                intensityLevels: exerciseData.intensityLevels,
                repRanges: exerciseData.repRanges,
                tempoOptions: exerciseData.tempoOptions,
                equipmentVariations: exerciseData.equipmentVariations,
                movementVariations: exerciseData.movementVariations,
              } : null,
            };
          } catch (error) {
            console.error(`Error enriching exercise data for ${block.exerciseName}:`, error);
            // Return block without exercise data if lookup fails
            return {
              ...block,
              tierSilver: block.tierPrescriptions.find((t) => t.tier === 'SILVER') || null,
              tierGold: block.tierPrescriptions.find((t) => t.tier === 'GOLD') || null,
              tierBlack: block.tierPrescriptions.find((t) => t.tier === 'BLACK') || null,
              tierPrescriptions: undefined,
              exerciseImageUrl: null,
              exerciseInstructions: null,
              exerciseVariations: null,
            };
          }
        })
      )
    );

    // Reconstruct sections with enriched blocks
    let blockIndex = 0;
    return {
      ...workout,
      sections: workout.sections.map((section) => ({
        ...section,
        blocks: section.blocks.map(() => {
          const enrichedBlock = enrichedBlocks[blockIndex];
          blockIndex++;
          return enrichedBlock;
        }),
      })),
    };
  }

  /**
   * Generate a unique workout name based on content (3-4 words max)
   */
  private generateWorkoutName(workout: any): string {
    const sections = workout.sections || [];
    const archetype = workout.archetype;
    
    // Get main work sections (exclude warmup/cooldown)
    const mainSections = sections.filter((s: any) => 
      s.type && !['WARMUP', 'COOLDOWN'].includes(s.type)
    );
    
    // Extract key exercises from main sections
    const exercises: string[] = [];
    mainSections.forEach((section: any) => {
      if (section.blocks && Array.isArray(section.blocks)) {
        section.blocks.slice(0, 3).forEach((block: any) => {
          if (block.exerciseName) {
            // Extract main exercise name (remove prefixes like "BB", "DB", "SA", etc.)
            const exerciseName = block.exerciseName
              .replace(/^(BB|DB|SA|KB|WB|DBall|Slam|Wall)\s+/i, '')
              .split(/[\/\-\s]/)[0]
              .trim();
            if (exerciseName && !exercises.includes(exerciseName)) {
              exercises.push(exerciseName);
            }
          }
        });
      }
    });
    
    // Get section types
    const sectionTypes = mainSections.map((s: any) => s.type).filter(Boolean);
    
    // Build name based on archetype and content
    const nameParts: string[] = [];
    
    // Add archetype if available
    if (archetype) {
      const archetypeNames: Record<string, string> = {
        'PR1ME': 'Strength',
        'FORGE': 'Superset',
        'ENGIN3': 'Hybrid',
        'CIRCUIT_X': 'Circuit',
        'CAPAC1TY': 'Endurance',
        'FLOWSTATE': 'Flow',
      };
      nameParts.push(archetypeNames[archetype] || archetype);
    }
    
    // Add primary exercise (first main exercise)
    if (exercises.length > 0) {
      const primaryExercise = exercises[0];
      // Shorten long exercise names
      const shortExercise = primaryExercise.length > 15 
        ? primaryExercise.split(' ').slice(0, 2).join(' ')
        : primaryExercise;
      nameParts.push(shortExercise);
    }
    
    // Add section type if distinctive
    if (sectionTypes.length > 0) {
      const mainType = sectionTypes[0];
      const typeNames: Record<string, string> = {
        'EMOM': 'EMOM',
        'AMRAP': 'AMRAP',
        'WAVE': 'Wave',
        'SUPERSET': 'Superset',
        'FOR_TIME': 'ForTime',
        'CAPACITY': 'Capacity',
        'INTERVAL': 'Interval',
      };
      if (typeNames[mainType] && !nameParts.includes(typeNames[mainType])) {
        nameParts.push(typeNames[mainType]);
      }
    }
    
    // Add second exercise if space allows
    if (exercises.length > 1 && nameParts.length < 3) {
      const secondExercise = exercises[1];
      const shortExercise = secondExercise.length > 12 
        ? secondExercise.split(' ')[0]
        : secondExercise;
      if (shortExercise && !nameParts.includes(shortExercise)) {
        nameParts.push(shortExercise);
      }
    }
    
    // Fallback if no good name generated
    if (nameParts.length === 0) {
      if (mainSections.length > 0) {
        nameParts.push('Workout');
      } else {
        return 'New Workout';
      }
    }
    
    // Limit to 3-4 words max
    const finalName = nameParts.slice(0, 4).join(' ');
    
    return finalName;
  }

  async create(userId: string, createWorkoutDto: any, userEmail?: string) {
    const { sections, ...workoutData } = createWorkoutDto;
    
    // Generate unique name if not provided or if it's generic
    let workoutName = workoutData.name;
    if (!workoutName || workoutName === 'Workout Name' || workoutName.includes('//')) {
      workoutName = this.generateWorkoutName({ ...workoutData, sections });
      console.log('Generated workout name:', workoutName);
    }

    // Ensure user exists in database (in case webhook hasn't run yet)
    let user = await this.usersService.findOne(userId);
    if (!user) {
      console.log('User not found in database, attempting to create from Clerk ID:', userId);
      if (!userEmail) {
        throw new Error('User not found in database. Please ensure you are logged in properly.');
      }
      // Create user if they don't exist (handles webhook delays)
      await this.usersService.createFromClerk({
        id: userId,
        email: userEmail,
        role: 'HOME_USER',
        isAdmin: false,
      });
      // Fetch the user again with profile included to match the expected type
      user = await this.usersService.findOne(userId);
      if (!user) {
        throw new Error('Failed to create user in database');
      }
      console.log('Created user in database:', user.id);
    }

    // Generate shareId if not provided
    const shareId = workoutData.shareId || `share_${Math.random().toString(36).substring(2, 15)}`;

    // Ensure isRecommended defaults to false if not provided
    const isRecommended = workoutData.isRecommended ?? false;

    console.log('Creating workout with userId:', userId);
    console.log('Workout name:', workoutName);
    console.log('User exists:', !!user);

    const workout = await this.prisma.workout.create({
      data: {
        ...workoutData,
        name: workoutName,
        createdBy: userId, // Track who created/saved this workout (Clerk ID = User.id)
        shareId,
        isRecommended,
        sections: {
          create: sections.map((section: any) => {
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
                  
                  // Explicitly map only valid Prisma fields for ExerciseBlock
                  return {
                    label: blockData.label,
                    exerciseName: blockData.exerciseName,
                    description: blockData.description || null,
                    shortDescription: blockData.shortDescription || null,
                    longDescription: blockData.longDescription || null,
                    repScheme: blockData.repScheme || null,
                    tempo: blockData.tempo || null,
                    loadPercentage: blockData.loadPercentage || null,
                    distance: blockData.distance || null,
                    distanceUnit: blockData.distanceUnit || null,
                    order: blockData.order,
                    tierPrescriptions: tierPrescriptions.length > 0 ? { create: tierPrescriptions } : undefined,
                  };
                }) || [],
              },
            };
          }),
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

    // Log activity if workout was created by a user (has createdBy)
    if (workout.createdBy) {
      const user = await this.prisma.user.findUnique({
        where: { id: workout.createdBy },
        select: { name: true, username: true },
      });
      const userName = user?.username ? `@${user.username}` : user?.name || 'Someone';
      
      const activityLog = await this.activityService.createActivity(
        workout.createdBy,
        'WORKOUT_CREATED',
        `${userName} created workout: ${workout.name}`,
        {
          entityType: 'workout',
          entityId: workout.id,
          metadata: { workoutName: workout.name },
        },
      ).catch(() => null);

      // Notify friends
      await this.notifyFriends(workout.createdBy, 'FRIEND_WORKOUT_CREATED', {
        workoutName: workout.name,
        activityLogId: activityLog?.id,
      }).catch(() => {});
    }

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

  /**
   * Notify user's network connections about activity
   */
  private async notifyFriends(
    userId: string,
    notificationType: 'FRIEND_WORKOUT_CREATED',
    metadata: any,
  ) {
    // Get user's network connections
    const connections = await this.prisma.network.findMany({
      where: {
        OR: [
          { requesterId: userId, status: 'ACCEPTED' },
          { addresseeId: userId, status: 'ACCEPTED' },
        ],
      },
    });

    // Get friend user IDs
    const friendIds = connections.map((conn) =>
      conn.requesterId === userId ? conn.addresseeId : conn.requesterId,
    );

    if (friendIds.length === 0) return;

    // Create notifications for friends (rate-limited: max 1 per hour per friend per type)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    for (const friendId of friendIds) {
      // Check if we've already notified this friend recently
      const recentNotification = await this.prisma.notification.findFirst({
        where: {
          userId: friendId,
          type: notificationType,
          createdAt: { gte: oneHourAgo },
        },
      });

      if (!recentNotification) {
        await this.notificationsService.createNotification(
          friendId,
          notificationType,
          undefined,
        ).catch(() => {});
      }
    }
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

  async findAll(filters?: {
    search?: string;
    createdBy?: string;
    archetype?: string;
    isRecommended?: boolean;
    startDate?: Date;
    endDate?: Date;
    isHyrox?: boolean; // Filter for HYROX workouts (name contains "HYROX" or archetype is null)
  }) {
    console.log('findAll called with filters:', filters);
    
    const where: any = {};
    const andConditions: any[] = [];

    // Search by name, displayCode, or description
    if (filters?.search) {
      andConditions.push({
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { displayCode: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ],
      });
    }

    // Filter by creator
    if (filters?.createdBy) {
      andConditions.push({ createdBy: filters.createdBy });
    }

    // Filter by archetype (or null for HYROX workouts)
    if (filters?.archetype) {
      if (filters.archetype === 'HYROX') {
        // HYROX workouts have null archetype or name contains "HYROX"
        andConditions.push({
          OR: [
            { archetype: null },
            { name: { contains: 'HYROX', mode: 'insensitive' } },
          ],
        });
      } else {
        andConditions.push({ archetype: filters.archetype });
      }
    }

    // Filter specifically for HYROX workouts
    if (filters?.isHyrox === true) {
      andConditions.push({
        OR: [
          { archetype: null },
          { name: { contains: 'HYROX', mode: 'insensitive' } },
          { description: { contains: 'HYROX', mode: 'insensitive' } },
        ],
      });
    }

    // Filter by recommended status
    if (filters?.isRecommended !== undefined) {
      andConditions.push({ isRecommended: filters.isRecommended });
    }

    // Filter by date range
    if (filters?.startDate || filters?.endDate) {
      const dateFilter: any = {};
      if (filters.startDate) {
        dateFilter.gte = filters.startDate;
      }
      if (filters.endDate) {
        dateFilter.lte = filters.endDate;
      }
      andConditions.push({ createdAt: dateFilter });
    }

    // Combine all AND conditions - if no filters, where stays empty (returns all)
    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    console.log('Finding all workouts with where clause:', JSON.stringify(where, null, 2));

    const workouts = await this.prisma.workout.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            username: true,
          },
        },
        ratings: {
          select: {
            starRating: true,
          },
        },
        _count: {
          select: {
            sections: true,
            ratings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`Found ${workouts.length} workouts in database`);

    const mapped = workouts.map((workout) => {
      // Calculate average rating
      const ratingCount = workout.ratings.length;
      const averageRating = ratingCount > 0
        ? workout.ratings.reduce((sum, r) => sum + r.starRating, 0) / ratingCount
        : null;

      return {
        id: workout.id,
        name: workout.name,
        displayCode: workout.displayCode,
        archetype: workout.archetype,
        description: workout.description,
        isRecommended: workout.isRecommended,
        createdAt: workout.createdAt,
        createdBy: workout.createdBy,
        creator: workout.creator ? {
          id: workout.creator.id,
          email: workout.creator.email,
          name: workout.creator.name,
          username: workout.creator.username,
        } : null,
        sectionCount: workout._count.sections,
        averageRating,
        ratingCount,
      };
    });
    
    console.log(`Returning ${mapped.length} mapped workouts`);
    return mapped;
  }

  async toggleRecommended(id: string, isRecommended: boolean) {
    return this.prisma.workout.update({
      where: { id },
      data: { isRecommended },
    });
  }

  async findByUser(userId: string) {
    console.log('Finding workouts for user:', userId);
    
    // First, verify user exists
    const user = await this.usersService.findOne(userId);
    console.log('User exists:', !!user, user ? `email: ${user.email}` : 'not found');
    
    if (!user) {
      console.error('User not found:', userId);
      return [];
    }
    
    // Get workouts created by the user (saved workouts) - this is the primary source
    const workoutsCreatedByUser = await this.prisma.workout.findMany({
      where: { createdBy: userId },
      select: { id: true, name: true, createdBy: true },
    });

    console.log('Workouts created by user:', workoutsCreatedByUser.length, workoutsCreatedByUser.map(w => ({ id: w.id, name: w.name })));
    
    const workoutIdsFromCreated = workoutsCreatedByUser.map(w => w.id);
    
    // Also get workouts from user's sessions (workouts they've done but didn't create)
    const sessions = await this.prisma.sessionLog.findMany({
      where: { userId },
      select: { workoutId: true },
      distinct: ['workoutId'],
    });

    const workoutIdsFromSessions = sessions.map(s => s.workoutId).filter(Boolean);
    console.log('Workout IDs from sessions:', workoutIdsFromSessions);

    // Combine both sets of workout IDs (created OR done)
    const allWorkoutIds = [...new Set([...workoutIdsFromCreated, ...workoutIdsFromSessions])];
    console.log('All workout IDs to fetch:', allWorkoutIds.length, allWorkoutIds);

    if (allWorkoutIds.length === 0) {
      console.log('No workouts found for user');
      return [];
    }

    const workouts = await this.prisma.workout.findMany({
      where: { id: { in: allWorkoutIds } },
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
        ratings: {
          select: {
            starRating: true,
          },
        },
        _count: {
          select: {
            ratings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`Found ${workouts.length} workouts with full data`);

    return workouts.map((workout) => {
      // Calculate average rating
      const ratingCount = workout.ratings.length;
      const averageRating = ratingCount > 0
        ? workout.ratings.reduce((sum, r) => sum + r.starRating, 0) / ratingCount
        : null;

      return {
        ...workout,
        averageRating,
        ratingCount,
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
    });
  }

  async deleteAdmin(workoutId: string) {
    // Admin can delete any workout without permission checks
    const workout = await this.prisma.workout.findUnique({
      where: { id: workoutId },
    });

    if (!workout) {
      throw new Error('Workout not found');
    }

    // Delete the workout (cascade will handle related data)
    return this.prisma.workout.delete({
      where: { id: workoutId },
    });
  }

  async delete(userId: string, workoutId: string) {
    // Verify the workout belongs to the user
    // Check if user created it OR has a session with it
    const workout = await this.prisma.workout.findUnique({
      where: { id: workoutId },
      select: { createdBy: true },
    });

    if (!workout) {
      throw new Error('Workout not found');
    }

    // Check if user created the workout
    const isCreator = workout.createdBy === userId;

    // If not creator, check if they have a session with it
    if (!isCreator) {
      const session = await this.prisma.sessionLog.findFirst({
        where: {
          userId,
          workoutId,
        },
      });

      if (!session) {
        throw new Error('You do not have permission to delete this workout');
      }
    }

    // Delete the workout (cascade will handle related data)
    return this.prisma.workout.delete({
      where: { id: workoutId },
    });
  }

  async generateShareLink(userId: string, workoutId: string) {
    try {
      // Verify the workout exists (can be shared by anyone who can view it)
      const workout = await this.prisma.workout.findUnique({
        where: { id: workoutId },
      });

      if (!workout) {
        throw new Error('Workout not found');
      }

      // Generate or update shareId if not already set
      let shareId = workout.shareId;
      if (!shareId) {
        // Generate a unique shareId with timestamp to ensure uniqueness
        shareId = `share_${Math.random().toString(36).substring(2, 15)}_${Date.now().toString(36)}`;
        
        // Ensure uniqueness by checking if it already exists (retry if needed)
        let attempts = 0;
        while (attempts < 10) {
          const existing = await this.prisma.workout.findUnique({
            where: { shareId },
          });
          if (!existing) break;
          shareId = `share_${Math.random().toString(36).substring(2, 15)}_${Date.now().toString(36)}`;
          attempts++;
        }
        
        await this.prisma.workout.update({
          where: { id: workoutId },
          data: { shareId },
        });
      }

      // The frontend expects the share URL to be /workouts/{shareId} (not /workouts/share/{shareId})
      // because the frontend route handler checks if workoutId.startsWith('share_')
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const shareUrl = `${frontendUrl}/workouts/${shareId}`;

      return {
        shareId,
        shareUrl,
        qrCodeData: shareUrl, // For QR code generation
      };
    } catch (error: any) {
      console.error('Error generating share link:', error);
      throw new Error(error.message || 'Failed to generate share link');
    }
  }

  async getShareQR(userId: string, workoutId: string) {
    const shareData = await this.generateShareLink(userId, workoutId);
    return shareData;
  }

  async getTopRated(limit: number = 20) {
    // Get workouts with their average ratings
    const workouts = await this.prisma.workout.findMany({
      include: {
        ratings: {
          select: {
            starRating: true,
          },
        },
        sections: {
          include: {
            blocks: {
              include: {
                tierPrescriptions: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            username: true,
          },
        },
        _count: {
          select: {
            ratings: true,
            favorites: true,
          },
        },
      },
    });

    // Calculate average rating and filter
    const workoutsWithRatings = workouts
      .map((workout) => {
        if (workout.ratings.length === 0) return null;
        
        const avgRating = workout.ratings.reduce((sum, r) => sum + r.starRating, 0) / workout.ratings.length;
        return {
          ...workout,
          averageRating: avgRating,
          ratingCount: workout.ratings.length,
        };
      })
      .filter((w) => w !== null && w.ratingCount >= 1) // At least 1 rating
      .sort((a, b) => {
        // Sort by average rating (desc), then by rating count (desc)
        if (b!.averageRating !== a!.averageRating) {
          return b!.averageRating - a!.averageRating;
        }
        return b!.ratingCount - a!.ratingCount;
      })
      .slice(0, limit)
      .map((workout) => {
        // Transform to match frontend format
        const { ratings, ...rest } = workout!;
        return {
          ...rest,
          sections: rest.sections.map((section: any) => ({
            ...section,
            blocks: section.blocks.map((block: any) => ({
              ...block,
              tierSilver: block.tierPrescriptions.find((t: any) => t.tier === 'SILVER') || null,
              tierGold: block.tierPrescriptions.find((t: any) => t.tier === 'GOLD') || null,
              tierBlack: block.tierPrescriptions.find((t: any) => t.tier === 'BLACK') || null,
              tierPrescriptions: undefined,
            })),
          })),
        };
      });

    return workoutsWithRatings;
  }

  async addFavorite(userId: string, workoutId: string) {
    // Check if workout exists
    const workout = await this.prisma.workout.findUnique({
      where: { id: workoutId },
    });

    if (!workout) {
      throw new Error('Workout not found');
    }

    // Add favorite (upsert to handle duplicates)
    const favorite = await this.prisma.workoutFavorite.upsert({
      where: {
        userId_workoutId: {
          userId,
          workoutId,
        },
      },
      create: {
        userId,
        workoutId,
      },
      update: {},
    });

    return { success: true, favorite };
  }

  async removeFavorite(userId: string, workoutId: string) {
    await this.prisma.workoutFavorite.deleteMany({
      where: {
        userId,
        workoutId,
      },
    });

    return { success: true };
  }

  async getFavorites(userId: string) {
    const favorites = await this.prisma.workoutFavorite.findMany({
      where: { userId },
      include: {
        workout: {
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
            creator: {
              select: {
                id: true,
                email: true,
                name: true,
                username: true,
              },
            },
            ratings: {
              select: {
                starRating: true,
              },
            },
            _count: {
              select: {
                ratings: true,
                favorites: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mappedFavorites = favorites
      .map((favorite) => {
        const workout = favorite.workout;
        if (!workout) {
          console.warn('Favorite has no workout:', favorite.id);
          return null;
        }
        
        // Calculate average rating
        const ratingCount = workout.ratings.length;
        const averageRating = ratingCount > 0
          ? workout.ratings.reduce((sum: number, r: any) => sum + r.starRating, 0) / ratingCount
          : null;

        return {
          ...workout,
          averageRating,
          ratingCount,
          sections: workout.sections.map((section: any) => ({
            ...section,
            blocks: section.blocks.map((block: any) => ({
              ...block,
              tierSilver: block.tierPrescriptions.find((t: any) => t.tier === 'SILVER') || null,
              tierGold: block.tierPrescriptions.find((t: any) => t.tier === 'GOLD') || null,
              tierBlack: block.tierPrescriptions.find((t: any) => t.tier === 'BLACK') || null,
              tierPrescriptions: undefined,
            })),
          })),
        };
      })
      .filter((w) => w !== null); // Remove null entries

    console.log(`Returning ${mappedFavorites.length} favorite workouts for user ${userId}`);
    return mappedFavorites;
  }

  async copyWorkout(userId: string, workoutId: string, userEmail?: string) {
    // Get the original workout from database (not transformed)
    const originalWorkout = await this.prisma.workout.findUnique({
      where: { id: workoutId },
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
    
    if (!originalWorkout) {
      throw new Error('Workout not found');
    }

    // Ensure user exists
    let user = await this.usersService.findOne(userId);
    if (!user) {
      if (!userEmail) {
        throw new Error('User not found and email not provided');
      }
      await this.usersService.createFromClerk({
        id: userId,
        email: userEmail,
        role: 'HOME_USER',
        isAdmin: false,
      });
      user = await this.usersService.findOne(userId);
      if (!user) {
        throw new Error('Failed to create user');
      }
    }

    // Create a copy of the workout
    const { id, createdAt, updatedAt, shareId, programId, templateId, createdBy, sections, ...workoutData } = originalWorkout;
    
    const copiedWorkout = await this.prisma.workout.create({
      data: {
        ...workoutData,
        createdBy: userId, // Set the new owner
        name: this.generateWorkoutName(originalWorkout), // Generate unique name based on content
        sections: {
          create: sections.map((section) => ({
            title: section.title,
            type: section.type,
            order: section.order,
            durationSec: section.durationSec,
            emomWorkSec: section.emomWorkSec,
            emomRestSec: section.emomRestSec,
            emomRounds: section.emomRounds,
            intervalWorkSec: section.intervalWorkSec,
            intervalRestSec: section.intervalRestSec,
            intervalRounds: section.intervalRounds,
            rounds: section.rounds,
            restBetweenRounds: section.restBetweenRounds,
            note: section.note,
            blocks: {
              create: section.blocks.map((block) => {
                const { id, sectionId, tierPrescriptions, ...blockData } = block;
                return {
                  ...blockData,
                  tierPrescriptions: {
                    create: tierPrescriptions.map((tp) => ({
                      tier: tp.tier,
                      load: tp.load,
                      targetReps: tp.targetReps,
                      distance: tp.distance,
                      distanceUnit: tp.distanceUnit,
                      notes: tp.notes,
                    })),
                  },
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

    // Transform the response to match frontend format
    return {
      ...copiedWorkout,
      sections: copiedWorkout.sections.map((section: any) => ({
        ...section,
        blocks: section.blocks.map((block: any) => ({
          ...block,
          tierSilver: block.tierPrescriptions.find((t: any) => t.tier === 'SILVER') || null,
          tierGold: block.tierPrescriptions.find((t: any) => t.tier === 'GOLD') || null,
          tierBlack: block.tierPrescriptions.find((t: any) => t.tier === 'BLACK') || null,
          tierPrescriptions: undefined,
        })),
      })),
    };
  }

  async createRating(userId: string, workoutId: string, sessionLogId: string | null, ratingData: {
    starRating: number;
    difficultyRating?: number;
    enjoymentRating?: number;
    effectivenessRating?: number;
    wouldDoAgain?: boolean;
    tags?: string[];
    notes?: string;
    favoriteExercises?: string[];
  }) {
    // Verify workout exists
    const workout = await this.prisma.workout.findUnique({
      where: { id: workoutId },
    });

    if (!workout) {
      throw new Error('Workout not found');
    }

    // Verify session exists if provided
    if (sessionLogId) {
      const session = await this.prisma.sessionLog.findUnique({
        where: { id: sessionLogId },
      });

      if (!session || session.userId !== userId || session.workoutId !== workoutId) {
        throw new Error('Session not found or does not match workout');
      }
    }

    // Check if rating already exists for this user/workout/session
    const existingRating = await this.prisma.workoutRating.findFirst({
      where: {
        userId,
        workoutId,
        sessionLogId: sessionLogId || null,
      },
    });

    let rating;
    if (existingRating) {
      // Update existing rating
      rating = await this.prisma.workoutRating.update({
        where: { id: existingRating.id },
        data: {
          starRating: ratingData.starRating,
          difficultyRating: ratingData.difficultyRating,
          enjoymentRating: ratingData.enjoymentRating,
          effectivenessRating: ratingData.effectivenessRating,
          wouldDoAgain: ratingData.wouldDoAgain,
          tags: ratingData.tags || [],
          notes: ratingData.notes,
          favoriteExercises: ratingData.favoriteExercises || [],
        },
      });
    } else {
      // Create new rating
      rating = await this.prisma.workoutRating.create({
        data: {
          userId,
          workoutId,
          sessionLogId: sessionLogId || null,
          starRating: ratingData.starRating,
          difficultyRating: ratingData.difficultyRating,
          enjoymentRating: ratingData.enjoymentRating,
          effectivenessRating: ratingData.effectivenessRating,
          wouldDoAgain: ratingData.wouldDoAgain,
          tags: ratingData.tags || [],
          notes: ratingData.notes,
          favoriteExercises: ratingData.favoriteExercises || [],
        },
      });
    }

    // Award XP for completing review (if gamification service exists)
    try {
      await this.usersService.addXP(userId, 10); // 10 XP for completing a review
    } catch (error) {
      console.error('Failed to award XP for review:', error);
    }

    return rating;
  }

  async getRatings(workoutId: string) {
    const ratings = await this.prisma.workoutRating.findMany({
      where: { workoutId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            profile: {
              select: {
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate aggregate statistics
    const totalRatings = ratings.length;
    if (totalRatings === 0) {
      return {
        totalRatings: 0,
        averageStarRating: 0,
        averageDifficultyRating: 0,
        averageEnjoymentRating: 0,
        averageEffectivenessRating: 0,
        wouldDoAgainPercentage: 0,
        tagCounts: {},
        ratings: [],
      };
    }

    const starRatings = ratings.map(r => r.starRating).filter(Boolean);
    const difficultyRatings = ratings.map(r => r.difficultyRating).filter(Boolean);
    const enjoymentRatings = ratings.map(r => r.enjoymentRating).filter(Boolean);
    const effectivenessRatings = ratings.map(r => r.effectivenessRating).filter(Boolean);
    const wouldDoAgainCount = ratings.filter(r => r.wouldDoAgain === true).length;

    // Count tags
    const tagCounts: Record<string, number> = {};
    ratings.forEach(rating => {
      rating.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return {
      totalRatings,
      averageStarRating: starRatings.length > 0
        ? starRatings.reduce((a, b) => a + b, 0) / starRatings.length
        : 0,
      averageDifficultyRating: difficultyRatings.length > 0
        ? difficultyRatings.reduce((a, b) => a + b, 0) / difficultyRatings.length
        : 0,
      averageEnjoymentRating: enjoymentRatings.length > 0
        ? enjoymentRatings.reduce((a, b) => a + b, 0) / enjoymentRatings.length
        : 0,
      averageEffectivenessRating: effectivenessRatings.length > 0
        ? effectivenessRatings.reduce((a, b) => a + b, 0) / effectivenessRatings.length
        : 0,
      wouldDoAgainPercentage: (wouldDoAgainCount / totalRatings) * 100,
      tagCounts,
      ratings: ratings.map(r => ({
        id: r.id,
        starRating: r.starRating,
        difficultyRating: r.difficultyRating,
        enjoymentRating: r.enjoymentRating,
        effectivenessRating: r.effectivenessRating,
        wouldDoAgain: r.wouldDoAgain,
        tags: r.tags,
        notes: r.notes,
        favoriteExercises: r.favoriteExercises,
        user: r.user,
        createdAt: r.createdAt,
      })),
    };
  }

  async getUserRating(userId: string, workoutId: string) {
    const rating = await this.prisma.workoutRating.findFirst({
      where: {
        userId,
        workoutId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    return rating;
  }
}

