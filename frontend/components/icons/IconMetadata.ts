/**
 * Icon Metadata & Rationale
 * 
 * This file documents the reasoning behind each icon choice and ensures
 * consistency across the application. Each icon should have a clear semantic
 * meaning and be used consistently for the same concept.
 */

export const ICON_METADATA = {
  // ============================================
  // ARCHETYPE ICONS
  // ============================================
  PR1ME: {
    name: 'PR1ME',
    description: 'Barbell with weight plates',
    reasoning: 'Represents primary strength training - maximal force output, heavy loading, progressive overload. The barbell is the universal symbol for strength training.',
    usage: ['Landing page archetypes', 'Theory page', 'AI builder archetype selector'],
    semantic: 'Primary strength, maximal force, heavy loading'
  },
  FORGE: {
    name: 'FORGE',
    description: 'Flame',
    reasoning: 'Flame represents intensity and heat - perfect for strength supersets that build "body armor" through high-volume work under fatigue. The forge metaphor aligns with building strength.',
    usage: ['Landing page archetypes', 'Theory page', 'AI builder archetype selector'],
    semantic: 'Strength supersets, intensity, body armor'
  },
  ENGIN3: {
    name: 'ENGIN3',
    description: 'Lightning bolt',
    reasoning: 'Lightning = energy, power, speed. Represents hybrid EMOM work that combines skill, engine, and loaded movement in time-based intervals. The energy metaphor fits perfectly.',
    usage: ['Landing page archetypes', 'Theory page', 'AI builder archetype selector'],
    semantic: 'Hybrid EMOM, energy, power, time-based intervals'
  },
  CIRCUIT_X: {
    name: 'CIRCUIT_X',
    description: 'Circuit path with connection nodes',
    reasoning: 'Circuit path with connection nodes represents the flow of anaerobic MetCon work - moving through stations/exercises in sequence. The nodes represent exercise stations.',
    usage: ['Landing page archetypes', 'Theory page', 'AI builder archetype selector'],
    semantic: 'Anaerobic MetCon, circuit training, station flow'
  },
  CAPAC1TY: {
    name: 'CAPAC1TY',
    description: 'Wave pattern',
    reasoning: 'Waves represent sustained flow and endurance - perfect for long engine conditioning work that builds aerobic base and pacing. The continuous wave pattern suggests sustained effort.',
    usage: ['Landing page archetypes', 'Theory page', 'AI builder archetype selector'],
    semantic: 'Long engine, endurance, sustained effort, pacing'
  },
  FLOWSTATE: {
    name: 'FLOWSTATE',
    description: 'Balanced circles',
    reasoning: 'Balanced circles represent harmony, recovery, and flow - ideal for deload/mobility work focused on longevity and movement quality. The balance suggests recovery and equilibrium.',
    usage: ['Landing page archetypes', 'Theory page', 'AI builder archetype selector'],
    semantic: 'Recovery, mobility, deload, longevity, balance'
  },

  // ============================================
  // STAT ICONS (Dashboard Metrics)
  // ============================================
  streak: {
    name: 'streak',
    description: 'Flame',
    reasoning: 'Flame represents continuous fire/momentum - perfect metaphor for consecutive training days. Visual connection to "on fire" language used throughout the app.',
    usage: ['Dashboard stat card (Current Streak)', 'Leaderboard streak display'],
    semantic: 'Consecutive days, momentum, consistency'
  },
  sessions: {
    name: 'sessions',
    description: 'Dumbbell',
    reasoning: 'Dumbbell represents completed workout sessions. Simple, recognizable symbol for training activity. Used for total sessions count.',
    usage: ['Dashboard stat card (Total Sessions)'],
    semantic: 'Workout sessions, training activity, completed workouts'
  },
  hours: {
    name: 'hours',
    description: 'Clock',
    reasoning: 'Clock is universal symbol for time. Represents accumulated training hours and workout duration. Used consistently for all time-related metrics.',
    usage: ['Dashboard stat card (Total Hours)', 'AI builder (Standard duration option)'],
    semantic: 'Time, duration, hours, accumulated training time'
  },
  intensity: {
    name: 'intensity',
    description: 'Lightning bolt',
    reasoning: 'Lightning = power, intensity, energy. Represents RPE and training intensity levels. The energy metaphor fits intensity metrics.',
    usage: ['Dashboard stat card (Avg Intensity/RPE)'],
    semantic: 'Intensity, RPE, power, energy level'
  },

  // ============================================
  // ACTION ICONS (Navigation/Quick Actions)
  // ============================================
  programs: {
    name: 'programs',
    description: 'Document with list lines',
    reasoning: 'Document/list represents structured programs - organized, sequential training plans. The lines suggest structure and organization.',
    usage: ['Dashboard quick action card (Browse Programs)'],
    semantic: 'Programs, structured training, organized plans'
  },
  ai: {
    name: 'ai',
    description: 'Neural network nodes',
    reasoning: 'Neural network represents AI/intelligence - nodes and connections symbolize the AI\'s decision-making process. Perfect for AI workout generation.',
    usage: ['Dashboard quick action card (AI Workout Builder)'],
    semantic: 'AI, intelligence, generation, neural processing'
  },
  exercises: {
    name: 'exercises',
    description: 'Open book',
    reasoning: 'Book represents knowledge library - exercise database with instructions, form cues, and movement patterns. The open book suggests accessible knowledge.',
    usage: ['Dashboard quick action card (Exercise Library)'],
    semantic: 'Exercise library, knowledge, movement database'
  },
  hyrox: {
    name: 'hyrox',
    description: 'Runner silhouette',
    reasoning: 'Runner represents endurance/conditioning - perfect for HYROX-style long-duration sessions focused on running and sustained effort. The runner is the core of HYROX.',
    usage: ['Landing page HYROX section', 'AI builder (HYROX duration option)', 'AI builder (HYROX info box)'],
    semantic: 'HYROX, endurance, running, long conditioning, sustained effort'
  },

  // ============================================
  // UTILITY ICONS
  // ============================================
  instructions: {
    name: 'instructions',
    description: 'Clipboard',
    reasoning: 'Clipboard is universal symbol for instructions/notes - represents structured guidance and workout notes. Used for all instruction sections.',
    usage: ['WorkoutDeckSlide (Instructions headers for FOR_TIME, WAVE, SUPERSET sections)'],
    semantic: 'Instructions, notes, guidance, documentation'
  },
  recommended: {
    name: 'recommended',
    description: 'Star',
    reasoning: 'Star is universal symbol for favorites/recommendations - represents curated, high-quality content. Used consistently for all "recommended" features.',
    usage: ['AI builder "Browse Recommended" link', 'Workout detail page (recommended badge)', 'Admin workouts page (recommended indicator)'],
    semantic: 'Recommended, favorites, curated, featured'
  },
  levelUp: {
    name: 'levelUp',
    description: 'Trophy',
    reasoning: 'Trophy represents achievement and accomplishment - perfect for level-up celebrations and milestones. The trophy is the universal achievement symbol.',
    usage: ['LevelUpModal (gamification achievement)'],
    semantic: 'Achievement, level up, milestone, accomplishment'
  },
  gamification: {
    name: 'gamification',
    description: 'Game controller',
    reasoning: 'Game controller represents gamification systems - XP, levels, achievements, and game-like progression. The controller is the symbol of gaming.',
    usage: ['Admin page (Gamification Preview section)', 'Admin analytics page'],
    semantic: 'Gamification, XP, levels, achievements, game systems'
  },
  calendar: {
    name: 'calendar',
    description: 'Calendar',
    reasoning: 'Calendar represents time-based programs - structured schedules over days/weeks. Used for all multi-day program types.',
    usage: ['AI builder (4-Day, 7-Day, 4-Week workout type options)'],
    semantic: 'Schedule, program duration, time-based plans, calendar'
  },

  // ============================================
  // FORM ICONS (AI Builder)
  // ============================================
  strength: {
    name: 'strength',
    description: 'Barbell',
    reasoning: 'Barbell represents maximal strength training - same as PR1ME but used for goal selection. Consistent with strength training iconography.',
    usage: ['AI builder (Training goal: STRENGTH)'],
    semantic: 'Strength training, maximal force'
  },
  hypertrophy: {
    name: 'hypertrophy',
    description: 'Volume/muscle shape',
    reasoning: 'Layered volume shapes represent muscle growth and hypertrophy - building size through progressive volume.',
    usage: ['AI builder (Training goal: HYPERTROPHY)'],
    semantic: 'Muscle growth, volume, size building'
  },
  hybrid: {
    name: 'hybrid',
    description: 'Combined strength + cardio',
    reasoning: 'Combined barbell and cardio circle represents hybrid training - mixing strength and conditioning work.',
    usage: ['AI builder (Training goal: HYBRID)'],
    semantic: 'Hybrid training, mixed modalities'
  },
  conditioning: {
    name: 'conditioning',
    description: 'Heart rate/pulse line',
    reasoning: 'Pulse line represents cardiovascular conditioning - heart rate, endurance, and aerobic work.',
    usage: ['AI builder (Training goal: CONDITIONING)'],
    semantic: 'Cardio, endurance, heart rate, aerobic'
  },
  fatLoss: {
    name: 'fatLoss',
    description: 'Flame',
    reasoning: 'Flame represents calorie burn and metabolism - the fire of fat loss. Same visual language as FORGE but different context.',
    usage: ['AI builder (Training goal: FAT_LOSS)'],
    semantic: 'Fat loss, calorie burn, metabolism'
  },
  longevity: {
    name: 'longevity',
    description: 'Infinity symbol',
    reasoning: 'Infinity symbol represents long-term health and longevity - sustainable, continuous training for life.',
    usage: ['AI builder (Training goal: LONGEVITY)'],
    semantic: 'Longevity, sustainable training, long-term health'
  },

  // Equipment icons - all specific to equipment type
  dumbbells: { semantic: 'Dumbbell equipment' },
  kettlebell: { semantic: 'Kettlebell equipment' },
  barbell: { semantic: 'Barbell equipment' },
  erg: { semantic: 'Erg machine (generic)' },
  rower: { semantic: 'Rowing machine' },
  bike: { semantic: 'Bike/cycling equipment' },
  rings: { semantic: 'Gymnastic rings' },
  pullUpBar: { semantic: 'Pull-up bar' },
  box: { semantic: 'Box for box jumps' },
  jumpRope: { semantic: 'Jump rope' },
  sandbag: { semantic: 'Sandbag' },
  runningRoute: { semantic: 'Running route/path' },
  bodyweight: { semantic: 'Bodyweight exercises' },

  // Training cycle icons
  base: {
    name: 'base',
    description: 'Foundation blocks',
    reasoning: 'Stacked foundation blocks represent establishing a baseline - building from the ground up.',
    usage: ['AI builder (Training cycle: BASE)'],
    semantic: 'Base phase, foundation, baseline establishment'
  },
  load: {
    name: 'load',
    description: 'Increasing blocks',
    reasoning: 'Increasing block heights represent progressive volume loading - building up intensity.',
    usage: ['AI builder (Training cycle: LOAD)'],
    semantic: 'Load phase, progressive volume, building intensity'
  },
  intensify: {
    name: 'intensify',
    description: 'Peak triangle',
    reasoning: 'Peak triangle represents maximum intensity - the apex of training intensity.',
    usage: ['AI builder (Training cycle: INTENSIFY)'],
    semantic: 'Intensity phase, peak training, maximum effort'
  },
  deload: {
    name: 'deload',
    description: 'Recovery wave',
    reasoning: 'Wave pattern represents recovery and deload - flowing, restorative movement.',
    usage: ['AI builder (Training cycle: DELOAD)'],
    semantic: 'Deload phase, recovery, restoration'
  },
} as const;

