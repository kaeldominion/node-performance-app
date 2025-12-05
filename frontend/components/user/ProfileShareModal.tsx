'use client';

import { useRef, useState } from 'react';
import { Icons } from '@/lib/iconMapping';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    name: string;
    username?: string;
    level: number;
    xp: number;
    stats?: {
      totalSessions: number;
      totalHours: number;
      avgRPE: number;
      streak: number;
      sessionsPerWeek: number;
    };
  };
}

export function ProfileShareModal({ isOpen, onClose, profile }: ProfileShareModalProps) {
  const storyRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!storyRef.current) return;

    try {
      setDownloading(true);
      
      // Dynamic import of html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      const bgColor = theme === 'dark' ? '#0a0a0a' : '#ffffff';
      
      const canvas = await html2canvas(storyRef.current, {
        width: 1080,
        height: 1920,
        scale: 2, // Higher quality
        backgroundColor: bgColor,
        useCORS: true,
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `node-profile-${profile.username || profile.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to download story:', error);
      alert('Failed to download story. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const textColor = theme === 'dark' ? '#ffffff' : '#000000';
  const mutedColor = theme === 'dark' ? '#b0b0b0' : '#666666';
  const borderColor = theme === 'dark' ? '#333333' : '#e5e5e5';
  const bgColor = theme === 'dark' ? '#0a0a0a' : '#ffffff';
  const panelColor = theme === 'dark' ? '#1a1a1a' : '#f5f5f5';
  const nodeVolt = '#ccff00';

  const stats = profile.stats || {
    totalSessions: 0,
    totalHours: 0,
    avgRPE: 0,
    streak: 0,
    sessionsPerWeek: 0,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative bg-panel thin-border rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Share My Profile
          </h2>
          <button
            onClick={onClose}
            className="text-muted-text hover:text-text-white transition-colors"
          >
            <Icons.X size={24} />
          </button>
        </div>

        {/* Theme Selector */}
        <div className="flex gap-4 mb-6">
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-text">Theme:</span>
            <button
              onClick={() => setTheme('dark')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                theme === 'dark'
                  ? 'bg-node-volt text-dark shadow-lg'
                  : 'bg-tech-grey text-muted-text hover:bg-tech-grey/80'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                theme === 'light'
                  ? 'bg-node-volt text-dark shadow-lg'
                  : 'bg-tech-grey text-muted-text hover:bg-tech-grey/80'
              }`}
            >
              Light
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex justify-center mb-6">
          <div
            key={theme}
            ref={storyRef}
            className="relative overflow-hidden"
            style={{
              width: '270px', // 1080 / 4 for preview
              height: '480px', // 1920 / 4 for preview
              aspectRatio: '9/16',
              backgroundColor: bgColor,
              border: `4px solid ${nodeVolt}`,
            }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="grid-overlay" />
            </div>

            {/* Full Screen Profile Section - Top Half */}
            <div 
              className="absolute top-0 left-0 right-0 flex flex-col items-center justify-center text-center p-6"
              style={{
                height: '50%',
                background: theme === 'dark' 
                  ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 50%, #ffffff 100%)',
              }}
            >
              {/* Header */}
              <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
                <div 
                  className="w-12 h-12 flex items-center justify-center text-xl font-bold rounded-lg" 
                  style={{ 
                    backgroundColor: nodeVolt,
                    color: '#000000'
                  }}
                >
                  Ø
                </div>
                <div 
                  className="text-[8px] uppercase tracking-[0.3em] font-heading"
                  style={{ color: nodeVolt }}
                >
                  NØDE OS
                </div>
              </div>

              {/* Profile Picture / Initial - Larger */}
              <div 
                className="w-32 h-32 rounded-full border-4 flex items-center justify-center text-5xl font-bold mb-6"
                style={{
                  backgroundColor: `${nodeVolt}33`,
                  borderColor: nodeVolt,
                  color: nodeVolt,
                  boxShadow: `0 0 40px ${nodeVolt}40`,
                }}
              >
                {profile.name.charAt(0).toUpperCase()}
              </div>
              
              {/* Name - Better text handling */}
              <h2 
                className="text-3xl font-bold mb-2 px-4 break-words"
                style={{
                  fontFamily: 'var(--font-space-grotesk)',
                  color: textColor,
                  maxWidth: '100%',
                  wordBreak: 'break-word',
                  lineHeight: '1.2',
                }}
              >
                {profile.name}
              </h2>
              
              {/* Username - Better text handling */}
              {profile.username && (
                <div 
                  className="text-base mb-3 px-4 break-all"
                  style={{
                    color: mutedColor,
                    fontFamily: 'var(--font-manrope)',
                    maxWidth: '100%',
                    wordBreak: 'break-all',
                  }}
                >
                  @{profile.username}
                </div>
              )}
              
              {/* Level & XP */}
              <div 
                className="text-lg mb-8"
                style={{
                  color: mutedColor,
                  fontFamily: 'var(--font-manrope)',
                }}
              >
                Level {profile.level} • {profile.xp.toLocaleString()} XP
              </div>
            </div>

            {/* Stats Section - Bottom Half with Fade */}
            <div 
              className="absolute bottom-0 left-0 right-0"
              style={{
                height: '50%',
                background: theme === 'dark'
                  ? `linear-gradient(to top, ${bgColor} 0%, ${bgColor} 40%, transparent 100%)`
                  : `linear-gradient(to top, ${bgColor} 0%, ${bgColor} 40%, transparent 100%)`,
              }}
            >
              {/* Fade overlay - smoother transition */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: theme === 'dark'
                    ? 'linear-gradient(to top, rgba(10, 10, 10, 1) 0%, rgba(10, 10, 10, 0.95) 20%, rgba(10, 10, 10, 0.7) 40%, rgba(10, 10, 10, 0.3) 60%, transparent 80%)'
                    : 'linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.95) 20%, rgba(255, 255, 255, 0.7) 40%, rgba(255, 255, 255, 0.3) 60%, transparent 80%)',
                }}
              />

              {/* Stats Content - Positioned at bottom */}
              <div className="relative z-10 h-full flex flex-col justify-end pb-8 px-6">
                {/* Key Stats */}
                <div className="grid grid-cols-2 gap-3 w-full">
                  <div 
                    className="rounded-lg p-4 text-center border backdrop-blur-sm"
                    style={{
                      backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(245, 245, 245, 0.8)',
                      borderColor: borderColor,
                    }}
                  >
                    <div 
                      className="text-[8px] uppercase tracking-[0.2em] font-heading mb-2"
                      style={{ color: mutedColor }}
                    >
                      Sessions
                    </div>
                    <div 
                      className="text-2xl font-bold"
                      style={{
                        color: nodeVolt,
                        fontFamily: 'var(--font-space-grotesk)',
                      }}
                    >
                      {stats.totalSessions}
                    </div>
                  </div>
                  <div 
                    className="rounded-lg p-4 text-center border backdrop-blur-sm"
                    style={{
                      backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(245, 245, 245, 0.8)',
                      borderColor: borderColor,
                    }}
                  >
                    <div 
                      className="text-[8px] uppercase tracking-[0.2em] font-heading mb-2"
                      style={{ color: mutedColor }}
                    >
                      Streak
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <div 
                        className="text-2xl font-bold"
                        style={{
                          color: nodeVolt,
                          fontFamily: 'var(--font-space-grotesk)',
                        }}
                      >
                        {stats.streak}
                      </div>
                      {stats.streak >= 7 && Icons.STREAK && (
                        <Icons.STREAK size={18} style={{ color: nodeVolt }} />
                      )}
                    </div>
                  </div>
                  <div 
                    className="rounded-lg p-4 text-center border backdrop-blur-sm"
                    style={{
                      backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(245, 245, 245, 0.8)',
                      borderColor: borderColor,
                    }}
                  >
                    <div 
                      className="text-[8px] uppercase tracking-[0.2em] font-heading mb-2"
                      style={{ color: mutedColor }}
                    >
                      Intensity
                    </div>
                    <div 
                      className="text-2xl font-bold"
                      style={{
                        color: nodeVolt,
                        fontFamily: 'var(--font-space-grotesk)',
                      }}
                    >
                      {stats.avgRPE > 0 ? stats.avgRPE.toFixed(1) : '—'}
                    </div>
                  </div>
                  <div 
                    className="rounded-lg p-4 text-center border backdrop-blur-sm"
                    style={{
                      backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(245, 245, 245, 0.8)',
                      borderColor: borderColor,
                    }}
                  >
                    <div 
                      className="text-[8px] uppercase tracking-[0.2em] font-heading mb-2"
                      style={{ color: mutedColor }}
                    >
                      Per Week
                    </div>
                    <div 
                      className="text-2xl font-bold"
                      style={{
                        color: nodeVolt,
                        fontFamily: 'var(--font-space-grotesk)',
                      }}
                    >
                      {stats.sessionsPerWeek > 0 ? stats.sessionsPerWeek.toFixed(1) : '—'}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div 
                  className="text-center text-[8px] mt-6"
                  style={{ color: mutedColor }}
                >
                  nodeos.app
                </div>
              </div>
            </div>
          </div>
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
            onClick={handleDownload}
            disabled={downloading}
            className="px-6 py-3 bg-node-volt text-dark font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {downloading ? 'Generating...' : 'Download Story'}
          </button>
        </div>
      </div>
    </div>
  );
}

