'use client';

import React from 'react';
import { registerIcon } from './Icon';

interface IconProps {
  className?: string;
  size?: number | string;
  color?: string;
}

/**
 * Training Goal Icons - Used in AI Builder form
 */

/**
 * Strength Icon - STRENGTH Training Goal
 * 
 * Design: Barbell
 * Reasoning: Barbell represents maximal strength training - same visual language as PR1ME archetype 
 * but used for goal selection. Consistent with strength training iconography throughout the app.
 * 
 * Usage: AI builder (Training goal: STRENGTH)
 * Semantic: Strength training, maximal force, heavy loading
 */
export function StrengthIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      {/* Barbell */}
      <rect x="2" y="10" width="20" height="4" rx="1" />
      <rect x="1" y="8" width="4" height="8" rx="1" />
      <rect x="19" y="8" width="4" height="8" rx="1" />
    </svg>
  );
}

/**
 * Hypertrophy Icon - HYPERTROPHY Training Goal
 * 
 * Design: Layered volume/muscle shapes
 * Reasoning: Layered volume shapes represent muscle growth and hypertrophy - building size through 
 * progressive volume. The diamond/volume pattern suggests growth and expansion.
 * 
 * Usage: AI builder (Training goal: HYPERTROPHY)
 * Semantic: Muscle growth, volume, size building, hypertrophy
 */
export function HypertrophyIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      {/* Muscle/volume */}
      <path d="M12 2L8 6L12 10L16 6L12 2Z" />
      <path d="M8 6L4 10L8 14L12 10L8 6Z" />
      <path d="M16 6L20 10L16 14L12 10L16 6Z" />
      <path d="M8 14L12 18L16 14L12 10L8 14Z" />
    </svg>
  );
}

/**
 * Hybrid Icon - HYBRID Training Goal
 * 
 * Design: Combined barbell + cardio circle
 * Reasoning: Combined barbell and cardio circle represents hybrid training - mixing strength and 
 * conditioning work. The visual combination shows the blend of modalities.
 * 
 * Usage: AI builder (Training goal: HYBRID)
 * Semantic: Hybrid training, mixed modalities, strength + conditioning
 */
export function HybridIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      {/* Combined strength + cardio */}
      <rect x="2" y="10" width="8" height="4" rx="1" />
      <circle cx="6" cy="12" r="2" />
      <path d="M12 8L16 12L12 16" />
      <circle cx="18" cy="12" r="3" />
    </svg>
  );
}

/**
 * Conditioning Icon - CONDITIONING Training Goal
 * 
 * Design: Heart rate/pulse line
 * Reasoning: Pulse line represents cardiovascular conditioning - heart rate, endurance, and aerobic 
 * work. The pulse pattern suggests heart rate and cardiovascular activity.
 * 
 * Usage: AI builder (Training goal: CONDITIONING)
 * Semantic: Cardio, endurance, heart rate, aerobic, cardiovascular
 */
export function ConditioningIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      {/* Heart rate/pulse */}
      <path d="M3 12H7L9 8L15 16L17 12H21" />
      <circle cx="3" cy="12" r="1.5" fill={color} />
      <circle cx="21" cy="12" r="1.5" fill={color} />
    </svg>
  );
}

/**
 * Fat Loss Icon - FAT_LOSS Training Goal
 * 
 * Design: Flame
 * Reasoning: Flame represents calorie burn and metabolism - the fire of fat loss. Same visual 
 * language as FORGE archetype but different context (goal vs archetype). The flame suggests 
 * metabolic burn and intensity.
 * 
 * Usage: AI builder (Training goal: FAT_LOSS)
 * Semantic: Fat loss, calorie burn, metabolism, metabolic intensity
 */
export function FatLossIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
 * Longevity Icon - LONGEVITY Training Goal
 * 
 * Design: Infinity symbol
 * Reasoning: Infinity symbol represents long-term health and longevity - sustainable, continuous 
 * training for life. The infinity loop suggests ongoing, sustainable practice.
 * 
 * Usage: AI builder (Training goal: LONGEVITY)
 * Semantic: Longevity, sustainable training, long-term health, continuous practice
 */
export function LongevityIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      {/* Infinity/longevity symbol */}
      <path d="M6 12C6 8 8 6 12 6C16 6 18 8 18 12C18 16 16 18 12 18C8 18 6 16 6 12Z" />
      <path d="M18 12C18 8 16 6 12 6C8 6 6 8 6 12C6 16 8 18 12 18C16 18 18 16 18 12Z" />
    </svg>
  );
}

/**
 * Equipment Icons - Used in AI Builder form for equipment selection
 * All equipment icons are specific to their equipment type for clear identification.
 */

export function DumbbellsIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      <rect x="2" y="9" width="6" height="6" rx="1" />
      <rect x="16" y="9" width="6" height="6" rx="1" />
      <line x1="8" y1="12" x2="16" y2="12" strokeWidth="3" />
    </svg>
  );
}

export function KettlebellIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      <path d="M12 2C10 2 8 3 8 5V7C8 9 10 10 12 10C14 10 16 9 16 7V5C16 3 14 2 12 2Z" />
      <rect x="8" y="10" width="8" height="10" rx="2" />
      <line x1="12" y1="20" x2="12" y2="22" />
    </svg>
  );
}

export function BarbellIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      <rect x="2" y="10" width="20" height="4" rx="1" />
      <rect x="1" y="8" width="4" height="8" rx="1" />
      <rect x="19" y="8" width="4" height="8" rx="1" />
    </svg>
  );
}

export function ErgIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      {/* Rowing machine */}
      <rect x="2" y="6" width="20" height="12" rx="1" />
      <line x1="6" y1="10" x2="18" y2="10" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export function RowerIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      {/* Rower */}
      <rect x="2" y="8" width="18" height="8" rx="1" />
      <line x1="4" y1="10" x2="18" y2="10" />
      <circle cx="6" cy="12" r="1" />
      <circle cx="18" cy="12" r="1" />
    </svg>
  );
}

export function BikeIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      {/* Bike */}
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="18" r="3" />
      <path d="M9 18L15 18" />
      <path d="M12 12L9 18" />
      <path d="M12 12L15 18" />
      <path d="M12 6V12" />
    </svg>
  );
}

export function RingsIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      {/* Rings */}
      <circle cx="8" cy="8" r="3" />
      <circle cx="16" cy="8" r="3" />
      <line x1="8" y1="11" x2="8" y2="20" />
      <line x1="16" y1="11" x2="16" y2="20" />
    </svg>
  );
}

export function PullUpBarIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      {/* Pull-up bar */}
      <line x1="2" y1="6" x2="22" y2="6" strokeWidth="3" />
      <line x1="2" y1="6" x2="2" y2="2" />
      <line x1="22" y1="6" x2="22" y2="2" />
    </svg>
  );
}

export function BoxIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      {/* Box */}
      <rect x="4" y="8" width="16" height="12" rx="1" />
      <line x1="4" y1="8" x2="12" y2="4" />
      <line x1="20" y1="8" x2="12" y2="4" />
    </svg>
  );
}

export function JumpRopeIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      {/* Jump rope */}
      <path d="M6 6C6 6 8 4 12 4C16 4 18 6 18 6" />
      <path d="M6 18C6 18 8 20 12 20C16 20 18 18 18 18" />
      <path d="M6 6L6 12L18 12L18 6" />
    </svg>
  );
}

export function SandbagIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      {/* Sandbag */}
      <rect x="6" y="6" width="12" height="14" rx="1" />
      <line x1="8" y1="10" x2="16" y2="10" />
      <line x1="8" y1="14" x2="16" y2="14" />
    </svg>
  );
}

export function RunningRouteIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      {/* Running path */}
      <path d="M3 12L8 7L12 11L16 7L21 12" />
      <circle cx="3" cy="12" r="1.5" fill={color} />
      <circle cx="21" cy="12" r="1.5" fill={color} />
    </svg>
  );
}

export function BodyweightIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      {/* Person silhouette */}
      <circle cx="12" cy="6" r="2" />
      <path d="M12 8V12" />
      <path d="M8 16L10 14L12 16L14 14L16 16" />
      <path d="M10 12L8 20" />
      <path d="M14 12L16 20" />
    </svg>
  );
}

/**
 * Training Cycle Icons - Used in AI Builder form for cycle selection
 */

/**
 * Base Icon - BASE Training Cycle
 * 
 * Design: Stacked foundation blocks
 * Reasoning: Stacked foundation blocks represent establishing a baseline - building from the ground 
 * up. The blocks suggest solid foundation and base building.
 * 
 * Usage: AI builder (Training cycle: BASE)
 * Semantic: Base phase, foundation, baseline establishment, ground-up building
 */
export function BaseIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      {/* Foundation/base */}
      <rect x="4" y="16" width="16" height="4" rx="1" />
      <rect x="6" y="12" width="12" height="4" rx="1" />
      <rect x="8" y="8" width="8" height="4" rx="1" />
    </svg>
  );
}

/**
 * Load Icon - LOAD Training Cycle
 * 
 * Design: Increasing block heights
 * Reasoning: Increasing block heights represent progressive volume loading - building up intensity. 
 * The ascending pattern shows progression and growth.
 * 
 * Usage: AI builder (Training cycle: LOAD)
 * Semantic: Load phase, progressive volume, building intensity, progression
 */
export function LoadIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      {/* Increasing load */}
      <rect x="4" y="16" width="4" height="4" rx="1" />
      <rect x="10" y="12" width="4" height="8" rx="1" />
      <rect x="16" y="8" width="4" height="12" rx="1" />
    </svg>
  );
}

/**
 * Intensify Icon - INTENSIFY Training Cycle
 * 
 * Design: Peak triangle
 * Reasoning: Peak triangle represents maximum intensity - the apex of training intensity. The 
 * triangle suggests peak performance and maximum effort.
 * 
 * Usage: AI builder (Training cycle: INTENSIFY)
 * Semantic: Intensity phase, peak training, maximum effort, apex performance
 */
export function IntensifyIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      {/* Peak intensity */}
      <path d="M4 20L12 4L20 20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  );
}

/**
 * Deload Icon - DELOAD Training Cycle
 * 
 * Design: Recovery wave pattern
 * Reasoning: Wave pattern represents recovery and deload - flowing, restorative movement. The 
 * wave suggests flow, recovery, and restoration. Same visual language as CAPAC1TY but different 
 * context (cycle vs archetype).
 * 
 * Usage: AI builder (Training cycle: DELOAD)
 * Semantic: Deload phase, recovery, restoration, flow, rest
 */
export function DeloadIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      {/* Recovery wave */}
      <path d="M2 12C2 12 4 8 8 8C12 8 14 12 18 12C22 12 22 12 22 12" />
      <path d="M2 16C2 16 4 12 8 12C12 12 14 16 18 16C22 16 22 16 22 16" />
    </svg>
  );
}

// Register all form icons
registerIcon('strength', StrengthIcon);
registerIcon('hypertrophy', HypertrophyIcon);
registerIcon('hybrid', HybridIcon);
registerIcon('conditioning', ConditioningIcon);
registerIcon('fatLoss', FatLossIcon);
registerIcon('longevity', LongevityIcon);

registerIcon('dumbbells', DumbbellsIcon);
registerIcon('kettlebell', KettlebellIcon);
registerIcon('barbell', BarbellIcon);
registerIcon('erg', ErgIcon);
registerIcon('rower', RowerIcon);
registerIcon('bike', BikeIcon);
registerIcon('rings', RingsIcon);
registerIcon('pullUpBar', PullUpBarIcon);
registerIcon('box', BoxIcon);
registerIcon('jumpRope', JumpRopeIcon);
registerIcon('sandbag', SandbagIcon);
registerIcon('runningRoute', RunningRouteIcon);
registerIcon('bodyweight', BodyweightIcon);

registerIcon('base', BaseIcon);
registerIcon('load', LoadIcon);
registerIcon('intensify', IntensifyIcon);
registerIcon('deload', DeloadIcon);

