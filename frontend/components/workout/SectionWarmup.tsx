'use client';

import { getTierDisplayValue } from './tierDisplayUtils';
import { useTheme } from '@/contexts/ThemeContext';

interface ExerciseBlock {
  id: string;
  label?: string;
  exerciseName: string;
  description?: string;
  repScheme?: string;
  exerciseImageUrl?: string;
  exerciseInstructions?: string;
  tierSilver?: { load?: string; targetReps?: number; distance?: number; distanceUnit?: string; notes?: string };
  tierGold?: { load?: string; targetReps?: number; distance?: number; distanceUnit?: string; notes?: string };
  tierBlack?: { load?: string; targetReps?: number; distance?: number; distanceUnit?: string; notes?: string };
}

interface SectionWarmupProps {
  title: string;
  note?: string;
  blocks: ExerciseBlock[];
}

export default function SectionWarmup({ title, note, blocks }: SectionWarmupProps) {
  const { theme } = useTheme();
  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <h2 className="text-5xl font-bold mb-8 text-center">{title}</h2>
      {note && <p className="text-muted-text text-xl mb-8">{note}</p>}

      <div className="w-full max-w-4xl space-y-6">
        {blocks.map((block, idx) => (
          <div key={block.id || idx} className="bg-panel thin-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-2">
              <div>
                {block.label && (
                  <span className="text-node-volt font-mono text-2xl mr-4">{block.label}</span>
                )}
                <span className="text-2xl font-medium">{block.exerciseName}</span>
              </div>
            </div>
            {block.exerciseImageUrl && (
              <div className="mb-4 rounded-lg overflow-hidden max-w-xs mx-auto bg-transparent" style={{ aspectRatio: '1', maxHeight: '150px' }}>
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
              <div className="mb-4 text-sm text-muted-text italic leading-relaxed max-w-2xl mx-auto">
                {block.exerciseInstructions}
              </div>
            )}
            {block.description && (
              <p className="text-muted-text mb-4">{block.description}</p>
            )}
            {block.repScheme && (
              <div className="text-xl text-node-volt font-bold mb-4">{block.repScheme}</div>
            )}

            {(block.tierSilver || block.tierGold || block.tierBlack) && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {block.tierSilver && (
                  <div className="bg-panel thin-border rounded p-3" style={{ borderColor: '#94a3b8', backgroundColor: 'rgba(148, 163, 184, 0.1)' }}>
                    <div className="text-sm mb-1 font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>SILVER</div>
                    <div className="font-medium" style={{ color: '#94a3b8' }}>{getTierDisplayValue(block.tierSilver, block.exerciseName, block)}</div>
                  </div>
                )}
                {block.tierGold && (
                  <div className="bg-panel thin-border rounded p-3" style={{ borderColor: '#fbbf24', backgroundColor: 'rgba(251, 191, 36, 0.1)' }}>
                    <div className="text-sm mb-1 font-bold uppercase tracking-wider" style={{ color: '#fbbf24' }}>GOLD</div>
                    <div className="font-medium" style={{ color: '#fbbf24' }}>{getTierDisplayValue(block.tierGold, block.exerciseName, block)}</div>
                  </div>
                )}
                {block.tierBlack && (
                  <div className="bg-panel thin-border rounded p-3 border-node-volt" style={{ backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(31, 41, 55, 0.8)' }}>
                    <div className="text-sm mb-1 font-bold uppercase tracking-wider text-node-volt">BLACK</div>
                    <div className="font-medium text-node-volt">{getTierDisplayValue(block.tierBlack, block.exerciseName, block)}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

