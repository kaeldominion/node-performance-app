'use client';

import { useState, useRef } from 'react';
import { AchievementPost } from './AchievementPost';
import { Icons } from '@/lib/iconMapping';
import { useAuth } from '@/contexts/AuthContext';

interface AchievementShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: {
    code: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    earnedAt?: string;
    value?: number;
  };
}

export function AchievementShareModal({ isOpen, onClose, achievement }: AchievementShareModalProps) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [format, setFormat] = useState<'story' | 'post'>('story');
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const userData = {
    name: user?.name || user?.email?.split('@')[0] || 'User',
    level: user?.level || 1,
    xp: user?.xp || 0,
  };

  const achievementData = {
    ...achievement,
    earnedAt: achievement.earnedAt || new Date().toISOString(),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative bg-panel thin-border rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Share Achievement
          </h2>
          <button
            onClick={onClose}
            className="text-muted-text hover:text-text-white transition-colors"
          >
            <Icons.X size={24} />
          </button>
        </div>

        {/* Theme and Format Selectors */}
        <div className="flex gap-4 mb-6">
          <div className="flex gap-2">
            <span className="text-sm text-muted-text self-center">Theme:</span>
            <button
              onClick={() => setTheme('dark')}
              className={`px-3 py-1 rounded text-sm font-bold ${
                theme === 'dark'
                  ? 'bg-node-volt text-dark'
                  : 'bg-tech-grey text-muted-text'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`px-3 py-1 rounded text-sm font-bold ${
                theme === 'light'
                  ? 'bg-node-volt text-dark'
                  : 'bg-tech-grey text-muted-text'
              }`}
            >
              Light
            </button>
          </div>

          <div className="flex gap-2">
            <span className="text-sm text-muted-text self-center">Format:</span>
            <button
              onClick={() => setFormat('story')}
              className={`px-3 py-1 rounded text-sm font-bold ${
                format === 'story'
                  ? 'bg-node-volt text-dark'
                  : 'bg-tech-grey text-muted-text'
              }`}
            >
              Story
            </button>
            <button
              onClick={() => setFormat('post')}
              className={`px-3 py-1 rounded text-sm font-bold ${
                format === 'post'
                  ? 'bg-node-volt text-dark'
                  : 'bg-tech-grey text-muted-text'
              }`}
            >
              Post
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex justify-center mb-6">
          <AchievementPost
            achievement={achievementData}
            user={userData}
            theme={theme}
            format={format}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-tech-grey text-text-white font-bold rounded-lg hover:bg-tech-grey/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              // Trigger download from AchievementPost component
              // This is a workaround - in a real implementation, we'd expose the download function
              const event = new CustomEvent('download-achievement');
              window.dispatchEvent(event);
            }}
            className="px-6 py-3 bg-node-volt text-dark font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            Download {format === 'story' ? 'Story' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}

