'use client';

import { useEffect } from 'react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useDeckAnimations } from '@/hooks/useDeckAnimations';

interface StationIndicatorProps {
  totalStations: number;
  activeStation: number; // 0-indexed
  currentRound: number;
  totalRounds: number;
  nextStation?: number;
  stationNames?: string[];
}

export function StationIndicator({
  totalStations,
  activeStation,
  currentRound,
  totalRounds,
  nextStation,
  stationNames = [],
}: StationIndicatorProps) {
  const { config, isMobile } = useResponsiveLayout();
  const { triggerPulse } = useDeckAnimations();

  // Trigger pulse when station changes
  useEffect(() => {
    triggerPulse(500);
  }, [activeStation, triggerPulse]);

  const getStationName = (index: number) => {
    return stationNames[index] || `Station ${index + 1}`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Round Progress - Hidden on Mobile */}
      {!isMobile && (
        <div className="text-center">
          <div className="text-muted-text text-sm mb-2 uppercase tracking-wider">Round Progress</div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="text-3xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {currentRound} / {totalRounds}
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full max-w-md mx-auto h-2 bg-panel/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-node-volt transition-all duration-500"
              style={{ width: `${(currentRound / totalRounds) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Next Station Preview - Hidden on Mobile */}
      {!isMobile && nextStation !== undefined && nextStation !== activeStation && (
        <div className="text-center mt-4 p-4 bg-panel/50 rounded-lg thin-border">
          <div className="text-muted-text text-sm mb-1 uppercase tracking-wider">Next Station</div>
          <div className="text-xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            {getStationName(nextStation)}
          </div>
        </div>
      )}
    </div>
  );
}


