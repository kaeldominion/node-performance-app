import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getUserStats(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = {
      userId,
      completed: true,
    };

    if (startDate || endDate) {
      where.startedAt = {};
      if (startDate) where.startedAt.gte = startDate;
      if (endDate) where.startedAt.lte = endDate;
    }

    const sessions = await this.prisma.sessionLog.findMany({
      where,
      include: {
        workout: {
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
      orderBy: { startedAt: 'desc' },
    });

    // Calculate stats
    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((sum, s) => sum + (s.durationSec || 0), 0);
    const avgRPE = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.rpe || 0), 0) / sessions.length
      : 0;

    // Calculate volume (from metrics JSON)
    let totalVolume = 0;
    sessions.forEach((session) => {
      if (session.metrics && typeof session.metrics === 'object') {
        const metrics = session.metrics as any;
        if (metrics.volume) {
          totalVolume += Number(metrics.volume) || 0;
        }
      }
    });

    // Workout frequency
    const workoutDays = new Set(
      sessions.map((s) => s.startedAt.toISOString().split('T')[0])
    ).size;

    // Completion rate
    const allSessions = await this.prisma.sessionLog.count({
      where: { userId },
    });
    const completionRate = allSessions > 0 ? (totalSessions / allSessions) * 100 : 0;

    // RPE distribution
    const rpeDistribution = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // 1-10
    sessions.forEach((s) => {
      if (s.rpe && s.rpe >= 1 && s.rpe <= 10) {
        rpeDistribution[s.rpe - 1]++;
      }
    });

    // Archetype breakdown
    const archetypeCounts: Record<string, number> = {};
    sessions.forEach((s) => {
      if (s.workout.archetype) {
        archetypeCounts[s.workout.archetype] = (archetypeCounts[s.workout.archetype] || 0) + 1;
      }
    });

    return {
      totalSessions,
      totalDuration,
      totalDurationHours: totalDuration / 3600,
      avgRPE: Math.round(avgRPE * 10) / 10,
      totalVolume,
      workoutDays,
      completionRate: Math.round(completionRate * 10) / 10,
      rpeDistribution,
      archetypeCounts,
      sessions: sessions.slice(0, 10), // Recent sessions
    };
  }

  async getStrengthProgress(userId: string, exerciseName?: string) {
    const where: any = {
      userId,
      completed: true,
    };

    const sessions = await this.prisma.sessionLog.findMany({
      where,
      include: {
        workout: true,
      },
      orderBy: { startedAt: 'asc' },
    });

    // Extract strength metrics from session metrics JSON
    const strengthData: Array<{
      date: string;
      exercise: string;
      weight: number;
      reps: number;
      volume: number;
    }> = [];

    sessions.forEach((session) => {
      if (session.metrics && typeof session.metrics === 'object') {
        const metrics = session.metrics as any;
        if (metrics.weights && typeof metrics.weights === 'object') {
          Object.entries(metrics.weights).forEach(([exercise, weight]: [string, any]) => {
            if (exerciseName && !exercise.toLowerCase().includes(exerciseName.toLowerCase())) {
              return;
            }
            const reps = metrics.reps?.[exercise] || 0;
            strengthData.push({
              date: session.startedAt.toISOString().split('T')[0],
              exercise,
              weight: Number(weight) || 0,
              reps: Number(reps) || 0,
              volume: (Number(weight) || 0) * (Number(reps) || 0),
            });
          });
        }
      }
    });

    // Calculate PRs (Personal Records)
    const prs: Record<string, { weight: number; reps: number; date: string; volume: number }> = {};
    strengthData.forEach((data) => {
      if (!prs[data.exercise] || data.weight > prs[data.exercise].weight) {
        prs[data.exercise] = {
          weight: data.weight,
          reps: data.reps,
          date: data.date,
          volume: data.volume,
        };
      }
    });

    // Group by exercise for time series
    const exerciseGroups: Record<string, typeof strengthData> = {};
    strengthData.forEach((data) => {
      if (!exerciseGroups[data.exercise]) {
        exerciseGroups[data.exercise] = [];
      }
      exerciseGroups[data.exercise].push(data);
    });

    return {
      strengthData,
      prs,
      exerciseGroups,
    };
  }

  async getEngineProgress(userId: string) {
    const where: any = {
      userId,
      completed: true,
    };

    const sessions = await this.prisma.sessionLog.findMany({
      where,
      include: {
        workout: {
          include: {
            sections: true,
          },
        },
      },
      orderBy: { startedAt: 'asc' },
    });

    // Extract engine metrics (row, ski, bike, run times/distances)
    const engineData: Array<{
      date: string;
      type: string;
      metric: string;
      value: number;
      unit: string;
    }> = [];

    sessions.forEach((session) => {
      if (session.metrics && typeof session.metrics === 'object') {
        const metrics = session.metrics as any;
        if (metrics.times && typeof metrics.times === 'object') {
          Object.entries(metrics.times).forEach(([key, value]: [string, any]) => {
            const [type, metric] = key.split('_');
            engineData.push({
              date: session.startedAt.toISOString().split('T')[0],
              type: type || 'general',
              metric: metric || key,
              value: Number(value) || 0,
              unit: 'seconds',
            });
          });
        }
      }
    });

    // Group by type
    const typeGroups: Record<string, typeof engineData> = {};
    engineData.forEach((data) => {
      if (!typeGroups[data.type]) {
        typeGroups[data.type] = [];
      }
      typeGroups[data.type].push(data);
    });

    return {
      engineData,
      typeGroups,
    };
  }

  async getWeeklySummary(userId: string, weekStart?: Date) {
    const start = weekStart || new Date();
    start.setDate(start.getDate() - start.getDay()); // Start of week (Sunday)
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    return this.getUserStats(userId, start, end);
  }

  async getMonthlySummary(userId: string, month?: number, year?: number) {
    const now = new Date();
    const start = new Date(year || now.getFullYear(), month !== undefined ? month : now.getMonth(), 1);
    const end = new Date(year || now.getFullYear(), (month !== undefined ? month : now.getMonth()) + 1, 0);
    end.setHours(23, 59, 59, 999);

    return this.getUserStats(userId, start, end);
  }

  async getTrends(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sessions = await this.prisma.sessionLog.findMany({
      where: {
        userId,
        completed: true,
        startedAt: { gte: startDate },
      },
      orderBy: { startedAt: 'asc' },
    });

    // Group by date
    const dailyStats: Record<string, {
      date: string;
      sessions: number;
      totalDuration: number;
      avgRPE: number;
      totalVolume: number;
    }> = {};

    sessions.forEach((session) => {
      const date = session.startedAt.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          sessions: 0,
          totalDuration: 0,
          avgRPE: 0,
          totalVolume: 0,
        };
      }

      dailyStats[date].sessions++;
      dailyStats[date].totalDuration += session.durationSec || 0;
      
      if (session.rpe) {
        const currentAvg = dailyStats[date].avgRPE;
        const count = dailyStats[date].sessions;
        dailyStats[date].avgRPE = (currentAvg * (count - 1) + session.rpe) / count;
      }

      if (session.metrics && typeof session.metrics === 'object') {
        const metrics = session.metrics as any;
        if (metrics.volume) {
          dailyStats[date].totalVolume += Number(metrics.volume) || 0;
        }
      }
    });

    return {
      dailyStats: Object.values(dailyStats),
      period: { start: startDate, end: new Date() },
    };
  }

  // Leaderboard methods
  async getSystemStats() {
    // Total users
    const totalUsers = await this.prisma.user.count();
    const activeUsers = await this.prisma.user.count({
      where: {
        sessions: {
          some: {
            startedAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        },
      },
    });

    // Total workouts
    const totalWorkouts = await this.prisma.workout.count();
    const recommendedWorkouts = await this.prisma.workout.count({
      where: { isRecommended: true },
    });

    // Total sessions
    const totalSessions = await this.prisma.sessionLog.count();
    const completedSessions = await this.prisma.sessionLog.count({
      where: { completed: true },
    });
    const sessionsLast30Days = await this.prisma.sessionLog.count({
      where: {
        startedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // Total exercises
    const totalExercises = await this.prisma.exercise.count();
    const aiGeneratedExercises = await this.prisma.exercise.count({
      where: { aiGenerated: true },
    });

    // Gamification stats
    const usersWithXP = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
        level: true,
      },
      orderBy: { xp: 'desc' },
      take: 10,
    });

    const totalXP = await this.prisma.user.aggregate({
      _sum: { xp: true },
    });

    const avgLevel = await this.prisma.user.aggregate({
      _avg: { level: true },
    });

    // Recent activity (last 24 hours)
    const recentSessions = await this.prisma.sessionLog.findMany({
      where: {
        startedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        workout: {
          select: {
            id: true,
            name: true,
            archetype: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: 20,
    });

    // Workout generation stats (AI workouts)
    const aiWorkouts = await this.prisma.workout.count({
      where: {
        programId: null, // Standalone workouts (likely AI-generated)
      },
    });

    // User roles breakdown
    const roleBreakdown = await this.prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        roleBreakdown: roleBreakdown.reduce((acc, item) => {
          acc[item.role] = item._count;
          return acc;
        }, {} as Record<string, number>),
      },
      workouts: {
        total: totalWorkouts,
        recommended: recommendedWorkouts,
        aiGenerated: aiWorkouts,
      },
      sessions: {
        total: totalSessions,
        completed: completedSessions,
        completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
        last30Days: sessionsLast30Days,
      },
      exercises: {
        total: totalExercises,
        aiGenerated: aiGeneratedExercises,
      },
      gamification: {
        totalXP: totalXP._sum.xp || 0,
        avgLevel: Math.round((avgLevel._avg.level || 1) * 10) / 10,
        topUsers: usersWithXP,
      },
      recentActivity: recentSessions,
    };
  }

  async getLeaderboard(metric: 'sessions' | 'hours' | 'rpe' | 'streak' = 'sessions', limit: number = 50) {
    const users = await this.prisma.user.findMany({
      where: {
        role: { in: ['HOME_USER', 'COACH'] }, // Only show regular users and coaches
      },
      include: {
        sessions: {
          where: { completed: true },
          orderBy: { startedAt: 'desc' },
        },
      },
    });

    const leaderboardData = await Promise.all(
      users.map(async (user) => {
        const sessions = user.sessions;
        const totalSessions = sessions.length;
        const totalHours = sessions.reduce((sum, s) => sum + (s.durationSec || 0), 0) / 3600;
        const avgRPE = sessions.length > 0
          ? sessions.reduce((sum, s) => sum + (s.rpe || 0), 0) / sessions.length
          : 0;

        // Calculate streak
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < 365; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(checkDate.getDate() - i);
          const dateStr = checkDate.toISOString().split('T')[0];
          
          const hasSession = sessions.some((s) => {
            const sessionDate = new Date(s.startedAt).toISOString().split('T')[0];
            return sessionDate === dateStr;
          });
          
          if (hasSession) {
            streak++;
          } else if (i > 0) {
            break;
          }
        }

        let score = 0;
        switch (metric) {
          case 'sessions':
            score = totalSessions;
            break;
          case 'hours':
            score = totalHours;
            break;
          case 'rpe':
            score = avgRPE;
            break;
          case 'streak':
            score = streak;
            break;
        }

        return {
          userId: user.id,
          name: user.name || user.email.split('@')[0],
          email: user.email,
          totalSessions,
          totalHours: Math.round(totalHours * 10) / 10,
          avgRPE: Math.round(avgRPE * 10) / 10,
          streak,
          score,
        };
      })
    );

    // Sort by score and return top N
    return leaderboardData
      .filter((entry) => entry.score > 0) // Only include users with activity
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
  }
}
