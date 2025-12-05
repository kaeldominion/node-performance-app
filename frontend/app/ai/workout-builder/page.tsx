'use client';

import { useState, useEffect } from 'react';
import { Icons } from '@/lib/iconMapping';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { aiApi, workoutsApi, programsApi, userApi, scheduleApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { GenerationTerminal } from '@/components/workout/GenerationTerminal';
import { getTierDisplayValue } from '@/components/workout/tierDisplayUtils';

const TRAINING_GOALS = [
  { value: 'STRENGTH', label: 'STRENGTH', icon: Icons.GOAL_STRENGTH },
  { value: 'HYPERTROPHY', label: 'HYPERTROPHY', icon: Icons.GOAL_HYPERTROPHY },
  { value: 'HYBRID', label: 'HYBRID', icon: Icons.GOAL_HYBRID },
  { value: 'CONDITIONING', label: 'CONDITIONING', icon: Icons.GOAL_CONDITIONING },
  { value: 'FAT_LOSS', label: 'FAT_LOSS', icon: Icons.GOAL_FAT_LOSS },
  { value: 'LONGEVITY', label: 'LONGEVITY', icon: Icons.GOAL_LONGEVITY },
];
const ARCHETYPES = [
  { code: 'PR1ME', name: 'PR1ME', icon: Icons.PR1ME, description: 'Primary Strength Day' },
  { code: 'FORGE', name: 'FORGE', icon: Icons.FORGE, description: 'Strength Superset Day' },
  { code: 'ENGIN3', name: 'ENGIN3', icon: Icons.ENGIN3, description: 'Hybrid EMOM Day' },
  { code: 'CIRCUIT_X', name: 'CIRCUIT X', icon: Icons.CIRCUIT_X, description: 'Anaerobic / MetCon Day' },
  { code: 'CAPAC1TY', name: 'CAPAC1TY', icon: Icons.CAPAC1TY, description: 'Long Engine Conditioning' },
  { code: 'FLOWSTATE', name: 'FLOWSTATE', icon: Icons.FLOWSTATE, description: 'Deload, Movement & Mobility' },
];
// Equipment organized by category
const EQUIPMENT_CATEGORIES = {
  'Strength Equipment': [
    'dumbbells',
    'kettlebell',
    'barbell',
  ],
  'Erg Machines': [
    'rower',
    'bike_erg', // Concept2 BikeErg
    'ski_erg',
    'air_bike', // Assault/Echo Bike
  ],
  'Bodyweight & Accessories': [
    'rings',
    'pull-up bar',
    'box',
    'jump rope',
    'sandbag',
    'slam balls',
  ],
  'Space & Environment': [
    'running route',
  ],
};

// Flattened list for backward compatibility
const EQUIPMENT_OPTIONS = Object.values(EQUIPMENT_CATEGORIES).flat();

export default function WorkoutBuilderPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<any>(null);
  const [error, setError] = useState<string | null>('');
  const [showTerminal, setShowTerminal] = useState(false);
  const [startDate, setStartDate] = useState<string>(() => {
    // Default to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

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
  const [savedWorkoutId, setSavedWorkoutId] = useState<string | null>(null);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Load form data from URL query parameters (from dashboard mini form or HYROX page)
  useEffect(() => {
    const goalParam = searchParams.get('goal');
    const archetypeParam = searchParams.get('archetype');
    const workoutTypeParam = searchParams.get('workoutType');
    const workoutDurationParam = searchParams.get('workoutDuration');
    const equipmentParam = searchParams.get('equipment');
    const trainingLevelParam = searchParams.get('trainingLevel');

    if (goalParam || archetypeParam || workoutTypeParam || workoutDurationParam || equipmentParam || trainingLevelParam) {
      setFormData(prev => ({
        ...prev,
        goal: goalParam || prev.goal,
        archetype: archetypeParam || prev.archetype,
        workoutType: (workoutTypeParam as 'single' | 'week' | 'month' | 'fourDay') || prev.workoutType,
        workoutDuration: (workoutDurationParam as 'standard' | 'hyrox') || prev.workoutDuration,
      }));

      // Handle equipment from query params
      if (equipmentParam) {
        const equipmentArray = equipmentParam.split(',').filter(Boolean);
        if (equipmentArray.length > 0) {
          setFormData(prev => ({ ...prev, equipment: equipmentArray }));
        }
      }
    }
  }, [searchParams]);

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
      equipment: EQUIPMENT_OPTIONS,
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
    setReviewing(false); // Start with reviewing false
    setShowTerminal(true); // Show terminal

    try {
      // Determine if this is a HYROX workout
      const isHyrox = formData.workoutType === 'single' && formData.workoutDuration === 'hyrox';
      
      // Calculate available minutes based on workout duration
      const availableMinutes = isHyrox ? 90 : 55; // Standard: 50-60min (use 55), HYROX: 90min
      
      // Start generation phase - reviewing will start after generation completes
      const workout = await aiApi.generateWorkout({
        goal: isHyrox ? 'CONDITIONING' : formData.goal, // HYROX always uses CONDITIONING
        trainingLevel: 'ADVANCED', // Used only for workout complexity/duration guidance
        equipment: formData.equipment,
        availableMinutes: availableMinutes,
        // Only pass archetype for single workouts (not HYROX, not multi-day)
        // For multi-day programs, AI will randomly select archetypes based on goal
        archetype: (formData.workoutType === 'single' && !isHyrox) ? formData.archetype : undefined,
        sectionPreferences: formData.sectionPreferences,
        workoutType: formData.workoutType,
        // Don't pass cycle for 4-week programs (automatic progression)
        cycle: formData.workoutType === 'month' ? undefined : formData.cycle,
        isHyrox: isHyrox, // Only true for single HYROX workouts
        includeHyrox: formData.workoutType !== 'single' ? formData.includeHyrox : undefined, // For multi-day programs
      });
      
      // Generation is complete - now start review phase (only for single workouts)
      // The review happens in reviewAndAdjustWorkout on the backend, but we show it in UI
      if (formData.workoutType === 'single') {
        setLoading(false); // Generation phase complete
        setReviewing(true); // Start review phase
        // Simulate review phase duration to match backend processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        setReviewing(false);
      } else {
        // Multi-day programs don't go through review phase
        setLoading(false);
      }
      
      setGeneratedWorkout(workout);
    } catch (err: any) {
      console.error('Workout generation error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to generate workout. Please try again.';
      setError(errorMessage);
      setReviewing(false);
      setShowTerminal(true); // Keep terminal visible for errors
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkout = async () => {
    if (!generatedWorkout) return;

    try {
      setLoading(true);
      setError(null);
      
      // Handle arrays (week/month programs) vs single workout
      if (Array.isArray(generatedWorkout)) {
        // Determine program details based on workout type
        const workoutCount = generatedWorkout.length;
        let programName = '';
        let durationWeeks = 1;
        
        if (formData.workoutType === 'fourDay') {
          programName = `4-Day Program - ${formData.goal}`;
          durationWeeks = 1;
        } else if (formData.workoutType === 'week') {
          programName = `7-Day Program - ${formData.goal}`;
          durationWeeks = 1;
        } else if (formData.workoutType === 'month') {
          programName = `4-Week Program - ${formData.goal}`;
          durationWeeks = 4;
        }
        
        // Create program with all workouts
        const program = await programsApi.createWithWorkouts({
          name: programName,
          description: `AI-generated ${formData.workoutType === 'fourDay' ? '4-day' : formData.workoutType === 'week' ? '7-day' : '4-week'} program`,
          level: 'ADVANCED',
          goal: formData.goal,
          durationWeeks,
          cycle: formData.cycle,
          workouts: generatedWorkout,
        });
        
        // Optionally start the program with the selected start date
        try {
          await userApi.startProgram({
            programId: program.id,
            startDate: startDate,
          });
        } catch (err) {
          console.warn('Could not auto-start program:', err);
          // Continue anyway - user can start it manually
        }
        
        // Navigate to programs page or the program detail
        router.push(`/programs/${program.slug}`);
      } else {
        // Single workout - save first, then show success modal
        const savedWorkout = await workoutsApi.create(generatedWorkout);
        setSavedWorkoutId(savedWorkout.id);
        setShowSaveSuccessModal(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save workout. Please try again.');
      console.error('Failed to save workout:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInDeck = () => {
    if (savedWorkoutId) {
      router.push(`/workouts/${savedWorkoutId}`);
    }
  };

  const handlePreview = () => {
    if (savedWorkoutId) {
      router.push(`/workouts/${savedWorkoutId}?preview=true`);
    }
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleStayHere = () => {
    setShowSaveSuccessModal(false);
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
            <Icons.BROWSE size={20} />
            Browse Recommended
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
                      key={goal.value}
                      onClick={() => setFormData({ ...formData, goal: goal.value as any })}
                      className={`px-4 py-3 rounded border transition-colors font-medium flex items-center justify-center gap-2 ${
                        formData.goal === goal.value
                          ? 'bg-node-volt text-dark border-node-volt'
                          : 'bg-panel thin-border text-text-white hover:border-node-volt'
                      }`}
                    >
                      <goal.icon size={18} className={formData.goal === goal.value ? 'text-black' : 'text-node-volt'} />
                      <span>{goal.label}</span>
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
                    <div className="mb-2 text-node-volt"><Icons.TIMER size={32} /></div>
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
                    <div className="mb-2 text-node-volt"><Icons.HYROX size={32} /></div>
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
                  { value: 'single', label: '1-Off', desc: 'Single workout session', Icon: Icons.SESSIONS },
                  { value: 'fourDay', label: '4-Day', desc: '4 workouts per week', Icon: Icons.PROGRAMS },
                  { value: 'week', label: '7-Day', desc: 'Full week with deload', Icon: Icons.PROGRAMS },
                  { value: 'month', label: '4-Week', desc: 'Progressive cycle', Icon: Icons.PROGRAMS },
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
                    <div className="mb-2 text-node-volt"><type.Icon size={32} /></div>
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

            {/* Cycle Selection (for 4-day and 7-day programs, not 4-week) */}
            {formData.workoutType !== 'single' && formData.workoutType !== 'month' && (
              <div>
                <label className="block text-sm font-medium mb-2">Training Cycle</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'BASE', icon: 'base', desc: 'Establish baseline' },
                    { value: 'LOAD', icon: 'load', desc: 'Increase volume' },
                    { value: 'INTENSIFY', icon: 'intensify', desc: 'Peak intensity' },
                    { value: 'DELOAD', icon: 'deload', desc: 'Recovery week' },
                  ].map((cycle) => (
                    <button
                      key={cycle.value}
                      onClick={() => setFormData({ ...formData, cycle: cycle.value as any })}
                      className={`px-4 py-3 rounded border transition-colors text-left font-medium ${
                        formData.cycle === cycle.value
                          ? 'bg-node-volt text-dark border-node-volt'
                          : 'bg-panel thin-border text-text-white hover:border-node-volt'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="font-bold">{cycle.value}</div>
                        <div className="text-xs opacity-80">{cycle.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Info for 4-week programs */}
            {formData.workoutType === 'month' && (
              <div className="bg-node-volt/10 border border-node-volt rounded-lg p-4">
                <p className="text-sm text-text-white">
                  <strong>4-Week Program:</strong> Automatically follows progressive periodization:
                  <br />
                  Week 1: <strong>BASE</strong> (establish baseline) → Week 2: <strong>LOAD</strong> (increase volume) → 
                  Week 3: <strong>INTENSIFY</strong> (peak intensity) → Week 4: <strong>DELOAD</strong> (recovery)
                </p>
              </div>
            )}

            {/* HYROX Info (when HYROX is selected) */}
            {formData.workoutType === 'single' && formData.workoutDuration === 'hyrox' && (
              <div className="bg-node-volt/10 border-2 border-node-volt rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <div className="text-node-volt"><Icons.HYROX size={32} /></div>
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

            {/* Archetype (only for single workouts, hidden for HYROX and multi-day programs) */}
            {formData.workoutType === 'single' && formData.workoutDuration !== 'hyrox' && (
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
                      className={`w-full px-4 py-2 rounded border transition-colors relative font-medium ${
                        formData.archetype === archetype.code
                          ? 'bg-node-volt text-dark border-node-volt'
                          : 'bg-panel thin-border text-text-white hover:border-node-volt'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{archetype.name}</span>
                        <archetype.icon size={20} className="text-node-volt" />
                      </div>
                    </button>
                    {showArchetypeInfo === archetype.code && (
                      <div className="absolute z-50 mt-2 p-4 bg-panel border border-node-volt rounded-lg shadow-xl min-w-[280px] max-w-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <archetype.icon size={32} className="text-node-volt" />
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

            {/* Info for multi-day programs */}
            {formData.workoutType !== 'single' && (
              <div className="bg-node-volt/10 border border-node-volt rounded-lg p-4">
                <p className="text-sm text-text-white">
                  <strong>Note:</strong> For multi-day programs, archetypes will be automatically selected based on your primary goal. 
                  The system will create a balanced program with varied workout types.
                </p>
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
              <div className="space-y-4">
                {Object.entries(EQUIPMENT_CATEGORIES).map(([category, items]) => (
                  <div key={category}>
                    <div className="text-xs text-muted-text uppercase tracking-wide mb-2 font-semibold">
                      {category}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {items.map((equipment) => {
                        // Format display name
                        const displayName = equipment
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (l) => l.toUpperCase())
                          .replace('Bike Erg', 'BikeErg (Concept2)')
                          .replace('Air Bike', 'Assault/Echo Bike')
                          .replace('Ski Erg', 'SkiErg');
                        
                        return (
                          <button
                            key={equipment}
                            onClick={() => handleEquipmentToggle(equipment)}
                            className={`px-4 py-2 rounded border transition-colors text-sm font-medium ${
                              formData.equipment.includes(equipment)
                                ? 'bg-node-volt text-dark border-node-volt'
                                : 'bg-panel thin-border text-text-white hover:border-node-volt'
                            }`}
                          >
                            {displayName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
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

        {/* Generation Terminal */}
        {showTerminal && (loading || reviewing || error || (!loading && !reviewing && !error && generatedWorkout)) && (
          <div className="mb-8 transition-all duration-500">
            <GenerationTerminal
              isGenerating={loading}
              isReviewing={reviewing}
              error={error || null}
              workoutReady={!!generatedWorkout && !loading && !reviewing}
              onComplete={() => {
                setShowTerminal(false);
              }}
            />
          </div>
        )}

        {/* Error Message (fallback if terminal doesn't show error well) */}
        {error && !loading && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-8 text-red-400">
            {error}
          </div>
        )}

        {/* Generated Workout Preview */}
        {generatedWorkout && (
          <div 
            className={`bg-panel thin-border rounded-lg p-8 transition-all duration-700 ${
              showTerminal ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}
          >
            {/* Multi-day Program Display */}
            {(Array.isArray(generatedWorkout) || generatedWorkout.workouts) ? (
              <>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)', letterSpacing: '-0.02em' }}>
                      {formData.workoutType === 'fourDay' ? '4-Day Program' : 
                       formData.workoutType === 'week' ? '7-Day Program' : 
                       '4-Week Program'}
                    </h2>
                    <p className="text-muted-text text-lg">
                      {formData.goal} • {formData.cycle || 'Progressive Periodization'}
                    </p>
                    <p className="text-muted-text text-sm mt-1">
                      {(Array.isArray(generatedWorkout) ? generatedWorkout : generatedWorkout.workouts)?.length || 0} workouts
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-muted-text">Start Date:</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="bg-panel thin-border text-text-white px-3 py-2 rounded"
                      />
                    </div>
                    <button
                      onClick={handleSaveWorkout}
                      className="bg-node-volt text-dark font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity text-lg"
                      style={{ fontFamily: 'var(--font-space-grotesk)' }}
                    >
                      Save Program
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {(Array.isArray(generatedWorkout) ? generatedWorkout : generatedWorkout.workouts)?.map((workout: any, workoutIdx: number) => (
                    <div key={workoutIdx} className="bg-panel/50 thin-border rounded-lg p-6 border-l-4 border-node-volt">
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-tech-grey">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            {workout.displayCode && (
                              <span className="text-node-volt font-mono text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                                {workout.displayCode}
                              </span>
                            )}
                            <h3 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)', letterSpacing: '-0.02em' }}>
                              {workout.name}
                            </h3>
                          </div>
                          {workout.description && (
                            <p className="text-muted-text text-sm mt-1">{workout.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            {workout.dayIndex && (
                              <span className="text-node-volt text-sm font-medium">Day {workout.dayIndex}</span>
                            )}
                            {workout.weekIndex && (
                              <span className="text-node-volt text-sm font-medium">Week {workout.weekIndex}</span>
                            )}
                            {workout.archetype && (
                              <span className="text-muted-text text-sm">• {workout.archetype}</span>
                            )}
                            <span className="text-muted-text text-sm">
                              • {workout.sections?.length || 0} sections
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {workout.sections?.map((section: any, sectionIdx: number) => (
                          <div
                            key={sectionIdx}
                            className="bg-panel/30 thin-border rounded-lg p-4 border-l-2"
                            style={{ borderLeftColor: section.type === 'EMOM' ? '#ccff00' : section.type === 'AMRAP' ? '#ccff00' : 'transparent' }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                                {section.title}
                              </h4>
                              <div className="flex items-center gap-2">
                                <span className="text-node-volt text-xs font-medium uppercase tracking-wider">
                                  {section.type}
                                </span>
                                {section.durationSec && (
                                  <span className="text-muted-text text-xs">
                                    {Math.floor(section.durationSec / 60)}:{(section.durationSec % 60).toString().padStart(2, '0')}
                                  </span>
                                )}
                              </div>
                            </div>
                            {section.note && (
                              <p className="text-muted-text text-xs mb-3 italic">{section.note}</p>
                            )}
                            <div className="text-sm text-muted-text">
                              {section.blocks?.length || 0} exercises
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Single Workout Display */}
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
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleSaveWorkout}
                      className="bg-node-volt text-dark font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity text-lg"
                      style={{ fontFamily: 'var(--font-space-grotesk)' }}
                    >
                      Save Workout
                    </button>
                  </div>
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
                                  <strong className="text-white">{getTierDisplayValue(block.tierSilver, block.exerciseName)}</strong>
                                </div>
                              )}
                              {block.tierGold && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="px-2 py-1 bg-yellow-600 text-black text-xs font-bold rounded">GLD</span>
                                  <strong className="text-white">{getTierDisplayValue(block.tierGold, block.exerciseName)}</strong>
                                </div>
                              )}
                              {block.tierBlack && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="px-2 py-1 bg-black text-white border border-zinc-700 text-xs font-bold rounded">BLK</span>
                                  <strong className="text-white">{getTierDisplayValue(block.tierBlack, block.exerciseName)}</strong>
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
                                    {getTierDisplayValue(block.tierSilver, block.exerciseName)}
                                  </span>
                                  <span className="text-xs text-zinc-400 uppercase tracking-wider">Silver</span>
                                </div>
                              )}
                              {block.tierGold && (
                                <div className="text-center">
                                  <span className="text-2xl font-bold text-yellow-500 block mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                                    {getTierDisplayValue(block.tierGold, block.exerciseName)}
                                  </span>
                                  <span className="text-xs text-zinc-400 uppercase tracking-wider">Gold</span>
                                </div>
                              )}
                              {block.tierBlack && (
                                <div className="text-center">
                                  <span className="text-2xl font-bold text-white block mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                                    {getTierDisplayValue(block.tierBlack, block.exerciseName)}
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
                                  SLV: {getTierDisplayValue(block.tierSilver, block.exerciseName)}
                                </div>
                              )}
                              {block.tierGold && (
                                <div className="px-3 py-1 bg-yellow-600 text-black text-xs font-bold rounded">
                                  GLD: {getTierDisplayValue(block.tierGold, block.exerciseName)}
                                </div>
                              )}
                              {block.tierBlack && (
                                <div className="px-3 py-1 bg-black text-white border border-zinc-700 text-xs font-bold rounded">
                                  BLK: {getTierDisplayValue(block.tierBlack, block.exerciseName)}
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
              </>
            )}
          </div>
        )}

        {/* Save Success Modal */}
        {showSaveSuccessModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-panel thin-border rounded-lg max-w-md w-full p-6 space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-node-volt/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icons.CHECK size={32} className="text-node-volt" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-text-white mb-2">
                  Workout Saved!
                </h2>
                <p className="text-muted-text">
                  Your workout has been saved successfully. What would you like to do next?
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleViewInDeck}
                  className="w-full bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity text-center"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  View in Deck
                </button>
                <button
                  onClick={handlePreview}
                  className="w-full bg-panel thin-border text-text-white px-6 py-3 rounded-lg hover:border-node-volt hover:text-node-volt transition-colors text-center"
                >
                  Preview Workout
                </button>
                <button
                  onClick={handleGoToDashboard}
                  className="w-full bg-panel/50 thin-border text-muted-text px-6 py-3 rounded-lg hover:border-node-volt hover:text-node-volt transition-colors text-center"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={handleStayHere}
                  className="w-full text-muted-text px-6 py-3 rounded-lg hover:text-text-white transition-colors text-center"
                >
                  Stay Here
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Schedule Modal */}
      {showScheduleModal && savedWorkoutId && (
        <ScheduleWorkoutModal
          workoutId={savedWorkoutId}
          onClose={() => setShowScheduleModal(false)}
          onSuccess={() => {
            setShowScheduleModal(false);
            setShowSaveSuccessModal(false);
          }}
        />
      )}
    </div>
  );
}

// Schedule Workout Modal Component
function ScheduleWorkoutModal({
  workoutId,
  onClose,
  onSuccess,
}: {
  workoutId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set default to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const handleSchedule = async () => {
    if (!selectedDate) return;

    try {
      setLoading(true);
      const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}`);
      await scheduleApi.create({
        workoutId,
        scheduledDate: scheduledDateTime.toISOString(),
        duration: 60, // Default 60 minutes
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to schedule workout:', error);
      alert('Failed to schedule workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-panel thin-border rounded-lg max-w-md w-full p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Schedule Workout
          </h2>
          <button onClick={onClose} className="text-muted-text hover:text-text-white">
            <Icons.X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-text">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-dark thin-border rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-muted-text">Time</label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full bg-dark thin-border rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-panel thin-border text-text-white px-6 py-3 rounded-lg hover:bg-panel transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            disabled={loading || !selectedDate}
            className="flex-1 bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            {loading ? 'Scheduling...' : 'Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
}

