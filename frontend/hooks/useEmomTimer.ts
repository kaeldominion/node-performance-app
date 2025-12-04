'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseEmomTimerOptions {
  workSec: number;
  restSec: number;
  rounds: number;
  onTick?: (time: number, phase: 'work' | 'rest', round: number) => void;
  onPhaseChange?: (phase: 'work' | 'rest', round: number) => void;
  onComplete?: () => void;
}

export function useEmomTimer({
  workSec,
  restSec,
  rounds,
  onTick,
  onPhaseChange,
  onComplete,
}: UseEmomTimerOptions) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(workSec);
  const [currentPhase, setCurrentPhase] = useState<'work' | 'rest'>('work');
  const [currentRound, setCurrentRound] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    setCurrentTime(workSec);
    setCurrentPhase('work');
    setCurrentRound(1);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [workSec]);

  const start = useCallback(() => {
    setIsRunning(true);
    if (onPhaseChange) {
      onPhaseChange('work', 1);
    }
  }, [onPhaseChange]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev <= 1) {
          // Phase complete
          if (currentPhase === 'work') {
            // Move to rest
            setCurrentPhase('rest');
            setCurrentTime(restSec);
            if (onPhaseChange) {
              onPhaseChange('rest', currentRound);
            }
            return restSec;
          } else {
            // Rest complete, move to next round or finish
            if (currentRound >= rounds) {
              // All rounds complete
              setIsRunning(false);
              if (onComplete) {
                onComplete();
              }
              return 0;
            } else {
              // Next round
              setCurrentRound((prev) => prev + 1);
              setCurrentPhase('work');
              if (onPhaseChange) {
                onPhaseChange('work', currentRound + 1);
              }
              return workSec;
            }
          }
        }

        const newTime = prev - 1;
        if (onTick) {
          onTick(newTime, currentPhase, currentRound);
        }
        return newTime;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, currentPhase, currentRound, workSec, restSec, rounds, onTick, onPhaseChange, onComplete]);

  return {
    currentTime,
    currentPhase,
    currentRound,
    isRunning,
    start,
    pause,
    reset,
  };
}

