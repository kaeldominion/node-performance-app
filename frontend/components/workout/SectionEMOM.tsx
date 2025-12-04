'use client';

import { useState } from 'react';
import EmomTimer from '@/components/timers/EmomTimer';
import { useVoice } from '@/hooks/useVoice';

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

interface SectionEMOMProps {
  title: string;
  note?: string;
  blocks: ExerciseBlock[];
  workSec: number;
  restSec: number;
  rounds: number;
}

export default function SectionEMOM({ title, note, blocks, workSec, restSec, rounds }: SectionEMOMProps) {
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
            {block.description && (
              <p className="text-sm text-muted-text text-center mb-2">{block.description}</p>
            )}
            {block.repScheme && (
              <div className="text-node-volt font-bold text-center">{block.repScheme}</div>
            )}

            {(block.tierSilver || block.tierGold || block.tierBlack) && (
              <div className="mt-3 space-y-2">
                {block.tierSilver && (
                  <div className="text-xs bg-panel rounded p-2">
                    <div className="text-muted-text">SILVER: {block.tierSilver.load || block.tierSilver.targetReps}</div>
                  </div>
                )}
                {block.tierGold && (
                  <div className="text-xs bg-panel rounded p-2">
                    <div className="text-muted-text">GOLD: {block.tierGold.load || block.tierGold.targetReps}</div>
                  </div>
                )}
                {block.tierBlack && (
                  <div className="text-xs bg-panel border border-node-volt rounded p-2">
                    <div className="text-node-volt">BLACK: {block.tierBlack.load || block.tierBlack.targetReps}</div>
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

