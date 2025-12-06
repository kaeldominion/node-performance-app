'use client';

import { useEffect, useState } from 'react';
import { Icons } from '@/lib/iconMapping';
import { useTheme } from '@/contexts/ThemeContext';

interface GenerationTerminalProps {
  isGenerating: boolean;
  isReviewing: boolean;
  error?: string | null;
  onComplete?: () => void;
  workoutReady?: boolean; // Indicates workout is ready to display
}

type TerminalStep = {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  timestamp?: number;
};

export function GenerationTerminal({ isGenerating, isReviewing, error, onComplete, workoutReady }: GenerationTerminalProps) {
  const { theme } = useTheme();
  const [steps, setSteps] = useState<TerminalStep[]>([
    { id: 'input', label: 'User input received', status: 'complete' },
    { id: 'connecting', label: 'Connecting to NØDE AI systems...', status: 'pending' },
    { id: 'generating', label: 'Generating workout structure & exercise selection...', status: 'pending' },
    { id: 'reviewing', label: 'Running workout review & feasibility check...', status: 'pending' },
    { id: 'optimizing', label: 'Optimizing tier progression & timing...', status: 'pending' },
    { id: 'complete', label: 'Workout generation complete, loading...', status: 'pending' },
  ]);
  const [progress, setProgress] = useState(5); // Start at 5% (input received)
  const [currentStepProgress, setCurrentStepProgress] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [phaseStartTime, setPhaseStartTime] = useState<number | null>(null);
  const [currentPhase, setCurrentPhase] = useState<'connecting' | 'generating' | 'reviewing' | 'optimizing' | 'complete' | 'shutting-down' | null>(null);
  const [soundsPlayed, setSoundsPlayed] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);
  const [isShuttingDown, setIsShuttingDown] = useState(false);
  const [shutdownProgress, setShutdownProgress] = useState(0);

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
      setIsComplete(false);
      setIsShuttingDown(false);
      setShutdownProgress(0);
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
      // Phase 2: Generating (15% → 45%, ~30 seconds - reduced from 40s for better balance)
      // Only show generating phase when isGenerating is true AND isReviewing is false
      else if (currentPhase === 'generating' && isGenerating && !isReviewing) {
        const generatingDuration = 30000; // 30 seconds for generation (reduced from 40s)
        const phaseProgress = Math.min(1, phaseElapsed / generatingDuration);
        setCurrentStepProgress(phaseProgress);
        setProgress(15 + phaseProgress * 30); // 15% to 45% (reduced range)
      }
      // Phase 3: Reviewing (45% → 65%, ~5 seconds - increased from 2s)
      // Only transition to reviewing when isGenerating is false (generation complete)
      else if (isReviewing && !isGenerating && currentPhase !== 'reviewing') {
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
      } else if (currentPhase === 'reviewing' && isReviewing && !isGenerating) {
        const reviewDuration = 5000; // 5 seconds for review (increased from 2s)
        const phaseProgress = Math.min(1, phaseElapsed / reviewDuration);
        setCurrentStepProgress(phaseProgress);
        setProgress(45 + phaseProgress * 20); // 45% to 65% (adjusted range)
        
        // If review completes, transition to optimizing
        if (phaseProgress >= 1) {
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
          playSound('step');
        }
      }
      // Phase 4: Optimizing (65% → 85%, ~5 seconds - increased from 3s)
      // Transition to optimizing when reviewing is done OR when both flags are false
      else if (currentPhase === 'reviewing' && !isReviewing && !error) {
        // Reviewing phase ended, transition to optimizing
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
        playSound('step');
      } else if (!isGenerating && !isReviewing && !error && currentPhase !== 'optimizing' && currentPhase !== 'complete' && currentPhase !== 'shutting-down') {
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
        const optimizeDuration = 5000; // 5 seconds for optimizing (increased from 3s)
        const phaseProgress = Math.min(1, phaseElapsed / optimizeDuration);
        setCurrentStepProgress(phaseProgress);
        setProgress(65 + phaseProgress * 20); // 65% to 85% (adjusted range)
        
        if (phaseProgress >= 1 && currentPhase === 'optimizing') {
          // Transition to complete phase
          setSteps((prev) =>
            prev.map((step) => {
              if (step.id === 'optimizing') return { ...step, status: 'complete' as const };
              if (step.id === 'complete') return { ...step, status: 'active' as const };
              return step;
            })
          );
          setCurrentPhase('complete');
          setPhaseStartTime(Date.now());
          setCurrentStepProgress(0);
          playSound('complete');
        }
      } else if (currentPhase === 'complete') {
        // Complete phase: show 100% and completion message for 3 seconds (increased from 2s)
        const completeDuration = 3000; // 3 seconds to show completion (increased from 2s)
        const phaseProgress = Math.min(1, phaseElapsed / completeDuration);
        setCurrentStepProgress(phaseProgress);
        setProgress(85 + phaseProgress * 15); // 85% to 100% (adjusted range)
        
        if (phaseProgress >= 1 && !isShuttingDown) {
          // Mark complete step as done, then start shutdown
          setSteps((prev) =>
            prev.map((step) => {
              if (step.id === 'complete') return { ...step, status: 'complete' as const };
              return step;
            })
          );
          setProgress(100);
          setCurrentStepProgress(1);
          
          // Start shutdown animation after a brief pause
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
            setIsComplete(true);
          }, 300);
        }
      }

      // Continue animation if still processing, shutting down, or in any active phase
      if (currentPhase !== null && (
        isGenerating || 
        isReviewing || 
        currentPhase === 'optimizing' || 
        currentPhase === 'complete' || 
        currentPhase === 'shutting-down'
      )) {
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

  // Handle external completion (workout ready)
  useEffect(() => {
    if (workoutReady && !isGenerating && !isReviewing && !error && !isComplete && !isShuttingDown) {
      // Mark all steps as complete and set completion state
      setSteps((prev) =>
        prev.map((step) => ({ ...step, status: 'complete' as const }))
      );
      setProgress(100);
      setCurrentStepProgress(1);
      setCurrentPhase('complete');
      setIsComplete(true);
      playSound('complete');
    }
  }, [workoutReady, isGenerating, isReviewing, error, isComplete, isShuttingDown]);

  // Handle completion: show completion state, then shutdown
  useEffect(() => {
    if (isComplete && !isShuttingDown) {
      // Show completion state for 2 seconds, then start shutdown
      const completionTimer = setTimeout(() => {
        setIsShuttingDown(true);
      }, 2000);

      return () => clearTimeout(completionTimer);
    }
  }, [isComplete, isShuttingDown]);

  // Shutdown animation
  useEffect(() => {
    if (isShuttingDown) {
      let shutdownFrameId: number;
      let shutdownStartTime = Date.now();
      const shutdownDuration = 1500; // 1.5 seconds for shutdown animation

      const animateShutdown = () => {
        const elapsed = Date.now() - shutdownStartTime;
        const progress = Math.min(1, elapsed / shutdownDuration);
        setShutdownProgress(progress);

        if (progress < 1) {
          shutdownFrameId = requestAnimationFrame(animateShutdown);
        } else {
          // Shutdown complete, notify parent
          if (onComplete) {
            onComplete();
          }
        }
      };

      shutdownFrameId = requestAnimationFrame(animateShutdown);

      return () => {
        if (shutdownFrameId) {
          cancelAnimationFrame(shutdownFrameId);
        }
      };
    }
  }, [isShuttingDown, onComplete]);

  // Don't render if not generating, reviewing, complete, or error
  if (!isGenerating && !isReviewing && !error && !isComplete && !isShuttingDown) {
    return null;
  }

  // Calculate shutdown opacity and scale
  const shutdownOpacity = isShuttingDown ? 1 - shutdownProgress : 1;
  const shutdownScale = isShuttingDown ? 0.95 + shutdownProgress * 0.05 : 1;
  const shutdownBlur = isShuttingDown ? shutdownProgress * 10 : 0;

  return (
    <div className="space-y-4">
      {/* Info Box - You can browse while generating */}
      {(isGenerating || isReviewing) && !isShuttingDown && (
        <div className="bg-node-volt/10 border-2 border-node-volt/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Icons.INFO size={20} className="text-node-volt flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-text-white mb-1">
                Generation in Progress
              </p>
              <p className="text-xs text-muted-text leading-relaxed">
                You're free to browse the site while your workout generates. This process typically takes 1-3 minutes. 
                You'll receive a notification when it's ready, and you can find it in your notifications or return here anytime.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div 
        className={`${theme === 'light' ? 'bg-gray-100' : 'bg-black'} border-2 ${theme === 'light' ? 'border-blue-500/40' : 'border-node-volt/30'} rounded-lg p-6 font-mono text-sm overflow-hidden relative transition-all duration-300`}
        style={{
          opacity: shutdownOpacity,
          transform: `scale(${shutdownScale})`,
        filter: `blur(${shutdownBlur}px)`,
      }}
    >
      {/* Terminal header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-blue-500/30 dark:border-node-volt/20">
        <div className="flex gap-1.5">
          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${isShuttingDown ? 'bg-red-500' : 'bg-red-500/80'}`}></div>
          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${isShuttingDown ? 'bg-yellow-500' : 'bg-yellow-500/80'}`}></div>
          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${isShuttingDown ? 'bg-green-500' : 'bg-green-500/80'}`}></div>
        </div>
        <div className="text-blue-600/80 dark:text-node-volt/60 text-xs ml-2 font-mono">
          NØDE OS // AI Workout Generator v2.0
        </div>
        <div className="ml-auto text-blue-600/60 dark:text-node-volt/40 text-xs font-mono">
          {isShuttingDown ? 'SHUTTING DOWN...' : new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-blue-600/80 dark:text-node-volt/60 text-xs font-mono">
            {isShuttingDown ? 'Terminal Status' : 'Progress'}
          </span>
          <span className="text-blue-700 dark:text-node-volt font-mono font-bold text-sm">
            {isShuttingDown ? 'CLOSING...' : `${Math.round(progress)}%`}
          </span>
        </div>
        <div className="w-full h-2 bg-blue-100/50 dark:bg-node-volt/10 rounded-full overflow-hidden border border-blue-500/30 dark:border-node-volt/20">
          {isShuttingDown ? (
            <div className="h-full bg-gradient-to-r from-red-500/50 to-red-500 transition-all duration-300 ease-out relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
          ) : (
            <div
              className="h-full bg-gradient-to-r from-blue-500/70 to-blue-600 dark:from-node-volt/50 dark:to-node-volt transition-all duration-300 ease-out relative"
              style={{ width: `${Math.round(progress)}%` }}
            >
              {/* Animated shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
          )}
        </div>
      </div>

      {/* Shutdown overlay with terminal-style messages */}
      {isShuttingDown && (
        <div className={`absolute inset-0 ${theme === 'light' ? 'bg-gray-100/95' : 'bg-black/90'} flex flex-col items-center justify-center z-10 backdrop-blur-sm p-6`}>
          <div className="w-full max-w-md space-y-2 font-mono text-sm">
            <div className="text-blue-700 dark:text-node-volt/80">$ shutdown -h now</div>
            <div className="text-green-600/80 dark:text-green-400/60">Saving session state...</div>
            <div className="text-green-600/80 dark:text-green-400/60" style={{ transitionDelay: '0.2s', opacity: shutdownProgress > 0.3 ? 1 : 0 }}>
              Closing AI connections...
            </div>
            <div className="text-green-600/80 dark:text-green-400/60" style={{ transitionDelay: '0.4s', opacity: shutdownProgress > 0.5 ? 1 : 0 }}>
              Flushing workout cache...
            </div>
            <div className="text-green-600/80 dark:text-green-400/60" style={{ transitionDelay: '0.6s', opacity: shutdownProgress > 0.7 ? 1 : 0 }}>
              Transferring to display module...
            </div>
            <div className="text-blue-700 dark:text-node-volt text-lg font-bold mt-4 animate-pulse" style={{ opacity: shutdownProgress > 0.8 ? 1 : 0 }}>
              SYSTEM SHUTDOWN COMPLETE
            </div>
          </div>
        </div>
      )}

      {/* Terminal content */}
      <div className="space-y-2 min-h-[120px]">
        {steps.map((step, idx) => {
          const isActive = step.status === 'active';
          const isStepComplete = step.status === 'complete';
          const isError = step.status === 'error';

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 transition-all duration-300 ${
                isShuttingDown ? 'opacity-50' : ''
              } ${
                isActive ? 'text-blue-600 dark:text-node-volt' : isStepComplete ? 'text-green-600 dark:text-green-400' : isError ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {/* Status indicator */}
              <div className="w-2 h-2 flex-shrink-0">
                {isActive ? (
                  <div className="w-2 h-2 bg-blue-600 dark:bg-node-volt rounded-full animate-pulse"></div>
                ) : isComplete ? (
                  <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
                ) : isError ? (
                  <div className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full"></div>
                ) : (
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                )}
              </div>

              {/* Command prompt */}
              <span className="text-blue-600/60 dark:text-node-volt/40">$</span>

              {/* Step label */}
              <span className={isActive ? 'animate-pulse' : ''}>
                {step.label}
              </span>

              {/* Step progress indicator for active steps */}
              {isActive && (
                <div className="ml-auto flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-blue-100/50 dark:bg-node-volt/10 rounded-full overflow-hidden border border-blue-500/30 dark:border-node-volt/20">
                    <div
                      className="h-full bg-blue-600 dark:bg-node-volt transition-all duration-300 ease-out"
                      style={{ width: `${Math.round(Math.max(0, Math.min(100, currentStepProgress * 100)))}%` }}
                    />
                  </div>
                  <span className="text-blue-600/80 dark:text-node-volt/60 text-xs font-mono w-8 text-right">
                    {Math.round(Math.max(0, Math.min(100, currentStepProgress * 100)))}%
                  </span>
                </div>
              )}

              {/* Active cursor - only show when step is active but has no progress yet */}
              {isActive && currentStepProgress === 0 && (
                <span className="text-blue-600 dark:text-node-volt animate-pulse ml-2">▊</span>
              )}

              {/* Success checkmark */}
              {isStepComplete && (
                <Icons.CHECK size={16} className="text-green-600 dark:text-green-400 ml-auto" />
              )}

              {/* Error X */}
              {isError && (
                <Icons.X size={16} className="text-red-600 dark:text-red-400 ml-auto" />
              )}
            </div>
          );
        })}

        {/* Error message */}
        {error && (
          <div className="mt-4 pt-4 border-t border-red-500/30 dark:border-red-500/20">
            <div className="text-red-600 dark:text-red-400 text-xs">
              <span className="text-red-700/80 dark:text-red-500/60">ERROR:</span> {error}
            </div>
          </div>
        )}
      </div>

      {/* Terminal footer */}
      <div className="mt-4 pt-3 border-t border-blue-500/20 dark:border-node-volt/10 text-xs text-blue-600/60 dark:text-node-volt/40 font-mono">
        <div className="flex items-center gap-2 flex-wrap">
          <span>NØDE OS v2.0</span>
          <span>•</span>
          <span>AI Engine: GPT-4o</span>
          <span>•</span>
          <span>Status:</span>
          <span className={`${isGenerating || isReviewing ? 'text-blue-600 dark:text-node-volt animate-pulse' : isComplete ? 'text-green-600 dark:text-green-400' : error ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {isShuttingDown ? 'SHUTTING DOWN' : isGenerating || isReviewing ? 'PROCESSING' : isComplete ? 'COMPLETE' : error ? 'ERROR' : 'READY'}
          </span>
          {(isGenerating || isReviewing) && (
            <>
              <span>•</span>
              <span className="text-blue-600 dark:text-node-volt">
                {Math.round(progress)}% Complete
              </span>
            </>
          )}
        </div>
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


