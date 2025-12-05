'use client';

import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Icon } from '@/components/icons';

const ARCHETYPES = [
  {
    name: 'PR1ME',
    code: 'PR1ME',
    color: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/50',
    icon: '',
    description: 'Primary Strength Day',
    purpose: 'Build maximal strength, refined technique, progressive overload.',
    structure: 'Warm-up → Main Lift Wave (Deadlift/Squat/Bench/Strict Press) → Secondary Lift Superset → Optional short finisher',
    examples: [
      'Wave: 10-8-8-8, 9-8-7-6+, 6-4-3-2-1',
      'Wave: 6-3-1-1-1, 5-3-2-1-1',
      'Main lift with descending rep scheme',
    ],
    whenToUse: 'Focus days for building raw strength and power. Perfect for athletes prioritizing maximal force output.',
  },
  {
    name: 'FORGE',
    code: 'FORGE',
    color: 'from-orange-500/20 to-orange-600/10 border-orange-500/50',
    icon: '',
    description: 'Strength Superset Day',
    purpose: 'Develop muscular balance, body armor, skill under fatigue.',
    structure: 'Warm-up → Block A: Strength superset (push/pull or squat/hinge) → Block B: Accessory pump block',
    examples: [
      'BB Strict Press + Push Jerk',
      'RFE Split Squat + Pull-ups',
      'DB Rows + Incline Bench',
    ],
    whenToUse: 'Hypertrophy-focused sessions. Build muscle mass while maintaining strength. Great for balanced development.',
  },
  {
    name: 'ENGIN3',
    code: 'ENGIN3',
    color: 'from-blue-500/20 to-blue-600/10 border-blue-500/50',
    icon: '',
    description: 'Hybrid EMOM Day',
    purpose: 'Improve threshold capacity, aerobic power, movement efficiency.',
    structure: 'Warm-up → EMOM/E2MOM (skill + engine + loaded movement) → Optional short burner',
    examples: [
      'EMOM x 16 (4 stations × 4 rounds)',
      'E2MOM x 8',
      '1:10 rotation × 12',
    ],
    whenToUse: 'Cardio-strength hybrid sessions. Build work capacity while maintaining movement quality under fatigue.',
  },
  {
    name: 'CIRCUIT X',
    code: 'CIRCUIT_X',
    color: 'from-red-500/20 to-red-600/10 border-red-500/50',
    icon: '',
    description: 'Anaerobic / MetCon Day',
    purpose: 'Develop fast conditioning, mixed modal capacity, anaerobic durability.',
    structure: 'Warm-up → 1-3 AMRAP blocks (4-8 mins) → Pair work, YGIG, or solo cycles',
    examples: [
      '6:30 AMRAP (pairs)',
      '4-min burners',
      'Hyrox-style rep schemes (100/80/60 reps)',
    ],
    whenToUse: 'High-intensity conditioning. Perfect for race prep, competition training, or pushing anaerobic limits.',
  },
  {
    name: 'CAPAC1TY',
    code: 'CAPAC1TY',
    color: 'from-green-500/20 to-green-600/10 border-green-500/50',
    icon: '',
    description: 'Long Engine Conditioning',
    purpose: 'Build aerobic base, pacing strategy, long-range repeatability.',
    structure: 'Warm-up → One long block (12-20 mins) or two medium blocks',
    examples: [
      '18:00 cap',
      '14:00 aerobic engine',
      '30:00 mixed capacity',
    ],
    whenToUse: 'Aerobic development. Essential for endurance athletes and building sustainable work capacity.',
  },
  {
    name: 'FLOWSTATE',
    code: 'FLOWSTATE',
    color: 'from-purple-500/20 to-purple-600/10 border-purple-500/50',
    icon: '',
    description: 'Deload, Movement & Mobility',
    purpose: 'Facilitate recovery, mobility, tissue health, longevity.',
    structure: 'Light lifting (tempo) → KB flows → Slow EMOMs → Long cooldown → Breathwork + mobility',
    examples: [
      'Tempo work',
      'KB flows',
      'Slow EMOMs',
      'Mobility circuits',
    ],
    whenToUse: 'Recovery days. Essential for longevity, injury prevention, and maintaining movement quality.',
  },
];

export default function TheoryPage() {
  return (
    <div className="min-h-screen bg-deep-asphalt">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-deep-asphalt via-concrete-grey to-deep-asphalt border-b border-border-dark overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-node-volt rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-node-volt rounded-full blur-3xl" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-text-white to-node-volt bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            The NØDE Method
          </h1>
          <p className="text-2xl text-muted-text max-w-3xl" style={{ fontFamily: 'var(--font-manrope)' }}>
            Six distinct workout archetypes, each designed to target specific adaptations and training goals.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction */}
        <div className="bg-concrete-grey border border-border-dark rounded-xl p-8 mb-16">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Training Philosophy
          </h2>
          <div className="prose prose-invert max-w-none" style={{ fontFamily: 'var(--font-manrope)' }}>
            <p className="text-lg text-muted-text mb-4">
              NØDE is built on the principle of structured variety. Rather than random workouts, we use six core archetypes
              that each serve a specific purpose in your training journey.
            </p>
            <p className="text-lg text-muted-text mb-4">
              Each archetype has a distinct structure, rep scheme, and intensity profile. By cycling through these systematically,
              you ensure balanced development across strength, power, endurance, and mobility.
            </p>
            <p className="text-lg text-muted-text">
              Whether you're training for Hyrox, building raw strength, or maintaining longevity, the NØDE system adapts to your goals
              while maintaining the structure that drives progress.
            </p>
          </div>
        </div>

        {/* Archetypes Grid */}
        <div className="space-y-8 mb-16">
          {ARCHETYPES.map((archetype, index) => (
            <div
              key={archetype.code}
              className={`bg-gradient-to-r ${archetype.color} border rounded-xl p-8 hover:scale-[1.01] transition-all`}
            >
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0">
                  <Icon name={archetype.code} size={64} color="var(--node-volt)" className="mb-4" />
                  <div className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {archetype.name}
                  </div>
                  <div className="text-xl text-muted-text mb-4" style={{ fontFamily: 'var(--font-manrope)' }}>
                    {archetype.description}
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      Purpose
                    </h3>
                    <p className="text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                      {archetype.purpose}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      Structure
                    </h3>
                    <p className="text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                      {archetype.structure}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      Examples
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                      {archetype.examples.map((example, idx) => (
                        <li key={idx}>{example}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      When to Use
                    </h3>
                    <p className="text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                      {archetype.whenToUse}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Periodization Section */}
        <div className="bg-concrete-grey border border-border-dark rounded-xl p-8 mb-16">
          <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Program Structure & Periodization
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-tech-grey border border-border-dark rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3 text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                1-Off Workouts
              </h3>
              <p className="text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                Single session workouts perfect for when you need a quick, effective training stimulus.
                Great for maintaining fitness or when you can't commit to a full program.
              </p>
            </div>
            
            <div className="bg-tech-grey border border-border-dark rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3 text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                7-Day Programs
              </h3>
              <p className="text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                Week-long training blocks with built-in load and deload days. Structure: Load → Active Recovery → Load → Active Recovery → Load → Deload → Rest.
                Perfect for consistent weekly training.
              </p>
            </div>
            
            <div className="bg-tech-grey border border-border-dark rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3 text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                4-Day Programs
              </h3>
              <p className="text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                Focused training blocks for athletes with limited time. Typically structured as 3 training days + 1 active recovery day.
                Maintains intensity while respecting recovery.
              </p>
            </div>
            
            <div className="bg-tech-grey border border-border-dark rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3 text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                4-Week Programs
              </h3>
              <p className="text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                Full periodization cycles: Week 1 (BASE) → Week 2 (LOAD) → Week 3 (INTENSIFY) → Week 4 (DELOAD).
                Progressive overload with built-in recovery. The gold standard for long-term progress.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-node-volt/20 via-node-volt/10 to-concrete-grey border-2 border-node-volt rounded-xl p-12 text-center">
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Ready to Train?
          </h2>
          <p className="text-xl text-muted-text mb-8" style={{ fontFamily: 'var(--font-manrope)' }}>
            Generate a custom workout or explore our programs
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/ai/workout-builder"
              className="bg-node-volt text-deep-asphalt font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity text-lg"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              AI Workout Builder →
            </Link>
            <Link
              href="/programs"
              className="bg-concrete-grey border-2 border-node-volt text-node-volt font-bold px-8 py-4 rounded-xl hover:bg-tech-grey transition-colors text-lg"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Browse Programs →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

