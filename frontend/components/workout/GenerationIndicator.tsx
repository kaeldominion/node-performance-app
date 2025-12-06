'use client';

import { useEffect, useState } from 'react';
import { useWorkoutGeneration } from '@/contexts/WorkoutGenerationContext';
import { Icons } from '@/lib/iconMapping';

export function GenerationIndicator() {
  const { generatingWorkouts } = useWorkoutGeneration();
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    setShowIndicator(generatingWorkouts.size > 0);
  }, [generatingWorkouts]);

  if (!showIndicator) return null;

  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-node-volt/20 border border-node-volt/50 rounded-lg">
        <div className="w-2 h-2 bg-node-volt rounded-full animate-pulse" />
        <span className="text-xs text-node-volt font-mono uppercase tracking-wider">
          Generating...
        </span>
      </div>
    </div>
  );
}

