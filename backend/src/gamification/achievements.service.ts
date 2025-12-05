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

  // Additional STREAK badges
  {
    code: 'STREAK_14',
    name: 'Two Week Warrior',
    description: 'Complete 14 days in a row',
    category: 'STREAK',
    icon: 'streak-14',
    rarity: 'RARE',
    xpReward: 75,
    check: async (userId, prisma) => {
      const streak = await calculateStreak(userId, prisma);
      return { earned: streak >= 14, value: streak };
    },
  },
  {
    code: 'STREAK_21',
    name: 'Three Week Champion',
    description: 'Complete 21 days in a row',
    category: 'STREAK',
    icon: 'streak-21',
    rarity: 'RARE',
    xpReward: 100,
    check: async (userId, prisma) => {
      const streak = await calculateStreak(userId, prisma);
      return { earned: streak >= 21, value: streak };
    },
  },
  {
    code: 'STREAK_60',
    name: 'Two Month Master',
    description: 'Complete 60 days in a row',
    category: 'STREAK',
    icon: 'streak-60',
    rarity: 'EPIC',
    xpReward: 300,
    check: async (userId, prisma) => {
      const streak = await calculateStreak(userId, prisma);
      return { earned: streak >= 60, value: streak };
    },
  },
  {
    code: 'STREAK_90',
    name: 'Quarter Year',
    description: 'Complete 90 days in a row',
    category: 'STREAK',
    icon: 'streak-90',
    rarity: 'EPIC',
    xpReward: 400,
    check: async (userId, prisma) => {
      const streak = await calculateStreak(userId, prisma);
      return { earned: streak >= 90, value: streak };
    },
  },
  {
    code: 'STREAK_180',
    name: 'Half Year Hero',
    description: 'Complete 180 days in a row',
    category: 'STREAK',
    icon: 'streak-180',
    rarity: 'LEGENDARY',
    xpReward: 1500,
    check: async (userId, prisma) => {
      const streak = await calculateStreak(userId, prisma);
      return { earned: streak >= 180, value: streak };
    },
  },
  {
    code: 'STREAK_365',
    name: 'Year of Consistency',
    description: 'Complete 365 days in a row',
    category: 'STREAK',
    icon: 'streak-365',
    rarity: 'LEGENDARY',
    xpReward: 5000,
    check: async (userId, prisma) => {
      const streak = await calculateStreak(userId, prisma);
      return { earned: streak >= 365, value: streak };
    },
  },

  // Additional VOLUME badges
  {
    code: 'SESSIONS_25',
    name: 'Regular',
    description: 'Complete 25 workouts',
    category: 'VOLUME',
    icon: 'sessions-25',
    rarity: 'COMMON',
    xpReward: 75,
    check: async (userId, prisma) => {
      const count = await prisma.sessionLog.count({
        where: { userId, completed: true },
      });
      return { earned: count >= 25, value: count };
    },
  },
  {
    code: 'SESSIONS_75',
    name: 'Committed',
    description: 'Complete 75 workouts',
    category: 'VOLUME',
    icon: 'sessions-75',
    rarity: 'RARE',
    xpReward: 200,
    check: async (userId, prisma) => {
      const count = await prisma.sessionLog.count({
        where: { userId, completed: true },
      });
      return { earned: count >= 75, value: count };
    },
  },
  {
    code: 'SESSIONS_200',
    name: 'Veteran',
    description: 'Complete 200 workouts',
    category: 'VOLUME',
    icon: 'sessions-200',
    rarity: 'EPIC',
    xpReward: 750,
    check: async (userId, prisma) => {
      const count = await prisma.sessionLog.count({
        where: { userId, completed: true },
      });
      return { earned: count >= 200, value: count };
    },
  },
  {
    code: 'SESSIONS_1000',
    name: 'Master Trainer',
    description: 'Complete 1000 workouts',
    category: 'VOLUME',
    icon: 'sessions-1000',
    rarity: 'LEGENDARY',
    xpReward: 5000,
    check: async (userId, prisma) => {
      const count = await prisma.sessionLog.count({
        where: { userId, completed: true },
      });
      return { earned: count >= 1000, value: count };
    },
  },
  {
    code: 'HOURS_10',
    name: '10 Hour Club',
    description: 'Train for 10 total hours',
    category: 'VOLUME',
    icon: 'hours-10',
    rarity: 'COMMON',
    xpReward: 50,
    check: async (userId, prisma) => {
      const sessions = await prisma.sessionLog.findMany({
        where: { userId, completed: true },
        select: { durationSec: true },
      });
      const totalHours = sessions.reduce((sum, s) => sum + (s.durationSec || 0), 0) / 3600;
      return { earned: totalHours >= 10, value: Math.round(totalHours) };
    },
  },
  {
    code: 'HOURS_50',
    name: '50 Hour Club',
    description: 'Train for 50 total hours',
    category: 'VOLUME',
    icon: 'hours-50',
    rarity: 'RARE',
    xpReward: 200,
    check: async (userId, prisma) => {
      const sessions = await prisma.sessionLog.findMany({
        where: { userId, completed: true },
        select: { durationSec: true },
      });
      const totalHours = sessions.reduce((sum, s) => sum + (s.durationSec || 0), 0) / 3600;
      return { earned: totalHours >= 50, value: Math.round(totalHours) };
    },
  },
  {
    code: 'HOURS_100',
    name: 'Century Club',
    description: 'Train for 100 total hours',
    category: 'VOLUME',
    icon: 'hours-100',
    rarity: 'EPIC',
    xpReward: 500,
    check: async (userId, prisma) => {
      const sessions = await prisma.sessionLog.findMany({
        where: { userId, completed: true },
        select: { durationSec: true },
      });
      const totalHours = sessions.reduce((sum, s) => sum + (s.durationSec || 0), 0) / 3600;
      return { earned: totalHours >= 100, value: Math.round(totalHours) };
    },
  },
  {
    code: 'HOURS_500',
    name: '500 Hour Elite',
    description: 'Train for 500 total hours',
    category: 'VOLUME',
    icon: 'hours-500',
    rarity: 'LEGENDARY',
    xpReward: 2500,
    check: async (userId, prisma) => {
      const sessions = await prisma.sessionLog.findMany({
        where: { userId, completed: true },
        select: { durationSec: true },
      });
      const totalHours = sessions.reduce((sum, s) => sum + (s.durationSec || 0), 0) / 3600;
      return { earned: totalHours >= 500, value: Math.round(totalHours) };
    },
  },

  // Additional CONSISTENCY badges
  {
    code: 'WEEKLY_GOAL_3',
    name: 'Triple Threat',
    description: 'Complete 3 workouts in a week',
    category: 'CONSISTENCY',
    icon: 'weekly-3',
    rarity: 'COMMON',
    xpReward: 20,
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
      return { earned: count >= 3, value: count };
    },
  },
  {
    code: 'WEEKLY_GOAL_5',
    name: 'Five Day Fighter',
    description: 'Complete 5 workouts in a week',
    category: 'CONSISTENCY',
    icon: 'weekly-5',
    rarity: 'RARE',
    xpReward: 50,
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
      return { earned: count >= 5, value: count };
    },
  },
  {
    code: 'WEEKLY_GOAL_6',
    name: 'Six Pack',
    description: 'Complete 6 workouts in a week',
    category: 'CONSISTENCY',
    icon: 'weekly-6',
    rarity: 'EPIC',
    xpReward: 75,
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
      return { earned: count >= 6, value: count };
    },
  },
  {
    code: 'WEEKLY_GOAL_7',
    name: 'Every Day',
    description: 'Complete 7 workouts in a week',
    category: 'CONSISTENCY',
    icon: 'weekly-7',
    rarity: 'LEGENDARY',
    xpReward: 150,
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
      return { earned: count >= 7, value: count };
    },
  },
  {
    code: 'MONTHLY_GOAL_12',
    name: 'Monthly Warrior',
    description: 'Complete 12 workouts in a month',
    category: 'CONSISTENCY',
    icon: 'monthly-12',
    rarity: 'COMMON',
    xpReward: 40,
    check: async (userId, prisma) => {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const count = await prisma.sessionLog.count({
        where: {
          userId,
          completed: true,
          completedAt: { gte: monthAgo },
        },
      });
      return { earned: count >= 12, value: count };
    },
  },
  {
    code: 'MONTHLY_GOAL_16',
    name: 'Four Per Week',
    description: 'Complete 16 workouts in a month',
    category: 'CONSISTENCY',
    icon: 'monthly-16',
    rarity: 'RARE',
    xpReward: 80,
    check: async (userId, prisma) => {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const count = await prisma.sessionLog.count({
        where: {
          userId,
          completed: true,
          completedAt: { gte: monthAgo },
        },
      });
      return { earned: count >= 16, value: count };
    },
  },
  {
    code: 'MONTHLY_GOAL_20',
    name: 'Five Per Week',
    description: 'Complete 20 workouts in a month',
    category: 'CONSISTENCY',
    icon: 'monthly-20',
    rarity: 'EPIC',
    xpReward: 150,
    check: async (userId, prisma) => {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const count = await prisma.sessionLog.count({
        where: {
          userId,
          completed: true,
          completedAt: { gte: monthAgo },
        },
      });
      return { earned: count >= 20, value: count };
    },
  },
  {
    code: 'MONTHLY_GOAL_24',
    name: 'Six Per Week',
    description: 'Complete 24 workouts in a month',
    category: 'CONSISTENCY',
    icon: 'monthly-24',
    rarity: 'LEGENDARY',
    xpReward: 300,
    check: async (userId, prisma) => {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const count = await prisma.sessionLog.count({
        where: {
          userId,
          completed: true,
          completedAt: { gte: monthAgo },
        },
      });
      return { earned: count >= 24, value: count };
    },
  },
  {
    code: 'PERFECT_WEEK',
    name: 'Perfect Week',
    description: 'Complete all scheduled workouts in a week',
    category: 'CONSISTENCY',
    icon: 'perfect-week',
    rarity: 'RARE',
    xpReward: 100,
    check: async (userId, prisma) => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      const weekEnd = new Date();
      weekEnd.setHours(23, 59, 59, 999);
      
      const scheduled = await prisma.scheduledWorkout.findMany({
        where: {
          userId,
          scheduledDate: { gte: weekAgo, lte: weekEnd },
        },
      });
      
      if (scheduled.length < 4) return { earned: false };
      
      const completed = await prisma.sessionLog.findMany({
        where: {
          userId,
          completed: true,
          completedAt: { gte: weekAgo, lte: weekEnd },
        },
      });
      
      const scheduledWorkoutIds = scheduled.map(s => s.workoutId).filter(Boolean);
      const completedWorkoutIds = completed.map(s => s.workoutId).filter(Boolean);
      const allCompleted = scheduledWorkoutIds.every(id => completedWorkoutIds.includes(id));
      
      return { earned: allCompleted && scheduled.length >= 4, value: completed.length };
    },
  },
  {
    code: 'PERFECT_MONTH',
    name: 'Perfect Month',
    description: 'Complete all scheduled workouts in a month',
    category: 'CONSISTENCY',
    icon: 'perfect-month',
    rarity: 'EPIC',
    xpReward: 400,
    check: async (userId, prisma) => {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      monthAgo.setHours(0, 0, 0, 0);
      const monthEnd = new Date();
      monthEnd.setHours(23, 59, 59, 999);
      
      const scheduled = await prisma.scheduledWorkout.findMany({
        where: {
          userId,
          scheduledDate: { gte: monthAgo, lte: monthEnd },
        },
      });
      
      if (scheduled.length < 18) return { earned: false };
      
      const completed = await prisma.sessionLog.findMany({
        where: {
          userId,
          completed: true,
          completedAt: { gte: monthAgo, lte: monthEnd },
        },
      });
      
      const scheduledWorkoutIds = scheduled.map(s => s.workoutId).filter(Boolean);
      const completedWorkoutIds = completed.map(s => s.workoutId).filter(Boolean);
      const allCompleted = scheduledWorkoutIds.every(id => completedWorkoutIds.includes(id));
      
      return { earned: allCompleted && scheduled.length >= 18, value: completed.length };
    },
  },

  // Additional INTENSITY badges
  {
    code: 'HIGH_RPE_SESSION',
    name: 'High Intensity',
    description: 'Complete a workout at RPE 9+',
    category: 'INTENSITY',
    icon: 'high-rpe-session',
    rarity: 'COMMON',
    xpReward: 25,
    check: async (userId, prisma) => {
      const sessions = await prisma.sessionLog.findMany({
        where: {
          userId,
          completed: true,
          rpe: { gte: 9 },
        },
        take: 1,
      });
      return { earned: sessions.length > 0, value: sessions[0]?.rpe || 0 };
    },
  },
  {
    code: 'HIGH_RPE_MONTH',
    name: 'Intense Month',
    description: 'Average RPE 8+ for a month',
    category: 'INTENSITY',
    icon: 'high-rpe-month',
    rarity: 'RARE',
    xpReward: 150,
    check: async (userId, prisma) => {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const sessions = await prisma.sessionLog.findMany({
        where: {
          userId,
          completed: true,
          completedAt: { gte: monthAgo },
          rpe: { not: null },
        },
        select: { rpe: true },
      });
      if (sessions.length === 0) return { earned: false };
      const avgRPE = sessions.reduce((sum, s) => sum + (s.rpe || 0), 0) / sessions.length;
      return { earned: avgRPE >= 8, value: avgRPE };
    },
  },
  {
    code: 'MAX_RPE',
    name: 'Maximum Effort',
    description: 'Complete a workout at RPE 10',
    category: 'INTENSITY',
    icon: 'max-rpe',
    rarity: 'RARE',
    xpReward: 50,
    check: async (userId, prisma) => {
      const sessions = await prisma.sessionLog.findMany({
        where: {
          userId,
          completed: true,
          rpe: 10,
        },
        take: 1,
      });
      return { earned: sessions.length > 0, value: 10 };
    },
  },
  {
    code: 'RPE_9_PLUS_WEEK',
    name: 'Brutal Week',
    description: 'Average RPE 9+ for a week',
    category: 'INTENSITY',
    icon: 'rpe-9-week',
    rarity: 'EPIC',
    xpReward: 200,
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
      return { earned: avgRPE >= 9, value: avgRPE };
    },
  },
  {
    code: 'CONSISTENT_INTENSITY',
    name: 'Steady Intensity',
    description: 'Average RPE 7+ for 30 days',
    category: 'INTENSITY',
    icon: 'consistent-intensity',
    rarity: 'RARE',
    xpReward: 100,
    check: async (userId, prisma) => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sessions = await prisma.sessionLog.findMany({
        where: {
          userId,
          completed: true,
          completedAt: { gte: thirtyDaysAgo },
          rpe: { not: null },
        },
        select: { rpe: true },
      });
      if (sessions.length < 10) return { earned: false };
      const avgRPE = sessions.reduce((sum, s) => sum + (s.rpe || 0), 0) / sessions.length;
      return { earned: avgRPE >= 7, value: avgRPE };
    },
  },
  {
    code: 'INTENSITY_MASTER',
    name: 'Intensity Master',
    description: 'Average RPE 8.5+ for 30 days',
    category: 'INTENSITY',
    icon: 'intensity-master',
    rarity: 'EPIC',
    xpReward: 300,
    check: async (userId, prisma) => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sessions = await prisma.sessionLog.findMany({
        where: {
          userId,
          completed: true,
          completedAt: { gte: thirtyDaysAgo },
          rpe: { not: null },
        },
        select: { rpe: true },
      });
      if (sessions.length < 10) return { earned: false };
      const avgRPE = sessions.reduce((sum, s) => sum + (s.rpe || 0), 0) / sessions.length;
      return { earned: avgRPE >= 8.5, value: avgRPE };
    },
  },
  {
    code: 'RPE_10_COUNT_5',
    name: 'Five Max Sessions',
    description: 'Complete 5 workouts at RPE 10',
    category: 'INTENSITY',
    icon: 'rpe-10-5',
    rarity: 'EPIC',
    xpReward: 250,
    check: async (userId, prisma) => {
      const count = await prisma.sessionLog.count({
        where: {
          userId,
          completed: true,
          rpe: 10,
        },
      });
      return { earned: count >= 5, value: count };
    },
  },
  {
    code: 'RPE_10_COUNT_10',
    name: 'Ten Max Sessions',
    description: 'Complete 10 workouts at RPE 10',
    category: 'INTENSITY',
    icon: 'rpe-10-10',
    rarity: 'LEGENDARY',
    xpReward: 500,
    check: async (userId, prisma) => {
      const count = await prisma.sessionLog.count({
        where: {
          userId,
          completed: true,
          rpe: 10,
        },
      });
      return { earned: count >= 10, value: count };
    },
  },

  // Additional MILESTONE badges
  {
    code: 'LEVEL_5',
    name: 'Getting There',
    description: 'Reach level 5',
    category: 'MILESTONE',
    icon: 'level-5',
    rarity: 'COMMON',
    xpReward: 100,
    check: async (userId, prisma) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { level: true },
      });
      return { earned: (user?.level || 0) >= 5, value: user?.level || 0 };
    },
  },
  {
    code: 'LEVEL_15',
    name: 'Rising Star',
    description: 'Reach level 15',
    category: 'MILESTONE',
    icon: 'level-15',
    rarity: 'RARE',
    xpReward: 300,
    check: async (userId, prisma) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { level: true },
      });
      return { earned: (user?.level || 0) >= 15, value: user?.level || 0 };
    },
  },
  {
    code: 'LEVEL_20',
    name: 'Advanced',
    description: 'Reach level 20',
    category: 'MILESTONE',
    icon: 'level-20',
    rarity: 'RARE',
    xpReward: 400,
    check: async (userId, prisma) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { level: true },
      });
      return { earned: (user?.level || 0) >= 20, value: user?.level || 0 };
    },
  },
  {
    code: 'LEVEL_30',
    name: 'Elite',
    description: 'Reach level 30',
    category: 'MILESTONE',
    icon: 'level-30',
    rarity: 'EPIC',
    xpReward: 750,
    check: async (userId, prisma) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { level: true },
      });
      return { earned: (user?.level || 0) >= 30, value: user?.level || 0 };
    },
  },
  {
    code: 'LEVEL_40',
    name: 'Master',
    description: 'Reach level 40',
    category: 'MILESTONE',
    icon: 'level-40',
    rarity: 'EPIC',
    xpReward: 1000,
    check: async (userId, prisma) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { level: true },
      });
      return { earned: (user?.level || 0) >= 40, value: user?.level || 0 };
    },
  },
  {
    code: 'LEVEL_75',
    name: 'Grandmaster',
    description: 'Reach level 75',
    category: 'MILESTONE',
    icon: 'level-75',
    rarity: 'LEGENDARY',
    xpReward: 3000,
    check: async (userId, prisma) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { level: true },
      });
      return { earned: (user?.level || 0) >= 75, value: user?.level || 0 };
    },
  },
  {
    code: 'LEVEL_100',
    name: 'Centurion',
    description: 'Reach level 100',
    category: 'MILESTONE',
    icon: 'level-100',
    rarity: 'LEGENDARY',
    xpReward: 5000,
    check: async (userId, prisma) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { level: true },
      });
      return { earned: (user?.level || 0) >= 100, value: user?.level || 0 };
    },
  },
  {
    code: 'FIRST_PR',
    name: 'First PR',
    description: 'Set your first personal record',
    category: 'MILESTONE',
    icon: 'first-pr',
    rarity: 'COMMON',
    xpReward: 50,
    check: async (userId, prisma) => {
      // Check if user has any PRs in their metrics
      const sessions = await prisma.sessionLog.findMany({
        where: {
          userId,
          completed: true,
          metrics: { not: null },
        },
        select: { metrics: true },
        take: 100,
      });
      
      let hasPR = false;
      for (const session of sessions) {
        if (session.metrics && typeof session.metrics === 'object') {
          const metrics = session.metrics as any;
          if (metrics.prs && Array.isArray(metrics.prs) && metrics.prs.length > 0) {
            hasPR = true;
            break;
          }
        }
      }
      
      return { earned: hasPR, value: hasPR ? 1 : 0 };
    },
  },
  {
    code: 'PR_COUNT_5',
    name: 'PR Machine',
    description: 'Set 5 personal records',
    category: 'MILESTONE',
    icon: 'pr-5',
    rarity: 'RARE',
    xpReward: 150,
    check: async (userId, prisma) => {
      const sessions = await prisma.sessionLog.findMany({
        where: {
          userId,
          completed: true,
          metrics: { not: null },
        },
        select: { metrics: true },
      });
      
      let prCount = 0;
      for (const session of sessions) {
        if (session.metrics && typeof session.metrics === 'object') {
          const metrics = session.metrics as any;
          if (metrics.prs && Array.isArray(metrics.prs)) {
            prCount += metrics.prs.length;
          }
        }
      }
      
      return { earned: prCount >= 5, value: prCount };
    },
  },
  {
    code: 'PR_COUNT_10',
    name: 'PR Master',
    description: 'Set 10 personal records',
    category: 'MILESTONE',
    icon: 'pr-10',
    rarity: 'EPIC',
    xpReward: 400,
    check: async (userId, prisma) => {
      const sessions = await prisma.sessionLog.findMany({
        where: {
          userId,
          completed: true,
          metrics: { not: null },
        },
        select: { metrics: true },
      });
      
      let prCount = 0;
      for (const session of sessions) {
        if (session.metrics && typeof session.metrics === 'object') {
          const metrics = session.metrics as any;
          if (metrics.prs && Array.isArray(metrics.prs)) {
            prCount += metrics.prs.length;
          }
        }
      }
      
      return { earned: prCount >= 10, value: prCount };
    },
  },
  {
    code: 'PR_COUNT_25',
    name: 'PR Legend',
    description: 'Set 25 personal records',
    category: 'MILESTONE',
    icon: 'pr-25',
    rarity: 'LEGENDARY',
    xpReward: 1000,
    check: async (userId, prisma) => {
      const sessions = await prisma.sessionLog.findMany({
        where: {
          userId,
          completed: true,
          metrics: { not: null },
        },
        select: { metrics: true },
      });
      
      let prCount = 0;
      for (const session of sessions) {
        if (session.metrics && typeof session.metrics === 'object') {
          const metrics = session.metrics as any;
          if (metrics.prs && Array.isArray(metrics.prs)) {
            prCount += metrics.prs.length;
          }
        }
      }
      
      return { earned: prCount >= 25, value: prCount };
    },
  },

  // Additional SPECIAL badges
  {
    code: 'TOP_10_PERCENT',
    name: 'Top 10%',
    description: 'Rank in top 10% of NØDE network',
    category: 'SPECIAL',
    icon: 'top-10',
    rarity: 'RARE',
    xpReward: 200,
    check: async (userId, prisma) => {
      // This would need analytics service integration
      return { earned: false };
    },
  },
  {
    code: 'TOP_3_PERCENT',
    name: 'Top 3%',
    description: 'Rank in top 3% of NØDE network',
    category: 'SPECIAL',
    icon: 'top-3',
    rarity: 'EPIC',
    xpReward: 500,
    check: async (userId, prisma) => {
      // This would need analytics service integration
      return { earned: false };
    },
  },
  {
    code: 'LEADERBOARD_TOP_10',
    name: 'Top 10',
    description: 'Rank in top 10 globally',
    category: 'SPECIAL',
    icon: 'leaderboard-top-10',
    rarity: 'EPIC',
    xpReward: 750,
    check: async (userId, prisma) => {
      // This would need analytics service integration
      return { earned: false };
    },
  },
  {
    code: 'LEADERBOARD_TOP_5',
    name: 'Top 5',
    description: 'Rank in top 5 globally',
    category: 'SPECIAL',
    icon: 'leaderboard-top-5',
    rarity: 'LEGENDARY',
    xpReward: 1500,
    check: async (userId, prisma) => {
      // This would need analytics service integration
      return { earned: false };
    },
  },
  {
    code: 'LEADERBOARD_1',
    name: '#1',
    description: 'Rank #1 globally',
    category: 'SPECIAL',
    icon: 'leaderboard-1',
    rarity: 'LEGENDARY',
    xpReward: 5000,
    check: async (userId, prisma) => {
      // This would need analytics service integration
      return { earned: false };
    },
  },
  {
    code: 'ARCHETYPE_MASTER',
    name: 'Archetype Master',
    description: 'Complete 10 workouts of each archetype',
    category: 'SPECIAL',
    icon: 'archetype-master',
    rarity: 'EPIC',
    xpReward: 600,
    check: async (userId, prisma) => {
      const sessions = await prisma.sessionLog.findMany({
        where: {
          userId,
          completed: true,
        },
        include: {
          workout: {
            select: { archetype: true },
          },
        },
      });
      
      const archetypeCounts: Record<string, number> = {};
      sessions.forEach(s => {
        const archetype = s.workout?.archetype;
        if (archetype) {
          archetypeCounts[archetype] = (archetypeCounts[archetype] || 0) + 1;
        }
      });
      
      const requiredArchetypes = ['PR1ME', 'FORGE', 'ENGIN3', 'CIRCUIT_X', 'CAPAC1TY', 'FLOWSTATE'];
      const allHave10 = requiredArchetypes.every(arch => (archetypeCounts[arch] || 0) >= 10);
      
      return { earned: allHave10, value: Object.values(archetypeCounts).reduce((a, b) => a + b, 0) };
    },
  },
  {
    code: 'PR1ME_SPECIALIST',
    name: 'PR1ME Specialist',
    description: 'Complete 50 PR1ME workouts',
    category: 'SPECIAL',
    icon: 'pr1me-specialist',
    rarity: 'RARE',
    xpReward: 300,
    check: async (userId, prisma) => {
      const count = await prisma.sessionLog.count({
        where: {
          userId,
          completed: true,
          workout: {
            archetype: 'PR1ME',
          },
        },
      });
      return { earned: count >= 50, value: count };
    },
  },
  {
    code: 'FORGE_SPECIALIST',
    name: 'FORGE Specialist',
    description: 'Complete 50 FORGE workouts',
    category: 'SPECIAL',
    icon: 'forge-specialist',
    rarity: 'RARE',
    xpReward: 300,
    check: async (userId, prisma) => {
      const count = await prisma.sessionLog.count({
        where: {
          userId,
          completed: true,
          workout: {
            archetype: 'FORGE',
          },
        },
      });
      return { earned: count >= 50, value: count };
    },
  },
  {
    code: 'ENGIN3_SPECIALIST',
    name: 'ENGIN3 Specialist',
    description: 'Complete 50 ENGIN3 workouts',
    category: 'SPECIAL',
    icon: 'engin3-specialist',
    rarity: 'RARE',
    xpReward: 300,
    check: async (userId, prisma) => {
      const count = await prisma.sessionLog.count({
        where: {
          userId,
          completed: true,
          workout: {
            archetype: 'ENGIN3',
          },
        },
      });
      return { earned: count >= 50, value: count };
    },
  },
  {
    code: 'CIRCUIT_X_SPECIALIST',
    name: 'CIRCUIT X Specialist',
    description: 'Complete 50 CIRCUIT X workouts',
    category: 'SPECIAL',
    icon: 'circuit-x-specialist',
    rarity: 'RARE',
    xpReward: 300,
    check: async (userId, prisma) => {
      const count = await prisma.sessionLog.count({
        where: {
          userId,
          completed: true,
          workout: {
            archetype: 'CIRCUIT_X',
          },
        },
      });
      return { earned: count >= 50, value: count };
    },
  },
  {
    code: 'EARLY_BIRD',
    name: 'Early Bird',
    description: 'Complete 10 workouts before 6am',
    category: 'SPECIAL',
    icon: 'early-bird',
    rarity: 'COMMON',
    xpReward: 50,
    check: async (userId, prisma) => {
      const sessions = await prisma.sessionLog.findMany({
        where: {
          userId,
          completed: true,
        },
        select: { startedAt: true },
      });
      
      let earlyCount = 0;
      sessions.forEach(s => {
        const hour = new Date(s.startedAt).getHours();
        if (hour < 6) earlyCount++;
      });
      
      return { earned: earlyCount >= 10, value: earlyCount };
    },
  },
  {
    code: 'NIGHT_OWL',
    name: 'Night Owl',
    description: 'Complete 10 workouts after 9pm',
    category: 'SPECIAL',
    icon: 'night-owl',
    rarity: 'COMMON',
    xpReward: 50,
    check: async (userId, prisma) => {
      const sessions = await prisma.sessionLog.findMany({
        where: {
          userId,
          completed: true,
        },
        select: { startedAt: true },
      });
      
      let nightCount = 0;
      sessions.forEach(s => {
        const hour = new Date(s.startedAt).getHours();
        if (hour >= 21) nightCount++;
      });
      
      return { earned: nightCount >= 10, value: nightCount };
    },
  },
  {
    code: 'WEEKEND_WARRIOR',
    name: 'Weekend Warrior',
    description: 'Complete 20 weekend workouts',
    category: 'SPECIAL',
    icon: 'weekend-warrior',
    rarity: 'COMMON',
    xpReward: 75,
    check: async (userId, prisma) => {
      const sessions = await prisma.sessionLog.findMany({
        where: {
          userId,
          completed: true,
        },
        select: { startedAt: true },
      });
      
      let weekendCount = 0;
      sessions.forEach(s => {
        const day = new Date(s.startedAt).getDay();
        if (day === 0 || day === 6) weekendCount++; // Sunday or Saturday
      });
      
      return { earned: weekendCount >= 20, value: weekendCount };
    },
  },
  {
    code: 'PROGRAM_COMPLETER',
    name: 'Program Finisher',
    description: 'Complete a full program',
    category: 'SPECIAL',
    icon: 'program-completer',
    rarity: 'RARE',
    xpReward: 400,
    check: async (userId, prisma) => {
      const userPrograms = await prisma.userProgram.findMany({
        where: {
          userId,
          isActive: false, // Completed programs
        },
        include: {
          program: {
            select: { durationWeeks: true },
          },
        },
      });
      
      // Check if any program was completed (reached final week)
      const hasCompleted = userPrograms.some(up => {
        const program = up.program;
        return program && program.durationWeeks && up.currentWeek >= program.durationWeeks;
      });
      
      return { earned: hasCompleted, value: userPrograms.length };
    },
  },
  {
    code: 'MULTI_PROGRAM',
    name: 'Multi-Program',
    description: 'Complete 3 different programs',
    category: 'SPECIAL',
    icon: 'multi-program',
    rarity: 'EPIC',
    xpReward: 800,
    check: async (userId, prisma) => {
      const userPrograms = await prisma.userProgram.findMany({
        where: {
          userId,
          isActive: false,
        },
        include: {
          program: {
            select: { durationWeeks: true },
          },
        },
      });
      
      const completedPrograms = userPrograms.filter(up => {
        const program = up.program;
        return program && program.durationWeeks && up.currentWeek >= program.durationWeeks;
      });
      
      const uniqueProgramIds = new Set(completedPrograms.map(up => up.programId));
      
      return { earned: uniqueProgramIds.size >= 3, value: uniqueProgramIds.size };
    },
  },

  // CONTRIBUTION badges
  {
    code: 'FIRST_REVIEW',
    name: 'First Review',
    description: 'Submit your first workout review',
    category: 'CONTRIBUTION',
    icon: 'first-review',
    rarity: 'COMMON',
    xpReward: 25,
    check: async (userId, prisma) => {
      const count = await prisma.workoutRating.count({
        where: { userId },
      });
      return { earned: count >= 1, value: count };
    },
  },
  {
    code: 'REVIEW_COUNT_5',
    name: 'Helpful Reviewer',
    description: 'Submit 5 workout reviews',
    category: 'CONTRIBUTION',
    icon: 'review-5',
    rarity: 'COMMON',
    xpReward: 50,
    check: async (userId, prisma) => {
      const count = await prisma.workoutRating.count({
        where: { userId },
      });
      return { earned: count >= 5, value: count };
    },
  },
  {
    code: 'REVIEW_COUNT_10',
    name: 'Active Contributor',
    description: 'Submit 10 workout reviews',
    category: 'CONTRIBUTION',
    icon: 'review-10',
    rarity: 'RARE',
    xpReward: 100,
    check: async (userId, prisma) => {
      const count = await prisma.workoutRating.count({
        where: { userId },
      });
      return { earned: count >= 10, value: count };
    },
  },
  {
    code: 'REVIEW_COUNT_25',
    name: 'Network Contributor',
    description: 'Submit 25 workout reviews',
    category: 'CONTRIBUTION',
    icon: 'review-25',
    rarity: 'RARE',
    xpReward: 200,
    check: async (userId, prisma) => {
      const count = await prisma.workoutRating.count({
        where: { userId },
      });
      return { earned: count >= 25, value: count };
    },
  },
  {
    code: 'REVIEW_COUNT_50',
    name: 'Community Champion',
    description: 'Submit 50 workout reviews',
    category: 'CONTRIBUTION',
    icon: 'review-50',
    rarity: 'EPIC',
    xpReward: 400,
    check: async (userId, prisma) => {
      const count = await prisma.workoutRating.count({
        where: { userId },
      });
      return { earned: count >= 50, value: count };
    },
  },
  {
    code: 'REVIEW_COUNT_100',
    name: 'Review Master',
    description: 'Submit 100 workout reviews',
    category: 'CONTRIBUTION',
    icon: 'review-100',
    rarity: 'LEGENDARY',
    xpReward: 1000,
    check: async (userId, prisma) => {
      const count = await prisma.workoutRating.count({
        where: { userId },
      });
      return { earned: count >= 100, value: count };
    },
  },
  {
    code: 'DETAILED_REVIEWER',
    name: 'Detailed Reviewer',
    description: 'Submit 10 reviews with notes/feedback',
    category: 'CONTRIBUTION',
    icon: 'detailed-reviewer',
    rarity: 'RARE',
    xpReward: 150,
    check: async (userId, prisma) => {
      const reviews = await prisma.workoutRating.findMany({
        where: {
          userId,
          notes: { not: null },
        },
      });
      return { earned: reviews.length >= 10, value: reviews.length };
    },
  },
  {
    code: 'HELPFUL_REVIEWER',
    name: 'Helpful Reviewer',
    description: 'Get 10 helpful votes on your reviews',
    category: 'CONTRIBUTION',
    icon: 'helpful-reviewer',
    rarity: 'EPIC',
    xpReward: 300,
    check: async (userId, prisma) => {
      // Note: This requires a helpful votes system which may not exist yet
      // For now, return false - can be implemented when helpful votes are added
      return { earned: false };
    },
  },
  {
    code: 'NETWORK_BUILDER',
    name: 'Network Builder',
    description: 'Add 10 users to your network',
    category: 'CONTRIBUTION',
    icon: 'network-builder',
    rarity: 'RARE',
    xpReward: 150,
    check: async (userId, prisma) => {
      const connections = await prisma.network.findMany({
        where: {
          OR: [
            { requesterId: userId },
            { addresseeId: userId },
          ],
          status: 'ACCEPTED',
        },
      });
      return { earned: connections.length >= 10, value: connections.length };
    },
  },
  {
    code: 'NETWORK_LEADER',
    name: 'Network Leader',
    description: 'Add 25 users to your network',
    category: 'CONTRIBUTION',
    icon: 'network-leader',
    rarity: 'EPIC',
    xpReward: 500,
    check: async (userId, prisma) => {
      const connections = await prisma.network.findMany({
        where: {
          OR: [
            { requesterId: userId },
            { addresseeId: userId },
          ],
          status: 'ACCEPTED',
        },
      });
      return { earned: connections.length >= 25, value: connections.length };
    },
  },
  {
    code: 'WORKOUT_SHARER',
    name: 'Workout Sharer',
    description: 'Share 10 workouts',
    category: 'CONTRIBUTION',
    icon: 'workout-sharer',
    rarity: 'COMMON',
    xpReward: 50,
    check: async (userId, prisma) => {
      // Count workouts with shareId that were created by user
      const sharedWorkouts = await prisma.workout.count({
        where: {
          createdBy: userId,
          shareId: { not: null },
        },
      });
      return { earned: sharedWorkouts >= 10, value: sharedWorkouts };
    },
  },
  {
    code: 'WORKOUT_SHARER_50',
    name: 'Content Creator',
    description: 'Share 50 workouts',
    category: 'CONTRIBUTION',
    icon: 'workout-sharer-50',
    rarity: 'RARE',
    xpReward: 200,
    check: async (userId, prisma) => {
      const sharedWorkouts = await prisma.workout.count({
        where: {
          createdBy: userId,
          shareId: { not: null },
        },
      });
      return { earned: sharedWorkouts >= 50, value: sharedWorkouts };
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

  // Group sessions by date (just track if there's a workout on that day)
  const workoutDays = new Set<string>();
  sessions.forEach(session => {
    const date = new Date(session.completedAt!);
    date.setHours(0, 0, 0, 0);
    const dateKey = date.toISOString().split('T')[0];
    workoutDays.add(dateKey);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Calculate streak working backwards from today
  let streak = 0;
  let currentDate = new Date(today);
  
  // For streaks < 7: count consecutive days with workouts
  // For streaks >= 7: each 7-day window must have at least 5 workouts (max 2 rest days)
  
  while (true) {
    const dateKey = currentDate.toISOString().split('T')[0];
    const hasWorkout = workoutDays.has(dateKey);
    
    if (streak < 7) {
      // For streaks < 7, require consecutive days with workouts
      if (hasWorkout) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        // Gap breaks the streak
        break;
      }
    } else {
      // For streaks >= 7, check if the current 7-day window meets requirements
      // The window includes the current date and the 6 days before it
      const windowStart = new Date(currentDate);
      windowStart.setDate(windowStart.getDate() - 6); // 7 days total
      
      let workoutsInWindow = 0;
      let restDaysInWindow = 0;
      
      // Count workouts and rest days in this 7-day window
      for (let d = new Date(windowStart); d <= currentDate; d.setDate(d.getDate() + 1)) {
        const dKey = d.toISOString().split('T')[0];
        if (workoutDays.has(dKey)) {
          workoutsInWindow++;
        } else {
          restDaysInWindow++;
        }
      }
      
      // Each 7-day window must have at least 5 workouts (max 2 rest days)
      if (workoutsInWindow >= 5 && restDaysInWindow <= 2) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        // This window doesn't meet requirements, streak ends
        break;
      }
    }
    
    // Safety check to prevent infinite loops
    const daysBack = Math.floor((today.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysBack > 365) break;
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
    console.log('Initializing achievements...');
    let successCount = 0;
    let errorCount = 0;
    for (const def of ACHIEVEMENT_DEFINITIONS) {
      try {
        await this.prisma.achievement.upsert({
          where: { code: def.code },
          update: {
            name: def.name,
            description: def.description,
            category: def.category,
            icon: def.icon,
            rarity: def.rarity,
            xpReward: def.xpReward,
          },
          create: {
            code: def.code,
            name: def.name,
            description: def.description,
            category: def.category,
            icon: def.icon,
            rarity: def.rarity,
            xpReward: def.xpReward,
          },
        });
        successCount++;
      } catch (error) {
        errorCount++;
        console.error(`Error initializing achievement ${def.code}:`, error);
      }
    }
    console.log(`Initialized ${ACHIEVEMENT_DEFINITIONS.length} achievements`);
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

  /**
   * Get count of achievements in database
   */
  async getAchievementCount() {
    return this.prisma.achievement.count();
  }

  /**
   * Get all available achievements with user's earned status and progress
   */
  async getAllAchievementsWithStatus(userId: string) {
    try {
      // Initialize achievements if they don't exist
      const count = await this.getAchievementCount();
      if (count === 0) {
        console.log('No achievements found, initializing...');
        await this.initializeAchievements();
      }

      // Get all achievements
      const allAchievements = await this.prisma.achievement.findMany({
        orderBy: [
          { rarity: 'asc' }, // COMMON, RARE, EPIC, LEGENDARY
          { category: 'asc' },
          { name: 'asc' },
        ],
      });

      console.log(`Found ${allAchievements.length} achievements in database`);

      if (allAchievements.length === 0) {
        // If still empty after initialization, return empty array
        return [];
      }

      // Get user's earned achievements
      const userAchievements = await this.prisma.userAchievement.findMany({
        where: { userId },
        include: {
          achievement: true,
        },
      });

      const earnedMap = new Map(
        userAchievements.map((ua) => [ua.achievementId, ua])
      );

      // Combine with earned status and calculate progress
      const results = await Promise.all(
        allAchievements.map(async (achievement) => {
          const userAchievement = earnedMap.get(achievement.id);
          const isEarned = !!userAchievement;
          
          // Calculate progress for unearned achievements
          let progress = isEarned ? 100 : 0;
          let currentValue: any = null;
          if (userAchievement?.metadata) {
            const metadata = userAchievement.metadata as any;
            currentValue = metadata?.value || null;
          }
          
          if (!isEarned) {
            // Run the check function to get current value
            const achievementDef = ACHIEVEMENT_DEFINITIONS.find(def => def.code === achievement.code);
            if (achievementDef) {
              try {
                const checkResult = await achievementDef.check(userId, this.prisma);
                currentValue = checkResult.value || null;
                
                // Calculate progress based on achievement type
                progress = this.calculateProgress(achievement.code, currentValue);
              } catch (error) {
                console.error(`Error calculating progress for ${achievement.code}:`, error);
                // Don't fail the whole request if one achievement fails
                progress = 0;
              }
            }
          }
          
          return {
            ...achievement,
            earned: isEarned,
            earnedAt: userAchievement?.earnedAt || null,
            value: currentValue,
            progress: progress || 0,
          };
        })
      );

      return results;
    } catch (error) {
      console.error('Error in getAllAchievementsWithStatus:', error);
      // Return empty array on error rather than throwing
      return [];
    }
  }

  /**
   * Calculate progress percentage for an achievement based on its code and current value
   */
  private calculateProgress(code: string, currentValue: any): number {
    if (!currentValue || currentValue === 0) return 0;

    // Extract target from code
    const codeLower = code.toLowerCase();
    
    // Streak achievements
    if (codeLower.startsWith('streak_')) {
      const target = parseInt(codeLower.replace('streak_', ''));
      if (target && typeof currentValue === 'number') {
        return Math.min(100, Math.round((currentValue / target) * 100));
      }
    }
    
    // Session count achievements
    if (codeLower.startsWith('sessions_')) {
      const target = parseInt(codeLower.replace('sessions_', ''));
      if (target && typeof currentValue === 'number') {
        return Math.min(100, Math.round((currentValue / target) * 100));
      }
    }
    
    // Hours achievements
    if (codeLower.startsWith('hours_')) {
      const target = parseInt(codeLower.replace('hours_', ''));
      if (target && typeof currentValue === 'number') {
        return Math.min(100, Math.round((currentValue / target) * 100));
      }
    }
    
    // Weekly goals
    if (codeLower.startsWith('weekly_goal_')) {
      const target = parseInt(codeLower.replace('weekly_goal_', ''));
      if (target && typeof currentValue === 'number') {
        return Math.min(100, Math.round((currentValue / target) * 100));
      }
    }
    
    // Monthly goals
    if (codeLower.startsWith('monthly_goal_')) {
      const target = parseInt(codeLower.replace('monthly_goal_', ''));
      if (target && typeof currentValue === 'number') {
        return Math.min(100, Math.round((currentValue / target) * 100));
      }
    }
    
    // Level achievements
    if (codeLower.startsWith('level_')) {
      const target = parseInt(codeLower.replace('level_', ''));
      if (target && typeof currentValue === 'number') {
        return Math.min(100, Math.round((currentValue / target) * 100));
      }
    }
    
    // PR count achievements
    if (codeLower.startsWith('pr_count_')) {
      const target = parseInt(codeLower.replace('pr_count_', ''));
      if (target && typeof currentValue === 'number') {
        return Math.min(100, Math.round((currentValue / target) * 100));
      }
    }
    
    // Review count achievements
    if (codeLower.startsWith('review_count_') || codeLower.startsWith('review-')) {
      const match = codeLower.match(/review[_-]?count[_-]?(\d+)/);
      if (match) {
        const target = parseInt(match[1]);
        if (target && typeof currentValue === 'number') {
          return Math.min(100, Math.round((currentValue / target) * 100));
        }
      }
    }
    
    // Network achievements
    if (codeLower.includes('network_builder') || codeLower.includes('network-leader')) {
      const match = codeLower.match(/network[_-]?(builder|leader)/);
      if (match) {
        // Network builder: 10, Network leader: 25
        const target = codeLower.includes('leader') ? 25 : 10;
        if (typeof currentValue === 'number') {
          return Math.min(100, Math.round((currentValue / target) * 100));
        }
      }
    }
    
    // Workout sharer achievements
    if (codeLower.includes('workout_sharer') || codeLower.includes('workout-sharer')) {
      const match = codeLower.match(/workout[_-]?sharer[_-]?(\d+)/);
      if (match) {
        const target = parseInt(match[1]);
        if (target && typeof currentValue === 'number') {
          return Math.min(100, Math.round((currentValue / target) * 100));
        }
      } else if (codeLower.includes('workout_sharer') && !codeLower.includes('50')) {
        // Default workout sharer is 10
        if (typeof currentValue === 'number') {
          return Math.min(100, Math.round((currentValue / 10) * 100));
        }
      }
    }
    
    // RPE count achievements
    if (codeLower.includes('rpe_10') || codeLower.includes('rpe-10')) {
      const match = codeLower.match(/rpe[_-]?10[_-]?(count[_-]?)?(\d+)/);
      if (match) {
        const target = parseInt(match[2] || match[1]);
        if (target && typeof currentValue === 'number') {
          return Math.min(100, Math.round((currentValue / target) * 100));
        }
      }
    }
    
    // Specialist achievements (50 workouts)
    if (codeLower.includes('specialist')) {
      if (typeof currentValue === 'number') {
        return Math.min(100, Math.round((currentValue / 50) * 100));
      }
    }
    
    // For achievements without clear numeric targets, return 0
    return 0;
  }
}

