# Exercise Classification Fix

## Problem Identified

All exercises in the database were showing:
- **Category**: `MIXED` (incorrect default)
- **Movement Pattern**: `FULL_BODY` (incorrect default)
- **Equipment**: Sometimes showing "Bodyweight" when it should show actual equipment (e.g., "BB Back Squat" showing "Bodyweight" instead of "barbell, plates, rack")

## Root Cause

The issue was in `backend/src/ai/ai.service.ts` in the `extractAndStoreExercises` function. When the AI generated new exercises, they were being stored with hardcoded defaults:
- `category: 'MIXED'`
- `movementPattern: 'FULL_BODY'`
- `equipment: []` (empty array, which displays as "Bodyweight")

## Solutions Implemented

### 1. Improved AI Service Classification Logic

Added intelligent classification functions to `ai.service.ts`:
- `inferCategoryFromName()` - Classifies exercises into STRENGTH, MIXED, SKILL, ENGINE, CORE, or MOBILITY
- `inferMovementPatternFromName()` - Classifies exercises into proper movement patterns (HORIZONTAL_PUSH, SQUAT, HINGE, etc.)
- `inferPrimaryMusclesFromName()` - Infers primary muscles from exercise names
- `inferEquipmentFromName()` - Improved equipment inference (now includes 'rack' for barbell squats, etc.)

**Examples:**
- "BB Back Squat" → Category: `STRENGTH`, Pattern: `SQUAT`, Equipment: `['barbell', 'plates', 'rack']`
- "Bench Press" → Category: `STRENGTH`, Pattern: `HORIZONTAL_PUSH`, Equipment: `['barbell', 'plates', 'bench']`
- "5 min Jog" → Category: `ENGINE`, Pattern: `LOC0MOTION`, Equipment: `[]` (bodyweight)
- "Burpee" → Category: `ENGINE`, Pattern: `FULL_BODY`, Equipment: `[]` (bodyweight)

### 2. Created Migration Script

Created `backend/scripts/fix-exercise-classifications.ts` to fix all existing exercises in the database.

**Features:**
- Reads all exercises from the database
- Uses the same classification logic to infer correct category, movement pattern, and equipment
- Only updates exercises that need fixing (compares current vs inferred values)
- Provides detailed logging of what was changed
- Safe to run multiple times (idempotent)

### 3. Added Air Squat Exercise

Added a new "Air Squat" exercise to the seed file for bodyweight squats:
- Exercise ID: `air_squat`
- Name: "Air Squat"
- Category: `STRENGTH`
- Movement Pattern: `SQUAT`
- Equipment: `[]` (bodyweight)

## How to Use

### Fix Existing Exercises in Database

Run the migration script to fix all existing exercises:

```bash
cd backend
npm run fix:exercise-classifications
```

This will:
1. Read all exercises from the database
2. Infer correct classifications from exercise names
3. Update exercises that have incorrect data
4. Show a summary of what was fixed

### Re-seed Database (Optional)

If you want to start fresh with correct seed data:

```bash
cd backend
npm run prisma:seed:exercises
```

This will upsert all exercises from the seed file with correct classifications.

## Classification Logic Examples

### Categories

- **STRENGTH**: Most barbell/dumbbell exercises (bench press, squats, deadlifts, rows)
- **MIXED**: Hybrid exercises (thrusters, wall balls, sled pushes, kettlebell swings)
- **SKILL**: Technical movements (snatches, cleans, muscle-ups, Turkish get-ups)
- **ENGINE**: Cardio/conditioning (running, rowing, biking, burpees, jump rope)
- **CORE**: Core-specific (planks, hollow holds, sit-ups, Russian twists)
- **MOBILITY**: Mobility/flexibility (stretches, Cossack squats, World's Greatest Stretch)

### Movement Patterns

- **HORIZONTAL_PUSH**: Bench press, push-ups, floor press
- **HORIZONTAL_PULL**: Rows, face pulls
- **VERTICAL_PUSH**: Overhead press, strict press, push press
- **VERTICAL_PULL**: Pull-ups, lat pulldowns, chin-ups
- **SQUAT**: All squat variations (back squat, front squat, goblet squat)
- **HINGE**: Deadlifts, RDLs, good mornings, swings, hip thrusts
- **LUNGE**: All lunge variations, step-ups, split squats
- **CARRY**: Farmer carries, sandbag carries
- **LOC0MOTION**: Running, crawling, rowing erg, biking erg
- **FULL_BODY**: Complex movements (burpees, thrusters, Turkish get-ups)
- **CORE_ANTI_EXTENSION**: Planks, dead bugs, hollow holds
- **CORE_ROTATION**: Russian twists, Pallof presses
- **BREATH_MOBILITY**: Stretches, mobility work

## Next Steps

1. **Run the fix script** to update existing exercises:
   ```bash
   npm run fix:exercise-classifications
   ```

2. **Verify the fixes** by checking the exercises page in the frontend

3. **Future AI-generated exercises** will now automatically have correct classifications

## Notes

- The classification logic uses pattern matching on exercise names, so it works best with standard naming conventions
- Exercises with non-standard names might need manual correction
- The seed file already has correct classifications for all exercises
- The fix script is safe to run multiple times - it only updates exercises that need fixing

