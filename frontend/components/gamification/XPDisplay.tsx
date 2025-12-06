'use client';

import { useEffect, useState } from 'react';
import { gamificationApi } from '@/lib/api';
import { LevelUpModal } from './LevelUpModal';

interface XPDisplayProps {
  userId: string;
  className?: string;
}

export function XPDisplay({ userId, className = '' }: XPDisplayProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState<number | null>(null);
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);

  useEffect(() => {
    loadStats();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  const loadStats = async () => {
    try {
      const newStats = await gamificationApi.getStats();
      setStats(newStats);
      
      // Check for level up
      if (previousLevel !== null && newStats.level > previousLevel) {
        setNewLevel(newStats.level);
        setShowLevelUp(true);
      }
      
      setPreviousLevel(newStats.level);
      setLoading(false);
    } catch (error: any) {
      // Silently handle network errors - backend may be offline
      // Only set loading to false if we haven't loaded stats yet
      if (!stats) {
        setLoading(false);
      }
      // Don't log network errors - they're already handled gracefully in api.ts
      // Only log if it's a server error (not a network error)
      if (error?.response) {
        // Server responded with error - log it
        console.error('Failed to load XP stats:', error.response?.status, error.response?.data);
      } else if (error?.code !== 'ERR_NETWORK' && error?.message !== 'Network Error') {
        // Not a network error - log it
        console.error('Failed to load XP stats:', error);
      }
      // Don't set loading to false on first error - keep showing loading state
      // This prevents flickering when backend is temporarily unavailable
      if (stats === null) {
        setLoading(false);
      }
    }
  };

  if (loading || !stats) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-16 h-2 bg-panel rounded-full animate-pulse" />
      </div>
    );
  }

  const progressPercent = Math.round(stats.progress.progress * 100);

  return (
    <>
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="text-node-volt font-heading font-bold text-lg">
            L{stats.level}
          </div>
          <div className="text-muted-text text-sm">
            {stats.xp.toLocaleString()} XP
          </div>
        </div>
        
        <div className="flex-1 max-w-[200px]">
          <div className="h-2 bg-panel rounded-full overflow-hidden">
            <div
              className="h-full bg-node-volt transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {stats.xpToNextLevel && (
            <div className="text-xs text-muted-text mt-1">
              {stats.xpToNextLevel.toLocaleString()} XP to next level
            </div>
          )}
        </div>
      </div>

      {showLevelUp && newLevel && stats && (
        <LevelUpModal
          level={newLevel}
          levelName={stats.levelName}
          nextLevel={stats.nextLevel}
          nextLevelName={stats.nextLevelName}
          xpToNextLevel={stats.xpToNextLevel}
          onClose={() => {
            setShowLevelUp(false);
            setNewLevel(null);
          }}
        />
      )}
    </>
  );
}

