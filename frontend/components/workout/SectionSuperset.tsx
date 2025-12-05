'use client';

import { getTierDisplayValue } from './tierDisplayUtils';

interface ExerciseBlock {
  id: string;
  label?: string;
  exerciseName: string;
  description?: string;
  repScheme?: string;
  tierSilver?: { load?: string; targetReps?: number; notes?: string };
  tierGold?: { load?: string; targetReps?: number; notes?: string };
  tierBlack?: { load?: string; targetReps?: number; notes?: string };
}

interface SectionSupersetProps {
  title: string;
  note?: string;
  blocks: ExerciseBlock[];
}

export default function SectionSuperset({ title, note, blocks }: SectionSupersetProps) {
  // Group blocks into pairs (A/B supersets)
  const pairs: ExerciseBlock[][] = [];
  for (let i = 0; i < blocks.length; i += 2) {
    pairs.push(blocks.slice(i, i + 2));
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <h2 className="text-5xl font-bold mb-4 text-center">{title}</h2>
      {note && <p className="text-muted-text text-xl mb-8">{note}</p>}

      <div className="w-full max-w-5xl space-y-8">
        {pairs.map((pair, pairIdx) => (
          <div key={pairIdx} className="bg-panel border-2 border-node-volt rounded-lg p-6">
            <div className="grid grid-cols-2 gap-6">
              {pair.map((block, idx) => (
                <div key={block.id || idx} className="bg-panel thin-border rounded-lg p-4">
                  <div className="text-center mb-4">
                    <span className="text-node-volt font-mono text-2xl font-bold">
                      {block.label || (idx === 0 ? 'A' : 'B')}
                    </span>
                  </div>
                  <div className="text-2xl font-medium text-center mb-2">{block.exerciseName}</div>
                  {block.description && (
                    <p className="text-muted-text text-center mb-3 text-sm">{block.description}</p>
                  )}
                  {block.repScheme && (
                    <div className="text-xl text-node-volt font-bold text-center mb-4">{block.repScheme}</div>
                  )}

                  {(block.tierSilver || block.tierGold || block.tierBlack) && (
                    <div className="space-y-2 mt-4">
                      {block.tierSilver && (
                        <div className="bg-panel rounded p-2 text-sm">
                          <div className="text-muted-text">SILVER: {getTierDisplayValue(block.tierSilver, block.exerciseName)}</div>
                        </div>
                      )}
                      {block.tierGold && (
                        <div className="bg-panel rounded p-2 text-sm">
                          <div className="text-muted-text">GOLD: {getTierDisplayValue(block.tierGold, block.exerciseName)}</div>
                        </div>
                      )}
                      {block.tierBlack && (
                        <div className="bg-panel border border-node-volt rounded p-2 text-sm">
                          <div className="text-node-volt">BLACK: {getTierDisplayValue(block.tierBlack, block.exerciseName)}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

