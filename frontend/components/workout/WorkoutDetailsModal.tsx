'use client';

import { useState } from 'react';
import { Icons } from '@/lib/iconMapping';
import { ExerciseDetailsModal } from './ExerciseDetailsModal';
import ArchetypeBadge from './ArchetypeBadge';

interface WorkoutDetailsModalProps {
  workout: {
    id: string;
    name: string;
    displayCode?: string;
    archetype?: string;
    description?: string;
    sections: Array<{
      id: string;
      title: string;
      type: string;
      note?: string;
      durationSec?: number;
      emomWorkSec?: number;
      emomRestSec?: number;
      emomRounds?: number;
      blocks: Array<{
        id?: string;
        exerciseName: string;
        exerciseId?: string;
        description?: string; // Legacy field
        shortDescription?: string; // Brief form cue (max 80 chars)
        longDescription?: string; // Detailed instructions
        repScheme?: string;
        label?: string;
      }>;
    }>;
  };
  onClose: () => void;
}

export function WorkoutDetailsModal({ workout, onClose }: WorkoutDetailsModalProps) {
  const [selectedExercise, setSelectedExercise] = useState<{ name: string; id?: string } | null>(null);

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div 
          className="bg-panel thin-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-panel border-b thin-border p-6 flex items-center justify-between z-10">
            <div>
              {workout.displayCode && (
                <div className="text-node-volt font-mono text-sm mb-1">
                  {workout.displayCode}
                </div>
              )}
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                {workout.name}
              </h2>
              {workout.archetype && (
                <div className="mt-2">
                  <ArchetypeBadge archetype={workout.archetype} size="sm" />
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-muted-text hover:text-text-white transition-colors"
            >
              <Icons.X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {workout.description && (
              <p className="text-muted-text text-lg">{workout.description}</p>
            )}

            {/* Workout Sections */}
            <div className="space-y-6">
              {workout.sections.map((section, sectionIdx) => (
                <div key={section.id || sectionIdx} className="bg-panel/50 thin-border rounded-lg p-6">
                  {/* Section Header */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-tech-grey">
                    <div>
                      <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {section.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-node-volt text-xs font-medium uppercase tracking-wider">
                          {section.type}
                        </span>
                        {section.emomRounds && (
                          <span className="text-muted-text text-xs">
                            {section.emomRounds} rounds • {section.emomWorkSec}s work : {section.emomRestSec}s rest
                          </span>
                        )}
                        {section.durationSec && (
                          <span className="text-muted-text text-xs">
                            {Math.floor(section.durationSec / 60)}:{(section.durationSec % 60).toString().padStart(2, '0')} duration
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {section.note && (
                    <p className="text-muted-text text-sm mb-4 italic">{section.note}</p>
                  )}

                  {/* Exercise Blocks */}
                  <div className="space-y-3">
                    {section.blocks.map((block, blockIdx) => (
                      <div
                        key={block.id || blockIdx}
                        className="bg-panel thin-border rounded-lg p-4 hover:border-node-volt transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {block.label && (
                              <span className="text-node-volt font-mono text-lg font-bold mr-3">
                                {block.label}
                              </span>
                            )}
                            <button
                              onClick={() => setSelectedExercise({ 
                                name: block.exerciseName, 
                                id: block.exerciseId 
                              })}
                              className="text-text-white hover:text-node-volt transition-colors text-left"
                            >
                              <h4 className="text-lg font-bold inline-flex items-center gap-2 hover:text-node-volt transition-colors cursor-pointer">
                                {block.exerciseName}
                                <span className="text-xs text-node-volt">(click for details)</span>
                              </h4>
                            </button>
                            {/* ONLY show shortDescription, NEVER description or longDescription */}
                            {block.shortDescription && block.shortDescription.length <= 80 && (
                              <p className="text-muted-text text-sm mt-1">{block.shortDescription}</p>
                            )}
                            {block.repScheme && (
                              <div className="text-node-volt font-medium mt-2">{block.repScheme}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t thin-border flex justify-end gap-3">
              <button
                onClick={onClose}
                className="bg-panel thin-border text-text-white px-6 py-2 rounded-lg hover:border-node-volt transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Details Modal */}
      {selectedExercise && (
        <ExerciseDetailsModal
          exerciseName={selectedExercise.name}
          exerciseId={selectedExercise.id}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </>
  );
}

