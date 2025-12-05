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
    workoutType?: 'single' | 'week' | 'month' | 'fourDay';
    cycle?: 'BASE' | 'LOAD' | 'INTENSIFY' | 'DELOAD';
  }) {
    // Pass archetype to the prompt
    const archetypeParam = params.archetype || undefined;
    const archetypeGuidance = this.getArchetypeGuidance(archetypeParam);
    
    // Get exercises from database and filter by available equipment
    const allExercises = await this.exercisesService.findAll();
    const hasRunningRoute = params.equipment.some((eq) => 
      eq.toLowerCase().includes('running') || eq.toLowerCase().includes('route') || eq.toLowerCase().includes('outdoor')
    );
    
    const availableExercises = allExercises.filter((ex) => {
      // Always include bodyweight exercises
      if (ex.equipment.length === 0) return true;
      
      // Include running exercises if running route is available
      if (hasRunningRoute && (
        ex.name.toLowerCase().includes('run') || 
        ex.name.toLowerCase().includes('sprint') ||
        ex.equipment.some((e) => e.toLowerCase().includes('run') || e.toLowerCase().includes('route'))
      )) {
        return true;
      }
      
      // Match equipment
      return params.equipment.some((eq) =>
        ex.equipment.some((e) => e.toLowerCase().includes(eq.toLowerCase())),
      );
    });

    // Format exercises for prompt with detailed metadata
    const exerciseList = availableExercises
      .map((ex) => {
        const equipmentStr = ex.equipment.join(', ') || 'bodyweight';
        const archetypesStr = ex.suitableArchetypes.join(', ');
        const primaryMuscles = ex.primaryMuscles.join(', ') || 'N/A';
        const secondaryMuscles = ex.secondaryMuscles?.join(', ') || '';
        const space = ex.space || 'N/A';
        const impact = ex.impactLevel || 'N/A';
        const typicalUse = ex.typicalUse?.join(', ') || 'N/A';
        const notes = ex.notes || '';
        
        // Format tier prescriptions if available
        let tierInfo = '';
        if (ex.tiers && ex.tiers.length > 0) {
          const tierPrescriptions = ex.tiers.map((tier: any) => {
            const reps = tier.typicalReps ? ` ${tier.typicalReps} reps` : '';
            const desc = tier.description ? ` (${tier.description})` : '';
            return `${tier.tier}:${reps}${desc}`;
          }).join(' | ');
          tierInfo = ` | Tiers: ${tierPrescriptions}`;
        }
        
        return `- ${ex.name}
  Category: ${ex.category} | Pattern: ${ex.movementPattern}
  Equipment: ${equipmentStr} | Space: ${space} | Impact: ${impact}
  Muscles: ${primaryMuscles}${secondaryMuscles ? ` (secondary: ${secondaryMuscles})` : ''}
  Typical Use: ${typicalUse} | Archetypes: ${archetypesStr}${tierInfo}
  ${notes ? `Notes: ${notes}` : ''}`;
      })
      .join('\n\n');

    // REVL and Hyrox workout examples
    const workoutExamples = this.getWorkoutExamples();
    
    const systemPrompt = `You are an elite hybrid coach designing sessions for the NØDE performance training system, following REVL-style programming with extreme detail and precision.

${archetypeGuidance}

EXERCISE REFERENCE (for inspiration - you can create variations):
${exerciseList.length > 0 ? exerciseList.substring(0, 2000) + '...\n(Additional exercises available in database)' : 'No exercises in database - generate based on equipment and movement patterns'}

CRITICAL: You are NOT limited to the exercise database. Generate exercises based on:
- Available equipment: ${params.equipment.join(', ')}
- Movement patterns needed for the archetype
- REVL-style naming conventions (e.g., "BB FFE Rev Lunge", "SA DB Strict Press", "DBall TNG GTS")
- Compound movements and variations

REVL WORKOUT FORMATTING EXAMPLES (study these EXACTLY):
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
      "type": "WARMUP" | "EMOM" | "AMRAP" | "FOR_TIME" | "FINISHER" | "COOLDOWN" | "WAVE" | "SUPERSET" | "CIRCUIT" | "CAPACITY" | "FLOW" | "INTERVAL",
      "order": 1,
      "durationSec": 720 (for AMRAP/FOR_TIME/CAPACITY),
      "emomWorkSec": 45 (for EMOM),
      "emomRestSec": 15 (for EMOM),
      "emomRounds": 12 (for EMOM),
      "intervalWorkSec": 20 (for INTERVAL: work duration in seconds),
      "intervalRestSec": 100 (for INTERVAL: rest duration in seconds),
      "intervalRounds": 8 (for INTERVAL: number of rounds),
      "note": "Optional section note",
      "blocks": [
        {
          "label": "01",
          "exerciseName": "Exercise Name (use REVL naming: BB FFE Rev Lunge, SA DB Strict Press, DBall TNG GTS, etc.)",
          "description": "Form cues, tempo notation (e.g., '2220', '2s pause', '3s eccentric'), or special instructions",
          "repScheme": "MUST be specific: '10-8-8-8' (wave), '16-14-12' (descending), '8-7-6-5+' (descending with max), '10' (fixed), 'AMRAP' (only if truly unlimited), or specific rep ranges like '8-10'",
          "tempo": "Optional: '2220', '2020', '2s pause', '3s eccentric', 'First 4 Reps: R1-2 = 2220'",
          "loadPercentage": "Optional: '@ 40-45-50-55%' (progressive across rounds) or '@ 60-65-70-75%'",
          "distance": 200 (optional, for distance-based),
          "distanceUnit": "m" or "cal",
          "order": 1,
          "tierSilver": {
            "load": "12 kg" or "40% 1RM" or "Bodyweight",
            "targetReps": 10,
            "notes": "Form focus, steady pace"
          },
          "tierGold": {
            "load": "20 kg" or "50% 1RM" or "Standard RX",
            "targetReps": 12,
            "notes": "Challenging pace, standard RX"
          },
          "tierBlack": {
            "load": "28 kg" or "60% 1RM" or "Heavy",
            "targetReps": 15,
            "notes": "Competition standard, high intensity"
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

INTERVAL Section Type (Sprint Sessions):
- Use INTERVAL for sprint/interval work with specific work:rest ratios
- Examples: 20s max bike, 100s rest, repeat 6-10 rounds
- Common patterns: 20s/100s, 30s/90s, 40s/80s, 15s/45s
- Total time = (intervalWorkSec + intervalRestSec) × intervalRounds
- Perfect for REVL-style sprint sessions, power development, anaerobic capacity
- Can be used as FINISHER or standalone section

TIME MANAGEMENT GUIDELINES:
- WARMUP: 5-10 minutes (movement prep, activation, light cardio)
- COOLDOWN: 5 minutes (mobility, stretching, breathing)
- Main work sections should fit within remaining time
- EMOM calculations: (workSec + restSec) × rounds = total time (e.g., 45s+15s × 12 = 12:00)
- AMRAP/FOR_TIME: Duration should be realistic for training level
  * BEGINNER: 8-12 min AMRAPs, 15-20 min FOR_TIME caps
  * INTERMEDIATE: 10-15 min AMRAPs, 20-30 min FOR_TIME caps
  * ADVANCED: 12-20 min AMRAPs, 30-45 min FOR_TIME caps
  * ELITE: 15-25 min AMRAPs, 45-60 min FOR_TIME caps
- Total workout time = WARMUP + Main Work + FINISHER (optional) + COOLDOWN
- Always leave 2-3 minutes buffer for transitions

TIER PRESCRIPTION GUIDELINES:
- SILVER (Beginner/Intermediate): Focus on mechanics, lighter loads, steady pace, completion goal
- GOLD (Advanced): Standard RX weights, challenging pace, requires established strength base
- BLACK (Elite): Competition standard, heavy loading, high intensity, failure is likely
- Use exercise tier prescriptions from the database when available, otherwise estimate based on:
  * Training level (BEGINNER/INTERMEDIATE → SILVER, ADVANCED → GOLD, ELITE → BLACK)
  * Exercise complexity
  * Movement pattern
  * Typical use (CONDITIONING exercises = higher reps, FINISHER = max effort)
- ALWAYS generate all three tiers (SILVER, GOLD, BLACK) for each exercise block so users can scale up/down

REALISTIC WORKOUT DESIGN:
- Ensure workouts are challenging but achievable within the time limit
- Consider equipment transitions and setup time
- Balance intensity with volume based on training level
- Progressive difficulty: BASE < LOAD < INTENSIFY > DELOAD
- Running distances: 100m, 200m, 400m, 800m, 1km are common. Only include if "running route" is in equipment.
- Avoid unrealistic rep schemes or distances that would exceed time limits
- Match exercise selection to available equipment and space requirements

Design workouts that are challenging, progressive, realistic, and aligned with the user's goals, equipment, and time constraints.`;

    const workoutType = params.workoutType || 'single';
    const cycle = params.cycle || 'BASE';
    const workoutTypeGuidance = this.getWorkoutTypeGuidance(workoutType, cycle);
    
    const cycleGuidance = this.getCycleGuidance(cycle);
    
    const userPrompt = `Generate ${workoutTypeGuidance} with these parameters:
- Goal: ${params.goal}
- Training Level: ${params.trainingLevel} (used for workout complexity/duration guidance only)
- Available Equipment: ${params.equipment.join(', ')}
- Available Time: ${params.availableMinutes} minutes per session
${archetypeParam ? `- Archetype: ${archetypeParam} (follow archetype structure exactly)` : ''}
- Preferred Sections: ${params.sectionPreferences?.join(', ') || 'Auto-select based on archetype'}
${cycleGuidance ? `- Cycle: ${cycle} - ${cycleGuidance}` : ''}

${workoutTypeGuidance}

CRITICAL REQUIREMENTS - REVL-LEVEL DETAIL:

1. REP SCHEMES - NEVER use vague numbers:
   - ✅ CORRECT: "10-8-8-8", "16-14-12", "8-7-6-5+", "4-3-2-1-1"
   - ❌ WRONG: "10 reps", "some reps", "AMRAP" (unless truly unlimited)
   - Show progression: descending, ascending, or wave patterns
   - For AMRAP sections, specify target rep ranges per round

2. LOAD SPECIFICATIONS - ALWAYS include:
   - Percentage-based: "@ 40-45-50-55%" (progressive across rounds)
   - OR Tier-specific loads: "12 kg / 20 kg / 28 kg"
   - Show progression if multiple rounds

3. TEMPO NOTATION - Include when relevant:
   - "2220" = 2s down, 2s pause, 2s up, 0s pause
   - "2s pause" = pause at bottom
   - "3s eccentric" = slow lowering
   - "First 4 Reps: R1-2 = 2220" = tempo for specific reps/rounds

4. EXERCISE NAMING - Use REVL conventions:
   - Full descriptive names: "BB FFE Rev Lunge", "SA DB Strict Press"
   - Include equipment: "DBall", "KB", "BB", "SA" (Single Arm), "Alt" (Alternating)
   - Specify variations: "TNG" (Touch and Go), "FFE" (Front Foot Elevated), "KOT" (Knee Over Toe)

5. EVERY exercise block MUST include:
   - Specific rep scheme (not vague)
   - All three tiers (tierSilver, tierGold, tierBlack) with specific loads/reps
   - Load percentages OR tier-specific loads
   - Tempo notation when applicable
   - Clear description with form cues

6. SECTION TIMING - Be explicit:
   - "1:40 Cap × 4 Rounds" = time cap and round count
   - "Every 1:10 × 12" = interval and total rounds
   - "EMOM × 16" = EMOM with total rounds
   - Always calculate total time: (work + rest) × rounds

7. BLOCK STRUCTURES - When multiple blocks:
   - Label clearly: "Block A (14-12-10)", "Block B (12-10-8)"
   - Show rep progression for each block
   - Specify timing: "2 Blocks Every 1:10 × 12"

8. PAIR/TEAM WORK - Specify format:
   - "In Pairs 1:1" = one works, one rests
   - "In Pairs YGIG" = You Go I Go alternating
   - "Teams of 3-4" = team format

CRITICAL TIME CONSTRAINTS:
- Total workout must fit within ${params.availableMinutes} minutes
- WARMUP: 5-10 minutes
- COOLDOWN: 5 minutes
- Main work sections: ${params.availableMinutes - 15} minutes maximum (accounting for warmup/cooldown)
- If generating multiple workouts, each must independently fit within ${params.availableMinutes} minutes

EQUIPMENT NOTES:
${hasRunningRoute ? '- Running route available: You may include running distances (100m, 200m, 400m, 800m, 1km) in workouts' : '- NO running route available: Do NOT include running exercises or distances'}
- Only use exercises that match the available equipment list
- Ensure all exercises are realistic for the training level and equipment available

Generate workouts that are effective, time-appropriate, challenging but achievable, and properly structured with all three tiers for every exercise.`;

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
      if (workoutType === 'week' || workoutType === 'month' || workoutType === 'fourDay') {
        // For week/month/fourDay, expect workouts array in response
        const workouts = workoutJson.workouts || (Array.isArray(workoutJson) ? workoutJson : [workoutJson]);
        return workouts.map((w: any, idx: number) => ({
          ...this.validateWorkoutSchema(w),
          dayIndex: (workoutType === 'week' || workoutType === 'fourDay') ? idx + 1 : undefined,
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

REVL SPRINT SESSION EXAMPLES:
Example 1 - Bike Sprint Intervals:
"REVL SPRINT // 01"
WARMUP: 5 min easy bike
INTERVAL:
- Exercise: Bike Erg (Max Effort)
- intervalWorkSec: 20 (20 seconds max effort)
- intervalRestSec: 100 (100 seconds rest)
- intervalRounds: 8
- Total time: (20 + 100) × 8 = 960 seconds = 16 minutes
COOLDOWN: 5 min easy bike

Example 2 - Mixed Sprint Session:
"REVL POWER // 02"
WARMUP: 5 min
INTERVAL:
- Exercise: Assault Bike (Max Effort)
- intervalWorkSec: 30
- intervalRestSec: 90
- intervalRounds: 6
- Total time: (30 + 90) × 6 = 720 seconds = 12 minutes
FINISHER: 3 rounds: 10 Cal Bike + 10 KB Swings
COOLDOWN: 5 min

Common INTERVAL patterns:
- 20s work / 100s rest (1:5 ratio) - Power development
- 30s work / 90s rest (1:3 ratio) - Anaerobic capacity
- 15s work / 45s rest (1:3 ratio) - Speed/power
- 40s work / 80s rest (1:2 ratio) - Capacity work
- Rounds typically: 6-10 for power, 8-12 for capacity

Use INTERVAL section type for REVL-style sprint sessions with specific work:rest ratios.

Use these patterns and exercise names when generating workouts.`;
  }

  private getWorkoutTypeGuidance(workoutType: string, cycle: string = 'BASE'): string {
    switch (workoutType) {
      case 'fourDay':
        return `Generate a 4-DAY PROGRAM (4 workouts). Return JSON with this structure:
{
  "workouts": [
    { "name": "Day 1", "dayIndex": 1, ...workout structure... },
    { "name": "Day 2", "dayIndex": 2, ...workout structure... },
    { "name": "Day 3", "dayIndex": 3, ...workout structure... },
    { "name": "Day 4", "dayIndex": 4, ...workout structure... }
  ]
}
- Day 1: Load (higher intensity/volume) - Strength or Hybrid focus
- Day 2: Active Recovery or Engine - Lower intensity, aerobic focus
- Day 3: Load (higher intensity/volume) - Different stimulus than Day 1
- Day 4: Active Recovery or FLOWSTATE - Mobility, recovery, light movement

Perfect for athletes with limited time. Maintains intensity while respecting recovery.`;
      
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

  private getCycleGuidance(cycle: string): string {
    switch (cycle) {
      case 'BASE':
        return 'BASE CYCLE: Establish baseline with moderate intensity and volume. Focus on movement quality and building foundation.';
      case 'LOAD':
        return 'LOAD CYCLE: Increase volume and intensity progressively. Challenge capacity while maintaining form.';
      case 'INTENSIFY':
        return 'INTENSIFY CYCLE: Peak intensity with lower volume. Maximum effort, high intensity work.';
      case 'DELOAD':
        return 'DELOAD CYCLE: Recovery week with lower intensity. Focus on mobility, light movement, and active recovery.';
      default:
        return '';
    }
  }
}

