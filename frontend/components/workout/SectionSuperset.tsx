'use client';

import { getTierDisplayValue, isHeavyLift } from './tierDisplayUtils';
import { useTheme } from '@/contexts/ThemeContext';

interface ExerciseBlock {
  id: string;
  label?: string;
  exerciseName: string;
  description?: string;
  repScheme?: string;
  loadPercentage?: string;
  exerciseImageUrl?: string;
  exerciseInstructions?: string;
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
  const { theme } = useTheme();
  // Group blocks into pairs (A/B supersets)
  const pairs: ExerciseBlock[][] = [];
  for (let i = 0; i < blocks.length; i += 2) {
    pairs.push(blocks.slice(i, i + 2));
  }

  // Check if repScheme should be hidden (when it duplicates tier information)
  const shouldHideRepScheme = (block: ExerciseBlock): boolean => {
    // For heavy lifts, hide repScheme if tiers show weight (% 1RM)
    if (isHeavyLift(block.exerciseName, block, block.tierGold || block.tierSilver || block.tierBlack)) {
      // If tiers show weight, repScheme is redundant
      return true;
    }
    
    // Check if repScheme matches tier reps (duplication)
    if (block.repScheme && (block.tierSilver || block.tierGold || block.tierBlack)) {
      // Extract rep numbers from repScheme (e.g., "8-10" -> [8, 10])
      const repSchemeMatch = block.repScheme.match(/(\d+)(?:-(\d+))?/);
      if (repSchemeMatch) {
        const schemeMin = parseInt(repSchemeMatch[1]);
        const schemeMax = parseInt(repSchemeMatch[2] || repSchemeMatch[1]);
        
        // Check if tier reps match repScheme
        const tierReps = [
          block.tierSilver?.targetReps,
          block.tierGold?.targetReps,
          block.tierBlack?.targetReps,
        ].filter(r => r !== null && r !== undefined);
        
        // If all tier reps are within the repScheme range, hide repScheme
        if (tierReps.length > 0 && tierReps.every(r => r >= schemeMin && r <= schemeMax)) {
          return true;
        }
      }
    }
    
    return false;
  };

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
                  {block.exerciseImageUrl && (
                    <div className="mb-3 rounded overflow-hidden mx-auto bg-transparent" style={{ aspectRatio: '1', maxHeight: '120px', width: '120px' }}>
                      <img
                        src={block.exerciseImageUrl}
                        alt={block.exerciseName}
                        className="w-full h-full object-cover"
                        style={{
                          filter: theme === 'dark' 
                            ? 'brightness(0) saturate(100%) invert(85%) sepia(100%) saturate(10000%) hue-rotate(30deg)' // Volt green (#ccff00) for dark mode
                            : 'brightness(0) saturate(100%) invert(30%) sepia(100%) saturate(10000%) hue-rotate(200deg)', // Blue (#0066ff) for light mode
                        }}
                      />
                    </div>
                  )}
                  {block.exerciseInstructions && (
                    <div className="mb-3 text-xs text-muted-text italic leading-relaxed text-center">
                      {block.exerciseInstructions}
                    </div>
                  )}
                  {block.description && (
                    <p className="text-muted-text text-center mb-3 text-sm">{block.description}</p>
                  )}
                  {block.repScheme && !shouldHideRepScheme(block) && (
                    <div className="text-xl text-node-volt font-bold text-center mb-4">{block.repScheme}</div>
                  )}
                  {block.loadPercentage && (
                    <div className="text-sm text-muted-text text-center mb-3">Load: <span className="text-node-volt font-semibold">{block.loadPercentage}</span></div>
                  )}

                  {(block.tierSilver || block.tierGold || block.tierBlack) && (
                    <div className="space-y-2 mt-4">
                      {block.tierSilver && (
                        <div className="bg-panel rounded p-2 text-sm thin-border" style={{ borderColor: '#94a3b8', backgroundColor: 'rgba(148, 163, 184, 0.1)' }}>
                          <div style={{ color: '#94a3b8', fontWeight: 'bold' }}>SILVER: {getTierDisplayValue(block.tierSilver, block.exerciseName, block as any)}</div>
                        </div>
                      )}
                      {block.tierGold && (
                        <div className="bg-panel rounded p-2 text-sm thin-border" style={{ borderColor: '#fbbf24', backgroundColor: 'rgba(251, 191, 36, 0.1)' }}>
                          <div style={{ color: '#fbbf24', fontWeight: 'bold' }}>GOLD: {getTierDisplayValue(block.tierGold, block.exerciseName, block as any)}</div>
                        </div>
                      )}
                      {block.tierBlack && (
                        <div className="bg-panel border border-node-volt rounded p-2 text-sm" style={{ backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(31, 41, 55, 0.8)' }}>
                          <div className="text-node-volt font-bold">BLACK: {getTierDisplayValue(block.tierBlack, block.exerciseName, block as any)}</div>
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

