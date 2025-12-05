'use client';

import { useState } from 'react';
import EmomTimer from '@/components/timers/EmomTimer';
import { useVoice } from '@/hooks/useVoice';
import { getTierDisplayValue } from './tierDisplayUtils';

interface ExerciseBlock {
  id: string;
  label?: string;
  exerciseName: string;
  description?: string;
  repScheme?: string;
  tierSilver?: { load?: string; targetReps?: number; distance?: number; distanceUnit?: string; notes?: string };
  tierGold?: { load?: string; targetReps?: number; distance?: number; distanceUnit?: string; notes?: string };
  tierBlack?: { load?: string; targetReps?: number; distance?: number; distanceUnit?: string; notes?: string };
}

interface SectionEMOMProps {
  title: string;
  note?: string;
  blocks: ExerciseBlock[];
  workSec: number;
  restSec: number;
  rounds: number;
}

export default function SectionEMOM({ title, note, blocks, workSec, restSec, rounds }: SectionEMOMProps) {
  const { theme } = useTheme();
  const [activeStation, setActiveStation] = useState(0);
  const { speak } = useVoice();

  const handlePhaseChange = (phase: 'work' | 'rest', round: number) => {
    if (phase === 'work') {
      setActiveStation((round - 1) % blocks.length);
      speak(`Round ${round}, Station ${activeStation + 1}, ${blocks[activeStation].exerciseName}`);
    } else {
      speak('Rest');
    }
  };

  const handleTick = (time: number, phase: 'work' | 'rest', round: number) => {
    if (phase === 'work' && time === 10) {
      speak('Ten seconds remaining');
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <h2 className="text-5xl font-bold mb-4 text-center">{title}</h2>
      {note && <p className="text-muted-text text-xl mb-8">{note}</p>}

      <div className="mb-8">
        <EmomTimer
          workSec={workSec}
          restSec={restSec}
          rounds={rounds}
          onPhaseChange={handlePhaseChange}
          onTick={handleTick}
          activeStation={activeStation}
          totalStations={blocks.length}
        />
      </div>

      <div className="w-full max-w-6xl grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {blocks.map((block, idx) => (
          <div
            key={block.id || idx}
            className={`bg-panel border-2 rounded-lg p-4 transition-all ${
              idx === activeStation
                ? 'border-node-volt bg-panel'
                : 'thin-border'
            }`}
          >
            <div className="text-center mb-2">
              {block.label && (
                <span className="text-node-volt font-mono text-xl">{block.label}</span>
              )}
            </div>
            <div className="text-lg font-medium text-center mb-2">{block.exerciseName}</div>
            {block.exerciseImageUrl && (
              <div className="mb-2 rounded overflow-hidden mx-auto bg-transparent" style={{ aspectRatio: '1', maxHeight: '100px', width: '100px' }}>
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
              <div className="mb-2 text-xs text-muted-text italic leading-relaxed text-center">
                {block.exerciseInstructions}
              </div>
            )}
            {block.description && (
              <p className="text-sm text-muted-text text-center mb-2">{block.description}</p>
            )}
            {(() => {
              // Check if we should hide repScheme (when tiers have different distance/calories/reps)
              const hasTierDistance = block.tierSilver?.distance || block.tierGold?.distance || block.tierBlack?.distance;
              const hasTierReps = block.tierSilver?.targetReps || block.tierGold?.targetReps || block.tierBlack?.targetReps;
              const repsDiffer = hasTierReps && (
                block.tierSilver?.targetReps !== block.tierGold?.targetReps ||
                block.tierGold?.targetReps !== block.tierBlack?.targetReps ||
                block.tierSilver?.targetReps !== block.tierBlack?.targetReps
              );
              const shouldHideRepScheme = hasTierDistance || repsDiffer || 
                block.repScheme === 'N/A' || block.repScheme === 'n/a' || !block.repScheme;

              return !shouldHideRepScheme && block.repScheme && (
                <div className="text-node-volt font-bold text-center">{block.repScheme}</div>
              );
            })()}

            {(block.tierSilver || block.tierGold || block.tierBlack) && (
              <div className="mt-3 space-y-2">
                {block.tierSilver && (
                  <div className="text-xs bg-panel rounded p-2 thin-border" style={{ borderColor: '#94a3b8', backgroundColor: 'rgba(148, 163, 184, 0.1)' }}>
                    <div style={{ color: '#94a3b8', fontWeight: 'bold' }}>SILVER: {getTierDisplayValue(block.tierSilver, block.exerciseName, block)}</div>
                  </div>
                )}
                {block.tierGold && (
                  <div className="text-xs bg-panel rounded p-2 thin-border" style={{ borderColor: '#fbbf24', backgroundColor: 'rgba(251, 191, 36, 0.1)' }}>
                    <div style={{ color: '#fbbf24', fontWeight: 'bold' }}>GOLD: {getTierDisplayValue(block.tierGold, block.exerciseName, block)}</div>
                  </div>
                )}
                {block.tierBlack && (
                  <div className="text-xs bg-panel border border-node-volt rounded p-2" style={{ backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(31, 41, 55, 0.8)' }}>
                    <div className="text-node-volt font-bold">BLACK: {getTierDisplayValue(block.tierBlack, block.exerciseName, block)}</div>
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

