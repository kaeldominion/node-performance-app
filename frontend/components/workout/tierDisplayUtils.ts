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
 * Get the display value for a tier based on exercise type
 * Priority:
 * 1. Distance/calories for erg machines
 * 2. TargetReps for bodyweight rep exercises
 * 3. Load (if not "Bodyweight" or if no targetReps)
 * 4. Fallback to "—"
 */
export function getTierDisplayValue(
  tier: {
    distance?: number | null;
    distanceUnit?: string | null;
    targetReps?: number | null;
    load?: string | null;
    notes?: string | null;
  },
  exerciseName: string
): string {
  const isErg = isErgMachine(exerciseName);
  const isBodyweightRep = isBodyweightRepExercise(exerciseName);
  
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
  
  // 3. For bodyweight rep exercises (box jumps, pull-ups, etc.), prioritize targetReps
  if (isBodyweightRep && tier.targetReps !== null && tier.targetReps !== undefined) {
    return `${tier.targetReps} reps`;
  }
  
  // 4. For other exercises, show targetReps if available
  if (tier.targetReps !== null && tier.targetReps !== undefined) {
    return `${tier.targetReps} reps`;
  }
  
  // 5. Show load only if it's not "Bodyweight" (or if there's no targetReps)
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

