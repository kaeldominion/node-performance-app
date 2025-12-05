import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ExercisesService } from '../exercises/exercises.service';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private exercisesService: ExercisesService) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    // Log API key status (without exposing the key)
    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY is not set. AI workout generation will fail.');
    } else {
      console.log('✅ OPENAI_API_KEY is set:', {
        hasKey: true,
        keyLength: apiKey.length,
        keyPrefix: apiKey.substring(0, 7) + '...',
        keySuffix: '...' + apiKey.substring(apiKey.length - 4),
      });
    }
    
    this.openai = new OpenAI({
      apiKey: apiKey || '', // Will fail with clear error if not set
      timeout: 120000, // 120 seconds timeout for long requests
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
    console.log('🔧 generateWorkout called with params:', {
      goal: params.goal,
      trainingLevel: params.trainingLevel,
      equipment: params.equipment,
      availableMinutes: params.availableMinutes,
      workoutType: params.workoutType,
      hasOpenAIClient: !!this.openai,
      apiKeySet: !!process.env.OPENAI_API_KEY,
    });
    
    // Pass archetype to the prompt (only for single workouts)
    // For multi-day programs, archetype will be randomly selected by AI based on goal
    const archetypeParam = (params.workoutType === 'single' && params.archetype) ? params.archetype : undefined;
    const archetypeGuidance = archetypeParam ? this.getArchetypeGuidance(archetypeParam) : '';
    
    // Check if running route is available
    const hasRunningRoute = params.equipment.some((eq) => 
      eq.toLowerCase().includes('running') || eq.toLowerCase().includes('route') || eq.toLowerCase().includes('outdoor')
    );

    // REVL and Hyrox workout examples
    const workoutExamples = this.getWorkoutExamples();
    
    const systemPrompt = `You are an elite hybrid coach designing sessions for the NØDE performance training system, following REVL-style programming with extreme detail and precision.

${archetypeGuidance ? archetypeGuidance + '\n\n' : ''}

CRITICAL: Generate exercises FREELY based on:
- Available equipment: ${params.equipment.join(', ')}
- Movement patterns needed for the archetype
- REVL-style naming conventions (e.g., "BB FFE Rev Lunge", "SA DB Strict Press", "DBall TNG GTS")
- Compound movements and variations

IMPORTANT EXERCISES TO KNOW:
- WALL BALL: Essential for HYROX workouts. Squat to target, throw ball to wall target. Standard weights: 9kg (men) / 6kg (women). Use in high-rep conditioning blocks (20-100 reps per set).
- SLAM BALL: Explosive overhead slam to ground. Great for power and conditioning. Use in circuits, finishers, and conditioning blocks.
- BALLS TO OVERHEAD (or Balls Over Shoulder): Carry ball from ground to overhead/shoulder position. Excellent for grip, core, and shoulder stability. Use in carry circuits and conditioning blocks.
- When "slam balls" equipment is available, you can use: Slam Ball, Balls to Overhead, Balls Over Shoulder exercises
- When "wall ball" or similar equipment is available, you can use: Wall Ball Shot exercises

REVL WORKOUT FORMATTING EXAMPLES (study these EXACTLY):
${workoutExamples}

You MUST respond with ONLY valid JSON that matches this exact schema:

FOR SINGLE WORKOUTS:
{
  "name": "Generate a unique 3-4 word descriptive name based on the workout content (e.g., 'Strength Squat Wave', 'Hybrid EMOM Burpee', 'Circuit Rower AMRAP'). Do NOT use generic names like 'Workout Name' or NØDE codes like 'PR1ME // 01'. The name should describe the key exercises and format.",
  "displayCode": "Optional code like PR1ME-01 or ENGIN3-02",
  "archetype": "PR1ME" | "FORGE" | "ENGIN3" | "CIRCUIT_X" | "CAPAC1TY" | "FLOWSTATE" | null,
  "description": "Brief archetype description",
  "sections": [

FOR MULTI-DAY PROGRAMS (4-day, 7-day, 4-week):
{
  "workouts": [
    {
      "name": "Generate a unique 3-4 word descriptive name based on the workout content (e.g., 'Strength Squat Wave', 'Hybrid EMOM Burpee', 'Circuit Rower AMRAP'). Do NOT use generic names like 'Workout Name' or 'Day 1'. The name should describe the key exercises and format.",
      "displayCode": "Optional code",
      "dayIndex": 1 (REQUIRED for 4-day and 7-day programs),
      "weekIndex": 1 (REQUIRED for 4-week programs),
      "archetype": "PR1ME" | "FORGE" | "ENGIN3" | "CIRCUIT_X" | "CAPAC1TY" | "FLOWSTATE" | null,
      "description": "Brief description",
      "sections": [
    {
      "title": "Section Title",
      "type": "WARMUP" | "EMOM" | "AMRAP" | "FOR_TIME" | "FINISHER" | "COOLDOWN" | "WAVE" | "SUPERSET" | "CIRCUIT" | "CAPACITY" | "FLOW" | "INTERVAL",
      "order": 1,
      "durationSec": 720 (REQUIRED for ALL sections except EMOM/INTERVAL - must be specified in seconds. WARMUP: 300-600s, COOLDOWN: 300s, WAVE: 600-1200s, SUPERSET: 600-900s, AMRAP/FOR_TIME/CAPACITY: 480-1800s, FINISHER: 180-600s, FLOW: 600-900s),
      "emomWorkSec": 45 (REQUIRED for EMOM - work duration in seconds),
      "emomRestSec": 15 (REQUIRED for EMOM - rest duration in seconds),
      "emomRounds": 12 (REQUIRED for EMOM - total number of rounds),
      "intervalWorkSec": 20 (REQUIRED for INTERVAL - work duration in seconds),
      "intervalRestSec": 100 (REQUIRED for INTERVAL - rest duration in seconds),
      "intervalRounds": 8 (REQUIRED for INTERVAL - number of rounds),
      "rounds": 4 (REQUIRED for SUPERSET sections - number of rounds to complete the superset pair, typically 4-6 rounds. OPTIONAL for FOR_TIME: number of rounds when format is "X:XX Cap × Y Rounds"),
      "restBetweenRounds": 30 (REQUIRED for SUPERSET sections with rounds - rest duration in seconds between rounds (30-60s). OPTIONAL for FOR_TIME: rest duration in seconds between rounds),
      "note": "REQUIRED for AMRAP/CIRCUIT/FOR_TIME/SUPERSET/CAPACITY sections - MUST include: 'Complete [X] rounds of the superset pair. Rest [X] seconds between rounds.' OR 'Complete as many rounds as possible in [X:XX]. Rest [X] seconds between rounds if needed. Move through exercises in order: [exercise order].' For AMRAP/CIRCUIT sections, MUST include tier-based round targets: 'Target rounds: SILVER [X-X] rounds, GOLD [X-X] rounds, BLACK [X-X] rounds' (e.g., 'Target rounds: SILVER 3-4 rounds, GOLD 4-5 rounds, BLACK 5-6 rounds'). For CAPACITY sections, MUST mention: 'Target number of rounds according to tier' or similar guidance about tier-based round targets. Include pacing strategy, rest guidance, and round structure.",
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

FOR MULTI-DAY PROGRAMS: Each workout in the workouts array follows the same structure as above, and the response should be:
{
  "workouts": [
    { ...workout structure with dayIndex/weekIndex ... },
    { ...workout structure ... },
    ...
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

CRITICAL: EVERY SECTION MUST HAVE A TIME - NO EXCEPTIONS:
- WARMUP: REQUIRED durationSec: 300-600 seconds (5-10 min). HYROX: 600-900 seconds (10-15 min)
- COOLDOWN: REQUIRED durationSec: 300 seconds (5 min). HYROX: 300-600 seconds (5-10 min)
- WAVE: REQUIRED durationSec: 600-1200 seconds (10-20 min) - total time for all waves
- SUPERSET: REQUIRED durationSec: 600-900 seconds (10-15 min) - total time for superset block
  * SUPERSET sections MUST have either:
    a) "rounds" field (e.g., rounds: 4-6) with "restBetweenRounds" (30-60s) - complete X rounds of the superset pair
    b) "note" field explaining AMRAP format (e.g., "Complete as many rounds as possible in 10:00. Rest 30s between rounds if needed.")
  * A single superset pair (2 exercises × 8-10 reps) takes ~2-3 minutes, so you MUST include rounds or AMRAP format
  * Example: 4 rounds × 2 exercises = ~8-12 minutes of work (fits 10:00 cap)
  * Example: AMRAP 10:00 = complete as many rounds as possible in 10 minutes
  * ⚠️ NEVER create a SUPERSET with only one round - it will not fill the time cap
- AMRAP: REQUIRED durationSec: 480-1800 seconds (8-30 min) - countdown timer duration
- FOR_TIME: REQUIRED durationSec: 600-3600 seconds (10-60 min) - time cap
- CAPACITY: REQUIRED durationSec: 720-1800 seconds (12-30 min) - long conditioning block
- FINISHER: REQUIRED durationSec: 180-600 seconds (3-10 min) - short high-intensity block
- FLOW: REQUIRED durationSec: 600-900 seconds (10-15 min) - tempo/mobility work
- EMOM: REQUIRED emomWorkSec + emomRestSec + emomRounds (total time = (workSec + restSec) × rounds)
- INTERVAL: REQUIRED intervalWorkSec + intervalRestSec + intervalRounds (total time = (workSec + restSec) × rounds)

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
- ⚠️ NEVER create a section without durationSec (or emomWorkSec/intervalWorkSec for EMOM/INTERVAL)

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
- For erg machines (Rower, Row, SkiErg, Ski, BikeErg/Concept2 Bike, Assault Bike, Echo Bike, or any exercise name containing "row", "bike", "ski", "erg"):
- NOTE: BikeErg (Concept2) and Assault/Echo Bike are DIFFERENT machines - use "BikeErg" for Concept2, "Assault Bike" or "Echo Bike" for fan bikes
  * ⚠️ MANDATORY: You MUST include distance/calories in ALL THREE tiers (tierSilver, tierGold, tierBlack)
  * ⚠️ DO NOT use "N/A", "null", or leave distance empty for erg machines
  * ⚠️ DO NOT use a single distance/calories at the block level - each tier MUST be different
  * tierSilver: Lower distance/calories (e.g., 500m row, 12 cal bike, 400m ski)
  * tierGold: Medium distance/calories (e.g., 800m row, 15 cal bike, 600m ski)
  * tierBlack: Higher distance/calories (e.g., 1000m row, 18 cal bike, 800m ski)
  * Use calories (cal) for BikeErg and Assault/Echo Bike exercises
  * Use meters (m) for rower and ski erg exercises
  * Example progression: SILVER: 12 cal, GOLD: 15 cal, BLACK: 18 cal (BikeErg or Assault Bike)
  * Example progression: SILVER: 500m, GOLD: 800m, BLACK: 1000m (rower or ski erg)
  * If you see "BikeErg", "Bike Erg", "Assault Bike", "Echo Bike", "Row", "SkiErg", etc. in exerciseName, distance/calories are REQUIRED in all tiers
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
    // For 4-week programs, cycle is automatic (BASE → LOAD → INTENSIFY → DELOAD)
    // For other multi-day programs, use provided cycle or default to BASE
    const cycle = (workoutType === 'month') ? undefined : (params.cycle || 'BASE');
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
      // Only show cycle guidance for non-4-week programs
      cycleGuidance = workoutType !== 'month' ? this.getCycleGuidance(cycle) : undefined;
    } else {
      // Standard workout
      workoutTypeGuidance = this.getWorkoutTypeGuidance(workoutType, cycle);
      // Only show cycle guidance for non-4-week programs
      cycleGuidance = workoutType !== 'month' ? this.getCycleGuidance(cycle) : undefined;
    }
    
    // For multi-day programs, don't use archetype - let AI randomly select based on goal
    const shouldUseArchetype = workoutType === 'single' && !isHyrox && archetypeParam;
    
    const userPrompt = `Generate ${workoutTypeGuidance} with these parameters:
${isHyrox ? `
- Workout Type: HYROX-style 90-minute conditioning session
- Focus: Endurance, pacing, sustained effort, aerobic capacity
- Structure: Extended warmup (10-15 min) → Long conditioning blocks (30-60 min) → Cooldown (5-10 min)
- NO archetype or goal needed - this is pure conditioning
- CRITICAL: WALL BALL is a mandatory exercise for HYROX workouts. Always include Wall Ball exercises (typically 20-100 reps per set, 9kg/6kg weights). It's one of the core HYROX race stations.
` : `
- Goal: ${params.goal}
- Training Level: ${params.trainingLevel} (used for workout complexity/duration guidance only)
${shouldUseArchetype ? `- Archetype: ${archetypeParam} (follow archetype structure exactly)` : ''}
${workoutType !== 'single' ? `
- Archetype Selection: For each workout in the program, randomly select an appropriate archetype based on the goal (${params.goal}).
  * STRENGTH goal: Prefer PR1ME, FORGE, ENGIN3
  * HYPERTROPHY goal: Prefer PR1ME, FORGE, CIRCUIT_X
  * HYBRID goal: Mix of PR1ME, FORGE, ENGIN3, CIRCUIT_X, CAPAC1TY
  * CONDITIONING goal: Prefer ENGIN3, CIRCUIT_X, CAPAC1TY
  * FAT_LOSS goal: Prefer CIRCUIT_X, CAPAC1TY, ENGIN3
  * LONGEVITY goal: Mix with more FLOWSTATE
  * IMPORTANT: Only use FLOWSTATE rarely (max 1-2 times in a 4-day program, 1-2 times in a 7-day program, 2-3 times in a 4-week program)
  * Create variety - don't repeat the same archetype consecutively unless it makes sense for the program structure
` : ''}
`}
- Available Equipment: ${params.equipment.join(', ')}
- Available Time: ${params.availableMinutes} minutes per session
- Preferred Sections: ${params.sectionPreferences?.join(', ') || 'Auto-select based on archetype'}
${cycleGuidance ? `- Cycle: ${cycle} - ${cycleGuidance}` : ''}
${workoutType === 'month' ? `
- IMPORTANT: This is a 4-week program. Each week automatically follows its cycle:
  * Week 1 workouts = BASE cycle (moderate intensity, establish baseline)
  * Week 2 workouts = LOAD cycle (increased volume/intensity)
  * Week 3 workouts = INTENSIFY cycle (peak intensity, lower volume)
  * Week 4 workouts = DELOAD cycle (recovery, lower intensity, mobility focus)
  Adjust workout intensity, volume, and complexity accordingly for each week.` : ''}

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
        let workouts = workoutJson.workouts;
        
        // Fallback: if workouts is not an array, try to extract it
        if (!workouts) {
          if (Array.isArray(workoutJson)) {
            workouts = workoutJson;
          } else {
            // Single workout object - wrap it
            workouts = [workoutJson];
          }
        }
        
        // Validate and map workouts with proper dayIndex/weekIndex, with review and retry
        const validatedWorkouts = await Promise.all(workouts.map(async (w: any, idx: number) => {
          let validated = this.validateWorkoutSchema(w);
          
          // Set dayIndex and weekIndex based on workout type
          if (workoutType === 'fourDay') {
            // 4-day: dayIndex 1-4
            validated.dayIndex = w.dayIndex || idx + 1;
          } else if (workoutType === 'week') {
            // 7-day: dayIndex 1-7
            validated.dayIndex = w.dayIndex || idx + 1;
          } else if (workoutType === 'month') {
            // 4-week: weekIndex 1-4, dayIndex 1-6 (typically 5-6 workouts per week)
            // Calculate weekIndex: assume ~5 workouts per week
            const calculatedWeekIndex = Math.floor(idx / 5) + 1;
            validated.weekIndex = w.weekIndex || calculatedWeekIndex;
            // dayIndex within the week (1-5 or 1-6)
            const dayInWeek = (idx % 5) + 1;
            validated.dayIndex = w.dayIndex || dayInWeek;
          }
          
          // Review each workout (but don't regenerate individual workouts in multi-day programs)
          // Just log issues for now - full regeneration would be too expensive
          try {
            const reviewed = await this.reviewAndAdjustWorkout(validated, params);
            return reviewed;
          } catch (error: any) {
            // For multi-day programs, log but don't fail - return the validated workout
            console.warn(`⚠️  Workout ${idx + 1} has issues but continuing with program:`, error.message);
            return validated;
          }
        }));
        
        return validatedWorkouts;
      }

      // Validate and return single workout
      let validatedWorkout = this.validateWorkoutSchema(workoutJson);
      
      // Review and adjust workout if needed (with retry logic for critical issues)
      let reviewedWorkout: any;
      let regenerationAttempts = 0;
      const maxRegenerationAttempts = 2; // Allow up to 2 regenerations
      
      while (regenerationAttempts <= maxRegenerationAttempts) {
        try {
          reviewedWorkout = await this.reviewAndAdjustWorkout(validatedWorkout, params);
          break; // Success - exit loop
          } catch (error: any) {
            if (error.message?.includes('CRITICAL_TIME_MISMATCH') || error.message?.includes('ADJUSTMENT_FAILED')) {
              regenerationAttempts++;
              
              if (regenerationAttempts > maxRegenerationAttempts) {
                console.error(`❌ Failed after ${maxRegenerationAttempts} regeneration attempts. Returning last valid workout.`);
                // Return the last validated workout even if it has issues
                reviewedWorkout = validatedWorkout;
                break;
              }
              
              console.log(`🔄 Regenerating workout (attempt ${regenerationAttempts}/${maxRegenerationAttempts}) due to: ${error.message}`);
              
              // Use the attached issues list if available, otherwise parse from error message
              const criticalIssuesList = error.criticalIssues || 
                error.message.replace('CRITICAL_TIME_MISMATCH: ', '').replace('ADJUSTMENT_FAILED: ', '').split('; ').filter((i: string) => i.trim());
            
            // Regenerate with specific guidance about the issues
            const regenerationPrompt = `${userPrompt}

CRITICAL: The previous workout generation had timing issues that must be fixed. Please regenerate the workout ensuring these issues are resolved:

${criticalIssuesList.map((issue, idx) => `${idx + 1}. ${issue}`).join('\n')}

SPECIFIC REQUIREMENTS FOR REGENERATION:
- All section durations MUST match the actual work required
- SUPERSET sections MUST have either:
  * "rounds" field (4-6 rounds) with "restBetweenRounds" (30-60s), OR
  * AMRAP format in "note" field (e.g., "Complete as many rounds as possible in [X:XX]")
- A single superset pair (2 exercises) takes ~2-3 minutes
- For a 10-minute SUPERSET section, you need 4-6 rounds (not just 1 round)
- Estimated work time must align with section durationSec (±20% tolerance)
- Total workout time must fit within ${params.availableMinutes} minutes

Generate a completely new workout that properly addresses all timing issues.`;

            const regenerationCompletion = await this.openai.chat.completions.create({
              model: 'gpt-4o',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: regenerationPrompt },
              ],
              response_format: { type: 'json_object' as const },
              temperature: 0.7,
            });

            const regeneratedWorkoutJson = JSON.parse(
              regenerationCompletion.choices[0].message.content || '{}',
            );
            
            validatedWorkout = this.validateWorkoutSchema(regeneratedWorkoutJson);
            // Loop will continue and try reviewAndAdjustWorkout again
          } else {
            // Non-regeneration error - throw it
            throw error;
          }
        }
      }
      
      // Extract and store new exercises from the generated workout
      await this.extractAndStoreExercises(reviewedWorkout, params.equipment);
      
      return reviewedWorkout;
    } catch (error: any) {
      // Log the exact error before processing
      console.error('❌ Error in generateWorkout:', {
        errorType: error?.constructor?.name,
        errorMessage: error?.message,
        errorStatus: error?.status,
        errorCode: error?.code,
        errorResponse: error?.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        } : null,
      });
      console.error('OpenAI API error:', {
        message: error?.message,
        status: error?.status,
        code: error?.code,
        type: error?.type,
        response: error?.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        } : null,
        stack: error?.stack,
      });
      
      // Check if OpenAI API key is missing or invalid
      if (error?.status === 401 || 
          error?.response?.status === 401 ||
          error?.message?.includes('Invalid API key') || 
          error?.message?.includes('Incorrect API key') ||
          error?.response?.data?.error?.code === 'invalid_api_key') {
        throw new Error('OpenAI API key is missing or invalid. Please configure OPENAI_API_KEY in your environment variables.');
      }
      
      // Check for rate limiting
      if (error?.status === 429 || error?.message?.includes('rate limit')) {
        throw new Error('OpenAI API rate limit exceeded. Please try again in a moment.');
      }
      
      // Check for network/timeout errors
      if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout') || error?.message?.includes('ETIMEDOUT')) {
        throw new Error('Request timed out. The AI service is taking longer than expected. Please try again.');
      }
      
      // Check for network errors
      if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED' || error?.message?.includes('network')) {
        throw new Error('Network error connecting to OpenAI. Please check your internet connection and try again.');
      }
      
      // Check for API errors
      if (error?.response?.data?.error?.message) {
        throw new Error(`OpenAI API error: ${error.response.data.error.message}`);
      }
      
      // Generic error with more context
      const errorMessage = error?.message || 'Unknown error';
      throw new Error(`Failed to generate workout: ${errorMessage}`);
    }
  }
  
  /**
   * Extract exercises from AI-generated workout and store new ones in database
   */
  private inferEquipmentFromName(exerciseName: string, workoutEquipment: string[]): string[] {
    const name = exerciseName.toLowerCase();
    const equipment: string[] = [];
    
    // Equipment patterns
    if (name.includes('bb ') || name.includes('barbell') || name.includes('bar ')) {
      equipment.push('barbell');
      equipment.push('plates');
    }
    if (name.includes('db ') || name.includes('dumbbell') || name.includes('dumbbell')) {
      equipment.push('dumbbell');
    }
    if (name.includes('kb ') || name.includes('kettlebell')) {
      equipment.push('kettlebell');
    }
    if (name.includes('bench') || name.includes('incline') || name.includes('decline')) {
      if (!equipment.includes('bench')) equipment.push('bench');
    }
    if (name.includes('row') && (name.includes('erg') || name.includes('machine'))) {
      equipment.push('rower');
    }
    // Distinguish between BikeErg (Concept2) and Assault/Echo Bike
    if (name.includes('assault bike') || name.includes('airdyne') || name.includes('echo bike') || name.includes('air bike')) {
      equipment.push('air_bike');
    } else if (name.includes('bike') && (name.includes('erg') || name.includes('bikeerg') || name.includes('concept2'))) {
      // Concept2 BikeErg
      equipment.push('bike_erg');
    } else if (name.includes('bike') && name.includes('erg')) {
      // Generic bike erg - default to bike_erg
      equipment.push('bike_erg');
    }
    if (name.includes('ski') && name.includes('erg')) {
      equipment.push('ski_erg');
    }
    if (name.includes('sled')) {
      equipment.push('sled');
    }
    if (name.includes('wall ball') || name.includes('wallball')) {
      equipment.push('wall_ball');
    }
    if (name.includes('slam ball') || name.includes('slamball') || name.includes('ball slam')) {
      equipment.push('slam_ball');
    }
    if (name.includes('balls to overhead') || name.includes('balls over shoulder') || name.includes('ball overhead') || name.includes('ball over shoulder')) {
      equipment.push('slam_ball');
    }
    if (name.includes('sandbag')) {
      equipment.push('sandbag');
    }
    if (name.includes('farmers') || name.includes('farmer')) {
      equipment.push('dumbbell'); // Farmers walk typically uses DBs or KBs
    }
    if (name.includes('pull') && (name.includes('up') || name.includes('down'))) {
      equipment.push('rig');
    }
    if (name.includes('dip')) {
      equipment.push('rig');
    }
    if (name.includes('ghd') || name.includes('glute ham')) {
      equipment.push('ghd');
    }
    if (name.includes('squat') && (name.includes('rack') || name.includes('bb ') || name.includes('barbell'))) {
      if (!equipment.includes('rack')) equipment.push('rack');
    }
    
    // If no equipment inferred and it's not bodyweight, try to match from workout equipment
    if (equipment.length === 0 && workoutEquipment && workoutEquipment.length > 0) {
      // Check if exercise name contains any workout equipment keywords
      const workoutEqLower = workoutEquipment.map(eq => eq?.toLowerCase() || '').filter(Boolean);
      for (const eq of workoutEqLower) {
        if (eq && (name.includes(eq.replace(/_/g, ' ')) || name.includes(eq.replace(/_/g, '')))) {
          equipment.push(eq);
        }
      }
    }
    
    // If still no equipment, it's likely bodyweight
    // Return empty array to indicate bodyweight (frontend will display "Bodyweight")
    return equipment;
  }

  /**
   * Infer exercise category from exercise name
   */
  private inferCategoryFromName(exerciseName: string): 'STRENGTH' | 'MIXED' | 'SKILL' | 'ENGINE' | 'CORE' | 'MOBILITY' {
    const name = exerciseName.toLowerCase();
    
    // ENGINE: Cardio/conditioning exercises
    if (name.includes('run') || name.includes('jog') || name.includes('sprint') || 
        name.includes('row') && (name.includes('erg') || name.includes('machine')) ||
        name.includes('bike') && (name.includes('erg') || name.includes('assault') || name.includes('echo') || name.includes('air')) ||
        name.includes('ski') && name.includes('erg') ||
        name.includes('shuttle') || name.includes('burpee') ||
        name.includes('jump rope') || name.includes('double under') || name.includes('single under')) {
      return 'ENGINE';
    }
    
    // SKILL: Technical movements
    if (name.includes('snatch') || name.includes('clean') || name.includes('jerk') ||
        name.includes('muscle up') || name.includes('handstand') || name.includes('kip') ||
        name.includes('double under') || name.includes('turkish getup') || name.includes('tgu')) {
      return 'SKILL';
    }
    
    // CORE: Core-specific exercises
    if (name.includes('plank') || name.includes('hollow') || name.includes('dead bug') ||
        name.includes('pallof') || name.includes('russian twist') || name.includes('situp') ||
        name.includes('crunch') || name.includes('leg raise') || name.includes('knees to chest') ||
        name.includes('ttb') || name.includes('toes to bar') || name.includes('ghd situp')) {
      return 'CORE';
    }
    
    // MOBILITY: Mobility/flexibility exercises
    if (name.includes('stretch') || name.includes('mobility') || name.includes('cossack') ||
        name.includes('worlds greatest') || name.includes('inchworm') || name.includes('frog squat')) {
      return 'MOBILITY';
    }
    
    // MIXED: Hybrid exercises that combine strength and conditioning
    if (name.includes('thruster') || name.includes('wall ball') || name.includes('sandbag') ||
        name.includes('sled') || name.includes('carry') || name.includes('bear crawl') ||
        name.includes('push press') || name.includes('kettlebell swing')) {
      return 'MIXED';
    }
    
    // Default to STRENGTH for most other exercises
    return 'STRENGTH';
  }

  /**
   * Infer movement pattern from exercise name
   */
  private inferMovementPatternFromName(exerciseName: string): 'HORIZONTAL_PUSH' | 'HORIZONTAL_PULL' | 'VERTICAL_PUSH' | 'VERTICAL_PULL' | 'SQUAT' | 'HINGE' | 'LUNGE' | 'CARRY' | 'LOC0MOTION' | 'FULL_BODY' | 'CORE_ANTI_EXTENSION' | 'CORE_ROTATION' | 'BREATH_MOBILITY' {
    const name = exerciseName.toLowerCase();
    
    // HORIZONTAL_PUSH: Bench press, push-ups, dips (horizontal)
    if (name.includes('bench') || name.includes('push up') || name.includes('pushup') ||
        name.includes('floor press') || name.includes('chest press') || name.includes('fly')) {
      return 'HORIZONTAL_PUSH';
    }
    
    // HORIZONTAL_PULL: Rows, face pulls
    if (name.includes('row') && !name.includes('erg') && !name.includes('machine') ||
        name.includes('face pull') || name.includes('cable row')) {
      return 'HORIZONTAL_PULL';
    }
    
    // VERTICAL_PUSH: Overhead press, push press, strict press
    if (name.includes('press') && (name.includes('overhead') || name.includes('ohp') || name.includes('strict') || name.includes('push press'))) {
      return 'VERTICAL_PUSH';
    }
    
    // VERTICAL_PULL: Pull-ups, lat pulldowns, chin-ups
    if (name.includes('pull up') || name.includes('pullup') || name.includes('chin up') ||
        name.includes('lat pull') || name.includes('pulldown') || name.includes('ski erg')) {
      return 'VERTICAL_PULL';
    }
    
    // SQUAT: All squat variations
    if (name.includes('squat') || name.includes('wall ball') || name.includes('thruster') ||
        name.includes('goblet') || name.includes('front squat') || name.includes('back squat')) {
      return 'SQUAT';
    }
    
    // HINGE: Deadlifts, RDLs, good mornings, swings
    if (name.includes('deadlift') || name.includes('rdl') || name.includes('romanian') ||
        name.includes('good morning') || name.includes('swing') || name.includes('hip thrust') ||
        name.includes('ghd back extension')) {
      return 'HINGE';
    }
    
    // LUNGE: All lunge variations
    if (name.includes('lunge') || name.includes('step up') || name.includes('step-up') ||
        name.includes('split squat') || name.includes('bulgarian')) {
      return 'LUNGE';
    }
    
    // CARRY: Carrying exercises
    if (name.includes('carry') || name.includes('farmer') || name.includes('walk')) {
      return 'CARRY';
    }
    
    // LOC0MOTION: Running, crawling, locomotion
    if (name.includes('run') || name.includes('jog') || name.includes('sprint') ||
        name.includes('crawl') || name.includes('shuttle') || name.includes('row') && name.includes('erg') ||
        name.includes('bike') && (name.includes('erg') || name.includes('assault') || name.includes('echo'))) {
      return 'LOC0MOTION';
    }
    
    // CORE_ANTI_EXTENSION: Planks, dead bugs, hollow holds
    if (name.includes('plank') || name.includes('dead bug') || name.includes('hollow') ||
        name.includes('bear hold') || name.includes('bear crawl')) {
      return 'CORE_ANTI_EXTENSION';
    }
    
    // CORE_ROTATION: Russian twists, pallof presses
    if (name.includes('russian twist') || name.includes('pallof') || name.includes('side plank')) {
      return 'CORE_ROTATION';
    }
    
    // BREATH_MOBILITY: Mobility/breathing exercises
    if (name.includes('stretch') || name.includes('mobility') || name.includes('breath') ||
        name.includes('worlds greatest') || name.includes('cossack')) {
      return 'BREATH_MOBILITY';
    }
    
    // FULL_BODY: Complex movements that use multiple patterns
    if (name.includes('burpee') || name.includes('thruster') || name.includes('turkish getup') ||
        name.includes('tgu') || name.includes('muscle up') || name.includes('clean') ||
        name.includes('snatch') || name.includes('wall ball')) {
      return 'FULL_BODY';
    }
    
    // Default fallback
    return 'FULL_BODY';
  }

  /**
   * Infer primary muscles from exercise name
   */
  private inferPrimaryMusclesFromName(exerciseName: string): string[] {
    const name = exerciseName.toLowerCase();
    const muscles: string[] = [];
    
    // Chest exercises
    if (name.includes('bench') || name.includes('push up') || name.includes('pushup') ||
        name.includes('chest press') || name.includes('fly') || name.includes('dip') && !name.includes('hip')) {
      muscles.push('chest');
    }
    
    // Back/Lat exercises
    if (name.includes('row') && !name.includes('erg') || name.includes('pull up') || name.includes('pullup') ||
        name.includes('lat pull') || name.includes('pulldown') || name.includes('deadlift')) {
      if (name.includes('lat') || name.includes('pull')) {
        muscles.push('lats');
      } else {
        muscles.push('lats', 'mid_back');
      }
    }
    
    // Shoulder exercises
    if (name.includes('press') && (name.includes('overhead') || name.includes('ohp') || name.includes('strict') || name.includes('push press')) ||
        name.includes('lateral raise') || name.includes('face pull') || name.includes('shoulder')) {
      muscles.push('delts');
    }
    
    // Leg exercises - Quads
    if (name.includes('squat') || name.includes('lunge') || name.includes('leg press') ||
        name.includes('step up') || name.includes('wall ball') || name.includes('thruster')) {
      muscles.push('quads');
    }
    
    // Leg exercises - Glutes/Hamstrings
    if (name.includes('deadlift') || name.includes('rdl') || name.includes('romanian') ||
        name.includes('hip thrust') || name.includes('good morning') || name.includes('swing') ||
        name.includes('glute') || name.includes('hamstring')) {
      if (name.includes('hip thrust') || name.includes('glute')) {
        muscles.push('glutes');
      } else {
        muscles.push('hamstrings', 'glutes');
      }
    }
    
    // Core exercises
    if (name.includes('plank') || name.includes('hollow') || name.includes('dead bug') ||
        name.includes('situp') || name.includes('crunch') || name.includes('leg raise') ||
        name.includes('russian twist') || name.includes('pallof') || name.includes('ttb') ||
        name.includes('toes to bar') || name.includes('knees to chest')) {
      muscles.push('abs');
    }
    
    // Triceps
    if (name.includes('tricep') || name.includes('dip') && !name.includes('hip') ||
        name.includes('pushdown') || name.includes('extension')) {
      muscles.push('triceps');
    }
    
    // Biceps
    if (name.includes('bicep') || name.includes('curl')) {
      muscles.push('biceps');
    }
    
    return muscles.length > 0 ? muscles : ['full_body'];
  }

  private async extractAndStoreExercises(workout: any, workoutEquipment: string[] = []): Promise<void> {
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
            // Infer exercise properties from name and workout context
            const inferredEquipment = this.inferEquipmentFromName(exerciseName, workoutEquipment);
            const inferredCategory = this.inferCategoryFromName(exerciseName);
            const inferredMovementPattern = this.inferMovementPatternFromName(exerciseName);
            const inferredPrimaryMuscles = this.inferPrimaryMusclesFromName(exerciseName);
            
            // Infer space requirement based on exercise type
            let inferredSpace: 'SPOT' | 'OPEN_AREA' | 'LANE_5M' | 'LANE_10M' | 'RUN_ROUTE' | 'MACHINE_FIXED' = 'OPEN_AREA';
            const nameLower = exerciseName.toLowerCase();
            if (nameLower.includes('run') || nameLower.includes('jog') || nameLower.includes('sprint')) {
              inferredSpace = 'RUN_ROUTE';
            } else if (nameLower.includes('shuttle') || nameLower.includes('carry') || (nameLower.includes('lunge') && nameLower.includes('walk'))) {
              inferredSpace = 'LANE_10M';
            } else if (nameLower.includes('crawl') || nameLower.includes('bear')) {
              inferredSpace = 'LANE_5M';
            } else if (nameLower.includes('erg') || nameLower.includes('machine') || nameLower.includes('rower') || (nameLower.includes('bike') && nameLower.includes('erg'))) {
              inferredSpace = 'MACHINE_FIXED';
            } else if (inferredEquipment.length === 0 || inferredEquipment.includes('barbell') || inferredEquipment.includes('dumbbell')) {
              inferredSpace = 'SPOT';
            }
            
            // Infer impact level
            let inferredImpact: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
            if (nameLower.includes('jump') || nameLower.includes('sprint') || nameLower.includes('burpee') || nameLower.includes('box jump')) {
              inferredImpact = 'HIGH';
            } else if (nameLower.includes('plank') || nameLower.includes('hold') || nameLower.includes('stretch') || nameLower.includes('mobility')) {
              inferredImpact = 'LOW';
            }
            
            // Create exercise entry - instructions and image will be generated automatically by exercisesService.create()
            // Don't pass instructions: null - let the service generate it via AI
            await this.exercisesService.create({
              exerciseId,
              name: exerciseName,
              category: inferredCategory,
              movementPattern: inferredMovementPattern,
              primaryMuscles: inferredPrimaryMuscles,
              equipment: inferredEquipment,
              space: inferredSpace,
              impactLevel: inferredImpact,
              typicalUse: ['PRIMARY'],
              suitableArchetypes: workout.archetype ? [workout.archetype] : [],
              indoorFriendly: true,
              aiGenerated: true,
              usageCount: 1,
              // Don't set instructions, imageUrl, or variations - let exercisesService.create() generate them via AI
            });
            
            console.log(`✅ Stored new AI-generated exercise: ${exerciseName} (category: ${inferredCategory}, pattern: ${inferredMovementPattern}, equipment: ${inferredEquipment.length > 0 ? inferredEquipment.join(', ') : 'bodyweight'})`);
          } else {
            // Increment usage count for existing exercise
            await this.exercisesService.update(existing.id, {
              usageCount: (existing.usageCount || 0) + 1,
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

    // Ensure sections have proper structure, validate timing, and validate erg machines
    workout.sections = workout.sections.map((section: any, index: number) => {
      // Ensure every section has appropriate timing
      let updatedSection = { ...section };
      
      if (section.type === 'EMOM') {
        // EMOM sections need emomWorkSec, emomRestSec, emomRounds
        if (!section.emomWorkSec) updatedSection.emomWorkSec = 45;
        if (!section.emomRestSec) updatedSection.emomRestSec = 15;
        if (!section.emomRounds) updatedSection.emomRounds = 12;
      } else if (section.type === 'INTERVAL') {
        // INTERVAL sections need intervalWorkSec, intervalRestSec, intervalRounds
        if (!section.intervalWorkSec) updatedSection.intervalWorkSec = 20;
        if (!section.intervalRestSec) updatedSection.intervalRestSec = 100;
        if (!section.intervalRounds) updatedSection.intervalRounds = 8;
      } else {
        // All other sections need durationSec
        if (!section.durationSec) {
          // Set default durations based on section type
          switch (section.type) {
            case 'WARMUP':
              updatedSection.durationSec = 300; // 5 minutes default
              break;
            case 'COOLDOWN':
              updatedSection.durationSec = 300; // 5 minutes default
              break;
            case 'WAVE':
              updatedSection.durationSec = 900; // 15 minutes default
              break;
            case 'SUPERSET':
              updatedSection.durationSec = 600; // 10 minutes default
              break;
            case 'AMRAP':
            case 'CIRCUIT':
              updatedSection.durationSec = 600; // 10 minutes default
              break;
            case 'FOR_TIME':
              updatedSection.durationSec = 1200; // 20 minutes default
              break;
            case 'CAPACITY':
              updatedSection.durationSec = 900; // 15 minutes default
              break;
            case 'FINISHER':
              updatedSection.durationSec = 300; // 5 minutes default
              break;
            case 'FLOW':
              updatedSection.durationSec = 600; // 10 minutes default
              break;
            default:
              updatedSection.durationSec = 600; // 10 minutes default fallback
          }
          console.log(`⚠️  Auto-added durationSec (${updatedSection.durationSec}s) to ${section.type} section: ${section.title}`);
        }
      }
      
      return {
        ...updatedSection,
        order: updatedSection.order || index + 1,
        blocks: (updatedSection.blocks || []).map((block: any, blockIndex: number) => {
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
      };
    });

    return workout;
  }

  private async reviewAndAdjustWorkout(workout: any, params: any): Promise<any> {
    console.log('🔍 Reviewing workout for feasibility and adjustments...');
    
    const issues: string[] = [];
    const adjustments: any = {};
    
    // Calculate total workout time
    let totalTime = 0;
    
    workout.sections.forEach((section: any) => {
      if (section.type === 'WARMUP') {
        totalTime += 5 * 60; // 5-10 min warmup
      } else if (section.type === 'COOLDOWN') {
        totalTime += 5 * 60; // 5 min cooldown
      } else if (section.type === 'EMOM') {
        totalTime += (section.emomWorkSec + section.emomRestSec) * (section.emomRounds || 12);
      } else if (section.type === 'INTERVAL') {
        totalTime += (section.intervalWorkSec + section.intervalRestSec) * (section.intervalRounds || 8);
      } else if (section.durationSec) {
        totalTime += section.durationSec;
        // Add rest between rounds if applicable
        if (section.rounds && section.restBetweenRounds) {
          totalTime += section.restBetweenRounds * (section.rounds - 1);
        }
      }
    });
    
    const availableTime = params.availableMinutes * 60;
    const timeDifference = totalTime - availableTime;
    
    // Check time feasibility
    if (totalTime > availableTime * 1.1) {
      issues.push(`Workout is ${Math.round(timeDifference / 60)} minutes too long (${Math.round(totalTime / 60)}min vs ${params.availableMinutes}min available)`);
      adjustments.timeReduction = Math.round(timeDifference / 60);
    } else if (totalTime < availableTime * 0.6) {
      issues.push(`Workout is too short (${Math.round(totalTime / 60)}min vs ${params.availableMinutes}min available)`);
      adjustments.timeIncrease = Math.round((availableTime - totalTime) / 60);
    }
    
      // Check section duration matches work required
      workout.sections.forEach((section: any, sectionIdx: number) => {
        // Validate SUPERSET sections have rounds or AMRAP format
        if (section.type === 'SUPERSET') {
          const hasRounds = section.rounds && section.rounds > 0;
          const hasAMRAPNote = section.note && /AMRAP|as many rounds as possible/i.test(section.note);
          
          if (!hasRounds && !hasAMRAPNote) {
            const issueMsg = `SUPERSET section "${section.title}" is missing rounds or AMRAP format. A single superset pair takes ~2-3 minutes, but section duration is ${Math.round(section.durationSec / 60)} minutes. Add "rounds" field (4-6 rounds) or use AMRAP format in "note" field.`;
            issues.push(issueMsg);
            adjustments[`section_${sectionIdx}_missing_rounds`] = true;
          }
          
          // Estimate work time for superset
          if (hasRounds && section.blocks && section.blocks.length >= 2) {
            // Each round: 2 exercises × ~30-45s per exercise + 30-60s rest = ~2-3 min per round
            const estimatedWorkTime = section.rounds * 2.5 * 60; // 2.5 min per round
            const restTime = section.restBetweenRounds ? section.restBetweenRounds * (section.rounds - 1) : 0;
            const totalEstimatedTime = estimatedWorkTime + restTime;
            
            if (section.durationSec && totalEstimatedTime > section.durationSec * 1.2) {
              const issueMsg = `SUPERSET section "${section.title}": Estimated work time (${Math.round(totalEstimatedTime / 60)} min) exceeds duration (${Math.round(section.durationSec / 60)} min). Reduce rounds or increase duration.`;
              issues.push(issueMsg);
              adjustments[`section_${sectionIdx}_time_mismatch`] = true;
            } else if (section.durationSec && totalEstimatedTime < section.durationSec * 0.5) {
              const issueMsg = `SUPERSET section "${section.title}": Estimated work time (${Math.round(totalEstimatedTime / 60)} min) is much less than duration (${Math.round(section.durationSec / 60)} min). Add more rounds or reduce duration.`;
              issues.push(issueMsg);
              adjustments[`section_${sectionIdx}_time_mismatch`] = true;
            }
          } else if (!hasRounds && !hasAMRAPNote && section.blocks && section.blocks.length >= 2) {
            // No rounds and no AMRAP - this is a critical issue
            const issueMsg = `SUPERSET section "${section.title}": Has ${section.blocks.length} exercises but no rounds specified. With duration of ${Math.round(section.durationSec / 60)} minutes, this would only be ~2-3 minutes of work. MUST add "rounds" field (4-6 rounds) or AMRAP format.`;
            issues.push(issueMsg);
            adjustments[`section_${sectionIdx}_missing_rounds`] = true;
          }
        }
      
      // Check tier progression (SILVER ≤ GOLD ≤ BLACK)
      section.blocks?.forEach((block: any, blockIdx: number) => {
        const silver = block.tierSilver;
        const gold = block.tierGold;
        const black = block.tierBlack;
        
        // Check rep progression
        if (silver?.targetReps && gold?.targetReps && silver.targetReps > gold.targetReps) {
          issues.push(`Block ${block.label || blockIdx + 1}: SILVER reps (${silver.targetReps}) should be ≤ GOLD reps (${gold.targetReps})`);
          adjustments[`section_${sectionIdx}_block_${blockIdx}_rep_progression`] = true;
        }
        if (gold?.targetReps && black?.targetReps && gold.targetReps > black.targetReps) {
          issues.push(`Block ${block.label || blockIdx + 1}: GOLD reps (${gold.targetReps}) should be ≤ BLACK reps (${black.targetReps})`);
          adjustments[`section_${sectionIdx}_block_${blockIdx}_rep_progression`] = true;
        }
        
        // Check distance progression for erg machines
        if (silver?.distance && gold?.distance && silver.distance > gold.distance) {
          issues.push(`Block ${block.label || blockIdx + 1}: SILVER distance (${silver.distance}${silver.distanceUnit}) should be ≤ GOLD distance (${gold.distance}${gold.distanceUnit})`);
          adjustments[`section_${sectionIdx}_block_${blockIdx}_distance_progression`] = true;
        }
        if (gold?.distance && black?.distance && gold.distance > black.distance) {
          issues.push(`Block ${block.label || blockIdx + 1}: GOLD distance (${gold.distance}${gold.distanceUnit}) should be ≤ BLACK distance (${black.distance}${black.distanceUnit})`);
          adjustments[`section_${sectionIdx}_block_${blockIdx}_distance_progression`] = true;
        }
      });
    });
    
    // If there are issues, determine if we need full regeneration or just adjustment
    if (issues.length > 0) {
      console.log(`⚠️  Found ${issues.length} issues, analyzing severity...`);
      console.log('Issues:', issues);
      
      // Check for critical issues that require full regeneration
      const criticalIssues = issues.filter(issue => 
        issue.includes('time mismatch') || 
        issue.includes('missing rounds') ||
        issue.includes('exceeds duration') ||
        issue.includes('much less than duration') ||
        issue.includes('too long') ||
        issue.includes('too short')
      );
      
      if (criticalIssues.length > 0) {
        console.log(`🔴 Found ${criticalIssues.length} CRITICAL time-related issues - triggering full regeneration...`);
        console.log('Critical issues:', criticalIssues);
        
        // Create error with full context for regeneration
        const error = new Error(`CRITICAL_TIME_MISMATCH: ${criticalIssues.join('; ')}`) as any;
        error.criticalIssues = criticalIssues; // Attach full list for regeneration
        error.allIssues = issues; // Also attach all issues for context
        throw error;
      }
      
      // For non-critical issues, try adjustment
      console.log(`⚠️  Found ${issues.length} non-critical issues, attempting adjustment...`);
      try {
        const adjustedWorkout = await this.adjustWorkout(workout, issues, adjustments, params);
        
        // Re-validate the adjusted workout
        const revalidatedWorkout = await this.reviewAndAdjustWorkout(adjustedWorkout, params);
        console.log('✅ Workout adjusted and re-validated successfully');
        return revalidatedWorkout;
      } catch (error: any) {
        // If adjustment fails or reveals critical issues, trigger regeneration
        if (error.message?.includes('CRITICAL_TIME_MISMATCH')) {
          throw error; // Re-throw to trigger regeneration
        }
        console.error('❌ Failed to adjust workout, triggering regeneration:', error);
        throw new Error(`ADJUSTMENT_FAILED: ${error.message || 'Unknown error'}`);
      }
    }
    
    console.log('✅ Workout review passed - no adjustments needed');
    return workout;
  }

  private async adjustWorkout(workout: any, issues: string[], adjustments: any, params: any): Promise<any> {
    const totalTime = workout.sections.reduce((acc: number, s: any) => {
      if (s.type === 'EMOM') return acc + (s.emomWorkSec + s.emomRestSec) * (s.emomRounds || 12);
      if (s.type === 'INTERVAL') return acc + (s.intervalWorkSec + s.intervalRestSec) * (s.intervalRounds || 8);
      if (s.durationSec) return acc + s.durationSec + (s.rounds && s.restBetweenRounds ? s.restBetweenRounds * (s.rounds - 1) : 0);
      return acc;
    }, 600); // Add 10 min for warmup/cooldown
    
    const adjustmentPrompt = `You are reviewing a workout that has been flagged for issues. Please fix the following problems:

ISSUES FOUND:
${issues.map((issue, idx) => `${idx + 1}. ${issue}`).join('\n')}

ADJUSTMENTS NEEDED:
${JSON.stringify(adjustments, null, 2)}

ORIGINAL WORKOUT:
${JSON.stringify(workout, null, 2)}

REQUIREMENTS:
- Total workout time must be approximately ${params.availableMinutes} minutes (currently ${Math.round(totalTime / 60)} minutes)
- Tier progression must be: SILVER ≤ GOLD ≤ BLACK (for reps, distances, loads)
- Maintain workout structure and exercise selection
- Adjust durations, reps, distances, or loads as needed
- Keep the same JSON schema

Return ONLY the corrected workout JSON, no explanations.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a workout review system that fixes timing, difficulty progression, and feasibility issues. Return only valid JSON.' },
        { role: 'user', content: adjustmentPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Lower temperature for more consistent adjustments
    });

    const adjustedWorkoutJson = JSON.parse(completion.choices[0].message.content || '{}');
    
    // Validate the adjusted workout
    return this.validateWorkoutSchema(adjustedWorkoutJson);
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
- 50 Wall Balls (9/6 kg) - CRITICAL HYROX STATION: Wall Ball is essential for HYROX workouts
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

NOTE: WALL BALL is a mandatory exercise for HYROX-style workouts. Always include it when generating HYROX workouts.

Example 2 - Hyrox Station Focus:
"HYROX STATIONS // 02"
WARMUP: 5 min
EMOM x 20:
Min 1: 20 Wall Balls (9/6 kg) - CRITICAL: Wall Ball is essential for HYROX
Min 2: 15 Burpee Broad Jumps
Min 3: 100m Farmers Walk (24/16 kg)
Min 4: 20m Sandbag Lunges (20/14 kg)
Min 5: 100m Row
REST 2:00
Repeat 3 more rounds
FINISHER: 2km Run for time

NOTE: For HYROX workouts, always prioritize WALL BALL exercises. It's one of the core HYROX stations.

NOTE: For HYROX workouts, always prioritize WALL BALL exercises. It's one of the core HYROX stations.

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

  private getWorkoutTypeGuidance(workoutType: string, cycle: string | undefined = 'BASE', includeHyrox: boolean = false, hyroxCount: number = 0): string {
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
        return `Generate a 4-WEEK PROGRAM with automatic progressive periodization. Return JSON with this structure:
{
  "workouts": [
    { "name": "Week 1 Day 1", "weekIndex": 1, "dayIndex": 1, ...workout structure... },
    ... (20-24 total workouts)
  ]
}
CRITICAL: The program MUST automatically follow this progression (no cycle selection needed):
- Week 1: BASE cycle (establish baseline, moderate intensity, focus on movement quality) - 5-6 workouts
- Week 2: LOAD cycle (increase volume/intensity progressively, challenge capacity) - 5-6 workouts
- Week 3: INTENSIFY cycle (peak intensity, lower volume, maximum effort) - 5-6 workouts
- Week 4: DELOAD cycle (recovery week, lower intensity, mobility focus, active recovery) - 4-5 workouts

Progressive overload pattern: Week 1 < Week 2 < Week 3 > Week 4.
Each week should reflect its cycle in workout intensity, volume, and complexity.`;
      
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

  /**
   * Test OpenAI API connection and key validity
   */
  async testOpenAI(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      
      if (!apiKey) {
        return {
          success: false,
          message: 'OPENAI_API_KEY is not set in environment variables',
        };
      }

      // Make a simple API call to test the key
      const testResponse = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a test assistant.' },
          { role: 'user', content: 'Say "test successful" if you can read this.' },
        ],
        max_tokens: 10,
      });

      return {
        success: true,
        message: 'OpenAI API key is valid and working',
        details: {
          model: testResponse.model,
          response: testResponse.choices[0]?.message?.content,
        },
      };
    } catch (error: any) {
      console.error('OpenAI test error:', error);
      
      let message = 'OpenAI API test failed';
      if (error?.status === 401 || error?.response?.status === 401) {
        message = 'OpenAI API key is invalid or expired';
      } else if (error?.message) {
        message = `OpenAI API error: ${error.message}`;
      }

      return {
        success: false,
        message,
        details: {
          status: error?.status || error?.response?.status,
          code: error?.code,
          errorMessage: error?.message,
        },
      };
    }
  }
}

