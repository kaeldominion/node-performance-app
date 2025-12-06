import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

// Level thresholds - early levels are easy, later ones are extremely difficult
// Formula: exponential growth with early levels being very achievable
const LEVEL_THRESHOLDS: number[] = [
  0,      // Level 1 (starting level)
  10,     // Level 2 - Very easy (first workout)
  25,     // Level 3 - Easy (2-3 workouts)
  50,     // Level 4 - Easy (5 workouts)
  100,    // Level 5 - Easy (10 workouts)
  200,    // Level 6 - Moderate (20 workouts)
  350,    // Level 7 - Moderate (35 workouts)
  550,    // Level 8 - Moderate (55 workouts)
  800,    // Level 9 - Moderate-Hard (80 workouts)
  1100,   // Level 10 - Hard (110 workouts)
  1500,   // Level 11
  2000,   // Level 12
  2600,   // Level 13
  3300,   // Level 14
  4100,   // Level 15
  5000,   // Level 16
  6000,   // Level 17
  7200,   // Level 18
  8600,   // Level 19
  10200,  // Level 20
  12000,  // Level 21
  14000,  // Level 22
  16200,  // Level 23
  18600,  // Level 24
  21200,  // Level 25
  24000,  // Level 26
  27000,  // Level 27
  30200,  // Level 28
  33600,  // Level 29
  37200,  // Level 30
  41000,  // Level 31
  45000,  // Level 32
  49200,  // Level 33
  53600,  // Level 34
  58200,  // Level 35
  63000,  // Level 36
  68000,  // Level 37
  73200,  // Level 38
  78600,  // Level 39
  84200,  // Level 40
  90000,  // Level 41
  96000,  // Level 42
  102200, // Level 43
  108600, // Level 44
  115200, // Level 45
  122000, // Level 46
  129000, // Level 47
  136200, // Level 48
  143600, // Level 49
  151200, // Level 50
  159000, // Level 51
  167000, // Level 52
  175200, // Level 53
  183600, // Level 54
  192200, // Level 55
  201000, // Level 56
  210000, // Level 57
  220200, // Level 58
  230600, // Level 59
  241200, // Level 60
  252000, // Level 61
  263000, // Level 62
  274200, // Level 63
  285600, // Level 64
  297200, // Level 65
  309000, // Level 66
  321000, // Level 67
  333200, // Level 68
  345600, // Level 69
  358200, // Level 70
  371000, // Level 71
  384000, // Level 72
  397200, // Level 73
  410600, // Level 74
  424200, // Level 75
  438000, // Level 76
  452000, // Level 77
  466200, // Level 78
  480600, // Level 79
  495200, // Level 80
  510000, // Level 81
  525000, // Level 82
  540200, // Level 83
  555600, // Level 84
  571200, // Level 85
  587000, // Level 86
  603000, // Level 87
  619200, // Level 88
  635600, // Level 89
  652200, // Level 90
  669000, // Level 91
  686000, // Level 92
  703200, // Level 93
  720600, // Level 94
  738200, // Level 95
  756000, // Level 96
  774000, // Level 97
  792200, // Level 98
  810600, // Level 99
  829200, // Level 100 - Extremely difficult (hundreds/thousands of workouts)
];

// Level names - A meaningful progression that makes users feel accomplished
// Organized in tiers that represent a journey from beginner to elite
const LEVEL_NAMES: Record<number, string> = {
  // TIER 1: Foundation (Levels 1-10) - Building the base
  1: 'Initiate',
  2: 'Novice',
  3: 'Trainee',
  4: 'Apprentice',
  5: 'Aspiring',
  6: 'Dedicated',
  7: 'Committed',
  8: 'Disciplined',
  9: 'Focused',
  10: 'Established',
  
  // TIER 2: Growth (Levels 11-20) - Developing strength
  11: 'Rising',
  12: 'Emerging',
  13: 'Advancing',
  14: 'Progressing',
  15: 'Evolving',
  16: 'Developing',
  17: 'Strengthening',
  18: 'Improving',
  19: 'Refining',
  20: 'Accomplished',
  
  // TIER 3: Competence (Levels 21-30) - Becoming skilled
  21: 'Capable',
  22: 'Proficient',
  23: 'Skilled',
  24: 'Experienced',
  25: 'Competent',
  26: 'Qualified',
  27: 'Adept',
  28: 'Expert',
  29: 'Masterful',
  30: 'Elite',
  
  // TIER 4: Excellence (Levels 31-40) - Standing out
  31: 'Distinguished',
  32: 'Exceptional',
  33: 'Outstanding',
  34: 'Remarkable',
  35: 'Notable',
  36: 'Prestigious',
  37: 'Renowned',
  38: 'Illustrious',
  39: 'Eminent',
  40: 'Venerated',
  
  // TIER 5: Mastery (Levels 41-50) - Reaching mastery
  41: 'Veteran',
  42: 'Champion',
  43: 'Legend',
  44: 'Icon',
  45: 'Titan',
  46: 'Colossus',
  47: 'Behemoth',
  48: 'Juggernaut',
  49: 'Titanium',
  50: 'Unstoppable',
  
  // TIER 6: Transcendence (Levels 51-60) - Beyond normal limits
  51: 'Transcendent',
  52: 'Supreme',
  53: 'Paramount',
  54: 'Pinnacle',
  55: 'Apex',
  56: 'Zenith',
  57: 'Summit',
  58: 'Peak',
  59: 'Crest',
  60: 'Crown',
  
  // TIER 7: Immortality (Levels 61-70) - Legendary status
  61: 'Immortal',
  62: 'Eternal',
  63: 'Timeless',
  64: 'Perpetual',
  65: 'Infinite',
  66: 'Boundless',
  67: 'Limitless',
  68: 'Unlimited',
  69: 'Absolute',
  70: 'Ultimate',
  
  // TIER 8: Deity (Levels 71-80) - God-like status
  71: 'Divine',
  72: 'Celestial',
  73: 'Ethereal',
  74: 'Transcendental',
  75: 'Mythical',
  76: 'Legendary',
  77: 'Fabled',
  78: 'Immortalized',
  79: 'Deified',
  80: 'Ascended',
  
  // TIER 9: Dominion (Levels 81-90) - Ruling the domain
  81: 'Sovereign',
  82: 'Monarch',
  83: 'Emperor',
  84: 'Ruler',
  85: 'Commander',
  86: 'Conqueror',
  87: 'Dominator',
  88: 'Overlord',
  89: 'Supremacy',
  90: 'Dominion',
  
  // TIER 10: Absolute Power (Levels 91-100) - The ultimate
  91: 'Omnipotent',
  92: 'Omniscient',
  93: 'Omnipresent',
  94: 'Almighty',
  95: 'All-Powerful',
  96: 'Invincible',
  97: 'Unconquerable',
  98: 'Unbeatable',
  99: 'Unrivaled',
  100: 'DOMINUS',
};

export function getLevelName(level: number): string {
  return LEVEL_NAMES[level] || `Level ${level}`;
}

// XP rewards for different actions
export const XP_REWARDS = {
  COMPLETE_WORKOUT: 10,        // Base XP for completing a workout
  COMPLETE_SESSION: 5,          // XP for logging a session
  STREAK_DAY: 5,               // Bonus XP per day in streak
  STREAK_WEEK: 25,             // Bonus XP for 7-day streak
  STREAK_MONTH: 100,           // Bonus XP for 30-day streak
  FIRST_WORKOUT: 50,           // Bonus for first workout ever
  WEEKLY_GOAL: 20,             // Bonus for hitting weekly workout goal
  PROGRAM_COMPLETE: 100,       // Bonus for completing a full program
  HYROX_WORKOUT: 15,           // Bonus for HYROX-style workouts (longer)
  PR_PERSONAL_RECORD: 25,      // Bonus for setting a PR
  SHARE_WORKOUT: 5,            // Bonus for sharing a workout
};

@Injectable()
export class GamificationService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  /**
   * Calculate level from XP
   */
  calculateLevel(xp: number): number {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 1; i--) {
      if (xp >= LEVEL_THRESHOLDS[i]) {
        return i;
      }
    }
    return 1;
  }

  /**
   * Get XP required for next level
   */
  getXPForNextLevel(currentLevel: number): number {
    if (currentLevel >= LEVEL_THRESHOLDS.length - 1) {
      return null; // Max level reached
    }
    return LEVEL_THRESHOLDS[currentLevel + 1];
  }

  /**
   * Get XP progress to next level
   */
  getXPProgress(currentXP: number, currentLevel: number): {
    current: number;
    next: number;
    progress: number; // 0-1
  } {
    const nextLevelXP = this.getXPForNextLevel(currentLevel);
    if (!nextLevelXP) {
      return { current: currentXP, next: currentXP, progress: 1 };
    }
    
    const currentLevelXP = LEVEL_THRESHOLDS[currentLevel];
    const progress = (currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP);
    
    return {
      current: currentXP - currentLevelXP,
      next: nextLevelXP - currentLevelXP,
      progress: Math.min(1, Math.max(0, progress)),
    };
  }

  /**
   * Award XP to a user and check for level up
   */
  async awardXP(
    userId: string,
    amount: number,
    reason: string,
  ): Promise<{ xp: number; level: number; leveledUp: boolean; newLevel?: number }> {
    let user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true },
    });

    // If user doesn't exist, try to create from Clerk (handles webhook delays)
    if (!user) {
      try {
        const { clerkClient } = require('@clerk/clerk-sdk-node');
        const clerkUser = await clerkClient.users.getUser(userId);
        const email = clerkUser.emailAddresses?.[0]?.emailAddress;
        if (email) {
          await this.usersService.createFromClerk({
            id: userId,
            email,
            name: clerkUser.firstName && clerkUser.lastName 
              ? `${clerkUser.firstName} ${clerkUser.lastName}` 
              : clerkUser.firstName || clerkUser.lastName || null,
            role: (clerkUser.publicMetadata?.role as string) || 'HOME_USER',
            isAdmin: (clerkUser.publicMetadata?.isAdmin as boolean) || false,
          });
          // Fetch again
          user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { xp: true, level: true },
          });
        }
      } catch (error) {
        console.error('Failed to create user from Clerk in addXP:', error);
      }
    }

    if (!user) {
      throw new Error('User not found');
    }

    const newXP = user.xp + amount;
    const newLevel = this.calculateLevel(newXP);
    const leveledUp = newLevel > user.level;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXP,
        level: newLevel,
      },
    });

    return {
      xp: newXP,
      level: newLevel,
      leveledUp,
      newLevel: leveledUp ? newLevel : undefined,
    };
  }

  /**
   * Calculate XP for completing a workout
   */
  async calculateWorkoutXP(
    userId: string,
    workout: any,
    sessionData: { completed: boolean; rpe?: number; durationSec?: number },
  ): Promise<number> {
    let xp = XP_REWARDS.COMPLETE_WORKOUT;

    // Check if this is their first workout
    const sessionCount = await this.prisma.sessionLog.count({
      where: { userId, completed: true },
    });

    if (sessionCount === 0) {
      xp += XP_REWARDS.FIRST_WORKOUT;
    }

    // Bonus for HYROX-style workouts (longer duration)
    if (workout.archetype === 'CAPAC1TY' || (sessionData.durationSec && sessionData.durationSec > 3600)) {
      xp += XP_REWARDS.HYROX_WORKOUT;
    }

    // Bonus for high RPE (shows effort)
    if (sessionData.rpe && sessionData.rpe >= 9) {
      xp += 5; // Extra XP for high intensity
    }

    return xp;
  }

  /**
   * Calculate streak bonus XP
   */
  async calculateStreakXP(userId: string): Promise<number> {
    const sessions = await this.prisma.sessionLog.findMany({
      where: {
        userId,
        completed: true,
        completedAt: { not: null },
      },
      orderBy: { completedAt: 'desc' },
      take: 30, // Check last 30 sessions
    });

    if (sessions.length === 0) return 0;

    // Calculate current streak (consecutive days)
    let streakDays = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sessions.length; i++) {
      const sessionDate = new Date(sessions[i].completedAt);
      sessionDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i) {
        streakDays++;
      } else {
        break;
      }
    }

    let streakXP = 0;
    if (streakDays >= 30) {
      streakXP += XP_REWARDS.STREAK_MONTH;
    } else if (streakDays >= 7) {
      streakXP += XP_REWARDS.STREAK_WEEK;
    } else if (streakDays > 0) {
      streakXP += streakDays * XP_REWARDS.STREAK_DAY;
    }

    return streakXP;
  }

  /**
   * Get user's gamification stats
   */
  async getUserStats(userId: string) {
    let user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true },
    });

    // If user doesn't exist, try to create from Clerk (handles webhook delays)
    if (!user) {
      try {
        const { clerkClient } = require('@clerk/clerk-sdk-node');
        const clerkUser = await clerkClient.users.getUser(userId);
        const email = clerkUser.emailAddresses?.[0]?.emailAddress;
        if (email) {
          await this.usersService.createFromClerk({
            id: userId,
            email,
            name: clerkUser.firstName && clerkUser.lastName 
              ? `${clerkUser.firstName} ${clerkUser.lastName}` 
              : clerkUser.firstName || clerkUser.lastName || null,
            role: (clerkUser.publicMetadata?.role as string) || 'HOME_USER',
            isAdmin: (clerkUser.publicMetadata?.isAdmin as boolean) || false,
          });
          // Fetch again
          user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { xp: true, level: true },
          });
        }
      } catch (error) {
        console.error('Failed to create user from Clerk in getUserStats:', error);
      }
    }

    if (!user) {
      throw new Error('User not found');
    }

    const progress = this.getXPProgress(user.xp, user.level);
    const nextLevelXP = this.getXPForNextLevel(user.level);
    const xpToNextLevel = nextLevelXP ? nextLevelXP - user.xp : 0;
    const nextLevel = user.level < LEVEL_THRESHOLDS.length - 1 ? user.level + 1 : null;

    return {
      xp: user.xp,
      level: user.level,
      levelName: getLevelName(user.level),
      progress,
      nextLevelXP,
      xpToNextLevel: xpToNextLevel > 0 ? xpToNextLevel : 0,
      nextLevel: nextLevel,
      nextLevelName: nextLevel ? getLevelName(nextLevel) : null,
    };
  }
}

