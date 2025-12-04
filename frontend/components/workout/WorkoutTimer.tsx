'use client';

import { useState, useEffect, useRef } from 'react';
import { useAudioCues } from '@/hooks/useAudioCues';

interface WorkoutTimerProps {
  type: 'COUNTDOWN' | 'EMOM' | 'E2MOM' | 'AMRAP';
  durationSec?: number;
  workSec?: number;
  restSec?: number;
  rounds?: number;
  onComplete?: () => void;
  onTick?: (timeLeft: number) => void;
}

export function WorkoutTimer({
  type,
  durationSec,
  workSec = 45,
  restSec = 15,
  rounds = 12,
  onComplete,
  onTick,
}: WorkoutTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationSec || workSec || 0);
  const [currentRound, setCurrentRound] = useState(1);
  const [isWorkPhase, setIsWorkPhase] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const { playCue } = useAudioCues();

  useEffect(() => {
    if (type === 'COUNTDOWN' || type === 'AMRAP') {
      setTimeLeft(durationSec || 0);
    } else if (type === 'EMOM' || type === 'E2MOM') {
      setTimeLeft(workSec);
      setIsWorkPhase(true);
      setCurrentRound(1);
    }
  }, [type, durationSec, workSec]);

  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          
          // Audio cues
          if (newTime === 3) {
            playCue('countdown', 3);
          } else if (newTime === 0) {
            playCue('complete');
          }

          if (onTick) {
            onTick(newTime);
          }

          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, timeLeft, onTick, playCue]);

  const handleTimerComplete = () => {
    if (type === 'EMOM' || type === 'E2MOM') {
      if (isWorkPhase) {
        // Switch to rest
        setIsWorkPhase(false);
        setTimeLeft(restSec);
        playCue('rest');
      } else {
        // Switch to work for next round
        if (currentRound < rounds) {
          setIsWorkPhase(true);
          setTimeLeft(workSec);
          setCurrentRound(currentRound + 1);
          playCue('work');
        } else {
          // All rounds complete
          setIsRunning(false);
          if (onComplete) {
            onComplete();
          }
        }
      }
    } else {
      // COUNTDOWN or AMRAP complete
      setIsRunning(false);
      if (onComplete) {
        onComplete();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    playCue('start');
  };

  const handlePause = () => {
    setIsPaused(true);
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsPaused(false);
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    if (type === 'COUNTDOWN' || type === 'AMRAP') {
      setTimeLeft(durationSec || 0);
    } else {
      setTimeLeft(workSec);
      setIsWorkPhase(true);
      setCurrentRound(1);
    }
  };

  const getTimerColor = () => {
    if (timeLeft <= 10 && isRunning) return '#ff6b6b';
    if (isWorkPhase) return '#ccff00';
    return '#4a9eff';
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Timer Display */}
      <div className="relative">
        <div
          className="text-8xl font-bold font-mono"
          style={{
            fontFamily: 'var(--font-space-grotesk)',
            color: getTimerColor(),
            textShadow: `0 0 40px ${getTimerColor()}40`,
            transition: 'color 0.3s ease',
          }}
        >
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* EMOM/E2MOM Round Indicator */}
      {(type === 'EMOM' || type === 'E2MOM') && (
        <div className="flex items-center gap-4">
          <div className="bg-concrete-grey/50 backdrop-blur-sm border border-border-dark rounded-lg px-6 py-3">
            <div className="text-muted-text text-sm mb-1">Round</div>
            <div className="text-2xl font-bold text-node-volt">
              {currentRound} / {rounds}
            </div>
          </div>
          <div className="bg-concrete-grey/50 backdrop-blur-sm border border-border-dark rounded-lg px-6 py-3">
            <div className="text-muted-text text-sm mb-1">Phase</div>
            <div className="text-xl font-bold" style={{ color: getTimerColor() }}>
              {isWorkPhase ? 'WORK' : 'REST'}
            </div>
          </div>
        </div>
      )}

      {/* Timer Controls */}
      <div className="flex items-center gap-3">
        {!isRunning && !isPaused && (
          <button
            onClick={handleStart}
            className="bg-node-volt text-deep-asphalt font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Start
          </button>
        )}
        {isRunning && (
          <button
            onClick={handlePause}
            className="bg-tech-grey border border-border-dark text-text-white px-6 py-3 rounded-lg hover:bg-concrete-grey transition-colors font-medium"
          >
            Pause
          </button>
        )}
        {isPaused && (
          <>
            <button
              onClick={handleResume}
              className="bg-node-volt text-deep-asphalt font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Resume
            </button>
            <button
              onClick={handleReset}
              className="bg-tech-grey border border-border-dark text-text-white px-6 py-3 rounded-lg hover:bg-concrete-grey transition-colors font-medium"
            >
              Reset
            </button>
          </>
        )}
      </div>
    </div>
  );
}

