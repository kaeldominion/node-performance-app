'use client';

import { useState, useEffect, useRef } from 'react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useAudioSystem } from '@/hooks/useAudioSystem';
import { useDeckAnimations } from '@/hooks/useDeckAnimations';

interface DeckTimerProps {
  type: 'COUNTDOWN' | 'EMOM' | 'E2MOM' | 'AMRAP' | 'INTERVAL';
  durationSec?: number;
  workSec?: number;
  restSec?: number;
  rounds?: number;
  onComplete?: () => void;
  onTick?: (timeLeft: number) => void;
  onPhaseChange?: (phase: 'work' | 'rest', round: number) => void;
  autoStart?: boolean;
  showPreCountdown?: boolean;
}

export function DeckTimer({
  type,
  durationSec,
  workSec = 45,
  restSec = 15,
  rounds = 12,
  onComplete,
  onTick,
  onPhaseChange,
  autoStart = false,
  showPreCountdown = true,
}: DeckTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationSec || workSec || 0);
  const [currentRound, setCurrentRound] = useState(1);
  const [isWorkPhase, setIsWorkPhase] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showPreCountdownOverlay, setShowPreCountdownOverlay] = useState(false);
  const [preCountdownValue, setPreCountdownValue] = useState(10);
  const intervalRef = useRef<number | undefined>(undefined);
  const preCountdownRef = useRef<number | undefined>(undefined);
  
  const { config, isMobile } = useResponsiveLayout();
  const { playSound, playVoice, playCountdown } = useAudioSystem();
  const { triggerPulse, getPulseClass } = useDeckAnimations();

  // Initialize timer based on type
  useEffect(() => {
    if (type === 'COUNTDOWN' || type === 'AMRAP') {
      setTimeLeft(durationSec || 0);
    } else if (type === 'EMOM' || type === 'E2MOM' || type === 'INTERVAL') {
      setTimeLeft(workSec);
      setIsWorkPhase(true);
      setCurrentRound(1);
    }
  }, [type, durationSec, workSec]);

  // Pre-countdown before starting
  const startPreCountdown = () => {
    if (!showPreCountdown) {
      handleStart();
      return;
    }

    setShowPreCountdownOverlay(true);
    setPreCountdownValue(10);
    
    // Update countdown display manually
    let count = 10;
    const countdownInterval = setInterval(() => {
      count--;
      setPreCountdownValue(count);
      if (count <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);
    
    playCountdown(10, () => {
      clearInterval(countdownInterval);
      setShowPreCountdownOverlay(false);
      handleStart();
    });
  };

  // Main timer logic
  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          
          // Audio cues
          if (newTime === 3) {
            playSound('beep');
            playVoice('time', undefined, { count: 3 });
          } else if (newTime === 10) {
            playSound('beep2');
            playVoice('time', undefined, { count: 10 });
          } else if (newTime === 30) {
            playVoice('time', undefined, { count: 30 });
          } else if (newTime === 0) {
            playSound('complete');
            playVoice('phase', 'Complete');
          }

          // Pulse animation on low time
          if (newTime <= 5 && newTime > 0) {
            triggerPulse(200);
          }

          if (onTick) {
            onTick(newTime);
          }

          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, timeLeft, onTick, playSound, playVoice, triggerPulse]);

  const handleTimerComplete = () => {
    if (type === 'EMOM' || type === 'E2MOM' || type === 'INTERVAL') {
      if (isWorkPhase) {
        // Switch to rest
        setIsWorkPhase(false);
        setTimeLeft(restSec);
        playSound('transition');
        playVoice('phase', undefined, { phase: 'rest' });
        if (onPhaseChange) {
          onPhaseChange('rest', currentRound);
        }
      } else {
        // Switch to work for next round
        if (currentRound < rounds) {
          setIsWorkPhase(true);
          setTimeLeft(workSec);
          const nextRound = currentRound + 1;
          setCurrentRound(nextRound);
          playSound('transition');
          playVoice('phase', undefined, { phase: 'work' });
          playVoice('round', undefined, { count: nextRound });
          if (onPhaseChange) {
            onPhaseChange('work', nextRound);
          }
        } else {
          // All rounds complete
          setIsRunning(false);
          playSound('fanfare');
          if (onComplete) {
            onComplete();
          }
        }
      }
    } else {
      // COUNTDOWN or AMRAP complete
      setIsRunning(false);
      playSound('fanfare');
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
    playSound('beep');
    playVoice('phase', 'Start');
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
    if (timeLeft <= 5 && isRunning && !isPaused) return '#ff6b6b';
    if (isWorkPhase) return '#ccff00';
    return '#4a9eff';
  };

  const timerColor = getTimerColor();
  const isLowTime = timeLeft <= 5 && isRunning && !isPaused;
  const pulseClass = isLowTime ? getPulseClass() : '';

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && !isRunning && !isPaused) {
      startPreCountdown();
    }
  }, [autoStart]);

  return (
    <>
      {/* Pre-countdown Overlay */}
      {showPreCountdownOverlay && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-sm bg-black/90">
          <div className={`text-center transition-all ${preCountdownValue <= 3 ? 'animate-pulse scale-110' : ''}`}>
            <div
              className="font-bold mb-4"
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                fontSize: config.timerFontSize,
                color: preCountdownValue <= 3 ? '#ff6b6b' : 'var(--node-volt)',
                textShadow: `0 0 60px ${preCountdownValue <= 3 ? '#ff6b6b' : 'var(--node-volt)'}80`,
                transition: 'all 0.3s ease',
              }}
            >
              {preCountdownValue}
            </div>
            <div className="text-2xl sm:text-3xl text-muted-text mt-4 uppercase tracking-wider">
              Get Ready
            </div>
          </div>
        </div>
      )}

      {/* Main Timer Display */}
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          {/* Progress Ring (for EMOM/INTERVAL) */}
          {(type === 'EMOM' || type === 'E2MOM' || type === 'INTERVAL') && (
            <svg
              className="absolute inset-0 -z-10 transform -rotate-90"
              width="200"
              height="200"
              style={{ width: config.timerFontSize, height: config.timerFontSize }}
            >
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="rgba(204, 255, 0, 0.2)"
                strokeWidth="4"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke={timerColor}
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - (timeLeft / (isWorkPhase ? workSec : restSec)))}`}
                className="transition-all duration-1000"
              />
            </svg>
          )}

          {/* Timer Text */}
          <div
            className={`font-bold font-mono ${pulseClass}`}
            style={{
              fontFamily: 'var(--font-space-grotesk)',
              fontSize: config.timerFontSize,
              color: timerColor,
              textShadow: isLowTime
                ? `0 0 60px ${timerColor}80, 0 0 100px ${timerColor}40`
                : `0 0 40px ${timerColor}40`,
              transition: 'all 0.3s ease',
              lineHeight: 1,
            }}
          >
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Phase and Round Indicators */}
        {(type === 'EMOM' || type === 'E2MOM' || type === 'INTERVAL') && (
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <div className="bg-panel/90 backdrop-blur-sm thin-border rounded-lg px-6 py-3">
              <div className="text-muted-text text-sm mb-1 uppercase tracking-wider">Round</div>
              <div className="text-2xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                {currentRound} / {rounds}
              </div>
            </div>
            <div className="bg-panel/90 backdrop-blur-sm thin-border rounded-lg px-6 py-3">
              <div className="text-muted-text text-sm mb-1 uppercase tracking-wider">Phase</div>
              <div
                className="text-xl font-bold uppercase"
                style={{
                  color: timerColor,
                  fontFamily: 'var(--font-space-grotesk)',
                }}
              >
                {isWorkPhase ? 'WORK' : 'REST'}
              </div>
            </div>
          </div>
        )}

        {/* Timer Controls */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {!isRunning && !isPaused && (
            <button
              onClick={startPreCountdown}
              className="bg-node-volt text-dark font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                minWidth: config.touchTargetSize,
                minHeight: config.touchTargetSize,
              }}
            >
              Start
            </button>
          )}
          {isRunning && (
            <button
              onClick={handlePause}
              className="bg-panel thin-border text-text-white px-6 py-3 rounded-lg hover:bg-panel transition-colors font-medium"
              style={{
                minWidth: config.touchTargetSize,
                minHeight: config.touchTargetSize,
              }}
            >
              Pause
            </button>
          )}
          {isPaused && (
            <>
              <button
                onClick={handleResume}
                className="bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                style={{
                  fontFamily: 'var(--font-space-grotesk)',
                  minWidth: config.touchTargetSize,
                  minHeight: config.touchTargetSize,
                }}
              >
                Resume
              </button>
              <button
                onClick={handleReset}
                className="bg-panel thin-border text-text-white px-6 py-3 rounded-lg hover:bg-panel transition-colors font-medium"
                style={{
                  minWidth: config.touchTargetSize,
                  minHeight: config.touchTargetSize,
                }}
              >
                Reset
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

