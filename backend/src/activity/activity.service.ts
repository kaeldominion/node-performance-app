import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityType } from '@prisma/client';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create an activity log entry
   */
  async createActivity(
    userId: string | null,
    type: ActivityType,
    message: string,
    options?: {
      entityType?: string;
      entityId?: string;
      metadata?: any;
    },
  ) {
    return this.prisma.activityLog.create({
      data: {
        userId: userId || undefined,
        type,
        message,
        entityType: options?.entityType,
        entityId: options?.entityId,
        metadata: options?.metadata || undefined,
      },
    });
  }

  /**
   * Get activity feed (paginated)
   */
  async getActivityFeed(
    options: {
      page?: number;
      limit?: number;
      userId?: string;
      type?: ActivityType;
      since?: Date;
    } = {},
  ) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 50, 100);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (options.userId) {
      where.userId = options.userId;
    }

    if (options.type) {
      where.type = options.type;
    }

    if (options.since) {
      where.createdAt = { gte: options.since };
    }

    const [activities, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
              level: true,
              xp: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get recent activity (last N items)
   */
  async getRecentActivity(limit: number = 50) {
    return this.prisma.activityLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            level: true,
            xp: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get activity statistics
   */
  async getActivityStats(days: number = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const activities = await this.prisma.activityLog.findMany({
      where: {
        createdAt: { gte: since },
      },
    });

    const stats = {
      total: activities.length,
      byType: {} as Record<string, number>,
      byDay: {} as Record<string, number>,
    };

    activities.forEach((activity) => {
      // Count by type
      stats.byType[activity.type] = (stats.byType[activity.type] || 0) + 1;

      // Count by day
      const day = activity.createdAt.toISOString().split('T')[0];
      stats.byDay[day] = (stats.byDay[day] || 0) + 1;
    });

    return stats;
  }

  /**
   * Get activity for a specific user
   */
  async getUserActivity(userId: string, limit: number = 20) {
    return this.prisma.activityLog.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            level: true,
            xp: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Clean up old activity logs (older than specified days)
   */
  async cleanupOldActivities(days: number = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const result = await this.prisma.activityLog.deleteMany({
      where: {
        createdAt: { lt: cutoff },
      },
    });

    return { deleted: result.count };
  }
}

