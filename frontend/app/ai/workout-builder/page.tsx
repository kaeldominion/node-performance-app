'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { aiApi, workoutsApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

const TRAINING_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE'];
const TRAINING_GOALS = ['STRENGTH', 'HYPERTROPHY', 'HYBRID', 'CONDITIONING', 'FAT_LOSS', 'LONGEVITY'];
const ARCHETYPES = [
  { code: 'PR1ME', name: 'PR1ME', icon: '💪', description: 'Primary Strength Day' },
  { code: 'FORGE', name: 'FORGE', icon: '🔥', description: 'Strength Superset Day' },
  { code: 'ENGIN3', name: 'ENGIN3', icon: '⚡', description: 'Hybrid EMOM Day' },
  { code: 'CIRCUIT_X', name: 'CIRCUIT X', icon: '💥', description: 'Anaerobic / MetCon Day' },
  { code: 'CAPAC1TY', name: 'CAPAC1TY', icon: '🌊', description: 'Long Engine Conditioning' },
  { code: 'FLOWSTATE', name: 'FLOWSTATE', icon: '🧘', description: 'Deload, Movement & Mobility' },
];
const EQUIPMENT_OPTIONS = [
  'dumbbells',
  'kettlebell',
  'barbell',
  'erg',
  'rower',
  'bike',
  'rings',
  'pull-up bar',
  'box',
  'jump rope',
  'sandbag',
  'bodyweight',
];

export default function WorkoutBuilderPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<any>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    goal: 'HYBRID',
    trainingLevel: 'INTERMEDIATE',
    equipment: [] as string[],
    availableMinutes: 45,
    archetype: '' as string | undefined,
    sectionPreferences: ['WARMUP', 'EMOM', 'AMRAP', 'FINISHER', 'COOLDOWN'],
    workoutType: 'single' as 'single' | 'week' | 'month' | 'fourDay', // single, 7-day, 4-day, 4-week
    cycle: 'BASE' as 'BASE' | 'LOAD' | 'INTENSIFY' | 'DELOAD' | undefined, // Cycle for multi-day programs
  });
  const [showArchetypeInfo, setShowArchetypeInfo] = useState<string | null>(null);

  // Load equipment from cookie on mount
  useEffect(() => {
    const savedEquipment = document.cookie
      .split('; ')
      .find(row => row.startsWith('node_equipment='))
      ?.split('=')[1];
    if (savedEquipment) {
      try {
        const equipment = JSON.parse(decodeURIComponent(savedEquipment));
        if (Array.isArray(equipment) && equipment.length > 0) {
          setFormData(prev => ({ ...prev, equipment }));
        }
      } catch (e) {
        console.error('Failed to parse saved equipment:', e);
      }
    }
  }, []);

  // Save equipment to cookie whenever it changes
  useEffect(() => {
    if (formData.equipment.length > 0) {
      const cookieValue = encodeURIComponent(JSON.stringify(formData.equipment));
      document.cookie = `node_equipment=${cookieValue}; path=/; max-age=${365 * 24 * 60 * 60}`; // 1 year
    }
  }, [formData.equipment]);

  const handleEquipmentToggle = (equipment: string) => {
    setFormData((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter((e) => e !== equipment)
        : [...prev.equipment, equipment],
    }));
  };

  const handleSelectAll = () => {
    setFormData((prev) => ({
      ...prev,
      equipment: [...EQUIPMENT_OPTIONS],
    }));
  };


  const handleClearEquipment = () => {
    setFormData((prev) => ({
      ...prev,
      equipment: [],
    }));
  };

  const handleGenerate = async () => {
    if (formData.equipment.length === 0) {
      setError('Please select at least one piece of equipment');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedWorkout(null);

    try {
      const workout = await aiApi.generateWorkout({
        goal: formData.goal,
        trainingLevel: formData.trainingLevel,
        equipment: formData.equipment,
        availableMinutes: formData.availableMinutes,
        archetype: formData.archetype,
        sectionPreferences: formData.sectionPreferences,
        workoutType: formData.workoutType,
      });
      setGeneratedWorkout(workout);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkout = async () => {
    if (!generatedWorkout) return;

    try {
      setLoading(true);
      
      // Handle arrays (week/month programs) vs single workout
      if (Array.isArray(generatedWorkout)) {
        // Save each workout in the program
        const savedWorkouts = await Promise.all(
          generatedWorkout.map((workout) => workoutsApi.create(workout))
        );
        // Navigate to first workout or programs page
        router.push(`/workouts/${savedWorkouts[0].id}`);
      } else {
        // Single workout
        const savedWorkout = await workoutsApi.create(generatedWorkout);
        router.push(`/workouts/${savedWorkout.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save workout. Please try again.');
      console.error('Failed to save workout:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-muted-text">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8">AI Workout Builder</h1>

        <div className="bg-panel thin-border rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Workout Parameters</h2>

          <div className="space-y-6">
            {/* Training Level */}
            <div>
              <label className="block text-sm font-medium mb-2">Training Level</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {TRAINING_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => setFormData({ ...formData, trainingLevel: level })}
                    className={`px-4 py-2 rounded border transition-colors ${
                      formData.trainingLevel === level
                        ? 'bg-node-volt text-dark border-node-volt'
                        : 'bg-panel thin-border text-text-white hover:border-node-volt'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Goal */}
            <div>
              <label className="block text-sm font-medium mb-2">Primary Goal</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {TRAINING_GOALS.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => setFormData({ ...formData, goal })}
                    className={`px-4 py-2 rounded border transition-colors ${
                      formData.goal === goal
                        ? 'bg-node-volt text-dark border-node-volt'
                        : 'bg-panel thin-border text-text-white hover:border-node-volt'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            {/* Available Time */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Available Time: {formData.availableMinutes} minutes
              </label>
              <input
                type="range"
                min="20"
                max="90"
                step="5"
                value={formData.availableMinutes}
                onChange={(e) =>
                  setFormData({ ...formData, availableMinutes: parseInt(e.target.value) })
                }
                className="w-full"
              />
            </div>

            {/* Workout Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Program Type</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'single', label: '1-Off', desc: 'Single workout session', icon: '💪' },
                  { value: 'fourDay', label: '4-Day', desc: '4 workouts per week', icon: '📅' },
                  { value: 'week', label: '7-Day', desc: 'Full week with deload', icon: '📆' },
                  { value: 'month', label: '4-Week', desc: 'Progressive cycle', icon: '🗓️' },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setFormData({ ...formData, workoutType: type.value as any })}
                    className={`px-4 py-4 rounded-lg border-2 transition-all text-left ${
                      formData.workoutType === type.value
                        ? 'bg-node-volt text-dark border-node-volt shadow-lg shadow-node-volt/30'
                        : 'bg-panel thin-border text-text-white hover:border-node-volt hover:bg-tech-grey'
                    }`}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="font-bold text-lg mb-1">{type.label}</div>
                    <div className="text-xs opacity-80">{type.desc}</div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-text mt-2">
                {formData.workoutType === 'single' && 'Perfect for a quick, effective training session.'}
                {formData.workoutType === 'fourDay' && '3 training days + 1 active recovery. Maintains intensity while respecting recovery.'}
                {formData.workoutType === 'week' && 'Load → Active Recovery → Load → Active Recovery → Load → Deload → Rest.'}
                {formData.workoutType === 'month' && 'BASE → LOAD → INTENSIFY → DELOAD. Full periodization cycle.'}
              </p>
            </div>

            {/* Cycle Selection (for multi-day programs) */}
            {formData.workoutType !== 'single' && (
              <div>
                <label className="block text-sm font-medium mb-2">Training Cycle</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'BASE', desc: 'Establish baseline' },
                    { value: 'LOAD', desc: 'Increase volume' },
                    { value: 'INTENSIFY', desc: 'Peak intensity' },
                    { value: 'DELOAD', desc: 'Recovery week' },
                  ].map((cycle) => (
                    <button
                      key={cycle.value}
                      onClick={() => setFormData({ ...formData, cycle: cycle.value as any })}
                      className={`px-4 py-3 rounded border transition-colors text-left ${
                        formData.cycle === cycle.value
                          ? 'bg-node-volt text-dark border-node-volt'
                          : 'bg-panel thin-border text-text-white hover:border-node-volt'
                      }`}
                    >
                      <div className="font-bold">{cycle.value}</div>
                      <div className="text-xs opacity-80">{cycle.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Archetype */}
            <div>
              <label className="block text-sm font-medium mb-2">
                NØDE Archetype (Optional)
                <Link href="/theory" className="ml-2 text-xs text-node-volt hover:underline">
                  Learn more →
                </Link>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {ARCHETYPES.map((archetype) => (
                  <div key={archetype.code} className="relative">
                    <button
                      onClick={() => setFormData({ ...formData, archetype: formData.archetype === archetype.code ? undefined : archetype.code })}
                      onMouseEnter={() => setShowArchetypeInfo(archetype.code)}
                      onMouseLeave={() => setShowArchetypeInfo(null)}
                      className={`w-full px-4 py-2 rounded border transition-colors relative ${
                        formData.archetype === archetype.code
                          ? 'bg-node-volt text-dark border-node-volt'
                          : 'bg-panel thin-border text-text-white hover:border-node-volt'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{archetype.name}</span>
                        <span className="text-lg">{archetype.icon}</span>
                      </div>
                    </button>
                    {showArchetypeInfo === archetype.code && (
                      <div className="absolute z-50 mt-2 p-4 bg-panel border border-node-volt rounded-lg shadow-xl min-w-[280px] max-w-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{archetype.icon}</span>
                          <div>
                            <div className="font-bold text-node-volt">{archetype.name}</div>
                            <div className="text-xs text-muted-text">{archetype.description}</div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-text mb-3">
                          {archetype.code === 'PR1ME' && 'Primary strength day focusing on maximal strength and progressive overload.'}
                          {archetype.code === 'FORGE' && 'Strength superset day for muscular balance and body armor.'}
                          {archetype.code === 'ENGIN3' && 'Hybrid EMOM day for threshold capacity and aerobic power.'}
                          {archetype.code === 'CIRCUIT_X' && 'Anaerobic MetCon day for fast conditioning and mixed modal capacity.'}
                          {archetype.code === 'CAPAC1TY' && 'Long engine conditioning for aerobic base and pacing strategy.'}
                          {archetype.code === 'FLOWSTATE' && 'Deload, movement & mobility for recovery and longevity.'}
                        </p>
                        <Link
                          href="/theory"
                          className="text-xs text-node-volt hover:underline flex items-center gap-1"
                        >
                          View full details →
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setFormData({ ...formData, archetype: undefined })}
                className="text-sm text-muted-text hover:text-text-white"
              >
                Clear selection
              </button>
            </div>

            {/* Equipment */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Available Equipment</label>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-xs px-3 py-1 bg-panel thin-border rounded hover:border-node-volt text-muted-text hover:text-text-white transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleClearEquipment}
                    className="text-xs px-3 py-1 bg-panel thin-border rounded hover:border-node-volt text-muted-text hover:text-text-white transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {EQUIPMENT_OPTIONS.map((equipment) => (
                  <button
                    key={equipment}
                    onClick={() => handleEquipmentToggle(equipment)}
                    className={`px-4 py-2 rounded border transition-colors ${
                      formData.equipment.includes(equipment)
                        ? 'bg-node-volt text-dark border-node-volt'
                        : 'bg-panel thin-border text-text-white hover:border-node-volt'
                    }`}
                  >
                    {equipment}
                  </button>
                ))}
              </div>
              {formData.equipment.length > 0 && (
                <p className="text-xs text-muted-text mt-2">
                  {formData.equipment.length} equipment selected (saved to preferences)
                </p>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || formData.equipment.length === 0}
              className="w-full bg-node-volt text-dark font-bold py-3 rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="loading-spinner w-5 h-5 border-2"></div>
                  <span>Generating Workout...</span>
                </>
              ) : (
                'Generate Workout'
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-8 text-red-400">
            {error}
          </div>
        )}

        {/* Generated Workout Preview */}
        {generatedWorkout && (
          <div className="bg-panel thin-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {generatedWorkout.displayCode && (
                    <span className="text-node-volt">{generatedWorkout.displayCode}</span>
                  )}{' '}
                  {generatedWorkout.name}
                </h2>
                <p className="text-muted-text">
                  {generatedWorkout.sections?.length || 0} sections
                </p>
              </div>
              <button
                onClick={handleSaveWorkout}
                className="bg-node-volt text-dark font-bold px-6 py-2 rounded hover:opacity-90"
              >
                Save Workout
              </button>
            </div>

            <div className="space-y-4">
              {generatedWorkout.sections?.map((section: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-panel thin-border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold">{section.title}</h3>
                    <span className="text-node-volt text-sm font-medium">{section.type}</span>
                  </div>
                  {section.note && (
                    <p className="text-muted-text text-sm mb-3">{section.note}</p>
                  )}
                  {section.durationSec && (
                    <p className="text-muted-text text-sm">
                      Duration: {Math.floor(section.durationSec / 60)} minutes
                    </p>
                  )}
                  {section.emomRounds && (
                    <p className="text-muted-text text-sm">
                      EMOM: {section.emomRounds} rounds ({section.emomWorkSec}s work /{' '}
                      {section.emomRestSec}s rest)
                    </p>
                  )}
                  <div className="mt-3 space-y-2">
                    {section.blocks?.map((block: any, blockIdx: number) => (
                      <div
                        key={blockIdx}
                        className="bg-panel rounded p-2 text-sm"
                      >
                        <div className="font-medium">
                          {block.label && (
                            <span className="text-node-volt mr-2">{block.label}</span>
                          )}
                          {block.exerciseName}
                        </div>
                        {block.repScheme && (
                          <div className="text-node-volt">{block.repScheme}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

