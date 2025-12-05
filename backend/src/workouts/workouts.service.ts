import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class WorkoutsService {
  constructor(
    private prisma: PrismaService,
    private activityService: ActivityService,
    private notificationsService: NotificationsService,
    private usersService: UsersService,
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

  async create(userId: string, createWorkoutDto: any, userEmail?: string) {
    const { sections, ...workoutData } = createWorkoutDto;

    // Ensure user exists in database (in case webhook hasn't run yet)
    let user = await this.usersService.findOne(userId);
    if (!user) {
      console.log('User not found in database, attempting to create from Clerk ID:', userId);
      if (!userEmail) {
        throw new Error('User not found in database. Please ensure you are logged in properly.');
      }
      // Create user if they don't exist (handles webhook delays)
      user = await this.usersService.createFromClerk({
        id: userId,
        email: userEmail,
        role: 'HOME_USER',
        isAdmin: false,
      });
      console.log('Created user in database:', user.id);
    }

    // Generate shareId if not provided
    const shareId = workoutData.shareId || `share_${Math.random().toString(36).substring(2, 15)}`;

    // Ensure isRecommended defaults to false if not provided
    const isRecommended = workoutData.isRecommended ?? false;

    console.log('Creating workout with userId:', userId);
    console.log('Workout name:', workoutData.name);
    console.log('User exists:', !!user);

    const workout = await this.prisma.workout.create({
      data: {
        ...workoutData,
        createdBy: userId, // Track who created/saved this workout (Clerk ID = User.id)
        shareId,
        isRecommended,
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

    // Log activity if workout was created by a user (has userId)
    if (workout.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: workout.userId },
        select: { name: true, username: true },
      });
      const userName = user?.username ? `@${user.username}` : user?.name || 'Someone';
      
      const activityLog = await this.activityService.createActivity(
        workout.userId,
        'WORKOUT_CREATED',
        `${userName} created workout: ${workout.name}`,
        {
          entityType: 'workout',
          entityId: workout.id,
          metadata: { workoutName: workout.name },
        },
      ).catch(() => null);

      // Notify friends
      await this.notifyFriends(workout.userId, 'FRIEND_WORKOUT_CREATED', {
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
        _count: {
          select: {
            sections: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`Found ${workouts.length} workouts in database`);

    const mapped = workouts.map((workout) => ({
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
    }));
    
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
    
    // Get workouts from user's sessions (workouts they've done)
    const sessions = await this.prisma.sessionLog.findMany({
      where: { userId },
      select: { workoutId: true },
      distinct: ['workoutId'],
    });

    const workoutIdsFromSessions = sessions.map(s => s.workoutId).filter(Boolean);
    console.log('Workout IDs from sessions:', workoutIdsFromSessions);

    // Get workouts created by the user (saved workouts)
    const workoutsCreatedByUser = await this.prisma.workout.findMany({
      where: { createdBy: userId },
      select: { id: true, name: true, createdBy: true },
    });

    console.log('Workouts created by user:', workoutsCreatedByUser.length, workoutsCreatedByUser);
    
    // Also check for workouts with null createdBy (created before the field was added)
    const workoutsWithNullCreatedBy = await this.prisma.workout.findMany({
      where: { createdBy: null },
      select: { id: true, name: true, createdAt: true },
      take: 5, // Just check a few
    });
    console.log('Workouts with null createdBy (sample):', workoutsWithNullCreatedBy.length);
    
    const workoutIdsFromCreated = workoutsCreatedByUser.map(w => w.id);

    // Combine both sets of workout IDs
    const allWorkoutIds = [...new Set([...workoutIdsFromSessions, ...workoutIdsFromCreated])];

    if (allWorkoutIds.length === 0) {
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

