'use client';

import React from 'react';
import { registerIcon } from './Icon';

interface IconProps {
  className?: string;
  size?: number | string;
  color?: string;
}

/**
 * Instructions Icon - Workout Instructions/Documentation
 * 
 * Design: Clipboard
 * Reasoning: Clipboard is universal symbol for instructions/notes - represents structured guidance 
 * and workout notes. Used for all instruction sections to maintain consistency.
 * 
 * Usage: WorkoutDeckSlide (Instructions headers for FOR_TIME, WAVE, SUPERSET sections)
 * Semantic: Instructions, notes, guidance, documentation, workout notes
 */
export function InstructionsIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
  const sizeNum = typeof size === 'string' ? parseInt(size) : size;
  return (
    <svg
      width={sizeNum}
      height={sizeNum}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="15" y2="16" />
    </svg>
  );
}

/**
 * Recommended Icon - Featured/Curated Content
 * 
 * Design: Star
 * Reasoning: Star is universal symbol for favorites/recommendations - represents curated, 
 * high-quality content. Used consistently for all "recommended" features across the site.
 * 
 * Usage: AI builder "Browse Recommended" link, Workout detail page (recommended badge), 
 *        Admin workouts page (recommended indicator)
 * Semantic: Recommended, favorites, curated, featured, high-quality
 */
export function RecommendedIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
  const sizeNum = typeof size === 'string' ? parseInt(size) : size;
  return (
    <svg
      width={sizeNum}
      height={sizeNum}
      viewBox="0 0 24 24"
      fill={color}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/**
 * Level Up Icon - Achievement/Milestone
 * 
 * Design: Trophy
 * Reasoning: Trophy represents achievement and accomplishment - perfect for level-up celebrations 
 * and milestones. The trophy is the universal achievement symbol in gaming and fitness apps.
 * 
 * Usage: LevelUpModal (gamification achievement)
 * Semantic: Achievement, level up, milestone, accomplishment, progression
 */
export function LevelUpIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
  const sizeNum = typeof size === 'string' ? parseInt(size) : size;
  return (
    <svg
      width={sizeNum}
      height={sizeNum}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Trophy */}
      <path d="M6 9H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2" />
      <path d="M18 9H20a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" />
      <path d="M6 9V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
      <path d="M6 13v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="10" y1="17" x2="14" y2="17" />
    </svg>
  );
}

/**
 * Gamification Icon - Game Systems/XP/Levels
 * 
 * Design: Game controller
 * Reasoning: Game controller represents gamification systems - XP, levels, achievements, and 
 * game-like progression. The controller is the symbol of gaming and interactive systems.
 * 
 * Usage: Admin page (Gamification Preview section), Admin analytics page
 * Semantic: Gamification, XP, levels, achievements, game systems, progression mechanics
 */
export function GamificationIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
  const sizeNum = typeof size === 'string' ? parseInt(size) : size;
  return (
    <svg
      width={sizeNum}
      height={sizeNum}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Controller */}
      <rect x="6" y="8" width="12" height="10" rx="2" />
      <circle cx="9" cy="13" r="1" fill={color} />
      <circle cx="15" cy="13" r="1" fill={color} />
      <path d="M10 10V8" />
      <path d="M14 10V8" />
      <line x1="12" y1="10" x2="12" y2="8" />
    </svg>
  );
}

/**
 * Calendar Icon - Time-Based Programs/Schedules
 * 
 * Design: Calendar
 * Reasoning: Calendar represents time-based programs - structured schedules over days/weeks. 
 * Used for all multi-day program types to indicate time structure and scheduling.
 * 
 * Usage: AI builder (4-Day, 7-Day, 4-Week workout type options)
 * Semantic: Schedule, program duration, time-based plans, calendar, structured timing
 */
export function CalendarIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
  const sizeNum = typeof size === 'string' ? parseInt(size) : size;
  return (
    <svg
      width={sizeNum}
      height={sizeNum}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

// Register utility icons
registerIcon('instructions', InstructionsIcon);
registerIcon('recommended', RecommendedIcon);
registerIcon('levelUp', LevelUpIcon);
registerIcon('gamification', GamificationIcon);
registerIcon('calendar', CalendarIcon);

