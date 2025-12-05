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
    isHyrox?: boolean; // Flag for HYROX-style 90-minute conditioning workouts (single workouts only)
    includeHyrox?: boolean; // Flag to include HYROX sessions in multi-day programs
  }) {
    // Pass archetype to the prompt
    const archetypeParam = params.archetype || undefined;
    const archetypeGuidance = this.getArchetypeGuidance(archetypeParam);
    
    // Check if running route is available
    const hasRunningRoute = params.equipment.some((eq) => 
      eq.toLowerCase().includes('running') || eq.toLowerCase().includes('route') || eq.toLowerCase().includes('outdoor')
    );

    // REVL and Hyrox workout examples
    const workoutExamples = this.getWorkoutExamples();
    
    const systemPrompt = `You are an elite hybrid coach designing sessions for the NØDE performance training system, following REVL-style programming with extreme detail and precision.

${archetypeGuidance}

CRITICAL: Generate exercises FREELY based on:
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
      "durationSec": 720 (REQUIRED for AMRAP/FOR_TIME/CAPACITY - must be specified in seconds, e.g., 480 for 8:00, 600 for 10:00),
      "emomWorkSec": 45 (REQUIRED for EMOM - work duration in seconds),
      "emomRestSec": 15 (REQUIRED for EMOM - rest duration in seconds),
      "emomRounds": 12 (REQUIRED for EMOM - total number of rounds),
      "intervalWorkSec": 20 (REQUIRED for INTERVAL/CUSTOM_INTERVAL: work duration in seconds),
      "intervalRestSec": 100 (REQUIRED for INTERVAL/CUSTOM_INTERVAL: rest duration in seconds),
      "intervalRounds": 8 (REQUIRED for INTERVAL/CUSTOM_INTERVAL: number of rounds),
      "rounds": 4 (OPTIONAL for FOR_TIME: number of rounds when format is "X:XX Cap × Y Rounds"),
      "restBetweenRounds": 30 (OPTIONAL for FOR_TIME: rest duration in seconds between rounds),
      "note": "REQUIRED for AMRAP/CIRCUIT/FOR_TIME sections - MUST include: 'Complete as many rounds as possible in [X:XX]. Rest [X] seconds between rounds if needed. Move through exercises in order: [exercise order].' Include pacing strategy, rest guidance, and round structure.",
      "blocks": [
        {
          "label": "01",
          "exerciseName": "Exercise Name (use REVL naming: BB FFE Rev Lunge, SA DB Strict Press, DBall TNG GTS, etc.)",
          "description": "Form cues, tempo notation (e.g., '2220', '2s pause', '3s eccentric'), or special instructions",
          "repScheme": "MUST be specific: '10-8-8-8' (wave), '16-14-12' (descending), '8-7-6-5+' (descending with max), '10' (fixed), 'AMRAP' (only if truly unlimited), or specific rep ranges like '8-10'",
          "tempo": "Optional: '2220', '2020', '2s pause', '3s eccentric', 'First 4 Reps: R1-2 = 2220'",
          "loadPercentage": "Optional: '@ 40-45-50-55%' (progressive across rounds) or '@ 60-65-70-75%'",
          "order": 1,
          "tierSilver": {
            "load": "12 kg" or "40% 1RM" or "Bodyweight",
            "targetReps": 10,
            "distance": 500 (REQUIRED for erg machines: rower, ski erg, bike, assault bike - use different distance/calories per tier),
            "distanceUnit": "m" or "cal" (REQUIRED for erg machines),
            "notes": "Form focus, steady pace"
          },
          "tierGold": {
            "load": "20 kg" or "50% 1RM" or "Standard RX",
            "targetReps": 12,
            "distance": 800 (REQUIRED for erg machines: MUST be different from tierSilver - higher for tierGold),
            "distanceUnit": "m" or "cal" (REQUIRED for erg machines),
            "notes": "Challenging pace, standard RX"
          },
          "tierBlack": {
            "load": "28 kg" or "60% 1RM" or "Heavy",
            "targetReps": 15,
            "distance": 1000 (REQUIRED for erg machines: MUST be different from tierGold - highest for tierBlack),
            "distanceUnit": "m" or "cal" (REQUIRED for erg machines),
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
- WARMUP: 5-10 minutes (movement prep, activation, light cardio). HYROX: 10-15 minutes
- COOLDOWN: 5 minutes (mobility, stretching, breathing). HYROX: 5-10 minutes
- Main work sections should fit within remaining time
- EMOM calculations: (workSec + restSec) × rounds = total time (e.g., 45s+15s × 12 = 12:00)
- Custom intervals: "Every 1:10" = 70s total (calculate work:rest ratio), "Every 3:30" = 210s total
- AMRAP/FOR_TIME: Duration should be realistic for training level
  * BEGINNER: 8-12 min AMRAPs, 15-20 min FOR_TIME caps
  * INTERMEDIATE: 10-15 min AMRAPs, 20-30 min FOR_TIME caps
  * ADVANCED: 12-20 min AMRAPs, 30-45 min FOR_TIME caps
  * ELITE: 15-25 min AMRAPs, 45-60 min FOR_TIME caps
  * HYROX: 20-40 min AMRAPs, 30-60 min FOR_TIME caps (long endurance blocks)
- FOR_TIME with rounds: "1:40 Cap × 4 Rounds" = durationSec: 100, rounds: 4, restBetweenRounds: 30-45
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

CRITICAL: ERG MACHINES & DISTANCE-BASED EXERCISES - MANDATORY RULES:
- For erg machines (Rower, Row, SkiErg, Ski, Bike, Bike Erg, Assault Bike, Echo Bike, BikeErg, or any exercise name containing "row", "bike", "ski", "erg"):
  * ⚠️ MANDATORY: You MUST include distance/calories in ALL THREE tiers (tierSilver, tierGold, tierBlack)
  * ⚠️ DO NOT use "N/A", "null", or leave distance empty for erg machines
  * ⚠️ DO NOT use a single distance/calories at the block level - each tier MUST be different
  * tierSilver: Lower distance/calories (e.g., 500m row, 12 cal bike, 400m ski)
  * tierGold: Medium distance/calories (e.g., 800m row, 15 cal bike, 600m ski)
  * tierBlack: Higher distance/calories (e.g., 1000m row, 18 cal bike, 800m ski)
  * Use calories (cal) for bike/assault bike exercises
  * Use meters (m) for rower/ski erg exercises
  * Example progression: SILVER: 12 cal, GOLD: 15 cal, BLACK: 18 cal (bike)
  * Example progression: SILVER: 500m, GOLD: 800m, BLACK: 1000m (rower)
  * If you see "Bike Erg", "Row", "SkiErg", "Bike", etc. in exerciseName, distance/calories are REQUIRED in all tiers
- For bodyweight exercises that use distance (Burpee Broad Jumps, Shuttle Runs, etc.):
  * tierSilver: Shorter distance (e.g., 20m, 30m)
  * tierGold: Medium distance (e.g., 40m, 50m)
  * tierBlack: Longer distance (e.g., 60m, 80m)
- For loaded exercises (dumbbells, kettlebells, barbells):
  * Use different loads per tier (as normal)
  * Distance/calories are NOT required unless it's a distance-based loaded movement (e.g., Farmers Carry)
- For bodyweight exercises with reps (Push-ups, Pull-ups, etc.):
  * Use different targetReps per tier (as normal)
  * Distance/calories are NOT required

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
    const isHyrox = params.isHyrox || false;
    const includeHyrox = params.includeHyrox || false;
    
    // For HYROX workouts, use different guidance
    let workoutTypeGuidance: string;
    let cycleGuidance: string | undefined;
    
    if (isHyrox) {
      // Single HYROX workout
      workoutTypeGuidance = 'a single HYROX-style 90-minute conditioning workout';
    } else if (includeHyrox && workoutType !== 'single') {
      // Multi-day program with HYROX sessions
      const hyroxCount = workoutType === 'fourDay' ? 1 : workoutType === 'week' ? 1 : 4; // 4-week = 4 HYROX sessions
      workoutTypeGuidance = this.getWorkoutTypeGuidance(workoutType, cycle, includeHyrox, hyroxCount);
      cycleGuidance = this.getCycleGuidance(cycle);
    } else {
      // Standard workout
      workoutTypeGuidance = this.getWorkoutTypeGuidance(workoutType, cycle);
      cycleGuidance = this.getCycleGuidance(cycle);
    }
    
    const userPrompt = `Generate ${workoutTypeGuidance} with these parameters:
${isHyrox ? `
- Workout Type: HYROX-style 90-minute conditioning session
- Focus: Endurance, pacing, sustained effort, aerobic capacity
- Structure: Extended warmup (10-15 min) → Long conditioning blocks (30-60 min) → Cooldown (5-10 min)
- NO archetype or goal needed - this is pure conditioning
` : `
- Goal: ${params.goal}
- Training Level: ${params.trainingLevel} (used for workout complexity/duration guidance only)
${archetypeParam ? `- Archetype: ${archetypeParam} (follow archetype structure exactly)` : ''}
`}
- Available Equipment: ${params.equipment.join(', ')}
- Available Time: ${params.availableMinutes} minutes per session
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

6. SECTION TIMING - Be explicit and support ALL REVL formats:
   - "1:40 Cap × 4 Rounds" = FOR_TIME with durationSec: 100, rounds: 4, restBetweenRounds: 30-45
   - "8:00 Cap — 5 Rounds" = FOR_TIME with durationSec: 480, rounds: 5, restBetweenRounds: 45-60
   - "30:00 Cap" = FOR_TIME with durationSec: 1800 (HYROX-style long cap)
   - "Every 1:10 × 12" = INTERVAL with intervalWorkSec: 60, intervalRestSec: 10, intervalRounds: 12 (total 70s per round)
   - "Every 3:30 × 4" = INTERVAL with intervalWorkSec: 180, intervalRestSec: 30, intervalRounds: 4 (total 210s per round)
   - "E2MOM × 8" = INTERVAL with intervalWorkSec: 90, intervalRestSec: 30, intervalRounds: 8 (total 120s per round)
   - "E4MOM × 2" = INTERVAL with intervalWorkSec: 180, intervalRestSec: 60, intervalRounds: 2 (total 240s per round)
   - "EMOM × 16" = EMOM with emomWorkSec: 45, emomRestSec: 15, emomRounds: 16
   - Always calculate total time: (work + rest) × rounds OR (intervalWorkSec + intervalRestSec) × intervalRounds

7. BLOCK STRUCTURES - When multiple blocks:
   - Label clearly: "Block A (14-12-10)", "Block B (12-10-8)"
   - Show rep progression for each block
   - "2 Blocks Every 1:10 × 12" = Create 2 SUPERSET sections, each with INTERVAL timing (70s intervals)
   - Use section.note to explain block rotation: "Rotate between Block A and Block B every 1:10. Complete 12 rounds total (6 of each block)."

8. PAIR/TEAM WORK - Specify format in section.note:
   - "In Pairs 1:1" = one works, one rests (specify in note)
   - "In Pairs YGIG" = You Go I Go alternating (specify in note)
   - "Teams of 3-4" = team format (specify in note)
   - Include partner/team instructions in section.note field

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
      const validatedWorkout = this.validateWorkoutSchema(workoutJson);
      
      // Extract and store new exercises from the generated workout
      await this.extractAndStoreExercises(validatedWorkout);
      
      return validatedWorkout;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate workout');
    }
  }
  
  /**
   * Extract exercises from AI-generated workout and store new ones in database
   */
  private async extractAndStoreExercises(workout: any): Promise<void> {
    try {
      const exerciseNames = new Set<string>();
      
      // Collect all unique exercise names from the workout
      if (workout.sections && Array.isArray(workout.sections)) {
        workout.sections.forEach((section: any) => {
          if (section.blocks && Array.isArray(section.blocks)) {
            section.blocks.forEach((block: any) => {
              if (block.exerciseName) {
                exerciseNames.add(block.exerciseName.trim());
              }
            });
          }
        });
      }
      
      // Check which exercises are new and need to be stored
      const existingExercises = await this.exercisesService.findAll();
      const existingNames = new Set(
        existingExercises.map((ex) => ex.name.toLowerCase())
      );
      
      const newExercises = Array.from(exerciseNames).filter(
        (name) => !existingNames.has(name.toLowerCase())
      );
      
      // Store new exercises (with minimal data - will be enriched later)
      for (const exerciseName of newExercises) {
        try {
          // Generate a simple exerciseId from the name
          const exerciseId = exerciseName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
          
          // Check if exerciseId already exists
          const existing = await this.exercisesService
            .findByExerciseId(exerciseId)
            .catch(() => null);
          
          if (!existing) {
            // Create basic exercise entry - will be enriched with instructions/variations later
            await this.exercisesService.create({
              exerciseId,
              name: exerciseName,
              category: 'MIXED', // Default - can be updated later
              movementPattern: 'FULL_BODY', // Default - can be updated later
              primaryMuscles: [], // Will be inferred later from exercise name/context
              equipment: [], // Will be inferred from workout context
              space: 'OPEN_AREA', // Default
              impactLevel: 'MEDIUM', // Default
              typicalUse: ['PRIMARY'],
              suitableArchetypes: workout.archetype ? [workout.archetype] : [],
              indoorFriendly: true,
              aiGenerated: true,
              usageCount: 1,
              instructions: null, // Will be generated later via AI enrichment
              variations: null, // Will be generated later via AI enrichment
              graphics: [],
              videoUrl: null,
              commonMistakes: [],
              progressionTips: null,
              regressionTips: null,
            });
            
            console.log(`✅ Stored new AI-generated exercise: ${exerciseName}`);
          } else {
            // Increment usage count for existing exercise
            await this.exercisesService.update(existing.id, {
              usageCount: existing.usageCount + 1,
            });
          }
        } catch (error) {
          console.error(`Failed to store exercise ${exerciseName}:`, error);
          // Continue with other exercises even if one fails
        }
      }
    } catch (error) {
      console.error('Error extracting exercises from workout:', error);
      // Don't throw - exercise extraction is non-critical
    }
  }

  private validateWorkoutSchema(workout: any): any {
    // Basic validation - ensure required fields exist
    if (!workout.name || !workout.sections || !Array.isArray(workout.sections)) {
      throw new Error('Invalid workout schema: missing required fields');
    }

    // Erg machine detection patterns
    const ergMachinePatterns = [
      /row/i, /bike/i, /ski/i, /erg/i, /assault/i, /echo/i, /airdyne/i, /concept2/i
    ];

    const isErgMachine = (exerciseName: string): boolean => {
      return ergMachinePatterns.some(pattern => pattern.test(exerciseName));
    };

    // Ensure sections have proper structure and validate erg machines
    workout.sections = workout.sections.map((section: any, index: number) => ({
      ...section,
      order: section.order || index + 1,
      blocks: (section.blocks || []).map((block: any, blockIndex: number) => {
        const updatedBlock = {
          ...block,
          order: block.order || blockIndex + 1,
        };

        // Validate erg machines have distance/calories in all tiers
        if (isErgMachine(block.exerciseName)) {
          const tiers = ['tierSilver', 'tierGold', 'tierBlack'];
          tiers.forEach((tierKey) => {
            const tier = updatedBlock[tierKey];
            if (tier) {
              // If distance is missing or null, add default values based on exercise type
              if (tier.distance === null || tier.distance === undefined || !tier.distanceUnit) {
                const exerciseName = block.exerciseName.toLowerCase();
                let defaultDistance: number;
                let defaultUnit: string;

                if (exerciseName.includes('bike') || exerciseName.includes('assault') || exerciseName.includes('echo')) {
                  // Bike exercises use calories
                  defaultUnit = 'cal';
                  if (tierKey === 'tierSilver') defaultDistance = 12;
                  else if (tierKey === 'tierGold') defaultDistance = 15;
                  else defaultDistance = 18;
                } else if (exerciseName.includes('row')) {
                  // Rower uses meters
                  defaultUnit = 'm';
                  if (tierKey === 'tierSilver') defaultDistance = 500;
                  else if (tierKey === 'tierGold') defaultDistance = 800;
                  else defaultDistance = 1000;
                } else if (exerciseName.includes('ski')) {
                  // SkiErg uses meters
                  defaultUnit = 'm';
                  if (tierKey === 'tierSilver') defaultDistance = 400;
                  else if (tierKey === 'tierGold') defaultDistance = 600;
                  else defaultDistance = 800;
                } else {
                  // Default to meters
                  defaultUnit = 'm';
                  if (tierKey === 'tierSilver') defaultDistance = 500;
                  else if (tierKey === 'tierGold') defaultDistance = 800;
                  else defaultDistance = 1000;
                }

                tier.distance = defaultDistance;
                tier.distanceUnit = defaultUnit;
                console.log(`✅ Auto-added distance for ${block.exerciseName} ${tierKey}: ${defaultDistance}${defaultUnit}`);
              }
            }
          });
        }

        return updatedBlock;
      }),
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
=== REVL PROGRAM EXAMPLES - STUDY THESE EXACTLY ===

PERFORM TOTAL Example:
WARMUP (4:00 Cap):
- 1-2 Sets: 8 × BB Deadlift
- :30 Plate Deadbug
- 10 × DB Plank Row
- 10 × SL Glute Bridge

S1 (1:40 Cap × 4 Rounds):
- 10 × BB Deadlift @ 40-45-50-55%
  - First 4 Reps: R1-2 = 2220, R3-4 = 2020
- 8 × SA DB Strict Press
- 10 × Weighted OH Sit Up
- Rest :30-:45

S2 (Every 1:10 × 12):
- 16-14-12 (descending reps each round)
1. Alt BB FFE Rev Lunge
2. DB NG Bench Press
3. DBall Squat
4. Pull Up

S3 (In Pairs 1:1 — 6:00 Cap):
- 120/100 American KB Swing
- Every 20 Reps: 6 × Synchro Burpee
- Score = Time

PERFORM LOWER Example:
WARMUP (4:00 Cap):
- 1-2 Sets: 10 × BB Back/Front Squat
- :20 Side Plank Clamshell e/s
- 8 × Split Stance SA DB RDL
- :30 Hollow Hold

S1 (1:40 Cap × 4 Rounds):
- 8-10 × BB Back/Front Squat @ 40-45-50-55%
  - First 4 Reps: R1-2 = 2120, R3-4 = 2020
- 8-10 × DBall TNG GTS
- :30 Dragon Flag (Quality)
- Rest :30-:45

S2 (Every 1:10 × 12):
- 12-10-8 (descending reps)
1. BB Hip Thrust (First 4 reps = 1s pause)
2. 6-8-8-8 FFE KOT Split Squat
3. 8-12 KB Bent Over Row
4. 12-15 Butterfly Sit Up

S3 (In Pairs YGIG — 6:00 AMRAP):
- 2 × BB/KB Hang Power Clean
- 3 × BB/KB Front Squat

PERFORM UPPER Example:
WARMUP (4:00 Cap):
- 1-2 Sets: 10 × BB Bench Press
- 8 × 90° DB External Rotation
- 8 × Hand Release Push Up
- 8 × SA Gorilla Row

S1 (1:40 Cap × 4 Rounds):
- 10 × BB Bench Press @ 40-45-50-55%
  - First 4 Reps: R1-2 = 2220, R3-4 = 2020
- 12-16 × KB Seesaw Row
- 8 × DBall Supp Weighted Pull Over
- Rest :45

S2 (2 Blocks Every 1:10 × 12):
Block A (14-12-10):
1. BB Strict Press
2. 10-12 Incline DB Curl

Block B (12-10-8):
1. Pull Up
2. 8-10 DBall Supp DB Pec Fly

S3 (In Pairs 1:1 — 6:00 Cap):
- 100/100 BB/DB Curl
- 8-10-12... KB High Pull

ERG MACHINE TIER EXAMPLES (CRITICAL - Study these exactly):

Example - Rower with Tier-Specific Distances:
{
  "exerciseName": "Row",
  "tierSilver": {
    "load": "Bodyweight",
    "targetReps": null,
    "distance": 500,
    "distanceUnit": "m",
    "notes": "Steady pace, focus on form"
  },
  "tierGold": {
    "load": "Bodyweight",
    "targetReps": null,
    "distance": 800,
    "distanceUnit": "m",
    "notes": "Challenging pace, maintain stroke rate"
  },
  "tierBlack": {
    "load": "Bodyweight",
    "targetReps": null,
    "distance": 1000,
    "distanceUnit": "m",
    "notes": "High intensity, competition pace"
  }
}

Example - Bike with Tier-Specific Calories:
{
  "exerciseName": "Bike Erg",
  "tierSilver": {
    "load": "Bodyweight",
    "targetReps": null,
    "distance": 12,
    "distanceUnit": "cal",
    "notes": "Steady pace, focus on breathing"
  },
  "tierGold": {
    "load": "Bodyweight",
    "targetReps": null,
    "distance": 15,
    "distanceUnit": "cal",
    "notes": "Challenging pace, push the pace"
  },
  "tierBlack": {
    "load": "Bodyweight",
    "targetReps": null,
    "distance": 18,
    "distanceUnit": "cal",
    "notes": "Max effort, competition standard"
  }
}

Example - SkiErg with Tier-Specific Distances:
{
  "exerciseName": "SkiErg",
  "tierSilver": {
    "load": "Bodyweight",
    "targetReps": null,
    "distance": 400,
    "distanceUnit": "m",
    "notes": "Steady pace, focus on technique"
  },
  "tierGold": {
    "load": "Bodyweight",
    "targetReps": null,
    "distance": 600,
    "distanceUnit": "m",
    "notes": "Challenging pace, maintain rhythm"
  },
  "tierBlack": {
    "load": "Bodyweight",
    "targetReps": null,
    "distance": 800,
    "distanceUnit": "m",
    "notes": "High intensity, competition pace"
  }
}

HYROX WORKOUT EXAMPLES:

Example 1 - Hyrox Race Simulation:
"HYROX RACE SIM // 01"
WARMUP: 10 min run + dynamic prep
FOR_TIME (Cap 45:00):
- 1km Run
- 100m SkiErg (tierSilver: 80m, tierGold: 100m, tierBlack: 120m)
- 1km Run
- 50 Wall Balls (9/6 kg)
- 1km Run
- 100m Farmers Walk (24/16 kg)
- 1km Run
- 80m Sandbag Lunges (20/14 kg)
- 1km Run
- 100 Burpee Broad Jumps
- 1km Run
- 1000m Row (tierSilver: 800m, tierGold: 1000m, tierBlack: 1200m)
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

  private getWorkoutTypeGuidance(workoutType: string, cycle: string = 'BASE', includeHyrox: boolean = false, hyroxCount: number = 0): string {
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
        const weekHyrox = includeHyrox ? `\n- Include 1 HYROX-style 90-minute conditioning session (recommended: Day 4 or Day 5)` : '';
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

