'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  xpReward: number;
  category: string;
}

export function useAchievementNotifications() {
  const [queue, setQueue] = useState<Achievement[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [isShowing, setIsShowing] = useState(false);

  // Process queue - show next achievement when current one is dismissed
  useEffect(() => {
    if (!isShowing && queue.length > 0 && !currentAchievement) {
      const next = queue[0];
      setCurrentAchievement(next);
      setQueue(prev => prev.slice(1));
      setIsShowing(true);
    }
  }, [isShowing, queue, currentAchievement]);

  // Add achievements to queue
  const addAchievements = useCallback((achievements: Achievement[]) => {
    setQueue(prev => [...prev, ...achievements]);
  }, []);

  // Handle closing current achievement
  const handleClose = useCallback(() => {
    setIsShowing(false);
    // Small delay before showing next achievement
    setTimeout(() => {
      setCurrentAchievement(null);
    }, 300);
  }, []);

  // Handle share action
  const handleShare = useCallback(() => {
    // This will be handled by the parent component
    // For now, just close
    handleClose();
  }, [handleClose]);

  return {
    addAchievements,
    currentAchievement,
    isShowing,
    handleClose,
    handleShare,
    queueLength: queue.length,
  };
}

