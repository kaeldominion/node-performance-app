'use client';

import { useState, useEffect } from 'react';
import { WorkoutTimer } from './WorkoutTimer';
import ArchetypeBadge from './ArchetypeBadge';
import TierBadge from './TierBadge';

interface WorkoutDeckSlideProps {
  section: any;
  workout: any;
  onComplete: () => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function WorkoutDeckSlide({
  section,
  workout,
  onComplete,
  onNext,
  onPrevious,
  isFirst,
  isLast,
}: WorkoutDeckSlideProps) {
  const [selectedTier, setSelectedTier] = useState<'SILVER' | 'GOLD' | 'BLACK'>('GOLD');
  const [timerComplete, setTimerComplete] = useState(false);

  // Section-specific rendering
  const renderSectionContent = () => {
    switch (section.type) {
      case 'WARMUP':
      case 'COOLDOWN':
        return (
          <div className="text-center space-y-8 max-w-4xl">
            <div className="space-y-6">
              {section.blocks.map((block: any, idx: number) => (
                <div
                  key={block.id || idx}
                  className="bg-panel/50 backdrop-blur-sm thin-border rounded-lg p-8"
                >
                  <div className="flex items-center justify-center gap-4 mb-4">
                    {block.label && (
                      <span className="text-node-volt font-mono text-3xl font-bold">
                        {block.label}
                      </span>
                    )}
                    <h3 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      {block.exerciseName}
                    </h3>
                  </div>
                  {block.description && (
                    <p className="text-muted-text text-xl mb-4">{block.description}</p>
                  )}
                  {block.repScheme && (
                    <div className="text-2xl text-node-volt font-bold">{block.repScheme}</div>
                  )}
                  {renderTierPrescriptions(block)}
                </div>
              ))}
            </div>
          </div>
        );

      case 'EMOM':
        return (
          <div className="text-center space-y-8 max-w-6xl">
            <WorkoutTimer
              type="EMOM"
              workSec={section.emomWorkSec || 45}
              restSec={section.emomRestSec || 15}
              rounds={section.emomRounds || 12}
              onComplete={() => setTimerComplete(true)}
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {section.blocks.map((block: any, idx: number) => (
                <div
                  key={block.id || idx}
                  className="bg-panel/50 backdrop-blur-sm border-2 thin-border rounded-lg p-6 hover:border-node-volt transition-colors"
                >
                  {block.label && (
                    <div className="text-node-volt font-mono text-2xl font-bold mb-2">
                      {block.label}
                    </div>
                  )}
                  <h4 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {block.exerciseName}
                  </h4>
                  {block.description && (
                    <p className="text-muted-text text-sm mb-3">{block.description}</p>
                  )}
                  {block.repScheme && (
                    <div className="text-xl text-node-volt font-bold mb-3">{block.repScheme}</div>
                  )}
                  {renderTierPrescriptions(block)}
                </div>
              ))}
            </div>
          </div>
        );

      case 'AMRAP':
      case 'CIRCUIT':
      case 'FOR_TIME':
        return (
          <div className="text-center space-y-8 max-w-5xl">
            <WorkoutTimer
              type="COUNTDOWN"
              durationSec={section.durationSec || 720}
              onComplete={() => setTimerComplete(true)}
            />
            <div className="space-y-6">
              {section.blocks.map((block: any, idx: number) => (
                <div
                  key={block.id || idx}
                  className="bg-panel/50 backdrop-blur-sm thin-border rounded-lg p-8"
                >
                  <div className="flex items-center justify-center gap-4 mb-4">
                    {block.label && (
                      <span className="text-node-volt font-mono text-3xl font-bold">
                        {block.label}
                      </span>
                    )}
                    <h3 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      {block.exerciseName}
                    </h3>
                  </div>
                  {block.description && (
                    <p className="text-muted-text text-xl mb-4">{block.description}</p>
                  )}
                  {block.repScheme && (
                    <div className="text-2xl text-node-volt font-bold mb-4">{block.repScheme}</div>
                  )}
                  {renderTierPrescriptions(block)}
                </div>
              ))}
            </div>
          </div>
        );

      case 'INTERVAL':
        return (
          <div className="text-center space-y-8 max-w-5xl">
            <WorkoutTimer
              type="INTERVAL"
              workSec={section.intervalWorkSec || 20}
              restSec={section.intervalRestSec || 100}
              rounds={section.intervalRounds || 8}
              onComplete={() => setTimerComplete(true)}
            />
            <div className="space-y-6">
              {section.blocks.map((block: any, idx: number) => (
                <div
                  key={block.id || idx}
                  className="bg-panel/50 backdrop-blur-sm thin-border rounded-lg p-8 border-l-4 border-node-volt"
                >
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <h3 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      {block.exerciseName}
                    </h3>
                  </div>
                  {block.description && (
                    <p className="text-muted-text text-xl mb-4">{block.description}</p>
                  )}
                  <div className="text-lg text-node-volt font-bold mb-4">
                    {section.intervalWorkSec}s MAX EFFORT / {section.intervalRestSec}s REST
                  </div>
                  {block.repScheme && (
                    <div className="text-2xl text-node-volt font-bold mb-4">{block.repScheme}</div>
                  )}
                  {renderTierPrescriptions(block)}
                </div>
              ))}
            </div>
          </div>
        );

      case 'WAVE':
        return (
          <div className="text-center space-y-8 max-w-5xl">
            <div className="space-y-6">
              {section.blocks.map((block: any, idx: number) => (
                <div
                  key={block.id || idx}
                  className="bg-panel/50 backdrop-blur-sm thin-border rounded-lg p-8"
                >
                  <div className="flex items-center justify-center gap-4 mb-4">
                    {block.label && (
                      <span className="text-node-volt font-mono text-3xl font-bold">
                        {block.label}
                      </span>
                    )}
                    <h3 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      {block.exerciseName}
                    </h3>
                  </div>
                  {block.description && (
                    <p className="text-muted-text text-xl mb-4">{block.description}</p>
                  )}
                  {block.repScheme && (
                    <div className="text-2xl text-node-volt font-bold mb-4">{block.repScheme}</div>
                  )}
                  {renderTierPrescriptions(block)}
                </div>
              ))}
            </div>
          </div>
        );

      case 'SUPERSET':
        const pairs: any[][] = [];
        for (let i = 0; i < section.blocks.length; i += 2) {
          pairs.push(section.blocks.slice(i, i + 2));
        }
        return (
          <div className="text-center space-y-8 max-w-6xl">
            <div className="space-y-8">
              {pairs.map((pair, pairIdx) => (
                <div
                  key={pairIdx}
                  className="bg-panel/50 backdrop-blur-sm border-2 border-node-volt rounded-lg p-8"
                >
                  <div className="grid grid-cols-2 gap-8">
                    {pair.map((block, idx) => (
                      <div key={block.id || idx} className="bg-panel/50 thin-border rounded-lg p-6">
                        <div className="text-center mb-4">
                          <span className="text-node-volt font-mono text-3xl font-bold">
                            {block.label || (idx === 0 ? 'A' : 'B')}
                          </span>
                        </div>
                        <h4 className="text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                          {block.exerciseName}
                        </h4>
                        {block.description && (
                          <p className="text-muted-text mb-3">{block.description}</p>
                        )}
                        {block.repScheme && (
                          <div className="text-xl text-node-volt font-bold mb-3">{block.repScheme}</div>
                        )}
                        {renderTierPrescriptions(block)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <p className="text-muted-text text-xl">Section content</p>
          </div>
        );
    }
  };

  const renderTierPrescriptions = (block: any) => {
    if (!block.tierSilver && !block.tierGold && !block.tierBlack) return null;

    return (
      <div className="mt-6 flex justify-center gap-3">
        {block.tierSilver && (
          <div
            className={`px-4 py-2 rounded-lg border transition-all cursor-pointer ${
              selectedTier === 'SILVER'
                ? 'bg-node-volt/20 border-node-volt'
                : 'bg-panel thin-border'
            }`}
            onClick={() => setSelectedTier('SILVER')}
          >
            <div className="text-xs text-muted-text mb-1">SILVER</div>
            <div className="text-sm font-medium">
              {block.tierSilver.load || block.tierSilver.targetReps}
            </div>
          </div>
        )}
        {block.tierGold && (
          <div
            className={`px-4 py-2 rounded-lg border transition-all cursor-pointer ${
              selectedTier === 'GOLD'
                ? 'bg-node-volt/20 border-node-volt'
                : 'bg-panel thin-border'
            }`}
            onClick={() => setSelectedTier('GOLD')}
          >
            <div className="text-xs text-muted-text mb-1">GOLD</div>
            <div className="text-sm font-medium">
              {block.tierGold.load || block.tierGold.targetReps}
            </div>
          </div>
        )}
        {block.tierBlack && (
          <div
            className={`px-4 py-2 rounded-lg border transition-all cursor-pointer ${
              selectedTier === 'BLACK'
                ? 'bg-node-volt/20 border-node-volt'
                : 'bg-panel thin-border'
            }`}
            onClick={() => setSelectedTier('BLACK')}
          >
            <div className="text-xs text-muted-text mb-1">BLACK</div>
            <div className="text-sm font-medium text-node-volt">
              {block.tierBlack.load || block.tierBlack.targetReps}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center space-y-12 animate-fadeIn">
      {/* Section Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <h1 className="text-6xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)', letterSpacing: '-0.02em' }}>
            {section.title}
          </h1>
          {workout.archetype && (
            <ArchetypeBadge archetype={workout.archetype} size="lg" />
          )}
        </div>
        {section.note && (
          <p className="text-muted-text text-2xl max-w-3xl mx-auto italic">{section.note}</p>
        )}
      </div>

      {/* Section Content */}
      <div className="w-full">{renderSectionContent()}</div>

      {/* Navigation */}
      <div className="flex items-center gap-4">
        {!isFirst && (
          <button
            onClick={onPrevious}
            className="bg-panel/80 backdrop-blur-sm thin-border text-text-white px-6 py-3 rounded-lg hover:bg-panel transition-colors font-medium"
          >
            ← Previous
          </button>
        )}
        {timerComplete || section.type === 'WARMUP' || section.type === 'COOLDOWN' || section.type === 'WAVE' ? (
          <button
            onClick={isLast ? onComplete : onNext}
            className="bg-node-volt text-dark font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity text-lg"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            {isLast ? 'Complete Workout' : 'Next →'}
          </button>
        ) : null}
      </div>
    </div>
  );
}

