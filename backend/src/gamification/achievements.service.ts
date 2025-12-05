import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AchievementCategory } from '@prisma/client';

export interface AchievementDefinition {
  code: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  xpReward: number;
  check: (userId: string, prisma: PrismaService) => Promise<{ earned: boolean; value?: any }>;
  metadata?: any;
}

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // Streak Achievements
  {
    code: 'STREAK_3',
    name: 'On Fire',
    description: 'Complete 3 days in a row',
    category: 'STREAK',
    icon: 'flame',
    rarity: 'COMMON',
    xpReward: 25,
    check: async (userId, prisma) => {
      const streak = await calculateStreak(userId, prisma);
      return { earned: streak >= 3, value: streak };
    },
  },
  {
    code: 'STREAK_7',
    name: 'Streak Master',
    description: 'Complete 7 days in a row',
    category: 'STREAK',
    icon: 'streak-7',
    rarity: 'RARE',
    xpReward: 50,
    check: async (userId, prisma) => {
      const streak = await calculateStreak(userId, prisma);
      return { earned: streak >= 7, value: streak };
    },
  },
  {
    code: 'STREAK_30',
    name: 'Unstoppable',
    description: 'Complete 30 days in a row',
    category: 'STREAK',
    icon: 'streak-30',
    rarity: 'EPIC',
    xpReward: 200,
    check: async (userId, prisma) => {
      const streak = await calculateStreak(userId, prisma);
      return { earned: streak >= 30, value: streak };
    },
  },
  {
    code: 'STREAK_100',
    name: 'Legendary Consistency',
    description: 'Complete 100 days in a row',
    category: 'STREAK',
    icon: 'streak-100',
    rarity: 'LEGENDARY',
    xpReward: 1000,
    check: async (userId, prisma) => {
      const streak = await calculateStreak(userId, prisma);
      return { earned: streak >= 100, value: streak };
    },
  },
  
  // Volume Achievements
  {
    code: 'SESSIONS_10',
    name: 'Getting Started',
    description: 'Complete 10 workouts',
    category: 'VOLUME',
    icon: 'sessions-10',
    rarity: 'COMMON',
    xpReward: 50,
    check: async (userId, prisma) => {
      const count = await prisma.sessionLog.count({
        where: { userId, completed: true },
      });
      return { earned: count >= 10, value: count };
    },
  },
  {
    code: 'SESSIONS_50',
    name: 'Dedicated',
    description: 'Complete 50 workouts',
    category: 'VOLUME',
    icon: 'sessions-50',
    rarity: 'RARE',
    xpReward: 150,
    check: async (userId, prisma) => {
      const count = await prisma.sessionLog.count({
        where: { userId, completed: true },
      });
      return { earned: count >= 50, value: count };
    },
  },
  {
    code: 'SESSIONS_100',
    name: 'Centurion',
    description: 'Complete 100 workouts',
    category: 'VOLUME',
    icon: 'sessions-100',
    rarity: 'EPIC',
    xpReward: 500,
    check: async (userId, prisma) => {
      const count = await prisma.sessionLog.count({
        where: { userId, completed: true },
      });
      return { earned: count >= 100, value: count };
    },
  },
  {
    code: 'SESSIONS_500',
    name: 'Training Machine',
    description: 'Complete 500 workouts',
    category: 'VOLUME',
    icon: 'sessions-500',
    rarity: 'LEGENDARY',
    xpReward: 2500,
    check: async (userId, prisma) => {
      const count = await prisma.sessionLog.count({
        where: { userId, completed: true },
      });
      return { earned: count >= 500, value: count };
    },
  },
  
  // Consistency Achievements
  {
    code: 'WEEKLY_GOAL_4',
    name: 'Weekly Warrior',
    description: 'Complete 4 workouts in a week',
    category: 'CONSISTENCY',
    icon: 'weekly-4',
    rarity: 'COMMON',
    xpReward: 30,
    check: async (userId, prisma) => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const count = await prisma.sessionLog.count({
        where: {
          userId,
          completed: true,
          completedAt: { gte: weekAgo },
        },
      });
      return { earned: count >= 4, value: count };
    },
  },
  {
    code: 'TOP_5_PERCENT',
    name: 'Top 5%',
    description: 'Rank in top 5% of NØDE network',
    category: 'SPECIAL',
    icon: 'top-5',
    rarity: 'EPIC',
    xpReward: 300,
    check: async (userId, prisma) => {
      // This would need to check analytics percentiles
      // For now, placeholder
      return { earned: false };
    },
  },
  {
    code: 'TOP_1_PERCENT',
    name: 'Elite',
    description: 'Rank in top 1% of NØDE network',
    category: 'SPECIAL',
    icon: 'top-1',
    rarity: 'LEGENDARY',
    xpReward: 1000,
    check: async (userId, prisma) => {
      // This would need to check analytics percentiles
      return { earned: false };
    },
  },
  
  // Intensity Achievements
  {
    code: 'HIGH_RPE_WEEK',
    name: 'Intensity Master',
    description: 'Average RPE of 8+ for a week',
    category: 'INTENSITY',
    icon: 'intensity',
    rarity: 'RARE',
    xpReward: 100,
    check: async (userId, prisma) => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const sessions = await prisma.sessionLog.findMany({
        where: {
          userId,
          completed: true,
          completedAt: { gte: weekAgo },
          rpe: { not: null },
        },
        select: { rpe: true },
      });
      if (sessions.length === 0) return { earned: false };
      const avgRPE = sessions.reduce((sum, s) => sum + (s.rpe || 0), 0) / sessions.length;
      return { earned: avgRPE >= 8, value: avgRPE };
    },
  },
  
  // Milestone Achievements
  {
    code: 'FIRST_WORKOUT',
    name: 'First Steps',
    description: 'Complete your first workout',
    category: 'MILESTONE',
    icon: 'first-workout',
    rarity: 'COMMON',
    xpReward: 50,
    check: async (userId, prisma) => {
      const count = await prisma.sessionLog.count({
        where: { userId, completed: true },
      });
      return { earned: count >= 1, value: count };
    },
  },
  {
    code: 'LEVEL_10',
    name: 'Established',
    description: 'Reach level 10',
    category: 'MILESTONE',
    icon: 'level-10',
    rarity: 'RARE',
    xpReward: 200,
    check: async (userId, prisma) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { level: true },
      });
      return { earned: (user?.level || 0) >= 10, value: user?.level || 0 };
    },
  },
  {
    code: 'LEVEL_25',
    name: 'Expert',
    description: 'Reach level 25',
    category: 'MILESTONE',
    icon: 'level-25',
    rarity: 'EPIC',
    xpReward: 500,
    check: async (userId, prisma) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { level: true },
      });
      return { earned: (user?.level || 0) >= 25, value: user?.level || 0 };
    },
  },
  {
    code: 'LEVEL_50',
    name: 'Titan',
    description: 'Reach level 50',
    category: 'MILESTONE',
    icon: 'level-50',
    rarity: 'LEGENDARY',
    xpReward: 2000,
    check: async (userId, prisma) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { level: true },
      });
      return { earned: (user?.level || 0) >= 50, value: user?.level || 0 };
    },
  },
];

async function calculateStreak(userId: string, prisma: PrismaService): Promise<number> {
  const sessions = await prisma.sessionLog.findMany({
    where: {
      userId,
      completed: true,
      completedAt: { not: null },
    },
    orderBy: { completedAt: 'desc' },
    take: 365,
  });

  if (sessions.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sessions.length; i++) {
    const sessionDate = new Date(sessions[i].completedAt!);
    sessionDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === i) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

@Injectable()
export class AchievementsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Initialize achievements in database
   */
  async initializeAchievements() {
    for (const def of ACHIEVEMENT_DEFINITIONS) {
      await this.prisma.achievement.upsert({
        where: { code: def.code },
        update: {
          name: def.name,
          description: def.description,
          category: def.category,
          icon: def.icon,
          rarity: def.rarity,
          xpReward: def.xpReward,
          metadata: def.metadata || {},
        },
        create: {
          code: def.code,
          name: def.name,
          description: def.description,
          category: def.category,
          icon: def.icon,
          rarity: def.rarity,
          xpReward: def.xpReward,
          metadata: def.metadata || {},
        },
      });
    }
  }

  /**
   * Check and award achievements for a user
   */
  async checkAchievements(userId: string): Promise<Array<{ achievement: any; newlyEarned: boolean }>> {
    const results = [];
    
    for (const def of ACHIEVEMENT_DEFINITIONS) {
      const checkResult = await def.check(userId, this.prisma);
      
      if (checkResult.earned) {
        // Get or create achievement
        let achievement = await this.prisma.achievement.findUnique({
          where: { code: def.code },
        });
        
        if (!achievement) {
          achievement = await this.prisma.achievement.create({
            data: {
              code: def.code,
              name: def.name,
              description: def.description,
              category: def.category,
              icon: def.icon,
              rarity: def.rarity,
              xpReward: def.xpReward,
              metadata: def.metadata || {},
            },
          });
        }
        
        // Check if user already has this achievement
        const existing = await this.prisma.userAchievement.findUnique({
          where: {
            userId_achievementId: {
              userId,
              achievementId: achievement.id,
            },
          },
        });
        
        if (!existing) {
          // Award achievement
          await this.prisma.userAchievement.create({
            data: {
              userId,
              achievementId: achievement.id,
              metadata: { value: checkResult.value },
            },
          });
          
          results.push({ achievement, newlyEarned: true });
        } else {
          results.push({ achievement, newlyEarned: false });
        }
      }
    }
    
    return results;
  }

  /**
   * Get user's achievements
   */
  async getUserAchievements(userId: string) {
    return this.prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: { earnedAt: 'desc' },
    });
  }

  /**
   * Get newly earned achievements (for notifications)
   */
  async getNewAchievements(userId: string, since: Date) {
    return this.prisma.userAchievement.findMany({
      where: {
        userId,
        earnedAt: { gte: since },
      },
      include: {
        achievement: true,
      },
      orderBy: { earnedAt: 'desc' },
    });
  }
}

