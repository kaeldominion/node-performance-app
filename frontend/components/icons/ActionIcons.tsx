'use client';

import React from 'react';
import { registerIcon } from './Icon';

interface IconProps {
  className?: string;
  size?: number | string;
  color?: string;
}

/**
 * Programs Icon - Structured Training Programs
 * 
 * Design: Document with list lines
 * Reasoning: Document/list represents structured programs - organized, sequential training plans. 
 * The lines suggest structure and organization. Used for program navigation and browsing.
 * 
 * Usage: Dashboard quick action card (Browse Programs)
 * Semantic: Programs, structured training, organized plans, sequential workouts
 */
export function ProgramsIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      <line x1="7" y1="8" x2="17" y2="8" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="7" y1="16" x2="13" y2="16" />
    </svg>
  );
}

/**
 * AI Icon - AI Workout Generation
 * 
 * Design: Neural network nodes with connections
 * Reasoning: Neural network represents AI/intelligence - nodes and connections symbolize the AI's 
 * decision-making process. Perfect for AI workout generation features. The network suggests 
 * intelligent processing and generation.
 * 
 * Usage: Dashboard quick action card (AI Workout Builder)
 * Semantic: AI, intelligence, generation, neural processing, automated creation
 */
export function AIIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      {/* Neural network nodes */}
      <circle cx="12" cy="8" r="2" />
      <circle cx="6" cy="16" r="2" />
      <circle cx="18" cy="16" r="2" />
      {/* Connections */}
      <line x1="12" y1="10" x2="6" y2="14" />
      <line x1="12" y1="10" x2="18" y2="14" />
    </svg>
  );
}

/**
 * Exercises Icon - Exercise Library
 * 
 * Design: Open book
 * Reasoning: Book represents knowledge library - exercise database with instructions, form cues, 
 * and movement patterns. The open book suggests accessible knowledge and learning resources.
 * 
 * Usage: Dashboard quick action card (Exercise Library)
 * Semantic: Exercise library, knowledge, movement database, learning resources
 */
export function ExercisesIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20V20H6.5A2.5 2.5 0 0 1 4 17.5V4.5A2.5 2.5 0 0 1 6.5 2Z" />
      <line x1="9" y1="7" x2="15" y2="7" />
      <line x1="9" y1="11" x2="15" y2="11" />
    </svg>
  );
}

/**
 * HYROX Icon - HYROX/Running/Endurance
 * 
 * Design: Runner silhouette
 * Reasoning: Runner represents endurance/conditioning - perfect for HYROX-style long-duration 
 * sessions focused on running and sustained effort. The runner is the core of HYROX competition, 
 * making this the ideal symbol.
 * 
 * Usage: Landing page HYROX section, AI builder (HYROX duration option), AI builder (HYROX info box)
 * Semantic: HYROX, endurance, running, long conditioning, sustained effort, 90-minute sessions
 */
export function HYROXIcon({ className = '', size = 24, color = 'currentColor' }: IconProps) {
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
      {/* Runner silhouette */}
      <circle cx="12" cy="6" r="2" />
      <path d="M12 8V12" />
      <path d="M10 12L8 16" />
      <path d="M14 12L16 16" />
      <path d="M10 16L12 20" />
      <path d="M14 16L12 20" />
    </svg>
  );
}

// Register action icons
registerIcon('programs', ProgramsIcon);
registerIcon('ai', AIIcon);
registerIcon('exercises', ExercisesIcon);
registerIcon('hyrox', HYROXIcon);

