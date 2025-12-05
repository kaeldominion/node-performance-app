'use client';

import { useState } from 'react';
import { ShareableStatsCard } from './ShareableStatsCard';
import { InstagramStoryGenerator } from './InstagramStoryGenerator';
import { AchievementPost } from '../achievements/AchievementPost';
import { AchievementIcon } from '../achievements/AchievementIcon';
import { Icons } from '@/lib/iconMapping';

interface ShareStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    name: string;
    level: number;
    xp: number;
    totalSessions: number;
    totalHours: number;
    avgRPE: number;
    streak: number;
    sessionsPerWeek: number;
  };
  achievements?: Array<{
    code: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    earnedAt: string;
    value?: number;
  }>;
}

export function ShareStatsModal({ isOpen, onClose, stats, achievements = [] }: ShareStatsModalProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'achievement'>('stats');
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [format, setFormat] = useState<'story' | 'post'>('story');

  if (!isOpen) return null;

  const recentAchievements = achievements
    .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
    .slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative bg-panel thin-border rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Share Your Stats
          </h2>
          <button
            onClick={onClose}
            className="text-muted-text hover:text-text-white transition-colors"
          >
            <Icons.X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'stats'
                ? 'bg-node-volt text-dark'
                : 'bg-tech-grey text-muted-text hover:text-text-white'
            }`}
          >
            Stats
          </button>
          <button
            onClick={() => setActiveTab('achievement')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'achievement'
                ? 'bg-node-volt text-dark'
                : 'bg-tech-grey text-muted-text hover:text-text-white'
            }`}
          >
            Achievements
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

        {/* Content */}
        {activeTab === 'stats' ? (
          <div className="space-y-6">
            <ShareableStatsCard stats={stats} />
            <InstagramStoryGenerator stats={stats} />
          </div>
        ) : (
          <div className="space-y-6">
            {selectedAchievement ? (
              <div>
                <button
                  onClick={() => setSelectedAchievement(null)}
                  className="mb-4 text-node-volt hover:underline flex items-center gap-2"
                >
                  ← Back to Achievements
                </button>
                <AchievementPost
                  achievement={selectedAchievement}
                  user={{ name: stats.name, level: stats.level, xp: stats.xp }}
                  theme={theme}
                  format={format}
                />
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Select an Achievement to Share
                </h3>
                {recentAchievements.length === 0 ? (
                  <p className="text-muted-text text-center py-8">
                    No achievements earned yet. Keep training to unlock achievements!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentAchievements.map((achievement) => (
                      <button
                        key={achievement.code}
                        onClick={() => setSelectedAchievement(achievement)}
                        className="bg-tech-grey thin-border rounded-lg p-4 hover:border-node-volt transition-all text-left"
                      >
                        <div className="flex items-center gap-4">
                          <AchievementIcon
                            icon={achievement.icon}
                            rarity={achievement.rarity}
                            size="md"
                          />
                          <div className="flex-1">
                            <div className="font-bold text-text-white mb-1">{achievement.name}</div>
                            <div className="text-sm text-muted-text">{achievement.description}</div>
                            <div className="text-xs text-muted-text mt-2">
                              {new Date(achievement.earnedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

