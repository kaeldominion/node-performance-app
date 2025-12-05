import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

// Level names - networking, coding, data, performance themes
const LEVEL_NAMES: Record<number, string> = {
  1: 'Init',
  2: 'Node',
  3: 'Link',
  4: 'Route',
  5: 'Packet',
  6: 'Stream',
  7: 'Buffer',
  8: 'Cache',
  9: 'Query',
  10: 'Index',
  11: 'Schema',
  12: 'Table',
  13: 'Join',
  14: 'Filter',
  15: 'Map',
  16: 'Reduce',
  17: 'Async',
  18: 'Promise',
  19: 'Thread',
  20: 'Process',
  21: 'Cluster',
  22: 'Server',
  23: 'Gateway',
  24: 'Router',
  25: 'Switch',
  26: 'Bridge',
  27: 'Proxy',
  28: 'Load Balancer',
  29: 'Firewall',
  30: 'DNS',
  31: 'API',
  32: 'Endpoint',
  33: 'Webhook',
  34: 'Socket',
  35: 'Protocol',
  36: 'TCP',
  37: 'UDP',
  38: 'HTTP',
  39: 'HTTPS',
  40: 'GraphQL',
  41: 'REST',
  42: 'gRPC',
  43: 'WebSocket',
  44: 'SSH',
  45: 'TLS',
  46: 'OAuth',
  47: 'JWT',
  48: 'Hash',
  49: 'Encrypt',
  50: 'Decrypt',
  51: 'Genome',
  52: 'Sequence',
  53: 'Strand',
  54: 'Helix',
  55: 'Base Pair',
  56: 'Codon',
  57: 'Gene',
  58: 'Chromosome',
  59: 'Nucleotide',
  60: 'Mutation',
  61: 'Expression',
  62: 'Transcription',
  63: 'Translation',
  64: 'Replication',
  65: 'Synthesis',
  66: 'Polymerase',
  67: 'Ligase',
  68: 'Helicase',
  69: 'Primase',
  70: 'Topoisomerase',
  71: 'Exon',
  72: 'Intron',
  73: 'Promoter',
  74: 'Enhancer',
  75: 'Silencer',
  76: 'Ribosome',
  77: 'mRNA',
  78: 'tRNA',
  79: 'rRNA',
  80: 'Protein',
  81: 'Enzyme',
  82: 'Catalyst',
  83: 'Substrate',
  84: 'Active Site',
  85: 'Allosteric',
  86: 'Kinase',
  87: 'Phosphatase',
  88: 'Isomerase',
  89: 'Hydrolase',
  90: 'Oxidase',
  91: 'Reductase',
  92: 'Transferase',
  93: 'Lyase',
  94: 'Ligase',
  95: 'Synthase',
  96: 'Core',
  97: 'Kernel',
  98: 'Root',
  99: 'Master',
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
  constructor(private prisma: PrismaService) {}

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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true },
    });

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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const progress = this.getXPProgress(user.xp, user.level);
    const nextLevelXP = this.getXPForNextLevel(user.level);

    return {
      xp: user.xp,
      level: user.level,
      progress,
      nextLevelXP,
      xpToNextLevel: nextLevelXP ? nextLevelXP - user.xp : null,
    };
  }
}

