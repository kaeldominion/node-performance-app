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

  async onModuleInit() {
    // Run auto-fix on module initialization (non-blocking)
    this.logger.log('Running database auto-fix on startup...');
    autoFixDatabase()
      .then((result) => {
        if (result.success) {
          this.logger.log('Database auto-fix completed successfully');
        } else {
          this.logger.warn(`Database auto-fix completed with errors: ${result.errors.join(', ')}`);
        }
      })
      .catch((error) => {
        this.logger.error('Database auto-fix failed:', error);
      });
  }

  async findOne(id: string) {
    try {
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
              this.logger.error(`Error enriching exercise data for ${block.exerciseName}:`, error);
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
    } catch (error: any) {
      this.logger.error(`Error fetching workout ${id}:`, error);
      
      // If it's a database schema error, try to auto-fix and retry once
      if (error.message?.includes('column') || error.message?.includes('does not exist')) {
        this.logger.warn('Database schema error detected, attempting auto-fix...');
        try {
          await autoFixDatabase();
          // Retry the query once
          return this.findOne(id);
        } catch (retryError) {
          this.logger.error('Auto-fix failed, throwing original error');
          throw error;
        }
      }
      
      throw error;
    }
  }

  async findByShareId(shareId: string) {
    try {
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

      // Same enrichment logic as findOne
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
                tierPrescriptions: undefined,
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
              this.logger.error(`Error enriching exercise data for ${block.exerciseName}:`, error);
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
    } catch (error: any) {
      this.logger.error(`Error fetching workout by shareId ${shareId}:`, error);
      
      if (error.message?.includes('column') || error.message?.includes('does not exist')) {
        this.logger.warn('Database schema error detected, attempting auto-fix...');
        try {
          await autoFixDatabase();
          return this.findByShareId(shareId);
        } catch (retryError) {
          throw error;
        }
      }
      
      throw error;
    }
  }

  async findByUser(userId: string) {
    try {
      this.logger.log('Finding workouts for user:', userId);
      
      // First, verify user exists
      const user = await this.usersService.findOne(userId);
      this.logger.log('User exists:', !!user, user ? `email: ${user.email}` : 'not found');
      
      if (!user) {
        this.logger.error('User not found:', userId);
        return [];
      }
      
      // Get workouts created by the user (saved workouts) - this is the primary source
      const workoutsCreatedByUser = await this.prisma.workout.findMany({
        where: { createdBy: userId },
        select: { id: true, name: true, createdBy: true },
      });

      this.logger.log('Workouts created by user:', workoutsCreatedByUser.length, workoutsCreatedByUser.map(w => ({ id: w.id, name: w.name })));
      
      const workoutIdsFromCreated = workoutsCreatedByUser.map(w => w.id);
      
      // Also get workouts from user's sessions (workouts they've done but didn't create)
      const sessions = await this.prisma.sessionLog.findMany({
        where: { userId },
        select: { workoutId: true },
        distinct: ['workoutId'],
      });

      const workoutIdsFromSessions = sessions.map(s => s.workoutId).filter(Boolean);
      this.logger.log('Workout IDs from sessions:', workoutIdsFromSessions);

      // Combine both sets of workout IDs (created OR done)
      const allWorkoutIds = [...new Set([...workoutIdsFromCreated, ...workoutIdsFromSessions])];
      this.logger.log('All workout IDs to fetch:', allWorkoutIds.length, allWorkoutIds);

      if (allWorkoutIds.length === 0) {
        this.logger.log('No workouts found for user');
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

      this.logger.log(`Found ${workouts.length} workouts with full data`);

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
    } catch (error: any) {
      this.logger.error(`Error fetching workouts for user ${userId}:`, error);
      
      // If it's a database schema error, try to auto-fix and retry once
      if (error.message?.includes('column') || error.message?.includes('does not exist') || error.code === 'P2021') {
        this.logger.warn('Database schema error detected, attempting auto-fix...');
        try {
          await autoFixDatabase();
          return this.findByUser(userId);
        } catch (retryError) {
          this.logger.error('Auto-fix failed, throwing original error');
          throw error;
        }
      }
      
      throw error;
    }
  }
