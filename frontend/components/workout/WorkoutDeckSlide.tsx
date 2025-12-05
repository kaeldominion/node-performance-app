'use client';

import { useState, useEffect } from 'react';
import { WorkoutTimer } from './WorkoutTimer';
import ArchetypeBadge from './ArchetypeBadge';
import TierBadge from './TierBadge';
import { Icons } from '@/lib/iconMapping';

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

  // Helper to check if repScheme should be hidden (when tiers have different values)
  const shouldHideRepScheme = (block: any): boolean => {
    // Hide if exercise should use tier-based values
    if (shouldUseTierBasedValues(block)) return true;
    
    // Hide repScheme if it's "N/A"
    if (block.repScheme === 'N/A' || block.repScheme === 'n/a' || block.repScheme === null || block.repScheme === undefined) {
      return true;
    }
    
    return false;
  };

  // Section-specific rendering
  const renderSectionContent = () => {
    switch (section.type) {
      case 'WARMUP':
      case 'COOLDOWN':
        return (
          <div className="text-center space-y-8 max-w-4xl">
            {/* Timer for WARMUP/COOLDOWN */}
            {section.durationSec && (
              <div className="mb-6">
                <WorkoutTimer
                  type="COUNTDOWN"
                  durationSec={section.durationSec}
                  onComplete={() => setTimerComplete(true)}
                />
                <div className="text-sm text-muted-text mt-2">
                  {section.type === 'WARMUP' ? 'Warmup Duration' : 'Cooldown Duration'}
                </div>
              </div>
            )}
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
                  {block.repScheme && !shouldHideRepScheme(block) && (
                    <div className="text-2xl text-node-volt font-bold">{block.repScheme}</div>
                  )}
                  {shouldUseTierBasedValues(block) && shouldHideRepScheme(block) && (
                    <div className="text-sm text-muted-text mb-4 italic">
                      Choose your tier below for distance/calories/reps
                    </div>
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
                  {block.repScheme && !shouldHideRepScheme(block) && (
                    <div className="text-xl text-node-volt font-bold mb-3">{block.repScheme}</div>
                  )}
                  {isErgMachine(block.exerciseName) && shouldHideRepScheme(block) && (
                    <div className="text-sm text-muted-text mb-3 italic">
                      Choose your tier below for distance/calories
                    </div>
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
            {/* Timer */}
            <div className="space-y-4">
              <WorkoutTimer
                type="COUNTDOWN"
                durationSec={section.durationSec || 720}
                onComplete={() => setTimerComplete(true)}
              />
              {/* Duration and Rounds Display */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-panel/50 backdrop-blur-sm thin-border rounded-lg px-6 py-3">
                  <div className="text-muted-text text-sm mb-1">Duration</div>
                  <div className="text-2xl font-bold text-node-volt">
                    {Math.floor((section.durationSec || 720) / 60)}:{(section.durationSec || 720) % 60 < 10 ? '0' : ''}{(section.durationSec || 720) % 60}
                  </div>
                </div>
                {section.rounds && (
                  <div className="bg-panel/50 backdrop-blur-sm thin-border rounded-lg px-6 py-3">
                    <div className="text-muted-text text-sm mb-1">Rounds</div>
                    <div className="text-2xl font-bold text-node-volt">
                      {section.rounds}
                    </div>
                    {section.restBetweenRounds && (
                      <div className="text-xs text-muted-text mt-1">
                        Rest {section.restBetweenRounds}s between rounds
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Instructions Box */}
            {section.note && (
              <div className="bg-node-volt/10 border-2 border-node-volt rounded-lg p-6 text-left">
                <div className="text-node-volt font-bold text-lg mb-2 flex items-center gap-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  <Icons.PROGRAMS size={20} /> Instructions
                </div>
                <p className="text-text-white text-lg leading-relaxed whitespace-pre-line">{section.note}</p>
              </div>
            )}

            {/* Exercise Blocks */}
            <div className="space-y-6">
              <div className="text-muted-text text-sm mb-4">
                {section.rounds 
                  ? `Complete ${section.rounds} rounds. Rest ${section.restBetweenRounds || 30}s between rounds.`
                  : 'Complete exercises in order, then repeat until time expires'
                }
              </div>
              {section.blocks.map((block: any, idx: number) => (
                <div
                  key={block.id || idx}
                  className="bg-panel/50 backdrop-blur-sm thin-border rounded-lg p-8 border-l-4 border-node-volt"
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
                  {block.repScheme && !shouldHideRepScheme(block) && (
                    <div className="text-2xl text-node-volt font-bold mb-4">{block.repScheme}</div>
                  )}
                  {shouldUseTierBasedValues(block) && shouldHideRepScheme(block) && (
                    <div className="text-sm text-muted-text mb-4 italic">
                      Choose your tier below for distance/calories/reps
                    </div>
                  )}
                  {block.tempo && (
                    <div className="text-lg text-muted-text mb-4">Tempo: <span className="text-node-volt font-semibold">{block.tempo}</span></div>
                  )}
                  {block.loadPercentage && (
                    <div className="text-lg text-muted-text mb-4">Load: <span className="text-node-volt font-semibold">{block.loadPercentage}</span></div>
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
                  {block.repScheme && !shouldHideRepScheme(block) && (
                    <div className="text-2xl text-node-volt font-bold mb-4">{block.repScheme}</div>
                  )}
                  {shouldUseTierBasedValues(block) && shouldHideRepScheme(block) && (
                    <div className="text-sm text-muted-text mb-4 italic">
                      Choose your tier below for distance/calories/reps
                    </div>
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
            {/* Timer for WAVE */}
            {section.durationSec && (
              <div className="mb-6">
                <WorkoutTimer
                  type="COUNTDOWN"
                  durationSec={section.durationSec}
                  onComplete={() => setTimerComplete(true)}
                />
                <div className="text-sm text-muted-text mt-2">Wave Duration</div>
              </div>
            )}
            {/* Instructions Box */}
            {section.note && (
              <div className="bg-node-volt/10 border-2 border-node-volt rounded-lg p-6 text-left mb-6">
                <div className="text-node-volt font-bold text-lg mb-2 flex items-center gap-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  <Icons.PROGRAMS size={20} /> Wave Structure
                </div>
                <p className="text-text-white text-lg leading-relaxed whitespace-pre-line">{section.note}</p>
              </div>
            )}
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
                  {block.repScheme && !shouldHideRepScheme(block) && (
                    <div className="text-2xl text-node-volt font-bold mb-4">{block.repScheme}</div>
                  )}
                  {shouldUseTierBasedValues(block) && shouldHideRepScheme(block) && (
                    <div className="text-sm text-muted-text mb-4 italic">
                      Choose your tier below for distance/calories/reps
                    </div>
                  )}
                  {block.tempo && (
                    <div className="text-lg text-muted-text mb-4">Tempo: <span className="text-node-volt font-semibold">{block.tempo}</span></div>
                  )}
                  {block.loadPercentage && (
                    <div className="text-lg text-muted-text mb-4">Load: <span className="text-node-volt font-semibold">{block.loadPercentage}</span></div>
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
            {/* Timer for SUPERSET */}
            {section.durationSec && (
              <div className="mb-6">
                <WorkoutTimer
                  type="COUNTDOWN"
                  durationSec={section.durationSec}
                  onComplete={() => setTimerComplete(true)}
                />
                <div className="text-sm text-muted-text mt-2">Superset Duration</div>
              </div>
            )}
            {/* Instructions Box */}
            {section.note && (
              <div className="bg-node-volt/10 border-2 border-node-volt rounded-lg p-6 text-left mb-6">
                <div className="text-node-volt font-bold text-lg mb-2 flex items-center gap-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  <Icons.PROGRAMS size={20} /> Superset Instructions
                </div>
                <p className="text-text-white text-lg leading-relaxed whitespace-pre-line">{section.note}</p>
              </div>
            )}
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
                        {block.repScheme && !shouldHideRepScheme(block) && (
                          <div className="text-xl text-node-volt font-bold mb-3">{block.repScheme}</div>
                        )}
                        {isErgMachine(block.exerciseName) && shouldHideRepScheme(block) && (
                          <div className="text-xs text-muted-text mb-3 italic">
                            Choose tier for distance/cal
                          </div>
                        )}
                        {block.tempo && (
                          <div className="text-sm text-muted-text mb-3">Tempo: <span className="text-node-volt font-semibold">{block.tempo}</span></div>
                        )}
                        {block.loadPercentage && (
                          <div className="text-sm text-muted-text mb-3">Load: <span className="text-node-volt font-semibold">{block.loadPercentage}</span></div>
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

    const getTierDisplay = (tier: any, exerciseName: string) => {
      // Import the utility function logic inline to avoid import issues
      const isErgMachine = (name: string): boolean => {
        const ergPatterns = [/row/i, /bike/i, /ski/i, /erg/i, /assault/i, /echo/i, /airdyne/i];
        return ergPatterns.some(pattern => pattern.test(name));
      };
      
      const isBodyweightRepExercise = (name: string): boolean => {
        const nameLower = name.toLowerCase();
        const bodyweightRepExercises = [
          'box jump', 'pull up', 'pullup', 'chin up', 'push up', 'pushup',
          'dip', 'situp', 'sit-up', 'crunch', 'plank', 'burpee',
          'jump', 'lunge', 'squat', 'air squat', 'hollow', 'dead bug',
          'knees to chest', 'ttb', 'toes to bar', 'muscle up'
        ];
        return bodyweightRepExercises.some(ex => nameLower.includes(ex));
      };
      
      const isErg = isErgMachine(exerciseName);
      const isBodyweightRep = isBodyweightRepExercise(exerciseName);
      
      // 1. For erg machines, always show distance/calories
      if (isErg) {
        if (tier.distance !== null && tier.distance !== undefined && tier.distanceUnit) {
          return `${tier.distance}${tier.distanceUnit}`;
        }
        return 'Choose tier for distance/cal';
      }
      
      // 2. For distance-based exercises (not erg machines)
      if (tier.distance !== null && tier.distance !== undefined && tier.distanceUnit) {
        return `${tier.distance}${tier.distanceUnit}`;
      }
      
      // 3. For bodyweight rep exercises, prioritize targetReps
      if (isBodyweightRep && tier.targetReps !== null && tier.targetReps !== undefined) {
        return `${tier.targetReps} reps`;
      }
      
      // 4. For other exercises, show targetReps if available
      if (tier.targetReps !== null && tier.targetReps !== undefined) {
        return `${tier.targetReps} reps`;
      }
      
      // 5. Show load only if it's not "Bodyweight" (or if there's no targetReps)
      if (tier.load) {
        const loadLower = tier.load.toLowerCase();
        // Skip "Bodyweight" if this is a bodyweight rep exercise (should show reps instead)
        if (loadLower === 'bodyweight' && isBodyweightRep) {
          return '—';
        }
        return tier.load;
      }
      
      return '—';
    };

    // Use warm-up section styling: 3-column grid with rounded boxes
    return (
      <div className="grid grid-cols-3 gap-4 mt-4">
        {block.tierSilver && (
          <div className="bg-panel thin-border rounded p-3">
            <div className="text-sm text-muted-text mb-1">SILVER</div>
            <div className="font-medium">{getTierDisplay(block.tierSilver, block.exerciseName)}</div>
          </div>
        )}
        {block.tierGold && (
          <div className="bg-panel thin-border rounded p-3">
            <div className="text-sm text-muted-text mb-1">GOLD</div>
            <div className="font-medium">{getTierDisplay(block.tierGold, block.exerciseName)}</div>
          </div>
        )}
        {block.tierBlack && (
          <div className="bg-panel thin-border rounded p-3 border-node-volt">
            <div className="text-sm text-node-volt mb-1">BLACK</div>
            <div className="font-medium text-node-volt">{getTierDisplay(block.tierBlack, block.exerciseName)}</div>
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

