'use client';

import { useCallback, useEffect, useState } from 'react';

export interface AnimationState {
  isTransitioning: boolean;
  direction: 'forward' | 'backward' | null;
  isPulsing: boolean;
  isCelebrating: boolean;
}

export function useDeckAnimations() {
  const [animationState, setAnimationState] = useState<AnimationState>({
    isTransitioning: false,
    direction: null,
    isPulsing: false,
    isCelebrating: false,
  });

  // Trigger section transition
  const triggerTransition = useCallback((direction: 'forward' | 'backward', duration: number = 500) => {
    setAnimationState({
      isTransitioning: true,
      direction,
      isPulsing: false,
      isCelebrating: false,
    });

    setTimeout(() => {
      setAnimationState(prev => ({
        ...prev,
        isTransitioning: false,
        direction: null,
      }));
    }, duration);
  }, []);

  // Trigger pulse animation (for timers, active exercises)
  const triggerPulse = useCallback((duration: number = 1000) => {
    setAnimationState(prev => ({
      ...prev,
      isPulsing: true,
    }));

    setTimeout(() => {
      setAnimationState(prev => ({
        ...prev,
        isPulsing: false,
      }));
    }, duration);
  }, []);

  // Trigger celebration (confetti, completion)
  const triggerCelebration = useCallback((duration: number = 3000) => {
    setAnimationState(prev => ({
      ...prev,
      isCelebrating: true,
    }));

    setTimeout(() => {
      setAnimationState(prev => ({
        ...prev,
        isCelebrating: false,
      }));
    }, duration);
  }, []);

  // Get animation classes
  const getTransitionClass = useCallback(() => {
    if (!animationState.isTransitioning) return '';
    
    if (animationState.direction === 'forward') {
      return 'animate-slide-forward';
    } else if (animationState.direction === 'backward') {
      return 'animate-slide-backward';
    }
    return '';
  }, [animationState.isTransitioning, animationState.direction]);

  const getPulseClass = useCallback(() => {
    return animationState.isPulsing ? 'animate-pulse-glow' : '';
  }, [animationState.isPulsing]);

  const getCelebrationClass = useCallback(() => {
    return animationState.isCelebrating ? 'animate-celebration' : '';
  }, [animationState.isCelebrating]);

  return {
    animationState,
    triggerTransition,
    triggerPulse,
    triggerCelebration,
    getTransitionClass,
    getPulseClass,
    getCelebrationClass,
  };
}

// Confetti animation component helper
export function useConfetti() {
  const [showConfetti, setShowConfetti] = useState(false);

  const trigger = useCallback(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  return { showConfetti, trigger };
}


