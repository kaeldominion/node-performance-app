'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseEmomTimerOptions {
  workSec: number;
  restSec: number;
  rounds: number;
  betweenRoundRestSec?: number; // Rest period between rounds (default 60s)
  onTick?: (time: number, phase: 'work' | 'rest' | 'betweenRoundRest', round: number) => void;
  onPhaseChange?: (phase: 'work' | 'rest' | 'betweenRoundRest', round: number) => void;
  onComplete?: () => void;
}

export function useEmomTimer({
  workSec,
  restSec,
  rounds,
  betweenRoundRestSec = 60, // Default 1 minute between rounds
  onTick,
  onPhaseChange,
  onComplete,
}: UseEmomTimerOptions) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(workSec);
  const [currentPhase, setCurrentPhase] = useState<'work' | 'rest' | 'betweenRoundRest'>('work');
  const [currentRound, setCurrentRound] = useState(1);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [totalExercises, setTotalExercises] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    setCurrentTime(workSec);
    setCurrentPhase('work');
    setCurrentRound(1);
    setCurrentExerciseIndex(0);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [workSec]);

  // Set total exercises count (call this from component)
  const setExerciseCount = useCallback((count: number) => {
    setTotalExercises(count);
  }, []);

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
          } else if (currentPhase === 'rest') {
            // Rest complete - check if we've completed all exercises in this round
            const nextExerciseIndex = currentExerciseIndex + 1;
            
            if (nextExerciseIndex < totalExercises) {
              // Move to next exercise in the round
              setCurrentExerciseIndex(nextExerciseIndex);
              setCurrentPhase('work');
              setCurrentTime(workSec);
              if (onPhaseChange) {
                onPhaseChange('work', currentRound);
              }
              return workSec;
            } else {
              // All exercises in round complete - check if this is the last round
              if (currentRound >= rounds) {
                // All rounds complete - no rest after final round
                setIsRunning(false);
                if (onComplete) {
                  onComplete();
                }
                return 0;
              } else {
                // Insert between-round rest (1 min)
                setCurrentPhase('betweenRoundRest');
                setCurrentTime(betweenRoundRestSec);
                if (onPhaseChange) {
                  onPhaseChange('betweenRoundRest', currentRound);
                }
                return betweenRoundRestSec;
              }
            }
          } else if (currentPhase === 'betweenRoundRest') {
            // Between-round rest complete - move to next round
            setCurrentRound((prev) => prev + 1);
            setCurrentExerciseIndex(0); // Reset to first exercise
            setCurrentPhase('work');
            setCurrentTime(workSec);
            if (onPhaseChange) {
              onPhaseChange('work', currentRound + 1);
            }
            return workSec;
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
  }, [isRunning, currentPhase, currentRound, currentExerciseIndex, totalExercises, workSec, restSec, rounds, betweenRoundRestSec, onTick, onPhaseChange, onComplete]);

  return {
    currentTime,
    currentPhase,
    currentRound,
    currentExerciseIndex,
    isRunning,
    start,
    pause,
    reset,
    setExerciseCount,
  };
}

