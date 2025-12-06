'use client';

import { useEffect, useState } from 'react';
import { exercisesApi } from '@/lib/api';
import { Icons } from '@/lib/iconMapping';
import { useTheme } from '@/contexts/ThemeContext';

interface ExerciseDetailsModalProps {
  exerciseName: string;
  exerciseId?: string;
  onClose: () => void;
}

interface Exercise {
  id: string;
  exerciseId: string;
  name: string;
  aliases?: string[];
  category: string;
  movementPattern: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string[];
  instructions?: string;
  graphics?: string[];
  videoUrl?: string;
  commonMistakes?: string[];
  progressionTips?: string;
  regressionTips?: string;
  notes?: string;
  tiers?: Array<{
    tier: string;
    description?: string;
    typicalReps?: string;
  }>;
}

export function ExerciseDetailsModal({ exerciseName, exerciseId, onClose }: ExerciseDetailsModalProps) {
  const { theme } = useTheme();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExercise = async () => {
      if (!exerciseId && !exerciseName) {
        setError('No exercise identifier provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Try to find exercise by ID first, then by name
        let foundExercise: Exercise | null = null;
        
        if (exerciseId) {
          try {
            foundExercise = await exercisesApi.getById(exerciseId);
          } catch (err) {
            console.log('Could not find exercise by ID, trying name search');
          }
        }
        
        if (!foundExercise) {
          // Search by name
          const allExercises = await exercisesApi.getAll();
          foundExercise = allExercises.find((e: Exercise) => 
            e.name.toLowerCase() === exerciseName.toLowerCase() ||
            e.aliases?.some((alias: string) => alias.toLowerCase() === exerciseName.toLowerCase())
          ) || null;
        }

        if (foundExercise) {
          setExercise(foundExercise);
        } else {
          setError(`Exercise "${exerciseName}" not found in library`);
        }
      } catch (err: any) {
        console.error('Failed to load exercise:', err);
        setError('Failed to load exercise details. It may not be in the exercise library yet.');
      } finally {
        setLoading(false);
      }
    };

    loadExercise();
  }, [exerciseName, exerciseId]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-panel thin-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-panel border-b thin-border p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            {exercise?.name || exerciseName}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-text hover:text-text-white transition-colors"
          >
            <Icons.X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-text">Loading exercise details...</div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-400">
              {error}
            </div>
          )}

          {exercise && !loading && (
            <>
              {/* Basic Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-muted-text uppercase tracking-wide mb-1">Category</div>
                  <div className="text-text-white font-medium">{exercise.category}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-text uppercase tracking-wide mb-1">Movement Pattern</div>
                  <div className="text-text-white font-medium">{exercise.movementPattern.replace(/_/g, ' ')}</div>
                </div>
                {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 && (
                  <div>
                    <div className="text-xs text-muted-text uppercase tracking-wide mb-1">Primary Muscles</div>
                    <div className="text-text-white font-medium">{exercise.primaryMuscles.join(', ')}</div>
                  </div>
                )}
                {exercise.equipment && exercise.equipment.length > 0 && (
                  <div>
                    <div className="text-xs text-muted-text uppercase tracking-wide mb-1">Equipment</div>
                    <div className="text-text-white font-medium">{exercise.equipment.join(', ')}</div>
                  </div>
                )}
              </div>

              {/* Exercise Image/Graphics */}
              {exercise.graphics && exercise.graphics.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Instructions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {exercise.graphics.map((graphic, idx) => (
                      <div key={idx} className="rounded-lg overflow-hidden bg-dark">
                        <img
                          src={graphic}
                          alt={`${exercise.name} instruction ${idx + 1}`}
                          className="w-full h-auto"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions */}
              {exercise.instructions && (
                <div>
                  <h3 className="text-lg font-bold mb-3">How to Perform</h3>
                  <div className="text-text-white whitespace-pre-line leading-relaxed">
                    {exercise.instructions}
                  </div>
                </div>
              )}

              {/* Video */}
              {exercise.videoUrl && (
                <div>
                  <h3 className="text-lg font-bold mb-3">Video Demonstration</h3>
                  <div className="rounded-lg overflow-hidden">
                    <iframe
                      src={exercise.videoUrl}
                      className="w-full aspect-video"
                      allowFullScreen
                      title={`${exercise.name} video`}
                    />
                  </div>
                </div>
              )}

              {/* Tier Information */}
              {exercise.tiers && exercise.tiers.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-3">Tier Guidelines</h3>
                  <div className="space-y-3">
                    {exercise.tiers.map((tier) => (
                      <div key={tier.tier} className="bg-panel/50 thin-border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded text-xs font-bold ${
                            tier.tier === 'SILVER' 
                              ? 'bg-zinc-700 text-white'
                              : tier.tier === 'GOLD'
                              ? 'bg-yellow-600 text-black'
                              : 'bg-black text-white border border-zinc-700'
                          }`}>
                            {tier.tier}
                          </span>
                          {tier.typicalReps && (
                            <span className="text-node-volt font-medium">{tier.typicalReps}</span>
                          )}
                        </div>
                        {tier.description && (
                          <p className="text-muted-text text-sm">{tier.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Common Mistakes */}
              {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-3">Common Mistakes to Avoid</h3>
                  <ul className="space-y-2">
                    {exercise.commonMistakes.map((mistake, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-red-400 mt-1">×</span>
                        <span className="text-text-white">{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Progression Tips */}
              {exercise.progressionTips && (
                <div>
                  <h3 className="text-lg font-bold mb-3">Progression Tips</h3>
                  <div className="text-text-white whitespace-pre-line leading-relaxed">
                    {exercise.progressionTips}
                  </div>
                </div>
              )}

              {/* Regression Tips */}
              {exercise.regressionTips && (
                <div>
                  <h3 className="text-lg font-bold mb-3">Regression Tips</h3>
                  <div className="text-text-white whitespace-pre-line leading-relaxed">
                    {exercise.regressionTips}
                  </div>
                </div>
              )}

              {/* Secondary Muscles */}
              {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-3">Secondary Muscles</h3>
                  <div className="text-text-white">{exercise.secondaryMuscles.join(', ')}</div>
                </div>
              )}

              {/* Notes */}
              {exercise.notes && (
                <div>
                  <h3 className="text-lg font-bold mb-3">Additional Notes</h3>
                  <div className="text-muted-text whitespace-pre-line leading-relaxed">
                    {exercise.notes}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Footer */}
          <div className="pt-4 border-t thin-border flex justify-end">
            <button
              onClick={onClose}
              className="bg-node-volt text-dark font-bold px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

