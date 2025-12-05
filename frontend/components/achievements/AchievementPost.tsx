'use client';

import { useRef, useState, useEffect } from 'react';
import { AchievementIcon } from './AchievementIcon';

interface AchievementPostProps {
  achievement: {
    code: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    earnedAt: string;
    value?: number;
  };
  user: {
    name: string;
    level: number;
    xp: number;
  };
  theme?: 'dark' | 'light';
  format?: 'story' | 'post';
}

export function AchievementPost({ achievement, user, theme = 'dark', format = 'story' }: AchievementPostProps) {
  const postRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  // Listen for download event from share modal
  useEffect(() => {
    const handleDownloadEvent = () => {
      handleDownload();
    };
    window.addEventListener('download-achievement', handleDownloadEvent);
    return () => {
      window.removeEventListener('download-achievement', handleDownloadEvent);
    };
  }, [format, theme, achievement.code]); // Re-setup listener when these change

  const isStory = format === 'story';
  const bgColor = theme === 'dark' ? '#0a0a0a' : '#ffffff';
  const textColor = theme === 'dark' ? '#ffffff' : '#000000';
  const mutedColor = theme === 'dark' ? '#b0b0b0' : '#666666';
  const borderColor = theme === 'dark' ? '#333333' : '#e5e5e5';
  const nodeVolt = '#ccff00';

  const handleDownload = async () => {
    if (!postRef.current) return;

    try {
      setDownloading(true);
      
      // Dynamic import of html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(postRef.current, {
        width: isStory ? 1080 : 1080,
        height: isStory ? 1920 : 1080,
        scale: 2, // Higher quality
        backgroundColor: bgColor,
        useCORS: true,
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `node-achievement-${achievement.code}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to download:', error);
      alert('Failed to download. Please install html2canvas: npm install html2canvas');
    } finally {
      setDownloading(false);
    }
  };

  const rarityLabels = {
    COMMON: 'Common',
    RARE: 'Rare',
    EPIC: 'Epic',
    LEGENDARY: 'Legendary',
  };

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div className="flex justify-center">
        <div
          ref={postRef}
          className="relative border-4"
          style={{
            width: isStory ? '270px' : '405px', // 1080/4 for story, 1080/2.67 for post
            height: isStory ? '480px' : '405px', // 1920/4 for story, 1080/2.67 for post
            aspectRatio: isStory ? '9/16' : '1/1',
            backgroundColor: bgColor,
            borderColor: nodeVolt,
          }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid-overlay" />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-between p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 bg-node-volt text-black font-bold flex items-center justify-center text-sm" style={{ color: '#000000' }}>
                Ø
              </div>
              <div className="text-node-volt text-[8px] uppercase tracking-[0.3em] font-heading">NØDE OS</div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
              {/* Achievement Icon */}
              <AchievementIcon icon={achievement.icon} rarity={achievement.rarity} size={isStory ? 'lg' : 'xl'} />
              
              {/* Achievement Name */}
              <h2
                className="text-2xl font-bold"
                style={{
                  fontFamily: 'var(--font-space-grotesk)',
                  color: textColor,
                }}
              >
                {achievement.name}
              </h2>
              
              {/* Description */}
              <p
                className="text-sm"
                style={{
                  color: mutedColor,
                  fontFamily: 'var(--font-manrope)',
                }}
              >
                {achievement.description}
              </p>

              {/* Rarity Badge */}
              <div
                className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.2em]"
                style={{
                  backgroundColor: achievement.rarity === 'LEGENDARY' ? '#f59e0b' : 
                                  achievement.rarity === 'EPIC' ? '#a855f7' :
                                  achievement.rarity === 'RARE' ? '#3b82f6' : '#6b7280',
                  color: '#ffffff',
                }}
              >
                {rarityLabels[achievement.rarity]}
              </div>

              {/* Value if applicable */}
              {achievement.value !== undefined && (
                <div
                  className="text-lg font-bold"
                  style={{
                    color: nodeVolt,
                    fontFamily: 'var(--font-space-grotesk)',
                  }}
                >
                  {achievement.value}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center space-y-2">
              <div
                className="text-xs"
                style={{
                  color: mutedColor,
                  fontFamily: 'var(--font-manrope)',
                }}
              >
                {user.name} • Level {user.level}
              </div>
              <div
                className="text-[8px]"
                style={{
                  color: mutedColor,
                }}
              >
                nodeos.app
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div className="flex justify-center gap-3">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
        >
          {downloading ? 'Generating...' : `Download ${format === 'story' ? 'Story' : 'Post'}`}
        </button>
      </div>
    </div>
  );
}

