'use client';

import { useEffect, useState } from 'react';

interface GenerationTerminalProps {
  isGenerating: boolean;
  isReviewing: boolean;
  error?: string | null;
}

type TerminalStep = {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  timestamp?: number;
};

export function GenerationTerminal({ isGenerating, isReviewing, error }: GenerationTerminalProps) {
  const [steps, setSteps] = useState<TerminalStep[]>([
    { id: 'input', label: 'User input received ✓', status: 'complete' },
    { id: 'connecting', label: 'Connecting to NØDE AI systems...', status: 'pending' },
    { id: 'generating', label: 'Generating workout structure & exercise selection...', status: 'pending' },
    { id: 'reviewing', label: 'Running workout review & feasibility check...', status: 'pending' },
    { id: 'optimizing', label: 'Optimizing tier progression & timing...', status: 'pending' },
    { id: 'complete', label: 'Workout ready for deployment', status: 'pending' },
  ]);
  const [progress, setProgress] = useState(5); // Start at 5% (input received)
  const [currentStepProgress, setCurrentStepProgress] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [phaseStartTime, setPhaseStartTime] = useState<number | null>(null);
  const [currentPhase, setCurrentPhase] = useState<'connecting' | 'generating' | 'reviewing' | 'optimizing' | 'complete' | null>(null);
  const [soundsPlayed, setSoundsPlayed] = useState<Set<string>>(new Set());

  // Generate techy sound effects using Web Audio API
  const playSound = (type: 'connect' | 'step' | 'complete' | 'error') => {
    if (soundsPlayed.has(type)) return; // Don't play same sound multiple times
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      switch (type) {
        case 'connect':
          // Short beep for connection
          oscillator.frequency.value = 800;
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.15);
          break;
        case 'step':
          // Subtle tick for step progress
          oscillator.frequency.value = 1200;
          oscillator.type = 'square';
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.1);
          break;
        case 'complete':
          // Techy completion sound (ascending tones)
          const frequencies = [400, 600, 800, 1000, 1200];
          frequencies.forEach((freq, idx) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0, audioContext.currentTime + idx * 0.1);
            gain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + idx * 0.1 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + idx * 0.1 + 0.2);
            osc.start(audioContext.currentTime + idx * 0.1);
            osc.stop(audioContext.currentTime + idx * 0.1 + 0.2);
          });
          break;
        case 'error':
          // Error sound (low descending tone)
          oscillator.frequency.value = 300;
          oscillator.type = 'sawtooth';
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.3);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
          break;
      }
      
      setSoundsPlayed(prev => new Set(prev).add(type));
    } catch (e) {
      // Sound failed, continue silently
      console.debug('Sound playback failed:', e);
    }
  };

  // Reset when starting
  useEffect(() => {
    if (isGenerating && !startTime) {
      const now = Date.now();
      setStartTime(now);
      setPhaseStartTime(now);
      setCurrentPhase('connecting');
      setProgress(5);
      setCurrentStepProgress(0);
      setSoundsPlayed(new Set());
      setSteps((prev) =>
        prev.map((step) => {
          if (step.id === 'connecting') return { ...step, status: 'active' as const };
          return step;
        })
      );
      playSound('connect');
    }
  }, [isGenerating, startTime]);

  // Animation loop for smooth progress updates
  useEffect(() => {
    if (!isGenerating && !isReviewing && !error) {
      return;
    }

    let animationFrameId: number;

    const updateProgress = () => {
      if (!startTime || !phaseStartTime) return;

      const totalElapsed = Date.now() - startTime;
      const phaseElapsed = Date.now() - phaseStartTime;

      // Phase 1: Connecting (5% → 15%, ~2 seconds)
      if (currentPhase === 'connecting' && isGenerating && !isReviewing) {
        if (phaseElapsed < 2000) {
          const phaseProgress = Math.min(1, phaseElapsed / 2000);
          setCurrentStepProgress(phaseProgress);
          setProgress(5 + phaseProgress * 10); // 5% to 15%
        } else {
          // Transition to generating
          setSteps((prev) =>
            prev.map((step) => {
              if (step.id === 'connecting') return { ...step, status: 'complete' as const };
              if (step.id === 'generating') return { ...step, status: 'active' as const };
              return step;
            })
          );
          setCurrentPhase('generating');
          setPhaseStartTime(Date.now());
          setCurrentStepProgress(0);
          playSound('step');
        }
      }
      // Phase 2: Generating (15% → 60%, ~20-25 seconds)
      else if (currentPhase === 'generating' && isGenerating && !isReviewing) {
        const generatingDuration = 25000; // 25 seconds for generation
        const phaseProgress = Math.min(1, phaseElapsed / generatingDuration);
        setCurrentStepProgress(phaseProgress);
        setProgress(15 + phaseProgress * 45); // 15% to 60%
      }
      // Phase 3: Reviewing (60% → 85%, ~12 seconds)
      // Only transition to reviewing if we've completed generating phase
      else if (isReviewing && currentPhase === 'generating') {
        // First, mark generating as complete
        setSteps((prev) =>
          prev.map((step) => {
            if (step.id === 'generating') return { ...step, status: 'complete' as const };
            return step;
          })
        );
        // Then transition to reviewing
        setTimeout(() => {
          setSteps((prev) =>
            prev.map((step) => {
              if (step.id === 'reviewing') return { ...step, status: 'active' as const };
              return step;
            })
          );
          setCurrentPhase('reviewing');
          setPhaseStartTime(Date.now());
          setCurrentStepProgress(0);
          playSound('step');
        }, 300); // Small delay to show generating as complete first
      } else if (isReviewing && currentPhase !== 'reviewing' && currentPhase !== 'generating') {
        // If we're reviewing but haven't been through generating, mark generating as complete first
        setSteps((prev) =>
          prev.map((step) => {
            if (step.id === 'generating') return { ...step, status: 'complete' as const };
            if (step.id === 'reviewing') return { ...step, status: 'active' as const };
            return step;
          })
        );
        setCurrentPhase('reviewing');
        setPhaseStartTime(Date.now());
        setCurrentStepProgress(0);
        playSound('step');
      } else if (currentPhase === 'reviewing' && isReviewing) {
        const reviewDuration = 12000; // 12 seconds for review
        const phaseProgress = Math.min(1, phaseElapsed / reviewDuration);
        setCurrentStepProgress(phaseProgress);
        setProgress(60 + phaseProgress * 25); // 60% to 85%
      }
      // Phase 4: Optimizing (85% → 95%, ~3 seconds)
      else if (!isGenerating && !isReviewing && !error && currentPhase !== 'optimizing' && currentPhase !== 'complete') {
        setSteps((prev) =>
          prev.map((step) => {
            if (step.id === 'reviewing') return { ...step, status: 'complete' as const };
            if (step.id === 'optimizing') return { ...step, status: 'active' as const };
            return step;
          })
        );
        setCurrentPhase('optimizing');
        setPhaseStartTime(Date.now());
        setCurrentStepProgress(0);
      } else if (currentPhase === 'optimizing' && !isGenerating && !isReviewing && !error) {
        const optimizeDuration = 3000; // 3 seconds for optimizing
        const phaseProgress = Math.min(1, phaseElapsed / optimizeDuration);
        setCurrentStepProgress(phaseProgress);
        setProgress(85 + phaseProgress * 10); // 85% to 95%
        
        if (phaseProgress >= 1 && currentPhase === 'optimizing') {
          // Complete
          playSound('complete');
          setTimeout(() => {
            setSteps((prev) =>
              prev.map((step) => {
                if (step.id === 'optimizing') return { ...step, status: 'complete' as const };
                if (step.id === 'complete') return { ...step, status: 'complete' as const };
                return step;
              })
            );
            setCurrentPhase('complete');
            setProgress(100);
            setCurrentStepProgress(1);
          }, 300);
        }
      }

      // Continue animation if still processing
      if ((isGenerating || isReviewing) && currentPhase !== 'complete') {
        animationFrameId = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isGenerating, isReviewing, error, startTime, phaseStartTime, currentPhase, soundsPlayed]);

  // Error state
  useEffect(() => {
    if (error) {
      playSound('error');
      setSteps((prev) =>
        prev.map((step) => {
          if (step.status === 'active') return { ...step, status: 'error' as const };
          return step;
        })
      );
    }
  }, [error]);

  if (!isGenerating && !isReviewing && !error) {
    return null; // Don't show terminal when complete
  }

  return (
    <div className="bg-black border-2 border-node-volt/30 rounded-lg p-6 font-mono text-sm overflow-hidden relative">
      {/* Terminal header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-node-volt/20">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
        <div className="text-node-volt/60 text-xs ml-2 font-mono">
          NØDE OS // AI Workout Generator v2.0
        </div>
        <div className="ml-auto text-node-volt/40 text-xs font-mono">
          {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-node-volt/60 text-xs font-mono">Progress</span>
          <span className="text-node-volt font-mono font-bold text-sm">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full h-2 bg-node-volt/10 rounded-full overflow-hidden border border-node-volt/20">
          <div
            className="h-full bg-gradient-to-r from-node-volt/50 to-node-volt transition-all duration-300 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          </div>
        </div>
      </div>

      {/* Terminal content */}
      <div className="space-y-2 min-h-[120px]">
        {steps.map((step, idx) => {
          const isActive = step.status === 'active';
          const isComplete = step.status === 'complete';
          const isError = step.status === 'error';

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 ${
                isActive ? 'text-node-volt' : isComplete ? 'text-green-400' : isError ? 'text-red-400' : 'text-gray-500'
              } transition-colors duration-300`}
            >
              {/* Status indicator */}
              <div className="w-2 h-2 flex-shrink-0">
                {isActive ? (
                  <div className="w-2 h-2 bg-node-volt rounded-full animate-pulse"></div>
                ) : isComplete ? (
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                ) : isError ? (
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                ) : (
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                )}
              </div>

              {/* Command prompt */}
              <span className="text-node-volt/40">$</span>

              {/* Step label */}
              <span className={isActive ? 'animate-pulse' : ''}>
                {step.label}
              </span>

              {/* Step progress indicator for active steps */}
              {isActive && (
                <div className="ml-auto flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-node-volt/10 rounded-full overflow-hidden border border-node-volt/20">
                    <div
                      className="h-full bg-node-volt transition-all duration-300"
                      style={{ width: `${currentStepProgress * 100}%` }}
                    />
                  </div>
                  <span className="text-node-volt/60 text-xs font-mono w-8 text-right">
                    {Math.round(currentStepProgress * 100)}%
                  </span>
                </div>
              )}

              {/* Active cursor */}
              {isActive && !currentStepProgress && (
                <span className="text-node-volt animate-pulse ml-2">▊</span>
              )}

              {/* Success checkmark */}
              {isComplete && (
                <span className="text-green-400 ml-auto">✓</span>
              )}

              {/* Error X */}
              {isError && (
                <span className="text-red-400 ml-auto">✗</span>
              )}
            </div>
          );
        })}

        {/* Error message */}
        {error && (
          <div className="mt-4 pt-4 border-t border-red-500/20">
            <div className="text-red-400 text-xs">
              <span className="text-red-500/60">ERROR:</span> {error}
            </div>
          </div>
        )}
      </div>

      {/* Terminal footer */}
      <div className="mt-4 pt-3 border-t border-node-volt/10 text-xs text-node-volt/40 font-mono">
        <div className="flex items-center gap-2 flex-wrap">
          <span>NØDE OS v2.0</span>
          <span>•</span>
          <span>AI Engine: GPT-4o</span>
          <span>•</span>
          <span>Status:</span>
          <span className={`${isGenerating || isReviewing ? 'text-node-volt animate-pulse' : 'text-green-400'}`}>
            {isGenerating || isReviewing ? 'PROCESSING' : error ? 'ERROR' : 'READY'}
          </span>
          {(isGenerating || isReviewing) && (
            <>
              <span>•</span>
              <span className="text-node-volt">
                {Math.round(progress)}% Complete
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Add shimmer animation CSS
if (typeof document !== 'undefined') {
  const existingStyle = document.head.querySelector('style[data-terminal-shimmer]');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.setAttribute('data-terminal-shimmer', 'true');
    style.textContent = `
      @keyframes shimmer {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }
      .animate-shimmer {
        animation: shimmer 2s infinite;
      }
    `;
    document.head.appendChild(style);
  }
}

