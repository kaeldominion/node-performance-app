'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import { adminApi } from '@/lib/api';
import { useEffect, useState } from 'react';

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

interface Exercise {
  id: string;
  name: string;
  category: string;
  movementPattern: string;
  equipment: string[];
  suitableArchetypes: string[];
}

export default function ArchetypesPage() {
  const { user } = useAuth();
  const [exampleExercises, setExampleExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(true);

  useEffect(() => {
    // Try to load a few example exercises, but don't fail if it doesn't work
    const loadExamples = async () => {
      try {
        const exercises = await adminApi.getExercises();
        // Get a diverse sample of exercises
        const categories = ['STRENGTH', 'ENGINE', 'MIXED'];
        const examples: Exercise[] = [];
        
        categories.forEach((cat) => {
          const catExercises = exercises.filter((ex: Exercise) => ex.category === cat);
          if (catExercises.length > 0) {
            examples.push(catExercises[Math.floor(Math.random() * catExercises.length)]);
          }
        });
        
        // Fill up to 6 examples
        while (examples.length < 6 && exercises.length > examples.length) {
          const remaining = exercises.filter((ex: Exercise) => !examples.find((e) => e.id === ex.id));
          if (remaining.length > 0) {
            examples.push(remaining[Math.floor(Math.random() * remaining.length)]);
          } else {
            break;
          }
        }
        
        setExampleExercises(examples.slice(0, 6));
      } catch (error) {
        console.error('Failed to load exercises:', error);
        // Use fallback examples
        setExampleExercises([
          { id: '1', name: 'Barbell Back Squat', category: 'STRENGTH', movementPattern: 'SQUAT', equipment: ['barbell'], suitableArchetypes: ['PR1ME', 'FORGE'] },
          { id: '2', name: 'EMOM Burpees', category: 'ENGINE', movementPattern: 'FULL_BODY', equipment: [], suitableArchetypes: ['ENGIN3', 'CIRCUIT_X'] },
          { id: '3', name: 'Dumbbell Bench Press', category: 'STRENGTH', movementPattern: 'HORIZONTAL_PUSH', equipment: ['dumbbell'], suitableArchetypes: ['PR1ME', 'FORGE'] },
        ]);
      } finally {
        setLoadingExercises(false);
      }
    };
    
    loadExamples();
  }, []);

  return (
    <div className="min-h-screen bg-dark">
      {/* Simple Navbar for public pages */}
      <nav className="border-b thin-border bg-panel/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-muted-text hover:text-text-white transition-colors">
                Home
              </Link>
              {user ? (
                <Link href="/dashboard" className="text-sm text-muted-text hover:text-text-white transition-colors">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="text-sm text-muted-text hover:text-text-white transition-colors">
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-4 py-2 thin-border border-node-volt text-node-volt font-heading font-bold text-xs uppercase tracking-[0.2em] hover:bg-node-volt hover:text-dark transition-all duration-300"
                  >
                    Join
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-5xl font-bold mb-4 font-heading">
                NØDE <span className="text-node-volt">Archetypes</span>
              </h1>
              <p className="text-xl text-muted-text font-body">
                Six core workout structures designed for elite hybrid performance
              </p>
            </div>
            <Link
              href="/"
              className="ml-6 px-6 py-3 thin-border border-node-volt text-node-volt font-heading font-bold text-sm uppercase tracking-[0.2em] hover:bg-node-volt hover:text-dark transition-all duration-300 whitespace-nowrap"
            >
              ← Home
            </Link>
          </div>
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

        {/* Exercise Database Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold mb-2 font-heading">
                Exercise <span className="text-node-volt">Database</span>
              </h2>
              <p className="text-muted-text font-body text-lg">
                Comprehensive library of exercises with tier prescriptions, movement patterns, and archetype compatibility
              </p>
            </div>
            <Link
              href="/exercises"
              className="px-6 py-3 thin-border border-node-volt text-node-volt font-heading font-bold text-sm uppercase tracking-[0.2em] hover:bg-node-volt hover:text-dark transition-all duration-300 whitespace-nowrap"
            >
              View All →
            </Link>
          </div>

          {loadingExercises ? (
            <div className="text-center py-12 text-muted-text">Loading exercises...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {exampleExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="bg-panel thin-border rounded-lg p-6 hover:border-node-volt transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-text-white font-heading">
                      {exercise.name}
                    </h3>
                    <span className="text-xs bg-node-volt/20 text-node-volt px-2 py-1 rounded uppercase">
                      {exercise.category}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-text">Pattern:</span>{' '}
                      <span className="text-text-white">
                        {exercise.movementPattern.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-text">Equipment:</span>{' '}
                      <span className="text-text-white">
                        {exercise.equipment && exercise.equipment.length > 0
                          ? exercise.equipment.join(', ')
                          : 'Bodyweight'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {exercise.suitableArchetypes.slice(0, 3).map((arch) => (
                        <span
                          key={arch}
                          className="text-xs bg-dark/80 thin-border px-2 py-1 rounded text-node-volt"
                        >
                          {arch}
                        </span>
                      ))}
                      {exercise.suitableArchetypes.length > 3 && (
                        <span className="text-xs text-muted-text">
                          +{exercise.suitableArchetypes.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <Link
              href="/exercises"
              className="inline-block px-8 py-4 bg-node-volt text-dark font-heading font-bold uppercase tracking-[0.25em] hover:bg-text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-node-volt/20"
            >
              Browse Full Exercise Library
            </Link>
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



