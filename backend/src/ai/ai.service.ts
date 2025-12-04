import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ExercisesService } from '../exercises/exercises.service';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private exercisesService: ExercisesService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateWorkout(params: {
    goal: string;
    trainingLevel: string;
    equipment: string[];
    availableMinutes: number;
    sectionPreferences?: string[];
    archetype?: string;
    workoutType?: 'single' | 'week' | 'month'; // New: single workout, 1-week program, 4-week program
  }) {
    // Pass archetype to the prompt
    const archetypeParam = params.archetype || undefined;
    const archetypeGuidance = this.getArchetypeGuidance(archetypeParam);
    
    // Get exercises from database and filter by available equipment
    const allExercises = await this.exercisesService.findAll();
    const availableExercises = allExercises.filter((ex) =>
      params.equipment.some((eq) =>
        ex.equipment.some((e) => e.toLowerCase().includes(eq.toLowerCase())),
      ) || ex.equipment.length === 0, // Include bodyweight exercises
    );

    // Format exercises for prompt
    const exerciseList = availableExercises
      .map((ex) => {
        const equipmentStr = ex.equipment.join(', ');
        const archetypesStr = ex.suitableArchetypes.join(', ');
        return `- ${ex.name} (${ex.category}, ${ex.movementPattern}, Equipment: ${equipmentStr || 'bodyweight'}, Archetypes: ${archetypesStr})`;
      })
      .join('\n');

    // REVL and Hyrox workout examples
    const workoutExamples = this.getWorkoutExamples();
    
    const systemPrompt = `You are an elite hybrid coach designing sessions for the NØDE performance training system.

${archetypeGuidance}

AVAILABLE EXERCISES (use these exact names):
${exerciseList}

WORKOUT EXAMPLES (study these for structure and rep schemes):
${workoutExamples}

You MUST respond with ONLY valid JSON that matches this exact schema:

{
  "name": "Workout Name (use NØDE naming: PR1ME // 01, FORGE // 02, ENGIN3 // 03, etc.)",
  "displayCode": "Optional code like PR1ME-01 or ENGIN3-02",
  "archetype": "PR1ME" | "FORGE" | "ENGIN3" | "CIRCUIT_X" | "CAPAC1TY" | "FLOWSTATE" | null,
  "description": "Brief archetype description",
  "sections": [
    {
      "title": "Section Title",
      "type": "WARMUP" | "EMOM" | "AMRAP" | "FOR_TIME" | "FINISHER" | "COOLDOWN" | "WAVE" | "SUPERSET" | "CIRCUIT" | "CAPACITY" | "FLOW",
      "order": 1,
      "durationSec": 720 (for AMRAP/FOR_TIME/CAPACITY),
      "emomWorkSec": 45 (for EMOM),
      "emomRestSec": 15 (for EMOM),
      "emomRounds": 12 (for EMOM),
      "note": "Optional section note",
      "blocks": [
        {
          "label": "01",
          "exerciseName": "Exercise Name",
          "description": "Form cues or notes",
          "repScheme": "10" or "10-8-8-8" (for WAVE) or "AMRAP" or "100 cals",
          "distance": 200 (optional, for distance-based),
          "distanceUnit": "m" or "cal",
          "order": 1,
          "tierSilver": {
            "load": "12 kg",
            "targetReps": 10,
            "notes": "Optional"
          },
          "tierGold": {
            "load": "16 kg",
            "targetReps": 12,
            "notes": "Optional"
          },
          "tierBlack": {
            "load": "20 kg",
            "targetReps": 15,
            "notes": "Optional"
          }
        }
      ]
    }
  ]
}

Section Types by Archetype:
- PR1ME: WARMUP → WAVE (main lift) → SUPERSET (secondary) → Optional FINISHER → COOLDOWN
- FORGE: WARMUP → SUPERSET (Block A) → SUPERSET (Block B) → Optional FINISHER → COOLDOWN
- ENGIN3: WARMUP → EMOM (skill + engine + loaded movement) → Optional FINISHER → COOLDOWN
- CIRCUIT_X: WARMUP → AMRAP (4-8 min) → AMRAP (4-8 min) → Optional FINISHER → COOLDOWN
- CAPAC1TY: WARMUP → CAPACITY (12-20 min long block) → COOLDOWN
- FLOWSTATE: WARMUP → FLOW (tempo work, KB flows, slow EMOMs) → COOLDOWN

Design workouts that are challenging, progressive, and aligned with the user's goals and equipment.`;

    const workoutType = params.workoutType || 'single';
    const workoutTypeGuidance = this.getWorkoutTypeGuidance(workoutType);
    
    const userPrompt = `Generate ${workoutTypeGuidance} with these parameters:
- Goal: ${params.goal}
- Training Level: ${params.trainingLevel}
- Available Equipment: ${params.equipment.join(', ')}
- Available Time: ${params.availableMinutes} minutes per session
${archetypeParam ? `- Archetype: ${archetypeParam} (follow archetype structure exactly)` : ''}
- Preferred Sections: ${params.sectionPreferences?.join(', ') || 'Auto-select based on archetype'}

${workoutTypeGuidance}

Ensure each workout time fits within ${params.availableMinutes} minutes.`;

    try {
      // For week/month, we need an array response
      const responseFormat = workoutType === 'single' 
        ? { type: 'json_object' as const }
        : { type: 'json_object' as const }; // Still JSON object, but will contain workouts array

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o', // Updated to use gpt-4o model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: responseFormat,
        temperature: 0.7,
      });

      const workoutJson = JSON.parse(
        completion.choices[0].message.content || '{}',
      );

      // Handle different workout types
      if (workoutType === 'week' || workoutType === 'month') {
        // For week/month, expect workouts array in response
        const workouts = workoutJson.workouts || (Array.isArray(workoutJson) ? workoutJson : [workoutJson]);
        return workouts.map((w: any, idx: number) => ({
          ...this.validateWorkoutSchema(w),
          dayIndex: workoutType === 'week' ? idx + 1 : undefined,
          weekIndex: workoutType === 'month' ? Math.floor(idx / 5) + 1 : undefined,
        }));
      }

      // Validate and return single workout
      return this.validateWorkoutSchema(workoutJson);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate workout');
    }
  }

  private validateWorkoutSchema(workout: any): any {
    // Basic validation - ensure required fields exist
    if (!workout.name || !workout.sections || !Array.isArray(workout.sections)) {
      throw new Error('Invalid workout schema: missing required fields');
    }

    // Ensure sections have proper structure
    workout.sections = workout.sections.map((section: any, index: number) => ({
      ...section,
      order: section.order || index + 1,
      blocks: (section.blocks || []).map((block: any, blockIndex: number) => ({
        ...block,
        order: block.order || blockIndex + 1,
      })),
    }));

    return workout;
  }

  private getArchetypeGuidance(archetype?: string): string {
    const archetypes = {
      PR1ME: `NØDE // PR1ME - Primary Strength Day
Purpose: Build maximal strength, refined technique, progressive overload.
Structure: Warm-up → Main Lift Wave (Deadlift/Squat/Bench/Strict Press) → Secondary Lift Superset → Optional short finisher
Wave Examples: 10-8-8-8, 9-8-7-6+, 6-4-3-2-1, 6-3-1-1-1, 5-3-2-1-1
Use WAVE section type for main lift sets.`,

      FORGE: `NØDE // FORGE - Strength Superset Day
Purpose: Develop muscular balance, body armor, skill under fatigue.
Structure: Warm-up → Block A: Strength superset (push/pull or squat/hinge) → Block B: Accessory pump block
Examples: BB Strict Press + Push Jerk, RFE Split Squat + Pull-ups, DB Rows + Incline Bench
Use SUPERSET section type for paired exercises.`,

      ENGIN3: `NØDE // ENGIN3 - Hybrid EMOM Day
Purpose: Improve threshold capacity, aerobic power, movement efficiency.
Structure: Warm-up → EMOM/E2MOM (skill + engine + loaded movement) → Optional short burner
Examples: EMOM x 16 (4 stations × 4 rounds), E2MOM x 8, 1:10 rotation × 12
Use EMOM section type with multiple stations.`,

      CIRCUIT_X: `NØDE // CIRCUIT X - Anaerobic / MetCon Day
Purpose: Develop fast conditioning, mixed modal capacity, anaerobic durability.
Structure: Warm-up → 1-3 AMRAP blocks (4-8 mins) → Pair work, YGIG, or solo cycles
Examples: 6:30 AMRAP (pairs), 4-min burners, Hyrox-style rep schemes (100/80/60 reps)
Use AMRAP or CIRCUIT section types.`,

      CAPAC1TY: `NØDE // CAPAC1TY - Long Engine Conditioning
Purpose: Build aerobic base, pacing strategy, long-range repeatability.
Structure: Warm-up → One long block (12-20 mins) or two medium blocks
Examples: 18:00 cap, 14:00 aerobic engine, 30:00 mixed capacity
Use CAPACITY section type for long duration blocks.`,

      FLOWSTATE: `NØDE // FLOWSTATE - Deload, Movement & Mobility
Purpose: Facilitate recovery, mobility, tissue health, longevity.
Structure: Light lifting (tempo) → KB flows → Slow EMOMs → Long cooldown → Breathwork + mobility
Use FLOW section type for tempo work and movement flows.`,
    };

    if (archetype && archetypes[archetype as keyof typeof archetypes]) {
      return archetypes[archetype as keyof typeof archetypes];
    }

    return `NØDE Training System - Six Core Archetypes:
1. PR1ME: Primary strength with wave sets
2. FORGE: Strength supersets for hypertrophy
3. ENGIN3: Hybrid EMOM for power and efficiency
4. CIRCUIT_X: Anaerobic MetCon for speed and grit
5. CAPAC1TY: Long engine conditioning for aerobic base
6. FLOWSTATE: Deload and mobility for recovery

Select the appropriate archetype based on the user's goals and available time.`;
  }

  private getWorkoutExamples(): string {
    return `
REVL WORKOUT EXAMPLES:

Example 1 - Hyrox-Style MetCon:
"HYROX PREP // 01"
WARMUP: 5 min dynamic warmup
AMRAP 20:00:
- 100m SkiErg
- 80 Wall Balls (9/6 kg)
- 60m Farmers Walk (24/16 kg)
- 40 Burpee Broad Jumps
- 20m Sandbag Lunges (20/14 kg)
- 100m Row
FINISHER: 3 rounds for time: 10 Cal Bike + 10 KB Swings

Example 2 - REVL Strength Circuit:
"REVL STRENGTH // 02"
WARMUP: 8 min movement prep
AMRAP 12:00:
- 8 DB Thrusters (22.5/15 kg)
- 12 Pull-ups
- 16 DB Goblet Squats (22.5/15 kg)
- 20 Cal Row
REST 2:00
AMRAP 10:00:
- 10 KB Swings (24/16 kg)
- 15 Box Step-ups (24/20")
- 20 Cal Bike
- 25 AbMat Sit-ups

HYROX WORKOUT EXAMPLES:

Example 1 - Hyrox Race Simulation:
"HYROX RACE SIM // 01"
WARMUP: 10 min run + dynamic prep
FOR_TIME (Cap 45:00):
- 1km Run
- 100m SkiErg
- 1km Run
- 50 Wall Balls (9/6 kg)
- 1km Run
- 100m Farmers Walk (24/16 kg)
- 1km Run
- 80m Sandbag Lunges (20/14 kg)
- 1km Run
- 100 Burpee Broad Jumps
- 1km Run
- 1000m Row
- 1km Run
- 200m Farmers Walk (24/16 kg)

Example 2 - Hyrox Station Focus:
"HYROX STATIONS // 02"
WARMUP: 5 min
EMOM x 20:
Min 1: 20 Wall Balls (9/6 kg)
Min 2: 15 Burpee Broad Jumps
Min 3: 100m Farmers Walk (24/16 kg)
Min 4: 20m Sandbag Lunges (20/14 kg)
Min 5: 100m Row
REST 2:00
Repeat 3 more rounds
FINISHER: 2km Run for time

REVL/HYROX REP SCHEME PATTERNS:
- Descending reps: 100 → 80 → 60 → 40 → 20
- Ascending reps: 10 → 15 → 20 → 25 → 30
- Round-based: 5 rounds of 20/15/10
- Time-based: AMRAP 12:00, FOR_TIME with cap
- Distance-based: 100m, 200m, 400m, 1km runs/rows
- Mixed modal: Run → Station → Run → Station pattern

Use these patterns and exercise names when generating workouts.`;
  }

  private getWorkoutTypeGuidance(workoutType: string): string {
    switch (workoutType) {
      case 'week':
        return `Generate a 1-WEEK PROGRAM (7 workouts). Return JSON with this structure:
{
  "workouts": [
    { "name": "Day 1", "dayIndex": 1, ...workout structure... },
    { "name": "Day 2", "dayIndex": 2, ...workout structure... },
    ... (7 total)
  ]
}
- Day 1: Load (higher intensity/volume)
- Day 2: Active Recovery or Engine
- Day 3: Load
- Day 4: Active Recovery or Engine
- Day 5: Load
- Day 6: Deload (lower intensity, mobility focus)
- Day 7: Rest or FLOWSTATE

Progressive load across the week.`;
      
      case 'month':
        return `Generate a 4-WEEK PROGRAM with progressive loading. Return JSON with this structure:
{
  "workouts": [
    { "name": "Week 1 Day 1", "weekIndex": 1, "dayIndex": 1, ...workout structure... },
    ... (20-24 total workouts)
  ]
}
- Week 1: BASE (establish baseline, moderate intensity) - 5-6 workouts
- Week 2: LOAD (increase volume/intensity) - 5-6 workouts
- Week 3: INTENSIFY (peak intensity, lower volume) - 5-6 workouts
- Week 4: DELOAD (recovery week, lower intensity, mobility focus) - 4-5 workouts

Progressive overload: Week 1 < Week 2 < Week 3 > Week 4.`;
      
      default:
        return 'Generate a SINGLE WORKOUT (one-off session).';
    }
  }
}

