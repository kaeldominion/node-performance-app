'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { aiApi, workoutsApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

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
  'running route',
  'bodyweight',
];

export default function WorkoutBuilderPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<any>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    goal: 'HYBRID',
    equipment: [] as string[],
    workoutType: 'single' as 'single' | 'week' | 'month' | 'fourDay', // single, 7-day, 4-day, 4-week
    workoutDuration: 'standard' as 'standard' | 'hyrox', // Only for single workouts
    includeHyrox: false, // For multi-day programs: include HYROX sessions
    archetype: '' as string | undefined,
    sectionPreferences: ['WARMUP', 'EMOM', 'AMRAP', 'FINISHER', 'COOLDOWN'],
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
      // Determine if this is a HYROX workout
      const isHyrox = formData.workoutType === 'single' && formData.workoutDuration === 'hyrox';
      
      // Calculate available minutes based on workout duration
      const availableMinutes = isHyrox ? 90 : 55; // Standard: 50-60min (use 55), HYROX: 90min
      
      // For HYROX, don't send goal/archetype (they don't apply)
      // Show reviewing status after generation starts
      setReviewing(true);
      
      const workout = await aiApi.generateWorkout({
        goal: isHyrox ? 'CONDITIONING' : formData.goal, // HYROX always uses CONDITIONING
        trainingLevel: 'ADVANCED', // Used only for workout complexity/duration guidance
        equipment: formData.equipment,
        availableMinutes: availableMinutes,
        archetype: isHyrox ? undefined : formData.archetype, // No archetype for HYROX
        sectionPreferences: formData.sectionPreferences,
        workoutType: formData.workoutType,
        cycle: formData.cycle,
        isHyrox: isHyrox, // Only true for single HYROX workouts
        includeHyrox: formData.workoutType !== 'single' ? formData.includeHyrox : undefined, // For multi-day programs
      });
      setGeneratedWorkout(workout);
    } catch (err: any) {
      console.error('Workout generation error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to generate workout. Please try again.';
      setError(errorMessage);
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">AI Workout Builder</h1>
          <Link
            href="/workouts/recommended"
            className="bg-panel thin-border text-text-white px-4 py-2 rounded hover:border-node-volt transition-colors flex items-center gap-2"
          >
            <span>⭐</span> Browse Recommended
          </Link>
        </div>

        <div className="bg-panel thin-border rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Workout Parameters</h2>

          <div className="space-y-6">
            {/* Primary Goal (hidden for HYROX) */}
            {!(formData.workoutType === 'single' && formData.workoutDuration === 'hyrox') && (
              <div>
                <label className="block text-sm font-medium mb-2">Primary Goal</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {TRAINING_GOALS.map((goal) => (
                    <button
                      key={goal}
                      onClick={() => setFormData({ ...formData, goal: goal as any })}
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
            )}

            {/* Workout Duration (only for single workouts) */}
            {formData.workoutType === 'single' && (
              <div>
                <label className="block text-sm font-medium mb-2">Workout Duration</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, workoutDuration: 'standard' })}
                    className={`px-4 py-4 rounded-lg border-2 transition-all text-left ${
                      formData.workoutDuration === 'standard'
                        ? 'bg-node-volt text-dark border-node-volt shadow-lg shadow-node-volt/30'
                        : 'bg-panel thin-border text-text-white hover:border-node-volt hover:bg-tech-grey'
                    }`}
                  >
                    <div className="text-2xl mb-2">⏱️</div>
                    <div className="font-bold text-lg mb-1">Standard</div>
                    <div className="text-xs opacity-80">50-60 minutes</div>
                    <div className="text-xs opacity-60 mt-1">Standard NØDE workout</div>
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, workoutDuration: 'hyrox' })}
                    className={`px-4 py-4 rounded-lg border-2 transition-all text-left ${
                      formData.workoutDuration === 'hyrox'
                        ? 'bg-node-volt text-dark border-node-volt shadow-lg shadow-node-volt/30'
                        : 'bg-panel thin-border text-text-white hover:border-node-volt hover:bg-tech-grey'
                    }`}
                  >
                    <div className="text-2xl mb-2">🏃</div>
                    <div className="font-bold text-lg mb-1">HYROX</div>
                    <div className="text-xs opacity-80">90 minutes</div>
                    <div className="text-xs opacity-60 mt-1">Long conditioning session</div>
                  </button>
                </div>
              </div>
            )}

            {/* Include HYROX Sessions (for multi-day programs) */}
            {formData.workoutType !== 'single' && (
              <div>
                <label className="block text-sm font-medium mb-2">Include HYROX Sessions</label>
                <div className="bg-panel/50 border border-border-dark rounded-lg p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.includeHyrox}
                      onChange={(e) => setFormData({ ...formData, includeHyrox: e.target.checked })}
                      className="w-5 h-5 rounded border-border-dark bg-tech-grey text-node-volt focus:ring-node-volt"
                    />
                    <div>
                      <div className="font-medium text-text-white">
                        Include HYROX-style conditioning sessions
                      </div>
                      <div className="text-xs text-muted-text mt-1">
                        {formData.workoutType === 'fourDay' && '1 HYROX session per week (90 min)'}
                        {formData.workoutType === 'week' && '1 HYROX session per week (90 min)'}
                        {formData.workoutType === 'month' && '4 HYROX sessions (1 per week, 90 min each)'}
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}

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

            {/* HYROX Info (when HYROX is selected) */}
            {formData.workoutType === 'single' && formData.workoutDuration === 'hyrox' && (
              <div className="bg-node-volt/10 border-2 border-node-volt rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">🏃</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      HYROX-Style Conditioning
                    </h3>
                    <p className="text-text-white text-sm leading-relaxed">
                      This will generate a 90-minute long conditioning session focused on endurance, pacing, and sustained effort. 
                      Perfect for HYROX training, long-distance running preparation, or building aerobic capacity.
                    </p>
                    <p className="text-muted-text text-xs mt-2">
                      Archetype and Goal selectors are hidden as they don't apply to HYROX-style workouts.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Archetype (hidden for HYROX) */}
            {!(formData.workoutType === 'single' && formData.workoutDuration === 'hyrox') && (
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
              <p className="text-xs text-muted-text mt-2">
                Leave blank for AI to auto-select based on your goal and equipment
              </p>
              <button
                onClick={() => setFormData({ ...formData, archetype: undefined })}
                className="text-sm text-muted-text hover:text-text-white mt-2"
              >
                Clear selection
              </button>
              </div>
            )}

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
                  <span>
                    {reviewing ? 'Reviewing & Testing Workout...' : 'Generating Workout...'}
                  </span>
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
          <div className="bg-panel thin-border rounded-lg p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {generatedWorkout.displayCode && (
                    <span className="text-node-volt font-mono text-3xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      {generatedWorkout.displayCode}
                    </span>
                  )}
                  <h2 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)', letterSpacing: '-0.02em' }}>
                    {generatedWorkout.name}
                  </h2>
                </div>
                {generatedWorkout.description && (
                  <p className="text-muted-text text-lg mt-2">{generatedWorkout.description}</p>
                )}
                <p className="text-muted-text text-sm mt-1">
                  {generatedWorkout.sections?.length || 0} sections
                </p>
              </div>
              <button
                onClick={handleSaveWorkout}
                className="bg-node-volt text-dark font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity text-lg"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Save Workout
              </button>
            </div>

            <div className="space-y-6">
              {generatedWorkout.sections?.map((section: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-panel/50 thin-border rounded-lg p-6 border-l-4"
                  style={{ borderLeftColor: section.type === 'EMOM' ? '#ccff00' : section.type === 'AMRAP' ? '#ccff00' : 'transparent' }}
                >
                  {/* Section Header */}
                  <div className="flex items-start justify-between mb-4 pb-4 border-b border-tech-grey">
                    <div>
                      <h3 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {section.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-node-volt text-sm font-medium uppercase tracking-wider">
                          {section.type}
                        </span>
                        {section.emomRounds && (
                          <span className="text-muted-text text-sm">
                            EMOM x {section.emomRounds} // {section.emomWorkSec}s work : {section.emomRestSec}s rest
                          </span>
                        )}
                        {section.durationSec && (
                          <span className="text-muted-text text-sm">
                            {Math.floor(section.durationSec / 60)}:{(section.durationSec % 60).toString().padStart(2, '0')} CAP
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {section.note && (
                    <p className="text-muted-text text-sm mb-4 italic">{section.note}</p>
                  )}

                  {/* Section Content */}
                  {section.type === 'EMOM' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {section.blocks?.map((block: any, blockIdx: number) => (
                        <div
                          key={blockIdx}
                          className="bg-panel thin-border rounded-lg p-4 hover:border-node-volt transition-colors"
                        >
                          <div className="text-node-volt font-mono text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                            {block.label || String(blockIdx + 1).padStart(2, '0')}
                          </div>
                          <h4 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                            {block.exerciseName}
                          </h4>
                          {block.description && (
                            <p className="text-node-volt text-xs mb-3 uppercase tracking-wide">{block.description}</p>
                          )}
                          {block.repScheme && (
                            <div className="text-node-volt font-bold text-lg mb-3">{block.repScheme}</div>
                          )}
                          {/* Tier Prescriptions */}
                          {(block.tierSilver || block.tierGold || block.tierBlack) && (
                            <div className="space-y-2 mt-4 pt-3 border-t border-tech-grey">
                              {block.tierSilver && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="px-2 py-1 bg-zinc-700 text-white text-xs font-bold rounded">SLV</span>
                                  <strong className="text-white">{block.tierSilver.load || block.tierSilver.targetReps}</strong>
                                </div>
                              )}
                              {block.tierGold && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="px-2 py-1 bg-yellow-600 text-black text-xs font-bold rounded">GLD</span>
                                  <strong className="text-white">{block.tierGold.load || block.tierGold.targetReps}</strong>
                                </div>
                              )}
                              {block.tierBlack && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="px-2 py-1 bg-black text-white border border-zinc-700 text-xs font-bold rounded">BLK</span>
                                  <strong className="text-white">{block.tierBlack.load || block.tierBlack.targetReps}</strong>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {(section.type === 'AMRAP' || section.type === 'FOR_TIME' || section.type === 'CIRCUIT') && (
                    <div className="space-y-4">
                      {section.blocks?.map((block: any, blockIdx: number) => (
                        <div
                          key={blockIdx}
                          className="bg-panel/30 thin-border rounded-lg p-6"
                        >
                          <div className="flex items-center gap-4 mb-3">
                            {block.label && (
                              <span className="text-node-volt font-mono text-5xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                                {block.label}
                              </span>
                            )}
                            <div className="flex-1">
                              <h4 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                                {block.exerciseName}
                              </h4>
                              {block.description && (
                                <p className="text-muted-text text-sm">{block.description}</p>
                              )}
                            </div>
                          </div>
                          {block.repScheme && (
                            <div className="text-node-volt font-bold text-xl mb-4">{block.repScheme}</div>
                          )}
                          {/* Tier Prescriptions Grid */}
                          {(block.tierSilver || block.tierGold || block.tierBlack) && (
                            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-tech-grey bg-zinc-900/50 p-4 rounded">
                              {block.tierSilver && (
                                <div className="text-center">
                                  <span className="text-2xl font-bold text-white block mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                                    {block.tierSilver.load || block.tierSilver.targetReps}
                                  </span>
                                  <span className="text-xs text-zinc-400 uppercase tracking-wider">Silver</span>
                                </div>
                              )}
                              {block.tierGold && (
                                <div className="text-center">
                                  <span className="text-2xl font-bold text-yellow-500 block mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                                    {block.tierGold.load || block.tierGold.targetReps}
                                  </span>
                                  <span className="text-xs text-zinc-400 uppercase tracking-wider">Gold</span>
                                </div>
                              )}
                              {block.tierBlack && (
                                <div className="text-center">
                                  <span className="text-2xl font-bold text-white block mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                                    {block.tierBlack.load || block.tierBlack.targetReps}
                                  </span>
                                  <span className="text-xs text-zinc-400 uppercase tracking-wider">Black</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {(section.type === 'WAVE' || section.type === 'SUPERSET' || !['EMOM', 'AMRAP', 'FOR_TIME', 'CIRCUIT'].includes(section.type)) && (
                    <div className="space-y-3">
                      {section.blocks?.map((block: any, blockIdx: number) => (
                        <div
                          key={blockIdx}
                          className="bg-panel/30 thin-border rounded-lg p-4"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            {block.label && (
                              <span className="text-node-volt font-mono text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                                {block.label}
                              </span>
                            )}
                            <h4 className="text-xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                              {block.exerciseName}
                            </h4>
                          </div>
                          {block.description && (
                            <p className="text-muted-text text-sm mb-2">{block.description}</p>
                          )}
                          {block.repScheme && (
                            <div className="text-node-volt font-bold text-lg mb-3">{block.repScheme}</div>
                          )}
                          {/* Tier Prescriptions */}
                          {(block.tierSilver || block.tierGold || block.tierBlack) && (
                            <div className="flex gap-2 mt-3">
                              {block.tierSilver && (
                                <div className="px-3 py-1 bg-zinc-700 text-white text-xs font-bold rounded">
                                  SLV: {block.tierSilver.load || block.tierSilver.targetReps}
                                </div>
                              )}
                              {block.tierGold && (
                                <div className="px-3 py-1 bg-yellow-600 text-black text-xs font-bold rounded">
                                  GLD: {block.tierGold.load || block.tierGold.targetReps}
                                </div>
                              )}
                              {block.tierBlack && (
                                <div className="px-3 py-1 bg-black text-white border border-zinc-700 text-xs font-bold rounded">
                                  BLK: {block.tierBlack.load || block.tierBlack.targetReps}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

