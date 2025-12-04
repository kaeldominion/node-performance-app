'use client';

import CountdownTimer from '@/components/timers/CountdownTimer';
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

interface SectionAMRAPProps {
  title: string;
  note?: string;
  blocks: ExerciseBlock[];
  durationSec: number;
}

export default function SectionAMRAP({ title, note, blocks, durationSec }: SectionAMRAPProps) {
  const { speak } = useVoice();

  const handleComplete = () => {
    speak('Time is up! Great work!');
  };

  const handleTick = (seconds: number) => {
    if (seconds === 60) {
      speak('One minute remaining');
    } else if (seconds === 30) {
      speak('Thirty seconds');
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
          <div key={block.id || idx} className="bg-concrete-grey border border-border-dark rounded-lg p-6">
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
                  <div className="bg-tech-grey border border-border-dark rounded p-3">
                    <div className="text-sm text-muted-text mb-1">SILVER</div>
                    {block.tierSilver.load && <div className="font-medium">{block.tierSilver.load}</div>}
                    {block.tierSilver.targetReps && <div className="text-sm text-muted-text">{block.tierSilver.targetReps} reps</div>}
                  </div>
                )}
                {block.tierGold && (
                  <div className="bg-tech-grey border border-border-dark rounded p-3">
                    <div className="text-sm text-muted-text mb-1">GOLD</div>
                    {block.tierGold.load && <div className="font-medium">{block.tierGold.load}</div>}
                    {block.tierGold.targetReps && <div className="text-sm text-muted-text">{block.tierGold.targetReps} reps</div>}
                  </div>
                )}
                {block.tierBlack && (
                  <div className="bg-tech-grey border border-border-dark rounded p-3 border-node-volt">
                    <div className="text-sm text-node-volt mb-1">BLACK</div>
                    {block.tierBlack.load && <div className="font-medium text-node-volt">{block.tierBlack.load}</div>}
                    {block.tierBlack.targetReps && <div className="text-sm text-muted-text">{block.tierBlack.targetReps} reps</div>}
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

