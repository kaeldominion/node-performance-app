'use client';

import { Icons } from '@/lib/iconMapping';

interface AchievementIconProps {
  icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const RARITY_COLORS = {
  COMMON: {
    primary: '#6b7280', // gray
    secondary: '#9ca3af',
    glow: 'rgba(107, 114, 128, 0.3)',
  },
  RARE: {
    primary: '#3b82f6', // blue
    secondary: '#60a5fa',
    glow: 'rgba(59, 130, 246, 0.3)',
  },
  EPIC: {
    primary: '#a855f7', // purple
    secondary: '#c084fc',
    glow: 'rgba(168, 85, 247, 0.3)',
  },
  LEGENDARY: {
    primary: '#f59e0b', // amber/gold
    secondary: '#fbbf24',
    glow: 'rgba(245, 158, 11, 0.4)',
  },
};

const SIZE_CLASSES = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

// Icon mapping for achievements
const ICON_COMPONENTS: Record<string, any> = {
  // Streak icons
  flame: Icons.STREAK,
  'streak-7': Icons.STREAK,
  'streak-14': Icons.STREAK,
  'streak-21': Icons.STREAK,
  'streak-30': Icons.STREAK,
  'streak-60': Icons.STREAK,
  'streak-90': Icons.STREAK,
  'streak-100': Icons.STREAK,
  'streak-180': Icons.STREAK,
  'streak-365': Icons.STREAK,
  // Volume icons
  'sessions-10': Icons.SESSIONS,
  'sessions-25': Icons.SESSIONS,
  'sessions-50': Icons.SESSIONS,
  'sessions-75': Icons.SESSIONS,
  'sessions-100': Icons.SESSIONS,
  'sessions-200': Icons.SESSIONS,
  'sessions-500': Icons.SESSIONS,
  'sessions-1000': Icons.SESSIONS,
  'hours-10': Icons.SESSIONS,
  'hours-50': Icons.SESSIONS,
  'hours-100': Icons.SESSIONS,
  'hours-500': Icons.SESSIONS,
  // Consistency icons
  'weekly-3': Icons.SESSIONS,
  'weekly-4': Icons.SESSIONS,
  'weekly-5': Icons.SESSIONS,
  'weekly-6': Icons.SESSIONS,
  'weekly-7': Icons.SESSIONS,
  'monthly-12': Icons.SESSIONS,
  'monthly-16': Icons.SESSIONS,
  'monthly-20': Icons.SESSIONS,
  'monthly-24': Icons.SESSIONS,
  'perfect-week': Icons.SESSIONS,
  'perfect-month': Icons.SESSIONS,
  // Intensity icons
  intensity: Icons.INTENSITY,
  'high-rpe-session': Icons.INTENSITY,
  'high-rpe-month': Icons.INTENSITY,
  'max-rpe': Icons.INTENSITY,
  'rpe-9-week': Icons.INTENSITY,
  'consistent-intensity': Icons.INTENSITY,
  'intensity-master': Icons.INTENSITY,
  'rpe-10-5': Icons.INTENSITY,
  'rpe-10-10': Icons.INTENSITY,
  // Milestone icons
  'first-workout': Icons.SESSIONS,
  'level-5': Icons.LEVEL,
  'level-10': Icons.LEVEL,
  'level-15': Icons.LEVEL,
  'level-20': Icons.LEVEL,
  'level-25': Icons.LEVEL,
  'level-30': Icons.LEVEL,
  'level-40': Icons.LEVEL,
  'level-50': Icons.LEVEL,
  'level-75': Icons.LEVEL,
  'level-100': Icons.LEVEL,
  'first-pr': Icons.SESSIONS,
  'pr-5': Icons.SESSIONS,
  'pr-10': Icons.SESSIONS,
  'pr-25': Icons.SESSIONS,
  // Special icons
  'top-5': Icons.RANK_1,
  'top-10': Icons.RANK_1,
  'top-3': Icons.RANK_1,
  'top-1': Icons.RANK_1,
  'leaderboard-top-10': Icons.RANK_1,
  'leaderboard-top-5': Icons.RANK_1,
  'leaderboard-1': Icons.RANK_1,
  'archetype-master': Icons.SESSIONS,
  'pr1me-specialist': Icons.SESSIONS,
  'forge-specialist': Icons.SESSIONS,
  'engin3-specialist': Icons.SESSIONS,
  'circuit-x-specialist': Icons.SESSIONS,
  'early-bird': Icons.SESSIONS,
  'night-owl': Icons.SESSIONS,
  'weekend-warrior': Icons.SESSIONS,
  'program-completer': Icons.SESSIONS,
  'multi-program': Icons.SESSIONS,
  // Contribution icons
  'first-review': Icons.SESSIONS,
  'review-5': Icons.SESSIONS,
  'review-10': Icons.SESSIONS,
  'review-25': Icons.SESSIONS,
  'review-50': Icons.SESSIONS,
  'review-100': Icons.SESSIONS,
  'detailed-reviewer': Icons.SESSIONS,
  'helpful-reviewer': Icons.SESSIONS,
  'network-builder': Icons.SESSIONS,
  'network-leader': Icons.SESSIONS,
  'workout-sharer': Icons.SESSIONS,
  'workout-sharer-50': Icons.SESSIONS,
};

export function AchievementIcon({ icon, rarity, size = 'md', className = '' }: AchievementIconProps) {
  const colors = RARITY_COLORS[rarity];
  const IconComponent = ICON_COMPONENTS[icon] || Icons.SESSIONS;
  const sizeClass = SIZE_CLASSES[size];
  const iconSize = size === 'sm' ? 16 : size === 'md' ? 24 : size === 'lg' ? 32 : 48;

  return (
    <div
      className={`relative ${sizeClass} ${className}`}
      style={{
        filter: `drop-shadow(0 0 8px ${colors.glow})`,
      }}
    >
      {/* Background gradient circle */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${colors.secondary}, ${colors.primary})`,
          border: `2px solid ${colors.primary}`,
        }}
      />
      
      {/* Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <IconComponent
          size={iconSize}
          className="text-white"
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          }}
        />
      </div>
      
      {/* Shine effect */}
      <div
        className="absolute inset-0 rounded-full opacity-30"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)',
        }}
      />
    </div>
  );
}

