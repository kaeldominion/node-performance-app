/**
 * Utility functions for displaying exercise tier information
 */

/**
 * Check if an exercise is an erg machine (rower, bike, ski erg)
 */
export function isErgMachine(exerciseName: string): boolean {
  const ergPatterns = [/row/i, /bike/i, /ski/i, /erg/i, /assault/i, /echo/i, /airdyne/i];
  return ergPatterns.some(pattern => pattern.test(exerciseName));
}

/**
 * Check if an exercise is a bodyweight exercise that uses reps (not distance/calories)
 */
export function isBodyweightRepExercise(exerciseName: string): boolean {
  const name = exerciseName.toLowerCase();
  // Exercises that are bodyweight but use rep counts, not distance/calories
  const bodyweightRepExercises = [
    'box jump', 'pull up', 'pullup', 'chin up', 'push up', 'pushup',
    'dip', 'situp', 'sit-up', 'crunch', 'plank', 'burpee',
    'jump', 'lunge', 'squat', 'air squat', 'hollow', 'dead bug',
    'knees to chest', 'ttb', 'toes to bar', 'muscle up'
  ];
  return bodyweightRepExercises.some(ex => name.includes(ex));
}

/**
 * Check if an exercise is a slam ball (should show weight/load in tier display)
 */
export function isSlamBall(exerciseName: string): boolean {
  const name = exerciseName.toLowerCase();
  return /slam\s*ball|slamball/i.test(name);
}

/**
 * Check if an exercise is a heavy lift (strength exercise using % 1RM)
 */
export function isHeavyLift(exerciseName: string, block?: { loadPercentage?: string | null }, tier?: { load?: string | null }): boolean {
  const name = exerciseName.toLowerCase();
  
  // Check if block has loadPercentage (indicates % 1RM loading)
  if (block?.loadPercentage) {
    return true;
  }
  
  // Check if tier load contains % 1RM
  if (tier?.load && /%\s*(?:1RM|of\s*1RM)/i.test(tier.load)) {
    return true;
  }
  
  // Common heavy lift patterns (barbell, dumbbell, kettlebell exercises)
  const heavyLiftPatterns = [
    /deadlift/i, /squat/i, /bench/i, /press/i, /clean/i, /snatch/i,
    /jerk/i, /thruster/i, /front.*squat/i, /back.*squat/i, /overhead.*squat/i,
    /strict.*press/i, /push.*press/i, /shoulder.*press/i,
    /bb\s/i, /barbell/i, /db\s/i, /dumbbell/i, /kb\s/i, /kettlebell/i
  ];
  
  // Exclude rowing exercises (they use distance, not % 1RM)
  if (/row/i.test(name) && !/barbell.*row|db.*row|dumbbell.*row/i.test(name)) {
    return false;
  }
  
  return heavyLiftPatterns.some(pattern => pattern.test(name));
}

/**
 * Extract percentage from load string (e.g., "40% 1RM" -> "40%")
 */
function extractPercentage(load: string): string | null {
  const match = load.match(/(\d+(?:\.\d+)?)\s*%\s*(?:1RM|of\s*1RM)?/i);
  return match ? `${match[1]}%` : null;
}

/**
 * Get the display value for a tier based on exercise type
 * Priority:
 * 1. Distance/calories for erg machines
 * 2. Load (% 1RM) for heavy lifts
 * 3. TargetReps for bodyweight rep exercises
 * 4. TargetReps for other exercises
 * 5. Load (if not "Bodyweight" or if no targetReps)
 * 6. Fallback to "—"
 */
export function getTierDisplayValue(
  tier: {
    distance?: number | null;
    distanceUnit?: string | null;
    targetReps?: number | null;
    load?: string | null;
    notes?: string | null;
  },
  exerciseName: string,
  block?: { loadPercentage?: string | null }
): string {
  const isErg = isErgMachine(exerciseName);
  const isBodyweightRep = isBodyweightRepExercise(exerciseName);
  const isHeavy = isHeavyLift(exerciseName, block, tier);
  
  // 1. For erg machines, always show distance/calories
  if (isErg) {
    if (tier.distance !== null && tier.distance !== undefined && tier.distanceUnit) {
      return `${tier.distance}${tier.distanceUnit}`;
    }
    // Show helpful instruction if missing
    return 'Choose tier for distance/cal';
  }
  
  // 2. For distance-based exercises (not erg machines)
  if (tier.distance !== null && tier.distance !== undefined && tier.distanceUnit) {
    return `${tier.distance}${tier.distanceUnit}`;
  }
  
  // 3. For heavy lifts, prioritize load (% 1RM) over reps
  if (isHeavy && tier.load) {
    const percentage = extractPercentage(tier.load);
    if (percentage) {
      return percentage;
    }
    // If load doesn't contain %, show the load as-is (might be "12 kg" etc.)
    return tier.load;
  }
  
  // 3.5. For slam ball exercises, prioritize load (weight) over reps
  if (isSlamBall(exerciseName) && tier.load) {
    return tier.load;
  }
  
  // 4. For bodyweight rep exercises (box jumps, pull-ups, etc.), prioritize targetReps
  if (isBodyweightRep && tier.targetReps !== null && tier.targetReps !== undefined) {
    return `${tier.targetReps} reps`;
  }
  
  // 5. For other exercises, show targetReps if available
  if (tier.targetReps !== null && tier.targetReps !== undefined) {
    return `${tier.targetReps} reps`;
  }
  
  // 6. Show load only if it's not "Bodyweight" (or if there's no targetReps)
  if (tier.load) {
    const loadLower = tier.load.toLowerCase();
    // Skip "Bodyweight" if this is a bodyweight rep exercise (should show reps instead)
    if (loadLower === 'bodyweight' && isBodyweightRep) {
      return '—';
    }
    return tier.load;
  }
  
  return '—';
}

