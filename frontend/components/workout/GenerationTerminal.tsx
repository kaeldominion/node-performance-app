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
  const [animationFrameId, setAnimationFrameId] = useState<number | null>(null);

  useEffect(() => {
    // Reset when starting
    if (isGenerating && !startTime) {
      setStartTime(Date.now());
      setProgress(5);
      setCurrentStepProgress(0);
    }

    // Step 1: Connecting (5% → 15%, ~2 seconds)
    if (isGenerating && !isReviewing && startTime) {
      const elapsed = Date.now() - startTime;
      
      // Show connecting step for at least 1.5 seconds
      if (elapsed < 1500) {
        setSteps((prev) =>
          prev.map((step) => {
            if (step.id === 'connecting') return { ...step, status: 'active' as const };
            return step;
          })
        );
        // Smooth progress from 5% to 15% over 1.5 seconds
        const connectingProgress = Math.min(1, elapsed / 1500);
        setProgress(5 + connectingProgress * 10);
        setCurrentStepProgress(connectingProgress);
      } 
      // Complete connecting, start generating (15% → 60%, ~20-25 seconds)
      else if (elapsed < 25000) {
        setSteps((prev) =>
          prev.map((step) => {
            if (step.id === 'connecting') return { ...step, status: 'complete' as const };
            if (step.id === 'generating') return { ...step, status: 'active' as const };
            return step;
          })
        );
        // Smooth progress from 15% to 60% over 20 seconds (after connecting)
        const generatingElapsed = elapsed - 1500;
        const generatingDuration = 20000; // 20 seconds for generation
        const generatingProgress = Math.min(1, generatingElapsed / generatingDuration);
        setCurrentStepProgress(generatingProgress);
        setProgress(15 + generatingProgress * 45); // 15% to 60%
      }
      // Continue generating if still in this phase
      else {
        setProgress(60);
        setCurrentStepProgress(1);
      }
    } 
    // Step 2: Reviewing (60% → 85%, ~10-12 seconds)
    else if (isReviewing && startTime) {
      const elapsed = Date.now() - startTime;
      
      setSteps((prev) =>
        prev.map((step) => {
          if (step.id === 'generating') return { ...step, status: 'complete' as const };
          if (step.id === 'reviewing') return { ...step, status: 'active' as const };
          return step;
        })
      );
      
      // Estimate review started around 25 seconds
      const reviewStartTime = 25000;
      const reviewElapsed = Math.max(0, elapsed - reviewStartTime);
      const reviewDuration = 12000; // 12 seconds for review
      const reviewProgress = Math.min(1, reviewElapsed / reviewDuration);
      setCurrentStepProgress(reviewProgress);
      setProgress(60 + reviewProgress * 25); // 60% to 85%
    } 
    // Step 3: Optimizing (85% → 95%, ~3 seconds)
    else if (!isGenerating && !isReviewing && !error && startTime) {
      const elapsed = Date.now() - startTime;
      
      setSteps((prev) =>
        prev.map((step) => {
          if (step.id === 'reviewing') return { ...step, status: 'complete' as const };
          if (step.id === 'optimizing') return { ...step, status: 'active' as const };
          if (step.status === 'pending' && step.id !== 'complete') {
            return { ...step, status: 'complete' as const };
          }
          return step;
        })
      );
      
      // Estimate optimizing started around 37 seconds
      const optimizeStartTime = 37000;
      const optimizeElapsed = Math.max(0, elapsed - optimizeStartTime);
      const optimizeDuration = 3000; // 3 seconds for optimizing
      const optimizeProgress = Math.min(1, optimizeElapsed / optimizeDuration);
      setCurrentStepProgress(optimizeProgress);
      setProgress(85 + optimizeProgress * 10); // 85% to 95%
      
      // Complete after optimizing
      if (optimizeProgress >= 1) {
        setTimeout(() => {
          setSteps((prev) =>
            prev.map((step) => {
              if (step.id === 'optimizing') return { ...step, status: 'complete' as const };
              if (step.id === 'complete') return { ...step, status: 'complete' as const };
              return step;
            })
          );
          setProgress(100);
          setCurrentStepProgress(1);
        }, 500);
      }
    } 
    // Error state
    else if (error) {
      setSteps((prev) =>
        prev.map((step) => {
          if (step.status === 'active') return { ...step, status: 'error' as const };
          return step;
        })
      );
      // Keep progress at current state on error
    }

    // Cleanup animation frame
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isGenerating, isReviewing, error, startTime, animationFrameId]);

  // Continuous animation loop
  useEffect(() => {
    if (!isGenerating && !isReviewing && !error) {
      return;
    }

    const animate = () => {
      if (isGenerating || isReviewing) {
        const frameId = requestAnimationFrame(animate);
        setAnimationFrameId(frameId);
      }
    };
    
    const frameId = requestAnimationFrame(animate);
    setAnimationFrameId(frameId);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [isGenerating, isReviewing, error]);

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

