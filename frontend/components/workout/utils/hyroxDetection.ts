export function isHyroxWorkout(workout: { name?: string; archetype?: string | null; description?: string }): boolean {
  // Check if workout name contains "HYROX" (case-insensitive)
  if (workout.name && /hyrox/i.test(workout.name)) {
    return true;
  }

  // Check if description contains "HYROX"
  if (workout.description && /hyrox/i.test(workout.description)) {
    return true;
  }

  // HYROX workouts typically have null archetype (they're special format)
  // But we can't rely solely on this as other workouts might also have null archetype
  // So we combine with name/description check above

  return false;
}

