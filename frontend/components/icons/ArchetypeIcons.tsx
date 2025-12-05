'use client';

import React from 'react';
import { registerIcon } from './Icon';

interface IconProps {
  className?: string;
  size?: number | string;
  color?: string;
}

/**
 * PR1ME Icon - Primary Strength Archetype
 * 
 * Design: Barbell with weight plates
 * Reasoning: Barbell represents primary strength training - maximal force output, heavy loading, 
 * progressive overload. The barbell is the universal symbol for strength training.
 * Weight plates emphasize progressive overload and loading.
 * 
 * Usage: Landing page archetypes, Theory page, AI builder archetype selector
 * Semantic: Primary strength, maximal force, heavy loading
 */
export function PR1MEIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      {/* Weight plates */}
      <circle cx="3" cy="12" r="1.5" fill={color} />
      <circle cx="21" cy="12" r="1.5" fill={color} />
    </svg>
  );
}

/**
 * FORGE Icon - Strength Superset Archetype
 * 
 * Design: Flame
 * Reasoning: Flame represents intensity and heat - perfect for strength supersets that build 
 * "body armor" through high-volume work under fatigue. The forge metaphor aligns with building 
 * strength through fire and intensity.
 * 
 * Usage: Landing page archetypes, Theory page, AI builder archetype selector
 * Semantic: Strength supersets, intensity, body armor, high-volume work
 */
export function FORGEIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
 * ENGIN3 Icon - Hybrid EMOM Archetype
 * 
 * Design: Lightning bolt
 * Reasoning: Lightning = energy, power, speed. Represents hybrid EMOM work that combines skill, 
 * engine, and loaded movement in time-based intervals. The energy metaphor fits perfectly for 
 * threshold capacity and aerobic power work.
 * 
 * Usage: Landing page archetypes, Theory page, AI builder archetype selector
 * Semantic: Hybrid EMOM, energy, power, time-based intervals, threshold capacity
 */
export function ENGIN3Icon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      {/* Lightning bolt */}
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
    </svg>
  );
}

/**
 * CIRCUIT_X Icon - Anaerobic MetCon Archetype
 * 
 * Design: Circuit path with connection nodes
 * Reasoning: Circuit path with connection nodes represents the flow of anaerobic MetCon work - 
 * moving through stations/exercises in sequence. The nodes represent exercise stations, and the 
 * path shows the flow between them.
 * 
 * Usage: Landing page archetypes, Theory page, AI builder archetype selector
 * Semantic: Anaerobic MetCon, circuit training, station flow, fast conditioning
 */
export function CIRCUITXIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      {/* Circuit path */}
      <path d="M3 12H7L9 8L15 16L17 12H21" />
      <circle cx="3" cy="12" r="2" fill={color} />
      <circle cx="21" cy="12" r="2" fill={color} />
      <circle cx="9" cy="8" r="1.5" fill={color} />
      <circle cx="15" cy="16" r="1.5" fill={color} />
    </svg>
  );
}

/**
 * CAPAC1TY Icon - Long Engine Conditioning Archetype
 * 
 * Design: Wave pattern
 * Reasoning: Waves represent sustained flow and endurance - perfect for long engine conditioning 
 * work that builds aerobic base and pacing. The continuous wave pattern suggests sustained effort 
 * over long duration.
 * 
 * Usage: Landing page archetypes, Theory page, AI builder archetype selector
 * Semantic: Long engine, endurance, sustained effort, pacing, aerobic base
 */
export function CAPACITYIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      {/* Wave pattern */}
      <path d="M2 12C2 12 4 8 8 8C12 8 14 12 18 12C22 12 22 12 22 12" />
      <path d="M2 16C2 16 4 12 8 12C12 12 14 16 18 16C22 16 22 16 22 16" />
      <path d="M2 8C2 8 4 4 8 4C12 4 14 8 18 8C22 8 22 8 22 8" />
    </svg>
  );
}

/**
 * FLOWSTATE Icon - Recovery Flow Archetype
 * 
 * Design: Balanced circles
 * Reasoning: Balanced circles represent harmony, recovery, and flow - ideal for deload/mobility 
 * work focused on longevity and movement quality. The balance suggests recovery and equilibrium, 
 * while the circles suggest flow and continuity.
 * 
 * Usage: Landing page archetypes, Theory page, AI builder archetype selector
 * Semantic: Recovery, mobility, deload, longevity, balance, flow
 */
export function FLOWSTATEIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      {/* Balanced circles/flow */}
      <circle cx="12" cy="8" r="3" />
      <circle cx="8" cy="16" r="2" />
      <circle cx="16" cy="16" r="2" />
      <path d="M12 11V13" />
      <path d="M10 14L14 14" />
    </svg>
  );
}

// Register all archetype icons
registerIcon('PR1ME', PR1MEIcon);
registerIcon('FORGE', FORGEIcon);
registerIcon('ENGIN3', ENGIN3Icon);
registerIcon('CIRCUIT_X', CIRCUITXIcon);
registerIcon('CAPAC1TY', CAPACITYIcon);
registerIcon('FLOWSTATE', FLOWSTATEIcon);

