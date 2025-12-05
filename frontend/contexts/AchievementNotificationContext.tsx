'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AchievementNotificationModal } from '@/components/gamification/AchievementNotificationModal';
import { AchievementShareModal } from '@/components/achievements/AchievementShareModal';
import { useAchievementNotifications, Achievement } from '@/hooks/useAchievementNotifications';

interface AchievementNotificationContextType {
  showAchievements: (achievements: Achievement[]) => void;
  queueLength: number;
}

const AchievementNotificationContext = createContext<AchievementNotificationContextType | undefined>(undefined);

export function AchievementNotificationProvider({ children }: { children: ReactNode }) {
  const {
    addAchievements,
    currentAchievement,
    isShowing,
    handleClose,
    handleShare,
    queueLength,
  } = useAchievementNotifications();

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareAchievement, setShareAchievement] = useState<Achievement | null>(null);

  // Check for achievements from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('newAchievements');
    if (stored) {
      try {
        const achievements = JSON.parse(stored);
        if (Array.isArray(achievements) && achievements.length > 0) {
          addAchievements(achievements);
          sessionStorage.removeItem('newAchievements');
        }
      } catch (error) {
        console.error('Failed to parse stored achievements:', error);
        sessionStorage.removeItem('newAchievements');
      }
    }
  }, [addAchievements]);

  const showAchievements = useCallback((achievements: Achievement[]) => {
    addAchievements(achievements);
  }, [addAchievements]);

  const handleShareClick = useCallback(() => {
    if (currentAchievement) {
      setShareAchievement(currentAchievement);
      setShowShareModal(true);
      handleClose();
    }
  }, [currentAchievement, handleClose]);

  const handleShareClose = useCallback(() => {
    setShowShareModal(false);
    setShareAchievement(null);
  }, []);

  return (
    <AchievementNotificationContext.Provider value={{ showAchievements, queueLength }}>
      {children}
      
      {/* Achievement Notification Modal */}
      {currentAchievement && isShowing && (
        <AchievementNotificationModal
          achievement={currentAchievement}
          onClose={handleClose}
          onShare={handleShareClick}
        />
      )}

      {/* Share Modal */}
      {showShareModal && shareAchievement && (
        <AchievementShareModal
          isOpen={showShareModal}
          onClose={handleShareClose}
          achievement={shareAchievement}
        />
      )}
    </AchievementNotificationContext.Provider>
  );
}

export function useAchievementNotificationContext() {
  const context = useContext(AchievementNotificationContext);
  if (context === undefined) {
    throw new Error('useAchievementNotificationContext must be used within AchievementNotificationProvider');
  }
  return context;
}

