/**
 * Icon Mapping for NØDE OS
 * 
 * This file maps semantic concepts to Lucide React icons with metadata
 * explaining why each icon was chosen. Icons are selected to match the
 * brutalist, performance-focused aesthetic of NØDE OS.
 * 
 * Rules:
 * - Each icon should be semantically relevant to its use case
 * - Icons should match the brutalist, technical aesthetic
 * - Don't reuse icons unless it's for the same concept across pages
 */

import {
  // Strength & Training
  Dumbbell,           // Primary strength training icon
  Flame,              // Intensity, heat, forge
  Zap,                // Energy, power, speed
  Target,             // Focus, precision, goals
  Waves,              // Flow, capacity, endurance
  Activity,           // Movement, flow state, recovery
  
  // Time & Duration
  Clock,              // Time tracking, duration
  
  // Achievement & Status
  Star,               // Recommended, featured, excellence
  Trophy,             // Achievement, leaderboard ranks
  Award,              // Secondary achievement icon
  Medal,              // Ranking, recognition
  Layers,             // Level, progression
  
  // Gamification
  Gamepad2,           // Gamification, game mechanics
  
  // Actions & Navigation
  Share2,             // Sharing functionality
  Sparkles,           // Celebration, level up, success
  
  // Training Types
  Footprints,         // Running, HYROX, cardio
  BookOpen,           // Library, knowledge, exercises
  ClipboardList,      // Programs, structured plans
  Bot,                // AI, automation, generation
  
  // UI Elements
  Check,              // Success, completion
  X,                  // Error, failure (for UI only, not console)
  Menu,               // Menu, navigation
  MoreVertical,      // Three dots menu, more options
  Minimize2,          // Minimize window
  Bell,               // Notifications
  Plus,               // Add, create
  UserPlus,           // Add user, network connection
  Maximize2,          // Maximize window
  ChevronLeft,        // Previous, back navigation
  ChevronRight,       // Next, forward navigation
  ChevronDown,        // Dropdown, expand
  Trash2,             // Delete action
  Users,              // People, participants, group
  Play,               // Play, start, begin
  Volume2,            // Audio, volume, sound
  Info,               // Information, help, details
  MessageSquare,      // Comments, feedback
  Bug,                // Bug reports
  Lightbulb,          // Ideas, feature requests
  Palette,            // Design, UI/UX
  Gauge,              // Performance, speed
  Send,               // Submit, send
  
  // Training Goals
  TrendingUp,         // Strength, progression
  TrendingDown,       // Fat loss, reduction
  Heart,              // Longevity, health
} from 'lucide-react';

/**
 * Icon Metadata - explains why each icon fits its use case
 */
export const iconMetadata = {
  // Archetype Icons
  PR1ME: {
    icon: Dumbbell,
    reason: 'Dumbbell represents primary strength training - the core focus of PR1ME days. Clean, direct, and universally recognized as strength training.',
  },
  FORGE: {
    icon: Flame,
    reason: 'Flame represents intensity, heat, and transformation - perfect for FORGE superset days that build strength under fatigue.',
  },
  ENGIN3: {
    icon: Zap,
    reason: 'Lightning bolt represents energy, power, and speed - ideal for hybrid EMOM sessions that combine strength and conditioning.',
  },
  CIRCUIT_X: {
    icon: Target,
    reason: 'Target represents precision and intensity - fitting for anaerobic MetCon sessions that require focused, explosive effort.',
  },
  CAPAC1TY: {
    icon: Waves,
    reason: 'Waves represent flow, endurance, and sustained capacity - perfect for long-duration conditioning sessions.',
  },
  FLOWSTATE: {
    icon: Activity,
    reason: 'Activity icon represents movement, flow, and recovery - ideal for deload and mobility-focused sessions.',
  },
  
  // Time & Duration
  TIMER: {
    icon: Clock,
    reason: 'Clock is the universal symbol for time and duration - clear, functional, and matches the technical aesthetic.',
  },
  
  // Achievement & Status
  RECOMMENDED: {
    icon: Star,
    reason: 'Star represents excellence, featured content, and recommendations - universally understood as a quality indicator.',
  },
  BROWSE: {
    icon: Star,
    reason: 'Star for browsing recommended content - same semantic meaning as RECOMMENDED (featured/curated content).',
  },
  
  // Leaderboard Ranks
  RANK_1: {
    icon: Trophy,
    reason: 'Trophy represents first place achievement - the ultimate recognition for top performance.',
  },
  RANK_2: {
    icon: Award,
    reason: 'Award represents second place - recognition for strong performance, distinct from first place.',
  },
  RANK_3: {
    icon: Medal,
    reason: 'Medal represents third place - recognition for podium finish, distinct from first and second.',
  },
  
  // Gamification
  GAMIFICATION: {
    icon: Gamepad2,
    reason: 'Gamepad represents gamification systems - XP, levels, and achievement mechanics. Technical and modern.',
  },
  
  // Celebration
  CELEBRATION: {
    icon: Sparkles,
    reason: 'Sparkles represent celebration, achievement, and positive feedback - perfect for level up moments.',
  },
  
  // Training Types
  HYROX: {
    icon: Footprints,
    reason: 'Footprints represent running, HYROX, and endurance training - clear, direct, and matches the sport.',
  },
  EXERCISE_LIBRARY: {
    icon: BookOpen,
    reason: 'Book represents knowledge, library, and learning - ideal for exercise reference and education.',
  },
  PROGRAMS: {
    icon: ClipboardList,
    reason: 'Clipboard represents structured plans and programs - organized, systematic training blocks.',
  },
  AI_BUILDER: {
    icon: Bot,
    reason: 'Bot represents AI and automation - perfect for AI workout generation, modern and technical.',
  },
  
  // Actions
  SHARE: {
    icon: Share2,
    reason: 'Share icon is the standard symbol for sharing content - universally recognized and functional.',
  },
  
  // Status Indicators
  CHECK: {
    icon: Check,
    reason: 'Check mark represents success, completion, and validation - clean and minimal.',
  },
  X: {
    icon: X,
    reason: 'X represents close, cancel, or error - clear and direct.',
  },
  
  // Navigation
  MENU: {
    icon: Menu,
    reason: 'Menu icon for navigation and section selection - standard UI pattern.',
  },
  MINIMIZE: {
    icon: Minimize2,
    reason: 'Minimize icon for window controls - standard UI pattern.',
  },
  MAXIMIZE: {
    icon: Maximize2,
    reason: 'Maximize icon for fullscreen toggle - standard UI pattern.',
  },
  CHEVRON_LEFT: {
    icon: ChevronLeft,
    reason: 'Chevron left for previous/back navigation - standard UI pattern.',
  },
  CHEVRON_RIGHT: {
    icon: ChevronRight,
    reason: 'Chevron right for next/forward navigation - standard UI pattern.',
  },
  CHEVRON_DOWN: {
    icon: ChevronDown,
    reason: 'Chevron down for dropdowns and expandable sections - standard UI pattern.',
  },
  STAR: {
    icon: Star,
    reason: 'Star for ratings - universally recognized rating symbol.',
  },
  
  // Streak & Intensity
  STREAK: {
    icon: Flame,
    reason: 'Flame represents streak and intensity - same semantic meaning as FORGE (heat/intensity), but used for consecutive days.',
  },
  INTENSITY: {
    icon: Zap,
    reason: 'Lightning represents intensity and power - same semantic meaning as ENGIN3 (energy/power), but used for RPE/intensity metrics.',
  },
  
  // Sessions & Training
  SESSIONS: {
    icon: Dumbbell,
    reason: 'Dumbbell represents training sessions - same semantic meaning as PR1ME (strength/training), but used for session counts.',
  },
  
  // Training Goals
  GOAL_STRENGTH: {
    icon: TrendingUp,
    reason: 'TrendingUp represents strength progression and improvement - upward trajectory of strength gains.',
  },
  GOAL_HYPERTROPHY: {
    icon: Target,
    reason: 'Target represents focused muscle growth and hypertrophy - precision targeting of muscle development.',
  },
  GOAL_HYBRID: {
    icon: Zap,
    reason: 'Lightning represents hybrid training - combining strength and conditioning with energy and power.',
  },
  GOAL_CONDITIONING: {
    icon: Activity,
    reason: 'Activity represents conditioning and cardiovascular fitness - movement and endurance.',
  },
  GOAL_FAT_LOSS: {
    icon: TrendingDown,
    reason: 'TrendingDown represents fat loss and reduction - downward trajectory of body composition improvement.',
  },
  GOAL_LONGEVITY: {
    icon: Heart,
    reason: 'Heart represents longevity and health - long-term wellness and sustainable training.',
  },
};

/**
 * Export icon components directly for use in JSX
 */
export const Icons = {
  PR1ME: Dumbbell,
  FORGE: Flame,
  ENGIN3: Zap,
  CIRCUIT_X: Target,
  CAPAC1TY: Waves,
  FLOWSTATE: Activity,
  TIMER: Clock,
  RECOMMENDED: Star,
  BROWSE: Star,
  RANK_1: Trophy,
  RANK_2: Award,
  RANK_3: Medal,
  GAMIFICATION: Gamepad2,
  CELEBRATION: Sparkles,
  HYROX: Footprints,
  EXERCISE_LIBRARY: BookOpen,
  PROGRAMS: ClipboardList,
  AI_BUILDER: Bot,
  SHARE: Share2,
  CHECK: Check,
  X: X,
  MENU: Menu,
  MORE_VERTICAL: MoreVertical,
  TRASH: Trash2,
  MINIMIZE: Minimize2,
  MAXIMIZE: Maximize2,
  CHEVRON_LEFT: ChevronLeft,
  CHEVRON_RIGHT: ChevronRight,
  CHEVRON_DOWN: ChevronDown,
  STAR: Star,
  USERS: Users,
  STREAK: Flame,
  INTENSITY: Zap,
  SESSIONS: Dumbbell,
  LEVEL: Layers,
  GOAL_STRENGTH: TrendingUp,
  GOAL_HYPERTROPHY: Target,
  GOAL_HYBRID: Zap,
  GOAL_CONDITIONING: Activity,
  GOAL_FAT_LOSS: TrendingDown,
  GOAL_LONGEVITY: Heart,
  HEART: Heart,             // Favorite, like, heart icon
  BELL: Bell,
  PLUS: Plus,
  USER_PLUS: UserPlus,
  WORKOUT: Dumbbell,        // Workout icon (same as SESSIONS/PR1ME)
  PLAY: Play,               // Play/start icon
  CLIPBOARD_LIST: ClipboardList, // Clipboard list icon (same as PROGRAMS)
  VOLUME_2: Volume2,       // Audio, volume, sound
  INFO: Info,              // Information, help, details
  COMMENT: MessageSquare,  // Comments, feedback
  BUG: Bug,                // Bug reports
  LIGHTBULB: Lightbulb,    // Ideas, feature requests
  DESIGN: Palette,         // Design, UI/UX
  SPEED: Gauge,            // Performance, speed
  MORE: MoreVertical,      // More options
  SEND: Send,              // Submit, send
};

