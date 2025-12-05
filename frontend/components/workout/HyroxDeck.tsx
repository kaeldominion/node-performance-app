'use client';

import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { DeckTimer } from './DeckTimer';
import { StationIndicator } from './StationIndicator';
import { ExerciseCard } from './ExerciseCard';

interface HyroxDeckProps {
  section: any;
  currentRound?: number;
  activeStation?: number;
  onPhaseChange?: (phase: 'work' | 'rest', round: number) => void;
}

export function HyroxDeck({ section, currentRound = 1, activeStation = 0, onPhaseChange }: HyroxDeckProps) {
  const { config, getExerciseGridColumns } = useResponsiveLayout();

  // HYROX typically has 8 stations
  const totalStations = section.blocks?.length || 8;
  const stationNames = section.blocks?.map((b: any) => b.exerciseName) || [];

  return (
    <div className="w-full space-y-8">
      {/* HYROX Branding Header */}
      <div className="text-center mb-8">
        <div
          className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2"
          style={{
            fontFamily: 'var(--font-space-grotesk)',
            color: '#ff0000', // HYROX red
            textShadow: '0 0 20px rgba(255, 0, 0, 0.5)',
          }}
        >
          HYROX
        </div>
        {section.note && (
          <p className="text-muted-text text-lg max-w-2xl mx-auto">{section.note}</p>
        )}
      </div>

      {/* Timer Section */}
      {section.type === 'EMOM' && (
        <div className="mb-8">
          <DeckTimer
            type="EMOM"
            workSec={section.emomWorkSec || 45}
            restSec={section.emomRestSec || 15}
            rounds={section.emomRounds || 12}
            onPhaseChange={onPhaseChange}
            autoStart={false}
            showPreCountdown={true}
          />
        </div>
      )}

      {/* Station Indicator - Large for HYROX */}
      <div className="mb-8">
        <StationIndicator
          totalStations={totalStations}
          activeStation={activeStation}
          currentRound={currentRound}
          totalRounds={section.emomRounds || 12}
          nextStation={(activeStation + 1) % totalStations}
          stationNames={stationNames}
        />
      </div>

      {/* Exercise Cards - Optimized for 8-station format */}
      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: `repeat(${getExerciseGridColumns('EMOM')}, 1fr)`,
        }}
      >
        {section.blocks?.map((block: any, idx: number) => (
          <ExerciseCard
            key={block.id || idx}
            block={block}
            isActive={idx === activeStation}
          />
        ))}
      </div>

      {/* Pacing Guidance (if available) */}
      {section.pacingGuidance && (
        <div className="mt-8 p-6 bg-red-500/10 border-2 border-red-500/50 rounded-lg">
          <div className="text-red-400 font-bold text-lg mb-2">Pacing Guidance</div>
          <p className="text-text-white">{section.pacingGuidance}</p>
        </div>
      )}
    </div>
  );
}

