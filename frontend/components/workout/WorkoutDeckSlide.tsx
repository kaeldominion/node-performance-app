'use client';

import { useState, useEffect } from 'react';
import { WorkoutTimer } from './WorkoutTimer';
import ArchetypeBadge from './ArchetypeBadge';
import TierBadge from './TierBadge';
import { Icons } from '@/lib/iconMapping';
import { getTierDisplayValue, isHeavyLift } from './tierDisplayUtils';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { CollapsibleExerciseCard } from './CollapsibleExerciseCard';

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
  const { theme } = useTheme();
  const { isMobile, isTablet } = useResponsiveLayout();
  const [selectedTier, setSelectedTier] = useState<'SILVER' | 'GOLD' | 'BLACK'>('GOLD');
  const [timerComplete, setTimerComplete] = useState(false);

  // Helper to detect erg machines
  const isErgMachine = (exerciseName: string): boolean => {
    const ergPatterns = [/row/i, /bike/i, /ski/i, /erg/i, /assault/i, /echo/i, /airdyne/i];
    return ergPatterns.some(pattern => pattern.test(exerciseName));
  };

  // Helper to detect exercises that should have tier-based values (distance/calories/reps)
  const shouldUseTierBasedValues = (block: any): boolean => {
    const exerciseName = block.exerciseName?.toLowerCase() || '';
    
    // Erg machines always use tier-based distance/calories
    if (isErgMachine(exerciseName)) return true;
    
    // Running exercises
    if (/run|jog|sprint/i.test(exerciseName)) return true;
    
    // Bodyweight exercises that typically scale by reps
    if (/pull.?up|chin.?up|push.?up|press.?up|dip|burpee|sit.?up|crunch/i.test(exerciseName)) return true;
    
    // Check if tiers have different distance/calories/reps
    const hasTierDistance = block.tierSilver?.distance || block.tierGold?.distance || block.tierBlack?.distance;
    const hasTierReps = block.tierSilver?.targetReps || block.tierGold?.targetReps || block.tierBlack?.targetReps;
    
    // If tiers have distance or different reps, use tier-based values
    if (hasTierDistance) return true;
    
    // Check if reps differ between tiers
    if (hasTierReps) {
      const silverReps = block.tierSilver?.targetReps;
      const goldReps = block.tierGold?.targetReps;
      const blackReps = block.tierBlack?.targetReps;
      if (silverReps !== goldReps || goldReps !== blackReps || silverReps !== blackReps) {
        return true;
      }
    }
    
    return false;
  };

  // Helper to check if repScheme should be hidden (when tiers have different values or duplicate info)
  const shouldHideRepScheme = (block: any): boolean => {
    // Hide if exercise should use tier-based values
    if (shouldUseTierBasedValues(block)) return true;
    
    // Hide repScheme if it's "N/A"
    if (block.repScheme === 'N/A' || block.repScheme === 'n/a' || block.repScheme === null || block.repScheme === undefined) {
      return true;
    }
    
    // For heavy lifts, hide repScheme if tiers show weight (% 1RM)
    if (isHeavyLift(block.exerciseName, block, block.tierGold || block.tierSilver || block.tierBlack)) {
      // If tiers show weight, repScheme is redundant
      return true;
    }
    
    // Check if repScheme matches tier reps (duplication)
    if (block.repScheme && (block.tierSilver || block.tierGold || block.tierBlack)) {
      // Extract rep numbers from repScheme (e.g., "8-10" -> [8, 10])
      const repSchemeMatch = block.repScheme.match(/(\d+)(?:-(\d+))?/);
      if (repSchemeMatch) {
        const schemeMin = parseInt(repSchemeMatch[1]);
        const schemeMax = parseInt(repSchemeMatch[2] || repSchemeMatch[1]);
        
        // Check if tier reps match repScheme
        const tierReps = [
          block.tierSilver?.targetReps,
          block.tierGold?.targetReps,
          block.tierBlack?.targetReps,
        ].filter(r => r !== null && r !== undefined);
        
        // If all tier reps are within the repScheme range, hide repScheme
        if (tierReps.length > 0 && tierReps.every(r => r >= schemeMin && r <= schemeMax)) {
          return true;
        }
      }
    }
    
    return false;
  };

  // Section-specific rendering
  const renderSectionContent = () => {
    switch (section.type) {
      case 'WARMUP':
      case 'COOLDOWN':
        return (
          <div className={`text-center max-w-4xl w-full ${isMobile ? 'space-y-4' : 'space-y-6'}`}>
            {/* Timer for WARMUP/COOLDOWN */}
            {section.durationSec && (
              <div className={isMobile ? 'mb-3' : 'mb-4'} style={{ flexShrink: 0 }}>
                <WorkoutTimer
                  type="COUNTDOWN"
                  durationSec={section.durationSec}
                  onComplete={() => setTimerComplete(true)}
                />
                <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-text mt-2`}>
                  {section.type === 'WARMUP' ? 'Warmup Duration' : 'Cooldown Duration'}
                </div>
              </div>
            )}
            <div className={`${isMobile ? 'space-y-3' : 'space-y-4'} w-full`}>
              {section.blocks.map((block: any, idx: number) => (
                <CollapsibleExerciseCard
                  key={`${section.id}-block-${block.id || idx}`}
                  block={block}
                  compact={false}
                />
              ))}
            </div>
          </div>
        );

      case 'EMOM':
        return (
          <div className={`text-center max-w-6xl w-full ${isMobile ? 'space-y-4' : 'space-y-6'}`}>
            <div style={{ flexShrink: 0 }}>
              <WorkoutTimer
                type="EMOM"
                workSec={section.emomWorkSec || 45}
                restSec={section.emomRestSec || 15}
                rounds={section.emomRounds || 12}
                onComplete={() => setTimerComplete(true)}
              />
            </div>
            <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'}`}>
              {section.blocks.map((block: any, idx: number) => (
                <CollapsibleExerciseCard
                  key={`${section.id}-block-${block.id || idx}`}
                  block={block}
                  compact={true}
                />
              ))}
            </div>
          </div>
        );

      case 'AMRAP':
      case 'CIRCUIT':
      case 'FOR_TIME':
        const [showInstructions, setShowInstructions] = useState(!isMobile);
        return (
          <div className={`text-center max-w-5xl w-full ${isMobile ? 'space-y-3' : 'space-y-4'}`}>
            {/* Timer */}
            <div className={isMobile ? 'space-y-2' : 'space-y-3'} style={{ flexShrink: 0 }}>
              <WorkoutTimer
                type="COUNTDOWN"
                durationSec={section.durationSec || 720}
                onComplete={() => setTimerComplete(true)}
              />
              {/* Duration and Rounds Display */}
              <div className={`grid grid-cols-2 ${isMobile ? 'gap-2' : 'gap-3'}`}>
                <div className={`bg-panel/50 backdrop-blur-sm thin-border rounded-lg ${isMobile ? 'px-3 py-2' : 'px-6 py-3'}`}>
                  <div className={`text-muted-text ${isMobile ? 'text-xs' : 'text-sm'} mb-1`}>Duration</div>
                  <div className={`font-bold text-node-volt ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                    {Math.floor((section.durationSec || 720) / 60)}:{(section.durationSec || 720) % 60 < 10 ? '0' : ''}{(section.durationSec || 720) % 60}
                  </div>
                </div>
                {section.rounds && (
                  <div className={`bg-panel/50 backdrop-blur-sm thin-border rounded-lg ${isMobile ? 'px-3 py-2' : 'px-6 py-3'}`}>
                    <div className={`text-muted-text ${isMobile ? 'text-xs' : 'text-sm'} mb-1`}>Rounds</div>
                    <div className={`font-bold text-node-volt ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                      {section.rounds}
                    </div>
                    {section.restBetweenRounds && !isMobile && (
                      <div className="text-xs text-muted-text mt-1">
                        Rest {section.restBetweenRounds}s between rounds
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Instructions Box - Collapsible on Mobile */}
            {section.note && (
              <div className={`bg-node-volt/10 border-2 border-node-volt rounded-lg ${isMobile ? 'p-3' : 'p-4'} text-left`} style={{ flexShrink: 0 }}>
                <button
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="text-node-volt font-bold flex items-center gap-2" style={{ 
                    fontFamily: 'var(--font-space-grotesk)',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                  }}>
                    <Icons.PROGRAMS size={isMobile ? 16 : 20} /> Instructions
                  </div>
                  {isMobile && (
                    <Icons.CHEVRON_DOWN 
                      size={16} 
                      className={`text-node-volt transition-transform ${showInstructions ? 'rotate-180' : ''}`}
                    />
                  )}
                </button>
                {(!isMobile || showInstructions) && (
                  <p className={`text-text-white leading-relaxed whitespace-pre-line mt-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
                    {section.note}
                  </p>
                )}
              </div>
            )}

            {/* Exercise Blocks */}
            <div className={`${isMobile ? 'space-y-3' : 'space-y-4'} w-full`} style={{ flex: '1 1 auto', minHeight: 0, overflow: 'hidden' }}>
              {!isMobile && (
                <div className="text-muted-text text-sm mb-2">
                  {section.rounds 
                    ? `Complete ${section.rounds} rounds. Rest ${section.restBetweenRounds || 30}s between rounds.`
                    : 'Complete exercises in order, then repeat until time expires'
                  }
                </div>
              )}
              {section.blocks.map((block: any, idx: number) => (
                <CollapsibleExerciseCard
                  key={`${section.id}-block-${block.id || idx}`}
                  block={block}
                  compact={false}
                />
              ))}
            </div>
          </div>
        );

      case 'INTERVAL':
        return (
          <div className={`text-center max-w-5xl w-full ${isMobile ? 'space-y-3' : 'space-y-4'}`}>
            <div style={{ flexShrink: 0 }}>
              <WorkoutTimer
                type="INTERVAL"
                workSec={section.intervalWorkSec || 20}
                restSec={section.intervalRestSec || 100}
                rounds={section.intervalRounds || 8}
                onComplete={() => setTimerComplete(true)}
              />
            </div>
            <div className={`${isMobile ? 'space-y-3' : 'space-y-4'} w-full`} style={{ flex: '1 1 auto', minHeight: 0, overflow: 'hidden' }}>
              {section.blocks.map((block: any, idx: number) => (
                <CollapsibleExerciseCard
                  key={`${section.id}-block-${block.id || idx}`}
                  block={{
                    ...block,
                    description: block.description || `${section.intervalWorkSec}s MAX EFFORT / ${section.intervalRestSec}s REST`,
                  }}
                  compact={false}
                />
              ))}
            </div>
          </div>
        );

      case 'WAVE':
        const [showWaveInstructions, setShowWaveInstructions] = useState(!isMobile);
        return (
          <div className={`text-center max-w-5xl w-full ${isMobile ? 'space-y-3' : 'space-y-4'}`}>
            {/* Timer for WAVE */}
            {section.durationSec && (
              <div className={isMobile ? 'mb-3' : 'mb-4'} style={{ flexShrink: 0 }}>
                <WorkoutTimer
                  type="COUNTDOWN"
                  durationSec={section.durationSec}
                  onComplete={() => setTimerComplete(true)}
                />
                <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-text mt-2`}>Wave Duration</div>
              </div>
            )}
            {/* Instructions Box - Collapsible on Mobile */}
            {section.note && (
              <div className={`bg-node-volt/10 border-2 border-node-volt rounded-lg ${isMobile ? 'p-3' : 'p-4'} text-left`} style={{ flexShrink: 0 }}>
                <button
                  onClick={() => setShowWaveInstructions(!showWaveInstructions)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="text-node-volt font-bold flex items-center gap-2" style={{ 
                    fontFamily: 'var(--font-space-grotesk)',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                  }}>
                    <Icons.PROGRAMS size={isMobile ? 16 : 20} /> Wave Structure
                  </div>
                  {isMobile && (
                    <Icons.CHEVRON_DOWN 
                      size={16} 
                      className={`text-node-volt transition-transform ${showWaveInstructions ? 'rotate-180' : ''}`}
                    />
                  )}
                </button>
                {(!isMobile || showWaveInstructions) && (
                  <p className={`text-text-white leading-relaxed whitespace-pre-line mt-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
                    {section.note}
                  </p>
                )}
              </div>
            )}
            <div className={`${isMobile ? 'space-y-3' : 'space-y-4'} w-full`} style={{ flex: '1 1 auto', minHeight: 0, overflow: 'hidden' }}>
              {section.blocks.map((block: any, idx: number) => (
                <CollapsibleExerciseCard
                  key={`${section.id}-block-${block.id || idx}`}
                  block={block}
                  compact={false}
                />
              ))}
            </div>
          </div>
        );

      case 'SUPERSET':
        const pairs: any[][] = [];
        for (let i = 0; i < section.blocks.length; i += 2) {
          pairs.push(section.blocks.slice(i, i + 2));
        }
        const [showSupersetInstructions, setShowSupersetInstructions] = useState(!isMobile);
        return (
          <div className={`text-center max-w-6xl w-full ${isMobile ? 'space-y-3' : 'space-y-4'}`}>
            {/* Timer for SUPERSET */}
            {section.durationSec && (
              <div className={isMobile ? 'mb-3' : 'mb-4'} style={{ flexShrink: 0 }}>
                <WorkoutTimer
                  type="COUNTDOWN"
                  durationSec={section.durationSec}
                  onComplete={() => setTimerComplete(true)}
                />
                <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-text mt-2`}>Superset Duration</div>
              </div>
            )}
            {/* Instructions Box - Collapsible on Mobile */}
            {section.note && (
              <div className={`bg-node-volt/10 border-2 border-node-volt rounded-lg ${isMobile ? 'p-3' : 'p-4'} text-left`} style={{ flexShrink: 0 }}>
                <button
                  onClick={() => setShowSupersetInstructions(!showSupersetInstructions)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="text-node-volt font-bold flex items-center gap-2" style={{ 
                    fontFamily: 'var(--font-space-grotesk)',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                  }}>
                    <Icons.PROGRAMS size={isMobile ? 16 : 20} /> Superset Instructions
                  </div>
                  {isMobile && (
                    <Icons.CHEVRON_DOWN 
                      size={16} 
                      className={`text-node-volt transition-transform ${showSupersetInstructions ? 'rotate-180' : ''}`}
                    />
                  )}
                </button>
                {(!isMobile || showSupersetInstructions) && (
                  <p className={`text-text-white leading-relaxed whitespace-pre-line mt-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
                    {section.note}
                  </p>
                )}
              </div>
            )}
            <div className={`${isMobile ? 'space-y-3' : 'space-y-4'} w-full`} style={{ flex: '1 1 auto', minHeight: 0, overflow: 'hidden' }}>
              {pairs.map((pair, pairIdx) => (
                <div
                  key={pairIdx}
                  className={`bg-panel/50 backdrop-blur-sm border-2 border-node-volt rounded-lg ${isMobile ? 'p-3' : 'p-4'}`}
                >
                  <div className={`grid grid-cols-2 ${isMobile ? 'gap-3' : 'gap-4'}`}>
                    {pair.map((block, idx) => (
                      <CollapsibleExerciseCard
                        key={`${section.id}-block-${block.id || idx}`}
                        block={{
                          ...block,
                          label: block.label || (idx === 0 ? 'A' : 'B'),
                        }}
                        compact={true}
                      />
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

    // Use warm-up section styling: 3-column grid with rounded boxes
    return (
      <div className="grid grid-cols-3 gap-4 mt-4">
        {block.tierSilver && (
          <div className="bg-panel thin-border rounded p-3" style={{ borderColor: '#94a3b8', backgroundColor: 'rgba(148, 163, 184, 0.1)' }}>
            <div className="text-sm mb-1 font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>SILVER</div>
            <div className="font-medium" style={{ color: '#94a3b8' }}>{getTierDisplayValue(block.tierSilver, block.exerciseName, block)}</div>
          </div>
        )}
        {block.tierGold && (
          <div className="bg-panel thin-border rounded p-3" style={{ borderColor: '#fbbf24', backgroundColor: 'rgba(251, 191, 36, 0.1)' }}>
            <div className="text-sm mb-1 font-bold uppercase tracking-wider" style={{ color: '#fbbf24' }}>GOLD</div>
            <div className="font-medium" style={{ color: '#fbbf24' }}>{getTierDisplayValue(block.tierGold, block.exerciseName, block)}</div>
          </div>
        )}
        {block.tierBlack && (
          <div className="bg-panel thin-border rounded p-3 border-node-volt" style={{ backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(31, 41, 55, 0.8)' }}>
            <div className="text-sm mb-1 font-bold uppercase tracking-wider text-node-volt">BLACK</div>
            <div className="font-medium text-node-volt">{getTierDisplayValue(block.tierBlack, block.exerciseName, block)}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center animate-fadeIn" style={{ 
      gap: isMobile ? '0.75rem' : '1rem',
      padding: isMobile ? '0.5rem' : '1rem',
      maxHeight: '100%',
      overflow: 'hidden',
    }}>
      {/* Section Header */}
      <div className="text-center" style={{ flexShrink: 0 }}>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <h1 
            className="font-bold" 
            style={{ 
              fontFamily: 'var(--font-space-grotesk)', 
              letterSpacing: '-0.02em',
              fontSize: isMobile ? '1.5rem' : isTablet ? '2.5rem' : '3rem',
              lineHeight: 1.1,
            }}
          >
            {section.title}
          </h1>
          {workout.archetype && (
            <ArchetypeBadge archetype={workout.archetype} size={isMobile ? 'sm' : 'lg'} />
          )}
        </div>
        {section.note && !isMobile && (
          <p className={`text-muted-text max-w-3xl mx-auto italic mt-2 ${isMobile ? 'text-sm' : 'text-lg'}`}>
            {section.note}
          </p>
        )}
      </div>

      {/* Section Content - Scrollable only if needed, but try to fit */}
      <div className="w-full flex-1" style={{ minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {renderSectionContent()}
      </div>

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

