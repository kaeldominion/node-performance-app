import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor() {
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
  }) {
    // Pass archetype to the prompt
    const archetypeParam = params.archetype || undefined;
    const archetypeGuidance = this.getArchetypeGuidance(archetypeParam);
    
    const systemPrompt = `You are an elite hybrid coach designing sessions for the NØDE performance training system.

${archetypeGuidance}

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

    const userPrompt = `Generate a workout with these parameters:
- Goal: ${params.goal}
- Training Level: ${params.trainingLevel}
- Available Equipment: ${params.equipment.join(', ')}
- Available Time: ${params.availableMinutes} minutes
${archetypeParam ? `- Archetype: ${archetypeParam} (follow archetype structure exactly)` : ''}
- Preferred Sections: ${params.sectionPreferences?.join(', ') || 'Auto-select based on archetype'}

Ensure the total workout time fits within ${params.availableMinutes} minutes.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const workoutJson = JSON.parse(
        completion.choices[0].message.content || '{}',
      );

      // Validate and return
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
}

