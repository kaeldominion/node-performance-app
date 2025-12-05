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

  useEffect(() => {
    if (isGenerating && !isReviewing) {
      // Generating phase
      setSteps((prev) =>
        prev.map((step) => {
          if (step.id === 'connecting') return { ...step, status: 'complete' as const };
          if (step.id === 'generating') return { ...step, status: 'active' as const };
          return step;
        })
      );
    } else if (isReviewing) {
      // Reviewing phase
      setSteps((prev) =>
        prev.map((step) => {
          if (step.id === 'generating') return { ...step, status: 'complete' as const };
          if (step.id === 'reviewing') return { ...step, status: 'active' as const };
          return step;
        })
      );
    } else if (!isGenerating && !isReviewing && !error) {
      // Complete - mark all steps as complete
      setSteps((prev) =>
        prev.map((step) => {
          if (step.status === 'active' || step.status === 'pending') {
            return { ...step, status: 'complete' as const };
          }
          return step;
        })
      );
    } else if (error) {
      // Error state
      setSteps((prev) =>
        prev.map((step) => {
          if (step.status === 'active') return { ...step, status: 'error' as const };
          return step;
        })
      );
    }
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

              {/* Active cursor */}
              {isActive && (
                <span className="text-node-volt animate-pulse">▊</span>
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
        </div>
      </div>
    </div>
  );
}

