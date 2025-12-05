'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

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
  space: string;
  impactLevel: string;
  typicalUse: string[];
  suitableArchetypes: string[];
  indoorFriendly: boolean;
  notes?: string;
  instructions?: string; // Step-by-step instructions
  variations?: any; // JSON array of exercise variations
  graphics?: string[]; // URLs to instructional graphics/icons
  videoUrl?: string; // Video demonstration URL
  commonMistakes?: string[]; // Common form mistakes
  progressionTips?: string; // Tips for progressing
  regressionTips?: string; // Tips for regressing
  aiGenerated?: boolean; // Track if AI-generated
  usageCount?: number; // How many times used
  tiers: Array<{
    tier: string;
    description: string;
    typicalReps: string;
  }>;
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArchetype, setSelectedArchetype] = useState<string>('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [exercises, searchTerm, selectedCategory, selectedArchetype]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getExercises();
      console.log('Loaded exercises:', data?.length || 0);
      setExercises(data || []);
      setFilteredExercises(data || []);
    } catch (error) {
      console.error('Failed to load exercises:', error);
      setExercises([]);
      setFilteredExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const filterExercises = () => {
    let filtered = [...exercises];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (ex) =>
          ex.name.toLowerCase().includes(term) ||
          ex.aliases?.some((alias) => alias.toLowerCase().includes(term)) ||
          ex.primaryMuscles.some((muscle) => muscle.toLowerCase().includes(term)) ||
          ex.equipment.some((eq) => eq.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((ex) => ex.category === selectedCategory);
    }

    // Archetype filter
    if (selectedArchetype !== 'all') {
      filtered = filtered.filter((ex) =>
        ex.suitableArchetypes.includes(selectedArchetype)
      );
    }

    setFilteredExercises(filtered);
  };

  const categories = Array.from(new Set(exercises.map((ex) => ex.category))).sort();
  const archetypes = ['PR1ME', 'FORGE', 'ENGIN3', 'CIRCUIT_X', 'CAPAC1TY', 'FLOWSTATE'];

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-asphalt">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-muted-text">Loading exercises...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-asphalt">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Exercise Library
          </h1>
          <p className="text-muted-text">
            Reference guide for {exercises.length} exercises - learn proper form, variations, and progression tips
          </p>
        </div>

        {/* Filters */}
        <div className="bg-concrete-grey border border-border-dark rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-text">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, muscle, or equipment..."
                className="w-full bg-tech-grey border border-border-dark rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-text">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-tech-grey border border-border-dark rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-text">Archetype</label>
              <select
                value={selectedArchetype}
                onChange={(e) => setSelectedArchetype(e.target.value)}
                className="w-full bg-tech-grey border border-border-dark rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
              >
                <option value="all">All Archetypes</option>
                {archetypes.map((arch) => (
                  <option key={arch} value={arch}>
                    {arch}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-text">
            Showing {filteredExercises.length} of {exercises.length} exercises
          </div>
        </div>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              onClick={() => setSelectedExercise(exercise)}
              className="bg-concrete-grey border border-border-dark rounded-lg p-6 hover:border-node-volt transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {exercise.name}
                </h3>
                {exercise.indoorFriendly && (
                  <span className="text-xs bg-node-volt/20 text-node-volt px-2 py-1 rounded">
                    Indoor
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-text">Category:</span>{' '}
                  <span className="text-text-white">{exercise.category}</span>
                </div>
                <div>
                  <span className="text-muted-text">Pattern:</span>{' '}
                  <span className="text-text-white">{exercise.movementPattern.replace(/_/g, ' ')}</span>
                </div>
                <div>
                  <span className="text-muted-text">Muscles:</span>{' '}
                  <span className="text-text-white">
                    {exercise.primaryMuscles.join(', ')}
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
                <div className="flex gap-2 mt-3">
                  {exercise.suitableArchetypes.slice(0, 3).map((arch) => (
                    <span
                      key={arch}
                      className="text-xs bg-tech-grey border border-border-dark px-2 py-1 rounded"
                    >
                      {arch}
                    </span>
                  ))}
                  {exercise.suitableArchetypes.length > 3 && (
                    <span className="text-xs text-muted-text">+{exercise.suitableArchetypes.length - 3}</span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border-dark">
                <div className="flex gap-2">
                  {exercise.tiers.map((tier) => (
                    <span
                      key={tier.tier}
                      className={`text-xs px-2 py-1 rounded ${
                        tier.tier === 'SILVER'
                          ? 'bg-gray-600 text-gray-200'
                          : tier.tier === 'GOLD'
                          ? 'bg-yellow-900/30 text-yellow-400'
                          : 'bg-gray-800 text-gray-300'
                      }`}
                    >
                      {tier.tier}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <div className="text-center py-12 text-muted-text">
            <p>No exercises found matching your filters.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedArchetype('all');
              }}
              className="mt-4 text-node-volt hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Exercise Detail Modal */}
        {selectedExercise && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedExercise(null)}
          >
            <div
              className="bg-concrete-grey border border-border-dark rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {selectedExercise.name}
                  </h2>
                  {selectedExercise.aliases && selectedExercise.aliases.length > 0 && (
                    <p className="text-muted-text">Also known as: {selectedExercise.aliases.join(', ')}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="text-muted-text hover:text-text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-muted-text text-sm mb-1">Category</div>
                    <div className="text-text-white">{selectedExercise.category}</div>
                  </div>
                  <div>
                    <div className="text-muted-text text-sm mb-1">Movement Pattern</div>
                    <div className="text-text-white">
                      {selectedExercise.movementPattern.replace(/_/g, ' ')}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-text text-sm mb-1">Space Required</div>
                    <div className="text-text-white">{selectedExercise.space.replace(/_/g, ' ')}</div>
                  </div>
                  <div>
                    <div className="text-muted-text text-sm mb-1">Impact Level</div>
                    <div className="text-text-white">{selectedExercise.impactLevel}</div>
                  </div>
                </div>

                {/* Muscles */}
                <div>
                  <div className="text-muted-text text-sm mb-2">Primary Muscles</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise.primaryMuscles.map((muscle) => (
                      <span
                        key={muscle}
                        className="bg-node-volt/20 text-node-volt px-3 py-1 rounded text-sm"
                      >
                        {muscle.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedExercise.secondaryMuscles.length > 0 && (
                  <div>
                    <div className="text-muted-text text-sm mb-2">Secondary Muscles</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedExercise.secondaryMuscles.map((muscle) => (
                        <span
                          key={muscle}
                          className="bg-tech-grey border border-border-dark px-3 py-1 rounded text-sm"
                        >
                          {muscle.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Equipment */}
                <div>
                  <div className="text-muted-text text-sm mb-2">Equipment</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise.equipment && selectedExercise.equipment.length > 0 ? (
                      selectedExercise.equipment.map((eq) => (
                        <span
                          key={eq}
                          className="bg-tech-grey border border-border-dark px-3 py-1 rounded text-sm capitalize"
                        >
                          {eq.replace(/_/g, ' ')}
                        </span>
                      ))
                    ) : (
                      <span className="bg-tech-grey border border-border-dark px-3 py-1 rounded text-sm">
                        Bodyweight
                      </span>
                    )}
                  </div>
                </div>

                {/* Suitable Archetypes */}
                <div>
                  <div className="text-muted-text text-sm mb-2">Suitable for Archetypes</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise.suitableArchetypes.map((arch) => (
                      <span
                        key={arch}
                        className="bg-tech-grey border border-border-dark px-3 py-1 rounded text-sm font-medium"
                      >
                        {arch}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Typical Use */}
                <div>
                  <div className="text-muted-text text-sm mb-2">Typical Use</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise.typicalUse.map((use) => (
                      <span
                        key={use}
                        className="bg-tech-grey border border-border-dark px-3 py-1 rounded text-sm"
                      >
                        {use}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tier Prescriptions */}
                <div>
                  <div className="text-muted-text text-sm mb-3">Tier Prescriptions</div>
                  <div className="space-y-3">
                    {selectedExercise.tiers.map((tier) => (
                      <div
                        key={tier.tier}
                        className={`border rounded-lg p-4 ${
                          tier.tier === 'SILVER'
                            ? 'border-gray-600 bg-gray-900/30'
                            : tier.tier === 'GOLD'
                            ? 'border-yellow-600 bg-yellow-900/10'
                            : 'border-gray-500 bg-gray-800/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`font-bold ${
                              tier.tier === 'SILVER'
                                ? 'text-gray-300'
                                : tier.tier === 'GOLD'
                                ? 'text-yellow-400'
                                : 'text-gray-200'
                            }`}
                          >
                            {tier.tier} Tier
                          </span>
                          <span className="text-node-volt text-sm font-medium">{tier.typicalReps}</span>
                        </div>
                        <p className="text-muted-text text-sm">{tier.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions - How to Perform */}
                {selectedExercise.instructions && (
                  <div>
                    <div className="text-muted-text text-sm mb-2 font-semibold">How to Perform</div>
                    <div className="bg-tech-grey border border-border-dark rounded-lg p-4">
                      <p className="text-text-white whitespace-pre-line" style={{ fontFamily: 'var(--font-manrope)' }}>
                        {selectedExercise.instructions}
                      </p>
                    </div>
                  </div>
                )}

                {/* Video */}
                {selectedExercise.videoUrl && (
                  <div>
                    <div className="text-muted-text text-sm mb-2 font-semibold">Video Demonstration</div>
                    <div className="bg-tech-grey border border-border-dark rounded-lg p-4">
                      <a
                        href={selectedExercise.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-node-volt hover:underline flex items-center gap-2"
                      >
                        <span>Watch Video</span>
                        <span>→</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Graphics/Icons */}
                {selectedExercise.graphics && selectedExercise.graphics.length > 0 && (
                  <div>
                    <div className="text-muted-text text-sm mb-2 font-semibold">Instructional Graphics</div>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedExercise.graphics.map((graphic, idx) => (
                        <div key={idx} className="bg-tech-grey border border-border-dark rounded-lg p-4">
                          <img
                            src={graphic}
                            alt={`${selectedExercise.name} instruction ${idx + 1}`}
                            className="w-full h-auto rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Variations */}
                {selectedExercise.variations && (
                  <div>
                    <div className="text-muted-text text-sm mb-2 font-semibold">Exercise Variations</div>
                    <div className="space-y-3">
                      {Array.isArray(selectedExercise.variations) ? (
                        selectedExercise.variations.map((variation: any, idx: number) => (
                          <div key={idx} className="bg-tech-grey border border-border-dark rounded-lg p-4">
                            <div className="font-semibold text-text-white mb-1">
                              {variation.name || `Variation ${idx + 1}`}
                            </div>
                            {variation.description && (
                              <p className="text-muted-text text-sm">{variation.description}</p>
                            )}
                            {variation.equipment && (
                              <div className="mt-2 text-xs text-muted-text">
                                Equipment: {Array.isArray(variation.equipment) ? variation.equipment.join(', ') : variation.equipment}
                              </div>
                            )}
                          </div>
                        ))
                      ) : typeof selectedExercise.variations === 'object' ? (
                        <div className="bg-tech-grey border border-border-dark rounded-lg p-4">
                          <pre className="text-muted-text text-sm whitespace-pre-wrap">
                            {JSON.stringify(selectedExercise.variations, null, 2)}
                          </pre>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}

                {/* Common Mistakes */}
                {selectedExercise.commonMistakes && selectedExercise.commonMistakes.length > 0 && (
                  <div>
                    <div className="text-muted-text text-sm mb-2 font-semibold">Common Mistakes to Avoid</div>
                    <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                      <ul className="list-disc list-inside space-y-2">
                        {selectedExercise.commonMistakes.map((mistake, idx) => (
                          <li key={idx} className="text-text-white text-sm">
                            {mistake}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Progression Tips */}
                {selectedExercise.progressionTips && (
                  <div>
                    <div className="text-muted-text text-sm mb-2 font-semibold">Progression Tips</div>
                    <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                      <p className="text-text-white text-sm" style={{ fontFamily: 'var(--font-manrope)' }}>
                        {selectedExercise.progressionTips}
                      </p>
                    </div>
                  </div>
                )}

                {/* Regression Tips */}
                {selectedExercise.regressionTips && (
                  <div>
                    <div className="text-muted-text text-sm mb-2 font-semibold">Regression Tips</div>
                    <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                      <p className="text-text-white text-sm" style={{ fontFamily: 'var(--font-manrope)' }}>
                        {selectedExercise.regressionTips}
                      </p>
                    </div>
                  </div>
                )}

                {/* AI Generated Badge */}
                {selectedExercise.aiGenerated && (
                  <div className="flex items-center gap-2 text-xs text-muted-text">
                    <span className="bg-node-volt/20 text-node-volt px-2 py-1 rounded">AI Generated</span>
                    {selectedExercise.usageCount && selectedExercise.usageCount > 0 && (
                      <span>Used {selectedExercise.usageCount} time{selectedExercise.usageCount !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                )}

                {/* Notes */}
                {selectedExercise.notes && (
                  <div>
                    <div className="text-muted-text text-sm mb-2">Notes</div>
                    <p className="text-text-white" style={{ fontFamily: 'var(--font-manrope)' }}>
                      {selectedExercise.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

