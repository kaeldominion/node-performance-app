'use client';

import { useState, useEffect, useRef } from 'react';

interface CountdownTimerProps {
  initialSeconds: number;
  onComplete?: () => void;
  onTick?: (seconds: number) => void;
  autoStart?: boolean;
}

export default function CountdownTimer({
  initialSeconds,
  onComplete,
  onTick,
  autoStart = false,
}: CountdownTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (onComplete) {
              onComplete();
            }
            return 0;
          }
          const newSeconds = prev - 1;
          if (onTick) {
            onTick(newSeconds);
          }
          return newSeconds;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, seconds, onComplete, onTick]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const reset = () => {
    setSeconds(initialSeconds);
    setIsRunning(false);
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center">
      <div className="text-6xl font-bold text-node-volt mb-4 font-mono">
        {formatTime(seconds)}
      </div>
      <div className="flex gap-4 justify-center">
        {!isRunning && seconds > 0 && (
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

