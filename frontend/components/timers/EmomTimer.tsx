'use client';

import { useEmomTimer } from '@/hooks/useEmomTimer';

interface EmomTimerProps {
  workSec: number;
  restSec: number;
  rounds: number;
  onTick?: (time: number, phase: 'work' | 'rest', round: number) => void;
  onPhaseChange?: (phase: 'work' | 'rest', round: number) => void;
  onComplete?: () => void;
  activeStation?: number;
  totalStations?: number;
}

export default function EmomTimer({
  workSec,
  restSec,
  rounds,
  onTick,
  onPhaseChange,
  onComplete,
  activeStation,
  totalStations,
}: EmomTimerProps) {
  const { currentTime, currentPhase, currentRound, isRunning, start, pause, reset } = useEmomTimer({
    workSec,
    restSec,
    rounds,
    onTick,
    onPhaseChange,
    onComplete,
  });

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center">
      <div className="mb-4">
        <div className="text-sm text-muted-text mb-2">
          Round {currentRound} of {rounds}
        </div>
        <div className={`text-6xl font-bold font-mono ${currentPhase === 'work' ? 'text-node-volt' : 'text-text-white'}`}>
          {formatTime(currentTime)}
        </div>
        <div className="text-xl font-medium mt-2">
          {currentPhase === 'work' ? 'WORK' : 'REST'}
        </div>
      </div>

      {totalStations && activeStation !== undefined && (
        <div className="mb-4">
          <div className="text-sm text-muted-text mb-2">Current Station</div>
          <div className="flex gap-2 justify-center">
            {Array.from({ length: totalStations }).map((_, idx) => (
              <div
                key={idx}
                className={`w-12 h-12 rounded border-2 flex items-center justify-center font-bold ${
                  idx === activeStation
                    ? 'bg-node-volt border-node-volt text-dark'
                    : 'bg-panel thin-border text-muted-text'
                }`}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4 justify-center">
        {!isRunning && (
          <button
            onClick={start}
            className="bg-node-volt text-dark font-bold px-6 py-2 rounded hover:opacity-90"
          >
            Start
          </button>
        )}
        {isRunning && (
          <button
            onClick={pause}
            className="bg-panel thin-border text-text-white font-bold px-6 py-2 rounded hover:opacity-90"
          >
            Pause
          </button>
        )}
        <button
          onClick={reset}
          className="bg-panel thin-border text-text-white font-bold px-6 py-2 rounded hover:opacity-90"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

