'use client';

import { useRef, useState } from 'react';
import { Icons } from '@/lib/iconMapping';

interface InstagramStoryGeneratorProps {
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
}

export function InstagramStoryGenerator({ stats }: InstagramStoryGeneratorProps) {
  const storyRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!storyRef.current) return;

    try {
      setDownloading(true);
      
      // Dynamic import of html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(storyRef.current, {
        width: 1080,
        height: 1920,
        scale: 1,
        backgroundColor: '#0a0a0a',
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = `node-stats-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to download story:', error);
      if (error instanceof Error && error.message.includes('html2canvas')) {
        alert('Please install html2canvas: npm install html2canvas');
      } else {
        alert('Failed to download story. Please try again.');
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div className="flex justify-center">
        <div
          ref={storyRef}
          className="relative bg-gradient-to-br from-deep-asphalt via-concrete-grey to-deep-asphalt border-4 border-node-volt"
          style={{
            width: '270px', // 1080 / 4 for preview
            height: '480px', // 1920 / 4 for preview
            aspectRatio: '9/16',
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
              <div className="w-12 h-12 bg-node-volt text-black font-bold flex items-center justify-center text-xl" style={{ color: '#000000' }}>
                Ø
              </div>
              <div className="text-node-volt text-[8px] uppercase tracking-[0.3em] font-heading">NØDE OS</div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-node-volt/20 border-4 border-node-volt flex items-center justify-center text-3xl font-bold text-node-volt">
                {stats.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-bold text-text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                {stats.name}
              </h2>
              <div className="text-muted-text text-xs">
                Level {stats.level} • {stats.xp.toLocaleString()} XP
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 gap-3 w-full mt-6">
                <div className="bg-panel/50 thin-border rounded-lg p-3 text-center">
                  <div className="text-muted-text text-[8px] uppercase tracking-[0.2em] font-heading mb-1">Sessions</div>
                  <div className="text-xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {stats.totalSessions}
                  </div>
                </div>
                <div className="bg-panel/50 thin-border rounded-lg p-3 text-center">
                  <div className="text-muted-text text-[8px] uppercase tracking-[0.2em] font-heading mb-1">Streak</div>
                  <div className="flex items-center justify-center gap-1">
                    <div className="text-xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      {stats.streak}
                    </div>
                    {stats.streak >= 7 && Icons.STREAK && (
                      <Icons.STREAK size={16} className="text-node-volt" />
                    )}
                  </div>
                </div>
                <div className="bg-panel/50 thin-border rounded-lg p-3 text-center">
                  <div className="text-muted-text text-[8px] uppercase tracking-[0.2em] font-heading mb-1">Intensity</div>
                  <div className="text-xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {stats.avgRPE.toFixed(1)}
                  </div>
                </div>
                <div className="bg-panel/50 thin-border rounded-lg p-3 text-center">
                  <div className="text-muted-text text-[8px] uppercase tracking-[0.2em] font-heading mb-1">Per Week</div>
                  <div className="text-xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {stats.sessionsPerWeek.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-[8px] text-muted-text">
              nodeos.app
            </div>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div className="flex justify-center">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
        >
          {downloading ? 'Generating...' : 'Download Story'}
        </button>
      </div>

    </div>
  );
}

