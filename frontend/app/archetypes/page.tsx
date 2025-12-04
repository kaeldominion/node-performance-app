'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';

const ARCHETYPES = [
  {
    name: 'PR1ME',
    fullName: 'Primary Strength',
    description: 'Build maximal strength, refined technique, progressive overload.',
    structure: 'WARMUP → WAVE (main lift) → SUPERSET (secondary) → Optional FINISHER → COOLDOWN',
    examples: ['10-8-8-8', '9-8-7-6+', '6-4-3-2-1', '6-3-1-1-1', '5-3-2-1-1'],
    color: 'text-node-volt',
  },
  {
    name: 'FORGE',
    fullName: 'Strength Supersets',
    description: 'Develop muscular balance, body armor, skill under fatigue.',
    structure: 'WARMUP → SUPERSET (Block A) → SUPERSET (Block B) → Optional FINISHER → COOLDOWN',
    examples: ['BB Strict Press + Push Jerk', 'RFE Split Squat + Pull-ups', 'DB Rows + Incline Bench'],
    color: 'text-node-volt',
  },
  {
    name: 'ENGIN3',
    fullName: 'Hybrid EMOM',
    description: 'Improve threshold capacity, aerobic power, movement efficiency.',
    structure: 'WARMUP → EMOM/E2MOM (skill + engine + loaded movement) → Optional short burner',
    examples: ['EMOM x 16 (4 stations × 4 rounds)', 'E2MOM x 8', '1:10 rotation × 12'],
    color: 'text-node-volt',
  },
  {
    name: 'CIRCUIT_X',
    fullName: 'Anaerobic MetCon',
    description: 'Develop fast conditioning, mixed modal capacity, anaerobic durability.',
    structure: 'WARMUP → 1-3 AMRAP blocks (4-8 mins) → Pair work, YGIG, or solo cycles',
    examples: ['6:30 AMRAP (pairs)', '4-min burners', 'Hyrox-style rep schemes (100/80/60 reps)'],
    color: 'text-node-volt',
  },
  {
    name: 'CAPAC1TY',
    fullName: 'Long Engine Conditioning',
    description: 'Build aerobic base, pacing strategy, long-range repeatability.',
    structure: 'WARMUP → One long block (12-20 mins) or two medium blocks',
    examples: ['18:00 cap', '14:00 aerobic engine', '30:00 mixed capacity'],
    color: 'text-node-volt',
  },
  {
    name: 'FLOWSTATE',
    fullName: 'Deload, Movement & Mobility',
    description: 'Facilitate recovery, mobility, tissue health, longevity.',
    structure: 'Light lifting (tempo) → KB flows → Slow EMOMs → Long cooldown → Breathwork + mobility',
    examples: ['Tempo work', 'KB flows', 'Slow EMOMs'],
    color: 'text-node-volt',
  },
];

const SECTION_TYPES = [
  {
    type: 'WARMUP',
    description: 'Dynamic movement prep, activation, mobility work',
    duration: '5-10 minutes',
  },
  {
    type: 'WAVE',
    description: 'Progressive strength sets with descending reps (e.g., 10-8-8-8)',
    duration: '15-25 minutes',
  },
  {
    type: 'SUPERSET',
    description: 'Paired exercises performed back-to-back (push/pull, squat/hinge)',
    duration: '12-20 minutes',
  },
  {
    type: 'EMOM',
    description: 'Every Minute On the Minute - work at start of each minute',
    duration: '10-20 minutes',
  },
  {
    type: 'AMRAP',
    description: 'As Many Rounds As Possible - max rounds in time cap',
    duration: '4-12 minutes',
  },
  {
    type: 'FOR_TIME',
    description: 'Complete prescribed work as fast as possible',
    duration: '5-30 minutes',
  },
  {
    type: 'CIRCUIT',
    description: 'Multiple AMRAP blocks with rest between',
    duration: '20-40 minutes',
  },
  {
    type: 'CAPACITY',
    description: 'Long-duration aerobic/anaerobic threshold work',
    duration: '12-30 minutes',
  },
  {
    type: 'FLOW',
    description: 'Tempo work, KB flows, slow EMOMs for recovery',
    duration: '15-25 minutes',
  },
  {
    type: 'FINISHER',
    description: 'Short, high-intensity burn to finish the session',
    duration: '3-8 minutes',
  },
  {
    type: 'COOLDOWN',
    description: 'Mobility, stretching, breathwork',
    duration: '5-10 minutes',
  },
];

export default function ArchetypesPage() {
  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 font-heading">
            NØDE <span className="text-node-volt">Archetypes</span>
          </h1>
          <p className="text-xl text-muted-text font-body">
            Six core workout structures designed for elite hybrid performance
          </p>
        </div>

        {/* Archetypes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {ARCHETYPES.map((archetype) => (
            <div
              key={archetype.name}
              className="bg-panel thin-border rounded-lg p-8 hover:border-node-volt transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <h2 className={`text-3xl font-bold font-heading ${archetype.color}`}>
                  {archetype.name}
                </h2>
                <span className="text-muted-text font-body">// {archetype.fullName}</span>
              </div>
              <p className="text-muted-text mb-6 font-body">{archetype.description}</p>
              
              <div className="mb-4">
                <h3 className="text-sm font-bold text-node-volt mb-2 uppercase tracking-wider font-heading">
                  Structure
                </h3>
                <p className="text-text-white font-body">{archetype.structure}</p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-node-volt mb-2 uppercase tracking-wider font-heading">
                  Examples
                </h3>
                <ul className="space-y-1">
                  {archetype.examples.map((example, idx) => (
                    <li key={idx} className="text-muted-text font-body">• {example}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Section Types */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-8 font-heading">
            Section <span className="text-node-volt">Types</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SECTION_TYPES.map((section) => (
              <div
                key={section.type}
                className="bg-panel thin-border rounded-lg p-6"
              >
                <h3 className="text-xl font-bold mb-2 text-node-volt font-heading">
                  {section.type}
                </h3>
                <p className="text-muted-text mb-2 font-body">{section.description}</p>
                <p className="text-sm text-muted-text font-body">Duration: {section.duration}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-panel thin-border rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4 font-heading">Ready to Train?</h2>
          <p className="text-muted-text mb-6 font-body">
            Generate your own workout using our AI builder
          </p>
          <Link
            href="/ai/workout-builder"
            className="inline-block bg-node-volt text-dark font-bold px-8 py-4 rounded-lg hover:opacity-90 transition-opacity font-heading"
          >
            Build Workout
          </Link>
        </div>
      </main>
    </div>
  );
}

