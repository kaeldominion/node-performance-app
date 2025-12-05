'use client';

import CountdownTimer from '@/components/timers/CountdownTimer';
import { useVoice } from '@/hooks/useVoice';
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

interface SectionCapacityProps {
  title: string;
  note?: string;
  blocks: ExerciseBlock[];
  durationSec: number;
}

export default function SectionCapacity({ title, note, blocks, durationSec }: SectionCapacityProps) {
  const { speak } = useVoice();

  const handleComplete = () => {
    speak('Time is up! Great work on that long grind!');
  };

  const handleTick = (seconds: number) => {
    if (seconds === 300) {
      speak('Five minutes remaining');
    } else if (seconds === 60) {
      speak('One minute remaining');
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <h2 className="text-5xl font-bold mb-4 text-center">{title}</h2>
      {note && <p className="text-muted-text text-xl mb-8">{note}</p>}

      <div className="mb-8">
        <CountdownTimer
          initialSeconds={durationSec}
          onComplete={handleComplete}
          onTick={handleTick}
          autoStart={false}
        />
      </div>

      <div className="w-full max-w-4xl space-y-4">
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
            {block.description && (
              <p className="text-muted-text mb-4">{block.description}</p>
            )}
            {block.repScheme && (
              <div className="text-xl text-node-volt font-bold mb-4">{block.repScheme}</div>
            )}

            {(block.tierSilver || block.tierGold || block.tierBlack) && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {block.tierSilver && (
                  <div className="bg-panel thin-border rounded p-3">
                    <div className="text-sm text-muted-text mb-1">SILVER</div>
                    <div className="font-medium">{getTierDisplayValue(block.tierSilver, block.exerciseName)}</div>
                  </div>
                )}
                {block.tierGold && (
                  <div className="bg-panel thin-border rounded p-3">
                    <div className="text-sm text-muted-text mb-1">GOLD</div>
                    <div className="font-medium">{getTierDisplayValue(block.tierGold, block.exerciseName)}</div>
                  </div>
                )}
                {block.tierBlack && (
                  <div className="bg-panel thin-border rounded p-3 border-node-volt">
                    <div className="text-sm text-node-volt mb-1">BLACK</div>
                    <div className="font-medium text-node-volt">{getTierDisplayValue(block.tierBlack, block.exerciseName)}</div>
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

