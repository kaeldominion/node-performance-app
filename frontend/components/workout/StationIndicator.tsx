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
      {/* Round Progress */}
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

      {/* Station Grid */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(totalStations, isMobile ? 2 : 4)}, 1fr)` }}>
        {Array.from({ length: totalStations }).map((_, idx) => {
          const isActive = idx === activeStation;
          const isNext = idx === nextStation;
          
          return (
            <div
              key={idx}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-300
                ${isActive
                  ? 'bg-node-volt/20 border-node-volt scale-105 animate-pulse-glow'
                  : isNext
                  ? 'bg-panel/50 border-node-volt/50'
                  : 'bg-panel/30 border-border'
                }
              `}
            >
              {/* Station Number */}
              <div className="text-center mb-2">
                <div
                  className={`font-bold ${isActive ? 'text-node-volt' : 'text-muted-text'}`}
                  style={{
                    fontFamily: 'var(--font-space-grotesk)',
                    fontSize: isActive ? '2rem' : '1.5rem',
                  }}
                >
                  {idx + 1}
                </div>
              </div>

              {/* Station Name */}
              {stationNames[idx] && (
                <div className="text-center">
                  <div
                    className={`text-sm font-medium ${isActive ? 'text-text-white' : 'text-muted-text'}`}
                    style={{
                      fontFamily: 'var(--font-space-grotesk)',
                    }}
                  >
                    {getStationName(idx)}
                  </div>
                </div>
              )}

              {/* Active Indicator */}
              {isActive && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-node-volt rounded-full animate-pulse" />
              )}

              {/* Next Indicator */}
              {isNext && !isActive && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-node-volt/50 rounded-full" />
              )}
            </div>
          );
        })}
      </div>

      {/* Next Station Preview */}
      {nextStation !== undefined && nextStation !== activeStation && (
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


