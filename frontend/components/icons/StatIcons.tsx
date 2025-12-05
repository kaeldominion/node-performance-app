'use client';

import React from 'react';
import { registerIcon } from './Icon';

interface IconProps {
  className?: string;
  size?: number | string;
  color?: string;
}

/**
 * Streak Icon - Consecutive Training Days
 * 
 * Design: Flame
 * Reasoning: Flame represents continuous fire/momentum - perfect metaphor for consecutive 
 * training days. Visual connection to "on fire" language used throughout the app. The flame 
 * suggests ongoing intensity and consistency.
 * 
 * Usage: Dashboard stat card (Current Streak), Leaderboard streak display
 * Semantic: Consecutive days, momentum, consistency, "on fire"
 */
export function StreakIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      {/* Classic flame shape - more traditional and clear */}
      <path d="M12 22C12 22 8 18 8 14C8 12 9 10 10 9C10 7 11 6 12 6C13 6 14 7 14 9C15 10 16 12 16 14C16 18 12 22 12 22Z" />
      {/* Inner flame for depth */}
      <path d="M12 18C12 18 10 15 10 13C10 12 10.5 11 11 11C11.5 11 12 12 12 13C12 15 12 18 12 18Z" fill={color} opacity="0.6" />
      {/* Base of flame */}
      <ellipse cx="12" cy="20" rx="3" ry="2" fill={color} opacity="0.4" />
    </svg>
  );
}

/**
 * Sessions Icon - Total Workout Sessions
 * 
 * Design: Dumbbell
 * Reasoning: Dumbbell represents completed workout sessions. Simple, recognizable symbol for 
 * training activity. Used specifically for total sessions count to represent accumulated workouts.
 * 
 * Usage: Dashboard stat card (Total Sessions)
 * Semantic: Workout sessions, training activity, completed workouts, total count
 */
export function SessionsIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      {/* Dumbbell */}
      <rect x="2" y="9" width="6" height="6" rx="1" />
      <rect x="16" y="9" width="6" height="6" rx="1" />
      <line x1="8" y1="12" x2="16" y2="12" strokeWidth="3" />
    </svg>
  );
}

/**
 * Hours Icon - Time/Duration Metrics
 * 
 * Design: Clock
 * Reasoning: Clock is universal symbol for time. Represents accumulated training hours and 
 * workout duration. Used consistently for all time-related metrics to maintain semantic clarity.
 * 
 * Usage: Dashboard stat card (Total Hours), AI builder (Standard duration option)
 * Semantic: Time, duration, hours, accumulated training time, workout length
 */
export function HoursIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

/**
 * Intensity Icon - RPE/Intensity Metrics
 * 
 * Design: Lightning bolt
 * Reasoning: Lightning = power, intensity, energy. Represents RPE and training intensity levels. 
 * The energy metaphor fits intensity metrics. Note: Same visual as ENGIN3 but different context 
 * (stat vs archetype) - acceptable as they represent related concepts (energy/intensity).
 * 
 * Usage: Dashboard stat card (Avg Intensity/RPE)
 * Semantic: Intensity, RPE, power, energy level, training intensity
 */
export function IntensityIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
    </svg>
  );
}

// Register stat icons
registerIcon('streak', StreakIcon);
registerIcon('sessions', SessionsIcon);
registerIcon('hours', HoursIcon);
registerIcon('intensity', IntensityIcon);

