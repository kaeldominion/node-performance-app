'use client';

import { useRef } from 'react';
import { Icons } from '@/lib/iconMapping';

interface ShareableStatsCardProps {
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
  onDownload?: () => void;
}

export function ShareableStatsCard({ stats, onDownload }: ShareableStatsCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current || !onDownload) return;
    
    // Use html2canvas or similar library to convert to image
    // For now, we'll just call the callback
    onDownload();
  };

  return (
    <div
      ref={cardRef}
      className="relative w-full max-w-2xl mx-auto bg-gradient-to-br from-deep-asphalt via-concrete-grey to-deep-asphalt border-4 border-node-volt p-8 rounded-xl"
      style={{ aspectRatio: '16/9' }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid-overlay" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-node-volt text-xs uppercase tracking-[0.3em] font-heading mb-2">NØDE OS</div>
            <h2 className="text-3xl font-bold text-text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {stats.name}
            </h2>
            <div className="text-muted-text text-sm mt-1">
              Level {stats.level} • {stats.xp.toLocaleString()} XP
            </div>
          </div>
          <div className="w-20 h-20 rounded-full bg-node-volt/20 border-4 border-node-volt flex items-center justify-center text-3xl font-bold text-node-volt">
            {stats.name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 flex-1">
          <div className="bg-panel/50 thin-border rounded-lg p-4">
            <div className="text-muted-text text-xs uppercase tracking-[0.2em] font-heading mb-1">Sessions</div>
            <div className="text-2xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {stats.totalSessions}
            </div>
            <div className="text-xs text-muted-text mt-1">{Math.round(stats.totalHours)} hours</div>
          </div>
          <div className="bg-panel/50 thin-border rounded-lg p-4">
            <div className="text-muted-text text-xs uppercase tracking-[0.2em] font-heading mb-1">Sessions/Wk</div>
            <div className="text-2xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {stats.sessionsPerWeek.toFixed(1)}
            </div>
            <div className="text-xs text-muted-text mt-1">Last 30 days</div>
          </div>
          <div className="bg-panel/50 thin-border rounded-lg p-4">
            <div className="text-muted-text text-xs uppercase tracking-[0.2em] font-heading mb-1">Avg Intensity</div>
            <div className="text-2xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {stats.avgRPE.toFixed(1)}
            </div>
            <div className="text-xs text-muted-text mt-1">RPE average</div>
          </div>
          <div className="bg-panel/50 thin-border rounded-lg p-4">
            <div className="text-muted-text text-xs uppercase tracking-[0.2em] font-heading mb-1">Streak</div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                {stats.streak}
              </div>
              {stats.streak >= 7 && Icons.STREAK && (
                <Icons.STREAK size={20} className="text-node-volt" />
              )}
            </div>
            <div className="text-xs text-muted-text mt-1">days in a row</div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between text-xs text-muted-text">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-node-volt text-black font-bold flex items-center justify-center" style={{ color: '#000000' }}>
              Ø
            </div>
            <span>NØDE OS</span>
          </div>
          <div>nodeos.app</div>
        </div>
      </div>
    </div>
  );
}

