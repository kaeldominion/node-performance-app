'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { aiApi, workoutsApi } from '@/lib/api';
import Navbar from '@/components/Navbar';

const TRAINING_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE'];
const TRAINING_GOALS = ['STRENGTH', 'HYPERTROPHY', 'HYBRID', 'CONDITIONING', 'FAT_LOSS', 'LONGEVITY'];
const ARCHETYPES = ['PR1ME', 'FORGE', 'ENGIN3', 'CIRCUIT_X', 'CAPAC1TY', 'FLOWSTATE'];
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
  });

  const handleEquipmentToggle = (equipment: string) => {
    setFormData((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter((e) => e !== equipment)
        : [...prev.equipment, equipment],
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
      // TODO: Implement save to backend
      // For now, just navigate to view it
      alert('Workout saved! (Save functionality to be implemented)');
    } catch (err) {
      console.error('Failed to save workout:', err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-deep-asphalt flex items-center justify-center">
        <div className="text-muted-text">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-deep-asphalt">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8">AI Workout Builder</h1>

        <div className="bg-concrete-grey border border-border-dark rounded-lg p-6 mb-8">
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
                        ? 'bg-node-volt text-deep-asphalt border-node-volt'
                        : 'bg-tech-grey border-border-dark text-text-white hover:border-node-volt'
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
                        ? 'bg-node-volt text-deep-asphalt border-node-volt'
                        : 'bg-tech-grey border-border-dark text-text-white hover:border-node-volt'
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

            {/* Archetype */}
            <div>
              <label className="block text-sm font-medium mb-2">NØDE Archetype (Optional)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {ARCHETYPES.map((archetype) => (
                  <button
                    key={archetype}
                    onClick={() => setFormData({ ...formData, archetype: formData.archetype === archetype ? undefined : archetype })}
                    className={`px-4 py-2 rounded border transition-colors ${
                      formData.archetype === archetype
                        ? 'bg-node-volt text-deep-asphalt border-node-volt'
                        : 'bg-tech-grey border-border-dark text-text-white hover:border-node-volt'
                    }`}
                  >
                    {archetype}
                  </button>
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
              <label className="block text-sm font-medium mb-2">Available Equipment</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {EQUIPMENT_OPTIONS.map((equipment) => (
                  <button
                    key={equipment}
                    onClick={() => handleEquipmentToggle(equipment)}
                    className={`px-4 py-2 rounded border transition-colors ${
                      formData.equipment.includes(equipment)
                        ? 'bg-node-volt text-deep-asphalt border-node-volt'
                        : 'bg-tech-grey border-border-dark text-text-white hover:border-node-volt'
                    }`}
                  >
                    {equipment}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || formData.equipment.length === 0}
              className="w-full bg-node-volt text-deep-asphalt font-bold py-3 rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {loading ? 'Generating Workout...' : 'Generate Workout'}
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
          <div className="bg-concrete-grey border border-border-dark rounded-lg p-6">
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
                className="bg-node-volt text-deep-asphalt font-bold px-6 py-2 rounded hover:opacity-90"
              >
                Save Workout
              </button>
            </div>

            <div className="space-y-4">
              {generatedWorkout.sections?.map((section: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-tech-grey border border-border-dark rounded-lg p-4"
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
                        className="bg-concrete-grey rounded p-2 text-sm"
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

