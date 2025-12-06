'use client';

import { useRef, useState, useEffect } from 'react';
import { Icons } from '@/lib/iconMapping';
import { workoutsApi } from '@/lib/api';
import { copyToClipboard } from '@/lib/clipboard';
import ArchetypeBadge from './ArchetypeBadge';
import dynamic from 'next/dynamic';

const QRCodeSVG = dynamic(() => import('qrcode.react').then((mod) => mod.QRCodeSVG), {
  ssr: false,
});

interface WorkoutShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: {
    id: string;
    name: string;
    displayCode?: string;
    archetype?: string;
    description?: string;
    sections?: any[];
    averageRating?: number | null;
    ratingCount?: number;
  };
}

export function WorkoutShareModal({ isOpen, onClose, workout }: WorkoutShareModalProps) {
  const storyRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [shareUrl, setShareUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadShareLink();
    }
  }, [isOpen, workout.id]);

  const loadShareLink = async () => {
    try {
      setLoading(true);
      const shareData = await workoutsApi.generateShareLink(workout.id);
      // Use the shareUrl from the backend, or construct it from shareId
      if (shareData.shareUrl) {
        setShareUrl(shareData.shareUrl);
      } else if (shareData.shareId) {
        // Ensure shareId has the correct format for the frontend route
        const shareId = shareData.shareId.startsWith('share_') 
          ? shareData.shareId 
          : `share_${shareData.shareId}`;
        setShareUrl(`${window.location.origin}/workouts/${shareId}`);
      } else {
        setShareUrl(`${window.location.origin}/workouts/${workout.id}`);
      }
    } catch (error) {
      console.error('Failed to generate share link:', error);
      // Fallback to a basic URL if API fails
      setShareUrl(`${window.location.origin}/workouts/${workout.id}`);
    } finally {
      setLoading(false);
    }
  };

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
      link.download = `node-workout-${workout.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to download story:', error);
      alert('Failed to download story. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await copyToClipboard(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      alert('Failed to copy link. Please try again.');
    }
  };

  if (!isOpen) return null;

  const textColor = theme === 'dark' ? '#ffffff' : '#000000';
  const mutedColor = theme === 'dark' ? '#b0b0b0' : '#666666';
  const borderColor = theme === 'dark' ? '#333333' : '#e5e5e5';
  const bgColor = theme === 'dark' ? '#0a0a0a' : '#ffffff';
  const panelColor = theme === 'dark' ? '#1a1a1a' : '#f5f5f5';
  const nodeVolt = '#ccff00';

  const totalSections = workout.sections?.length || 0;
  const totalExercises = workout.sections?.reduce((acc, section) => acc + (section.blocks?.length || 0), 0) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative bg-panel thin-border rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Share Workout
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

            {/* Full Screen Workout Section - Top Half */}
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

              {/* Workout Code */}
              {workout.displayCode && (
                <div 
                  className="text-base mb-3 font-mono"
                  style={{ color: nodeVolt }}
                >
                  {workout.displayCode}
                </div>
              )}

              {/* Archetype Badge */}
              {workout.archetype && (
                <div className="mb-4">
                  <div 
                    className="inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${nodeVolt}33`,
                      color: nodeVolt,
                      border: `1px solid ${nodeVolt}`,
                    }}
                  >
                    {workout.archetype}
                  </div>
                </div>
              )}
              
              {/* Workout Name */}
              <h2 
                className="text-2xl font-bold mb-3 px-4 break-words"
                style={{
                  fontFamily: 'var(--font-space-grotesk)',
                  color: textColor,
                  maxWidth: '100%',
                  wordBreak: 'break-word',
                  lineHeight: '1.2',
                }}
              >
                {workout.name}
              </h2>
              
              {/* Description */}
              {workout.description && (
                <div 
                  className="text-xs mb-4 px-4 break-words"
                  style={{
                    color: mutedColor,
                    fontFamily: 'var(--font-manrope)',
                    maxWidth: '100%',
                    wordBreak: 'break-word',
                  }}
                >
                  {workout.description}
                </div>
              )}
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
              {/* Fade overlay */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: theme === 'dark'
                    ? 'linear-gradient(to top, rgba(10, 10, 10, 1) 0%, rgba(10, 10, 10, 0.95) 20%, rgba(10, 10, 10, 0.7) 40%, rgba(10, 10, 10, 0.3) 60%, transparent 80%)'
                    : 'linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.95) 20%, rgba(255, 255, 255, 0.7) 40%, rgba(255, 255, 255, 0.3) 60%, transparent 80%)',
                }}
              />

              {/* Stats Content */}
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
                      Sections
                    </div>
                    <div 
                      className="text-2xl font-bold"
                      style={{
                        color: nodeVolt,
                        fontFamily: 'var(--font-space-grotesk)',
                      }}
                    >
                      {totalSections}
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
                      Exercises
                    </div>
                    <div 
                      className="text-2xl font-bold"
                      style={{
                        color: nodeVolt,
                        fontFamily: 'var(--font-space-grotesk)',
                      }}
                    >
                      {totalExercises}
                    </div>
                  </div>
                  {workout.averageRating !== null && workout.averageRating !== undefined && workout.ratingCount !== undefined && workout.ratingCount > 0 && (
                    <>
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
                          Rating
                        </div>
                        <div 
                          className="text-2xl font-bold"
                          style={{
                            color: nodeVolt,
                            fontFamily: 'var(--font-space-grotesk)',
                          }}
                        >
                          {workout.averageRating.toFixed(1)}
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
                          Reviews
                        </div>
                        <div 
                          className="text-2xl font-bold"
                          style={{
                            color: nodeVolt,
                            fontFamily: 'var(--font-space-grotesk)',
                          }}
                        >
                          {workout.ratingCount}
                        </div>
                      </div>
                    </>
                  )}
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

        {/* Share Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* QR Code */}
          <div className="bg-panel thin-border rounded-lg p-6 text-center">
            <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Scan to View
            </h3>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="text-muted-text">Loading...</div>
              </div>
            ) : (
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG value={shareUrl} size={200} />
                </div>
              </div>
            )}
            <p className="text-xs text-muted-text">
              Scan with your phone to view this workout
            </p>
          </div>

          {/* Workout Info */}
          <div className="bg-panel thin-border rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Workout Details
            </h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-muted-text mb-1">Name</div>
                <div className="text-text-white font-medium">{workout.name}</div>
              </div>
              {workout.displayCode && (
                <div>
                  <div className="text-xs text-muted-text mb-1">Code</div>
                  <div className="text-node-volt font-mono">{workout.displayCode}</div>
                </div>
              )}
              {workout.archetype && (
                <div>
                  <div className="text-xs text-muted-text mb-1">Archetype</div>
                  <ArchetypeBadge archetype={workout.archetype} size="sm" />
                </div>
              )}
              <div>
                <div className="text-xs text-muted-text mb-1">Sections</div>
                <div className="text-text-white">{totalSections} sections • {totalExercises} exercises</div>
              </div>
              {workout.averageRating !== null && workout.averageRating !== undefined && workout.ratingCount !== undefined && workout.ratingCount > 0 && (
                <div>
                  <div className="text-xs text-muted-text mb-1">Rating</div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Icons.STAR
                          key={i}
                          size={14}
                          className={i < Math.round(workout.averageRating!) ? 'text-yellow-400 fill-current' : 'text-muted-text'}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-text-white">
                      {workout.averageRating.toFixed(1)} ({workout.ratingCount} {workout.ratingCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-tech-grey text-text-white font-bold rounded-lg hover:bg-tech-grey/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCopyLink}
            className="flex-1 px-6 py-3 bg-panel thin-border text-text-white font-bold rounded-lg hover:border-node-volt hover:text-node-volt transition-all flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Icons.CHECK size={18} />
                Copied!
              </>
            ) : (
              <>
                <Icons.SHARE size={18} />
                Copy Link
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 px-6 py-3 bg-node-volt text-dark font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Icons.SHARE size={18} />
                Download Story
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

