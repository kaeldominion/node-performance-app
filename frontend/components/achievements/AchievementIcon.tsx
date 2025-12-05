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
  flame: Icons.STREAK,
  'streak-7': Icons.STREAK,
  'streak-30': Icons.STREAK,
  'streak-100': Icons.STREAK,
  'sessions-10': Icons.SESSIONS,
  'sessions-50': Icons.SESSIONS,
  'sessions-100': Icons.SESSIONS,
  'sessions-500': Icons.SESSIONS,
  'weekly-4': Icons.SESSIONS,
  'top-5': Icons.RANK_1,
  'top-1': Icons.RANK_1,
  intensity: Icons.INTENSITY,
  'first-workout': Icons.SESSIONS,
  'level-10': Icons.LEVEL,
  'level-25': Icons.LEVEL,
  'level-50': Icons.LEVEL,
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

