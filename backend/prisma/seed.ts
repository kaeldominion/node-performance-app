import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to create tier prescriptions
function createTiers(silver?: any, gold?: any, black?: any) {
  const tiers = [];
  if (silver) tiers.push({ tier: 'SILVER' as const, ...silver });
  if (gold) tiers.push({ tier: 'GOLD' as const, ...gold });
  if (black) tiers.push({ tier: 'BLACK' as const, ...black });
  return tiers.length > 0 ? { create: tiers } : undefined;
}

async function main() {
  console.log('🌱 Seeding NØDE database with all archetypes...');

  // Create NØDE Core Program with all 6 archetypes
  const nodeProgram = await prisma.program.upsert({
    where: { slug: 'node-core-weekly' },
    update: {},
    create: {
      name: 'NØDE Core Weekly',
      slug: 'node-core-weekly',
      description: 'The complete NØDE training system featuring all six core archetypes: PR1ME, FORGE, ENGIN3, CIRCUIT X, CAPAC1TY, and FLOWSTATE.',
      level: 'INTERMEDIATE',
      goal: 'HYBRID',
      durationWeeks: 4,
      currentCycle: 'BASE',
      isPublic: true,
      workouts: {
        create: [
          // 1. PR1ME - Primary Strength Day (Lower)
          {
            name: 'PR1ME // 01: Deadlift Wave',
            displayCode: 'PR1ME-01',
            archetype: 'PR1ME',
            description: 'Primary strength day focusing on maximal strength and progressive overload. Main lift wave with secondary superset.',
            dayIndex: 0,
            sections: {
              create: [
                {
                  title: 'Warm-up',
                  type: 'WARMUP',
                  order: 0,
                  note: 'Prepare for heavy loading',
                  blocks: {
                    create: [
                      {
                        order: 0,
                        label: '01',
                        exerciseName: 'Dynamic Warm-up',
                        description: '5 minutes light movement',
                        repScheme: '5 min',
                      },
                      {
                        order: 1,
                        label: '02',
                        exerciseName: 'Barbell Warm-up Sets',
                        description: 'Empty bar → 50% → 70% → 85%',
                        repScheme: '5-3-2-1',
                      },
                    ],
                  },
                },
                {
                  title: 'Main Lift: Deadlift Wave',
                  type: 'WAVE',
                  order: 1,
                  note: '10-8-8-8 wave. Rest 2-3 min between sets.',
                  blocks: {
                    create: [
                      {
                        order: 0,
                        label: 'Set 1',
                        exerciseName: 'Conventional Deadlift',
                        description: 'Full lockout, controlled descent',
                        repScheme: '10',
                        tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: '60% 1RM', targetReps: 10 },
                            { tier: 'GOLD', load: '70% 1RM', targetReps: 10 },
                            { tier: 'BLACK', load: '80% 1RM', targetReps: 10 },
                          ],
                        },
                      },
                      {
                        order: 1,
                        label: 'Set 2',
                        exerciseName: 'Conventional Deadlift',
                        description: 'Maintain form',
                        repScheme: '8',
                        tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: '65% 1RM', targetReps: 8 },
                            { tier: 'GOLD', load: '75% 1RM', targetReps: 8 },
                            { tier: 'BLACK', load: '85% 1RM', targetReps: 8 },
                          ],
                        },
                      },
                      {
                        order: 2,
                        label: 'Set 3-4',
                        exerciseName: 'Conventional Deadlift',
                        description: 'Final two sets',
                        repScheme: '8-8',
                        tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: '65% 1RM', targetReps: 8 },
                            { tier: 'GOLD', load: '75% 1RM', targetReps: 8 },
                            { tier: 'BLACK', load: '85% 1RM', targetReps: 8 },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  title: 'Secondary Superset',
                  type: 'SUPERSET',
                  order: 2,
                  note: '3 rounds, minimal rest between exercises',
                  blocks: {
                    create: [
                      {
                        order: 0,
                        label: 'A',
                        exerciseName: 'Bulgarian Split Squat',
                        description: 'Full depth, front foot elevated',
                        repScheme: '12 each',
                        tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: 'Bodyweight', targetReps: 12 },
                            { tier: 'GOLD', load: '2x12 kg', targetReps: 12 },
                            { tier: 'BLACK', load: '2x20 kg', targetReps: 12 },
                          ],
                        },
                      },
                      {
                        order: 1,
                        label: 'B',
                        exerciseName: 'KB Swings',
                        description: 'Full extension',
                        repScheme: '15',
                        tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: '16 kg', targetReps: 15 },
                            { tier: 'GOLD', load: '20 kg', targetReps: 15 },
                            { tier: 'BLACK', load: '24 kg', targetReps: 15 },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  title: 'Cooldown',
                  type: 'COOLDOWN',
                  order: 3,
                  note: 'Recovery and mobility',
                  blocks: {
                    create: [
                      {
                        order: 0,
                        label: '01',
                        exerciseName: 'Hip Mobility',
                        description: 'Pigeon pose, hip circles',
                        repScheme: '5 min',
                      },
                    ],
                  },
                },
              ],
            },
          },
          // 2. FORGE - Strength Superset Day
          {
            name: 'FORGE // 02: Upper Body Supersets',
            displayCode: 'FORGE-02',
            archetype: 'FORGE',
            description: 'Strength supersets for muscular balance and body armor. Push/pull combinations.',
            dayIndex: 1,
            sections: {
              create: [
                {
                  title: 'Warm-up',
                  type: 'WARMUP',
                  order: 0,
                  note: 'Shoulder and upper body prep',
                  blocks: {
                    create: [
                      {
                        order: 0,
                        label: '01',
                        exerciseName: 'Arm Circles & Band Pull-aparts',
                        description: '3 sets of 10',
                        repScheme: '3x10',
                      },
                    ],
                  },
                },
                {
                  title: 'Block A: Strength Superset',
                  type: 'SUPERSET',
                  order: 1,
                  note: '4 rounds, 90s rest between rounds',
                  blocks: {
                    create: [
                      {
                        order: 0,
                        label: 'A',
                        exerciseName: 'BB Strict Press',
                        description: 'Full lockout overhead',
                        repScheme: '6',
                        tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: '40 kg', targetReps: 6 },
                            { tier: 'GOLD', load: '50 kg', targetReps: 6 },
                            { tier: 'BLACK', load: '60 kg', targetReps: 6 },
                          ],
                        },
                      },
                      {
                        order: 1,
                        label: 'B',
                        exerciseName: 'Weighted Pull-ups',
                        description: 'Chest to bar',
                        repScheme: '8',
                        tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: 'Bodyweight', targetReps: 8 },
                            { tier: 'GOLD', load: '+10 kg', targetReps: 8 },
                            { tier: 'BLACK', load: '+20 kg', targetReps: 8 },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  title: 'Block B: Accessory Pump',
                  type: 'SUPERSET',
                  order: 2,
                  note: '3 rounds, minimal rest',
                  blocks: {
                    create: [
                      {
                        order: 0,
                        label: 'A',
                        exerciseName: 'DB Incline Bench',
                        description: '30° incline',
                        repScheme: '12',
                        tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: '2x12 kg', targetReps: 12 },
                            { tier: 'GOLD', load: '2x16 kg', targetReps: 12 },
                            { tier: 'BLACK', load: '2x20 kg', targetReps: 12 },
                          ],
                        },
                      },
                      {
                        order: 1,
                        label: 'B',
                        exerciseName: 'DB Rows',
                        description: 'Full range of motion',
                        repScheme: '12 each',
                        tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: '16 kg', targetReps: 12 },
                            { tier: 'GOLD', load: '20 kg', targetReps: 12 },
                            { tier: 'BLACK', load: '24 kg', targetReps: 12 },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  title: 'Cooldown',
                  type: 'COOLDOWN',
                  order: 3,
                  note: 'Shoulder mobility',
                  blocks: {
                    create: [
                      {
                        order: 0,
                        label: '01',
                        exerciseName: 'Shoulder Stretches',
                        description: 'Doorway stretch, band work',
                        repScheme: '5 min',
                      },
                    ],
                  },
                },
              ],
            },
          },
          // 3. ENGIN3 - Hybrid EMOM Day
          {
            name: 'ENGIN3 // 03: Power Cycle',
            displayCode: 'ENGIN3-03',
            archetype: 'ENGIN3',
            description: 'Hybrid EMOM for threshold capacity and movement efficiency. Skill + engine + loaded movement.',
            dayIndex: 2,
            sections: {
              create: [
                {
                  title: 'Warm-up',
                  type: 'WARMUP',
                  order: 0,
                  note: 'Full body activation',
                  blocks: {
                    create: [
                      {
                        order: 0,
                        label: '01',
                        exerciseName: 'Dynamic Movement',
                        description: 'Jumping jacks, high knees, butt kicks',
                        repScheme: '3 min',
                      },
                    ],
                  },
                },
                {
                  title: 'EMOM: The Engine',
                  type: 'EMOM',
                  order: 1,
                  emomWorkSec: 45,
                  emomRestSec: 15,
                  emomRounds: 16,
                  note: 'EMOM x 16 (4 stations × 4 rounds)',
                  blocks: {
                    create: [
                      {
                        order: 0,
                        label: '01',
                        exerciseName: 'Box Jumps',
                        description: 'Full extension at top',
                        repScheme: '10',
                        tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: '20" box', targetReps: 10 },
                            { tier: 'GOLD', load: '24" box', targetReps: 10 },
                            { tier: 'BLACK', load: '30" box', targetReps: 10 },
                          ],
                        },
                      },
                      {
                        order: 1,
                        label: '02',
                        exerciseName: 'Row (Erg)',
                        description: 'Smooth, powerful strokes',
                        repScheme: '15 cals',
                        distance: 15,
                        distanceUnit: 'cal',
                        tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: 'Erg', targetReps: 12 },
                            { tier: 'GOLD', load: 'Erg', targetReps: 15 },
                            { tier: 'BLACK', load: 'Erg', targetReps: 18 },
                          ],
                        },
                      },
                      {
                        order: 2,
                        label: '03',
                        exerciseName: 'KB Swings',
                        description: 'Full extension',
                        repScheme: '12',
                        tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: '16 kg', targetReps: 12 },
                            { tier: 'GOLD', load: '20 kg', targetReps: 12 },
                            { tier: 'BLACK', load: '24 kg', targetReps: 12 },
                          ],
                        },
                      },
                      {
                        order: 3,
                        label: '04',
                        exerciseName: 'Burpees',
                        description: 'Full range of motion',
                        repScheme: '8',
                        tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: 'Bodyweight', targetReps: 8 },
                            { tier: 'GOLD', load: 'Bodyweight', targetReps: 10 },
                            { tier: 'BLACK', load: 'Bodyweight', targetReps: 12 },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  title: 'Cooldown',
                  type: 'COOLDOWN',
                  order: 2,
                  note: 'Light movement',
                  blocks: {
                    create: [
                      {
                        order: 0,
                        label: '01',
                        exerciseName: 'Walking & Stretching',
                        description: '5 minutes easy movement',
                        repScheme: '5 min',
                      },
                    ],
                  },
                },
              ],
            },
          },
          // 4. CIRCUIT X - Anaerobic MetCon Day
          {
            name: 'CIRCUIT X // 04: Kettlebell Chaos',
            displayCode: 'CIRCUIT-X-04',
            archetype: 'CIRCUIT_X',
            description: 'Anaerobic MetCon for fast conditioning and mixed modal capacity. Chaos, speed, grit.',
            dayIndex: 3,
            sections: {
              create: [
                {
                  title: 'Warm-up',
                  type: 'WARMUP',
                  order: 0,
                  note: 'High intensity prep',
                  blocks: {
                    create: [
                      {
                        order: 0,
                        label: '01',
                        exerciseName: 'Dynamic Warm-up',
                        description: '3 minutes',
                        repScheme: '3 min',
                      },
                    ],
                  },
                },
                {
                  title: 'AMRAP 1: The Burner',
                  type: 'AMRAP',
                  order: 1,
                  durationSec: 240, // 4 minutes
                  note: '4-minute AMRAP - go hard',
                  blocks: {
                    create: [
                      {
                        order: 0,
                        label: '01',
                        exerciseName: 'KB Swings',
                        description: 'Full extension',
                        repScheme: '20',
                        tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: '16 kg', targetReps: 20 },
                            { tier: 'GOLD', load: '20 kg', targetReps: 20 },
                            { tier: 'BLACK', load: '24 kg', targetReps: 20 },
                          ],
                        },
                      },
                      {
                        order: 1,
                        label: '02',
                        exerciseName: 'Burpees',
                        description: 'Full range',
                        repScheme: '15',
                        tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: 'Bodyweight', targetReps: 15 },
                            { tier: 'GOLD', load: 'Bodyweight', targetReps: 15 },
                            { tier: 'BLACK', load: 'Bodyweight', targetReps: 20 },
                          ],
                        },
                      },
                      {
                        order: 2,
                        label: '03',
                        exerciseName: 'Box Jumps',
                        description: 'Full extension',
                        repScheme: '12',
                        tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: '20" box', targetReps: 12 },
                            { tier: 'GOLD', load: '24" box', targetReps: 12 },
                            { tier: 'BLACK', load: '30" box', targetReps: 12 },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  title: 'Rest',
                  type: 'OTHER',
                  order: 2,
                  note: '3 minutes rest',
                  durationSec: 180,
                  blocks: {
                    create: [
                      {
                        order: 0,
                        label: '01',
                        exerciseName: 'Rest & Recover',
                        description: 'Walk, hydrate, prepare',
                        repScheme: '3 min',
                      },
                    ],
                  },
                },
                {
                  title: 'AMRAP 2: The Grind',
                  type: 'AMRAP',
                  order: 3,
                  durationSec: 390, // 6:30 minutes
                  note: '6:30 AMRAP - maintain pace',
                  blocks: {
                    create: [
                      {
                        order: 0,
                        label: '01',
                        exerciseName: 'Thrusters',
                        description: 'Full depth, full extension',
                        repScheme: '15',
                        tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: '2x12 kg', targetReps: 15 },
                            { tier: 'GOLD', load: '2x16 kg', targetReps: 15 },
                            { tier: 'BLACK', load: '2x20 kg', targetReps: 15 },
                          ],
                        },
                      },
                      {
                        order: 1,
                        label: '02',
                        exerciseName: 'Pull-ups',
                        description: 'Dead hang to chin over',
                        repScheme: '12',
                        tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: 'Bodyweight', targetReps: 10, notes: 'Use assistance if needed' },
                            { tier: 'GOLD', load: 'Bodyweight', targetReps: 12 },
                            { tier: 'BLACK', load: 'Bodyweight', targetReps: 15 },
                          ],
                        },
                      },
                      {
                        order: 2,
                        label: '03',
                        exerciseName: 'Double Unders',
                        description: 'Rope passes twice per jump',
                        repScheme: '50',
                        tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: 'Jump Rope', targetReps: 30, notes: 'Single unders if needed' },
                            { tier: 'GOLD', load: 'Jump Rope', targetReps: 50 },
                            { tier: 'BLACK', load: 'Jump Rope', targetReps: 75 },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  title: 'Cooldown',
                  type: 'COOLDOWN',
                  order: 4,
                  note: 'Recovery',
                  blocks: {
                    create: [
                      {
                        order: 0,
                        label: '01',
                        exerciseName: 'Light Stretching',
                        description: '5 minutes',
                        repScheme: '5 min',
                      },
                    ],
                  },
                },
              ],
            },
          },
          // 5. CAPAC1TY - Long Engine Conditioning
          {
            name: 'CAPAC1TY // 05: Threshold Breaker',
            displayCode: 'CAPAC1TY-05',
            archetype: 'CAPAC1TY',
            description: 'Long engine conditioning for aerobic base and pacing strategy. A brutal, beautiful grind.',
            dayIndex: 4,
            sections: {
              create: [
                {
                  title: 'Warm-up',
                  type: 'WARMUP',
                  order: 0,
                  note: 'Aerobic prep',
                  blocks: {
                    create: [
                      {
                        order: 0,
                        label: '01',
                        exerciseName: 'Easy Movement',
                        description: '5 minutes light cardio',
                        repScheme: '5 min',
                      },
                    ],
                  },
                },
                {
                  title: 'The Long Grind',
                  type: 'CAPACITY',
                  order: 1,
                  durationSec: 1080, // 18 minutes
                  note: '18:00 cap - maintain steady pace',
                  blocks: {
                    create: [
                      {
                        order: 0,
                        label: '01',
                        exerciseName: 'Row (Erg)',
                        description: 'Smooth, consistent pace',
                        repScheme: '500m',
                        distance: 500,
                        distanceUnit: 'm',
                        tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: 'Erg', targetReps: 1 },
                            { tier: 'GOLD', load: 'Erg', targetReps: 1 },
                            { tier: 'BLACK', load: 'Erg', targetReps: 1 },
                          ],
                        },
                      },
                      {
                        order: 1,
                        label: '02',
                        exerciseName: 'KB Swings',
                        description: 'Full extension',
                        repScheme: '30',
                        tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: '16 kg', targetReps: 30 },
                            { tier: 'GOLD', load: '20 kg', targetReps: 30 },
                            { tier: 'BLACK', load: '24 kg', targetReps: 30 },
                          ],
                        },
                      },
                      {
                        order: 2,
                        label: '03',
                        exerciseName: 'Burpees',
                        description: 'Full range',
                        repScheme: '20',
                        tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: 'Bodyweight', targetReps: 20 },
                            { tier: 'GOLD', load: 'Bodyweight', targetReps: 20 },
                            { tier: 'BLACK', load: 'Bodyweight', targetReps: 25 },
                          ],
                        },
                      },
                      {
                        order: 3,
                        label: '04',
                        exerciseName: 'Run',
                        description: 'Outdoor or treadmill',
                        repScheme: '400m',
                        distance: 400,
                        distanceUnit: 'm',
                        tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: 'Bodyweight', targetReps: 1 },
                            { tier: 'GOLD', load: 'Bodyweight', targetReps: 1 },
                            { tier: 'BLACK', load: 'Bodyweight', targetReps: 1 },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  title: 'Cooldown',
                  type: 'COOLDOWN',
                  order: 2,
                  note: 'Extended recovery',
                  blocks: {
                    create: [
                      {
                        order: 0,
                        label: '01',
                        exerciseName: 'Walking & Stretching',
                        description: '10 minutes easy movement',
                        repScheme: '10 min',
                      },
                    ],
                  },
                },
              ],
            },
          },
          // 6. FLOWSTATE - Deload, Movement & Mobility
          {
            name: 'FLOWSTATE // 06: Recovery Flow',
            displayCode: 'FLOWSTATE-06',
            archetype: 'FLOWSTATE',
            description: 'Deload, movement, and mobility for recovery, tissue health, and longevity. Precision, breath, recovery.',
            dayIndex: 5,
            sections: {
              create: [
                {
                  title: 'Warm-up',
                  type: 'WARMUP',
                  order: 0,
                  note: 'Gentle activation',
                  blocks: {
                    create: [
                      {
                        order: 0,
                        label: '01',
                        exerciseName: 'Breathwork',
                        description: '5 minutes diaphragmatic breathing',
                        repScheme: '5 min',
                      },
                    ],
                  },
                },
                {
                  title: 'Tempo Work',
                  type: 'FLOW',
                  order: 1,
                  note: 'Slow, controlled movements',
                  blocks: {
                    create: [
                      {
                        order: 0,
                        label: '01',
                        exerciseName: 'Tempo Goblet Squats',
                        description: '3-1-3-1 tempo (3s down, 1s pause, 3s up, 1s pause)',
                        repScheme: '3x8',
                        tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: '12 kg', targetReps: 8 },
                            { tier: 'GOLD', load: '16 kg', targetReps: 8 },
                            { tier: 'BLACK', load: '20 kg', targetReps: 8 },
                          ],
                        },
                      },
                      {
                        order: 1,
                        label: '02',
                        exerciseName: 'KB Flow Sequence',
                        description: 'Swings → Cleans → Presses → Snatches',
                        repScheme: '3 rounds',
                        tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: '12 kg', targetReps: 5 },
                            { tier: 'GOLD', load: '16 kg', targetReps: 5 },
                            { tier: 'BLACK', load: '20 kg', targetReps: 5 },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  title: 'Slow EMOM',
                  type: 'EMOM',
                  order: 2,
                  emomWorkSec: 30,
                  emomRestSec: 30,
                  emomRounds: 10,
                  note: 'Slow EMOM - focus on quality',
                  blocks: {
                    create: [
                      {
                        order: 0,
                        label: '01',
                        exerciseName: 'Turkish Get-ups',
                        description: 'Slow, controlled, one side per round',
                        repScheme: '1 each',
                        tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: '12 kg', targetReps: 1 },
                            { tier: 'GOLD', load: '16 kg', targetReps: 1 },
                            { tier: 'BLACK', load: '20 kg', targetReps: 1 },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  title: 'Mobility & Cooldown',
                  type: 'COOLDOWN',
                  order: 3,
                  note: 'Extended mobility work',
                  blocks: {
                    create: [
                      {
                        order: 0,
                        label: '01',
                        exerciseName: 'Hip Mobility Flow',
                        description: 'Pigeon, lizard, hip circles',
                        repScheme: '10 min',
                      },
                      {
                        order: 1,
                        label: '02',
                        exerciseName: 'Shoulder Mobility',
                        description: 'Band work, wall slides',
                        repScheme: '5 min',
                      },
                      {
                        order: 2,
                        label: '03',
                        exerciseName: 'Breathwork',
                        description: 'Box breathing, 4-4-4-4',
                        repScheme: '5 min',
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      workouts: true,
    },
  });

  console.log('✅ Created NØDE Core Program with 6 archetypes');
  nodeProgram.workouts.forEach((workout) => {
    console.log(`   - ${workout.displayCode}: ${workout.name} (${workout.archetype})`);
  });

  // Keep the original Villa Zeno Hybrid for backward compatibility
  const villaZeno = await prisma.program.upsert({
    where: { slug: 'villa-zeno-hybrid' },
    update: {},
    create: {
      name: 'Villa Zeno Hybrid',
      slug: 'villa-zeno-hybrid',
      description: 'A high-intensity hybrid training program combining strength, conditioning, and endurance.',
      level: 'INTERMEDIATE',
      goal: 'HYBRID',
      durationWeeks: 8,
      isPublic: true,
      workouts: {
        create: {
          name: 'Villa Zeno HYBRID',
          displayCode: 'VZ-001',
          archetype: 'ENGIN3',
          dayIndex: 0,
          sections: {
            create: [
              {
                title: 'Warm-up',
                type: 'WARMUP',
                order: 0,
                note: 'Prepare your body for the work ahead',
                blocks: {
                  create: [
                    {
                      order: 0,
                      label: '01',
                      exerciseName: 'Dynamic Warm-up',
                      description: '5 minutes of light movement',
                      repScheme: '5 min',
                    },
                  ],
                },
              },
              {
                title: 'Section 01: The Engine',
                type: 'EMOM',
                order: 1,
                emomWorkSec: 45,
                emomRestSec: 15,
                emomRounds: 12,
                note: 'Every minute on the minute for 12 rounds',
                blocks: {
                  create: [
                    {
                      order: 0,
                      label: '01',
                      exerciseName: 'KB Russian Swings',
                      description: 'Full extension at the top',
                      repScheme: '10',
                      tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: '12 kg', targetReps: 10 },
                            { tier: 'GOLD', load: '16 kg', targetReps: 10 },
                            { tier: 'BLACK', load: '20 kg', targetReps: 10 },
                          ],
                        },
                    },
                    {
                      order: 1,
                      label: '02',
                      exerciseName: 'Burpees',
                      description: 'Full range of motion',
                      repScheme: '10',
                      tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: 'Bodyweight', targetReps: 8 },
                            { tier: 'GOLD', load: 'Bodyweight', targetReps: 10 },
                            { tier: 'BLACK', load: 'Bodyweight', targetReps: 12 },
                          ],
                        },
                    },
                    {
                      order: 2,
                      label: '03',
                      exerciseName: 'Row (Erg)',
                      description: 'Smooth, powerful strokes',
                      repScheme: '100 cals',
                      distance: 100,
                      distanceUnit: 'cal',
                      tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: 'Erg', targetReps: 80 },
                            { tier: 'GOLD', load: 'Erg', targetReps: 100 },
                            { tier: 'BLACK', load: 'Erg', targetReps: 120 },
                          ],
                        },
                    },
                    {
                      order: 3,
                      label: '04',
                      exerciseName: 'Pull-ups',
                      description: 'Dead hang to chin over bar',
                      repScheme: '10',
                      tierPrescriptions: {
                        create: [
                          { tier: 'SILVER', load: 'Bodyweight', targetReps: 5, notes: 'Use assistance if needed' },
                          { tier: 'GOLD', load: 'Bodyweight', targetReps: 10 },
                          { tier: 'BLACK', load: 'Bodyweight', targetReps: 15 },
                        ],
                      },
                    },
                  ],
                },
              },
              {
                title: 'Section 02: The Grind',
                type: 'AMRAP',
                order: 2,
                durationSec: 720,
                note: 'As many rounds as possible in 12 minutes',
                blocks: {
                  create: [
                    {
                      order: 0,
                      label: '01',
                      exerciseName: 'Thrusters',
                      description: 'Full depth squat, full overhead extension',
                      repScheme: '15',
                      tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: '2x12 kg', targetReps: 15 },
                            { tier: 'GOLD', load: '2x15 kg', targetReps: 15 },
                            { tier: 'BLACK', load: '2x20 kg', targetReps: 15 },
                          ],
                        },
                    },
                    {
                      order: 1,
                      label: '02',
                      exerciseName: 'Box Jumps',
                      description: 'Full extension at the top',
                      repScheme: '12',
                      tierPrescriptions: {
                        create: [
                          { tier: 'SILVER', load: '20" box', targetReps: 12 },
                          { tier: 'GOLD', load: '24" box', targetReps: 12 },
                          { tier: 'BLACK', load: '30" box', targetReps: 12 },
                        ],
                      },
                    },
                    {
                      order: 2,
                      label: '03',
                      exerciseName: 'Double Unders',
                      description: 'Rope passes twice per jump',
                      repScheme: '50',
                      tierPrescriptions: {
                        create: [
                          { tier: 'SILVER', load: 'Jump Rope', targetReps: 30, notes: 'Single unders if needed' },
                          { tier: 'GOLD', load: 'Jump Rope', targetReps: 50 },
                          { tier: 'BLACK', load: 'Jump Rope', targetReps: 75 },
                        ],
                      },
                    },
                  ],
                },
              },
              {
                title: 'Finisher',
                type: 'FINISHER',
                order: 3,
                note: 'One final push',
                blocks: {
                  create: [
                    {
                      order: 0,
                      label: '01',
                      exerciseName: "Farmer's Walk",
                      description: 'Heavy carry, maintain posture',
                      repScheme: '200m',
                      distance: 200,
                      distanceUnit: 'm',
                      tierPrescriptions: {
                          create: [
                            { tier: 'SILVER', load: '2x16 kg' },
                            { tier: 'GOLD', load: '2x20 kg' },
                            { tier: 'BLACK', load: '2x24 kg' },
                          ],
                        },
                    },
                  ],
                },
              },
              {
                title: 'Cooldown',
                type: 'COOLDOWN',
                order: 4,
                note: 'Recovery and mobility',
                blocks: {
                  create: [
                    {
                      order: 0,
                      label: '01',
                      exerciseName: 'Static Stretching',
                      description: 'Hold each stretch for 30-60 seconds',
                      repScheme: '5 min',
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  });

  console.log('✅ Created Villa Zeno Hybrid program');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
