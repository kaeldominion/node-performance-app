'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sun, Moon } from 'lucide-react';
import { Icons } from '@/lib/iconMapping';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useAudioSystem } from '@/hooks/useAudioSystem';
import { useDeckAnimations, useConfetti } from '@/hooks/useDeckAnimations';
import { useTheme } from '@/contexts/ThemeContext';
import { Logo } from '@/components/Logo';
import { DeckTimer } from './DeckTimer';
import { StationIndicator } from './StationIndicator';
import { ExerciseCard } from './ExerciseCard';
import { CollapsibleExerciseCard } from './CollapsibleExerciseCard';
import { RatingModal } from './RatingModal';
import { ParticipantManager } from './ParticipantManager';
import { AudioControls } from './AudioControls';
import { HyroxDeck } from './HyroxDeck';
import { isHyroxWorkout } from './utils/hyroxDetection';
import { sessionsApi } from '@/lib/api';

interface WorkoutSection {
  id: string;
  title: string;
  type: string;
  order: number;
  durationSec?: number;
  emomWorkSec?: number;
  emomRestSec?: number;
  emomRounds?: number;
  note?: string;
  blocks: any[];
}

interface Workout {
  id: string;
  name: string;
  displayCode?: string;
  archetype?: string;
  description?: string;
  sections: WorkoutSection[];
}

interface LiveDeckPlayerProps {
  workout: Workout;
  sessionId: string | null;
  onComplete?: (rpe: number, notes: string) => void;
}

const SECTION_COLORS: Record<string, string> = {
  WARMUP: '#4a9eff',
  EMOM: '#ccff00',
  AMRAP: '#ff6b6b',
  CIRCUIT: '#ff6b6b',
  FOR_TIME: '#ff6b6b',
  WAVE: '#ccff00',
  SUPERSET: '#ccff00',
  CAPACITY: '#ff6b6b',
  FLOW: '#9b59b6',
  FINISHER: '#ff6b6b',
  COOLDOWN: '#4a9eff',
};

export function LiveDeckPlayer({ workout, sessionId, onComplete }: LiveDeckPlayerProps) {
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [introSlideIndex, setIntroSlideIndex] = useState(0); // For mobile intro slides
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [participants, setParticipants] = useState<Array<{ id?: string; name: string; email?: string; isSignedUp: boolean; avatarUrl?: string }>>([]);
  const [activeStation, setActiveStation] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  
  const { config, isMobile, isTablet, isDesktop, isTV, getExerciseGridColumns } = useResponsiveLayout();
  const { playSound, playVoice } = useAudioSystem();
  const { triggerTransition, triggerCelebration, getTransitionClass } = useDeckAnimations();
  const { showConfetti, trigger: triggerConfetti } = useConfetti();
  const { theme, toggleTheme } = useTheme();
  
  const controlsTimeoutRef = useRef<number | undefined>(undefined);
  const introControlsTimeoutRef = useRef<number | undefined>(undefined);
  const sectionRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<number | null>(null);
  const touchEndRef = useRef<number | null>(null);

  // Safety checks for workout data
  if (!workout || !workout.sections || !Array.isArray(workout.sections) || workout.sections.length === 0) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-text text-xl mb-4">Invalid Workout Data</div>
          <div className="text-muted-text text-sm mb-6">
            This workout doesn't have any sections. Please create a new workout.
          </div>
          <button
            onClick={() => router.push('/workouts')}
            className="bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Go to Workouts
          </button>
        </div>
      </div>
    );
  }

  // Ensure currentSectionIndex is within bounds
  const safeSectionIndex = Math.min(Math.max(0, currentSectionIndex), workout.sections.length - 1);
  useEffect(() => {
    if (safeSectionIndex !== currentSectionIndex) {
      setCurrentSectionIndex(safeSectionIndex);
    }
  }, [safeSectionIndex, currentSectionIndex]);

  const currentSection = workout.sections[safeSectionIndex];
  if (!currentSection) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-muted-text">Workout section not found</div>
      </div>
    );
  }

  const isFirstSection = safeSectionIndex === 0;
  const isLastSection = safeSectionIndex === workout.sections.length - 1;
  const sectionColor = SECTION_COLORS[currentSection.type] || '#ccff00';
  const isHyrox = isHyroxWorkout(workout);

  // Calculate progress
  const progress = ((safeSectionIndex + 1) / workout.sections.length) * 100;

  // Auto-hide controls for live deck
  useEffect(() => {
    if (showControls && !showIntro) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 4000);
    }
    return () => {
      if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, currentSectionIndex, showIntro]);

  // Auto-hide controls for intro screen
  useEffect(() => {
    if (showControls && showIntro) {
      introControlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 4000);
    }
    return () => {
      if (introControlsTimeoutRef.current) {
        window.clearTimeout(introControlsTimeoutRef.current);
      }
    };
  }, [showControls, showIntro]);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      // Hide controls in fullscreen
      if (isFull) {
        setShowControls(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndRef.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    if (touchStartRef.current === null || touchEndRef.current === null) return;
    
    const diff = touchStartRef.current - touchEndRef.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        handleNextSection();
      } else {
        handlePreviousSection();
      }
    }
    
    touchStartRef.current = null;
    touchEndRef.current = null;
  };

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    // Reset timeout on mouse move
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    if (introControlsTimeoutRef.current) {
      window.clearTimeout(introControlsTimeoutRef.current);
    }
  }, []);

  const handleNextSection = useCallback(() => {
    const safeIndex = Math.min(Math.max(0, currentSectionIndex), workout.sections.length - 1);
    if (safeIndex < workout.sections.length - 1) {
      playSound('transition');
      triggerTransition('forward', 500);
      setCurrentSectionIndex(safeIndex + 1);
      setActiveStation(0);
      setCurrentRound(1);
      if (sectionRef.current) {
        sectionRef.current.scrollTop = 0;
      }
    } else {
      setShowRatingModal(true);
    }
  }, [currentSectionIndex, workout.sections.length, playSound, triggerTransition]);

  const handleStartWorkout = () => {
    setShowControls(false); // Hide controls when starting
    setShowIntro(false);
    playSound('transition');
  };

  const handlePreviousSection = useCallback(() => {
    const safeIndex = Math.min(Math.max(0, currentSectionIndex), workout.sections.length - 1);
    if (safeIndex > 0) {
      playSound('transition');
      triggerTransition('backward', 500);
      setCurrentSectionIndex(safeIndex - 1);
      if (sectionRef.current) {
        sectionRef.current.scrollTop = 0;
      }
    }
  }, [currentSectionIndex, playSound, triggerTransition]);

  const handleJumpToSection = (index: number) => {
    if (index >= 0 && index < workout.sections.length) {
      playSound('transition');
      const safeIndex = Math.min(Math.max(0, currentSectionIndex), workout.sections.length - 1);
      triggerTransition(index > safeIndex ? 'forward' : 'backward', 500);
      setCurrentSectionIndex(index);
      setShowSectionMenu(false);
      if (sectionRef.current) {
        sectionRef.current.scrollTop = 0;
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleCompleteWorkout = async (rating?: any) => {
    if (onComplete) {
      await onComplete(5, '');
    }
    triggerCelebration(3000);
    triggerConfetti();
    playSound('fanfare');
  };

  const handleRatingComplete = async (rating: any) => {
    setShowRatingModal(false);
    await handleCompleteWorkout(rating);
  };

  const handlePhaseChange = (phase: 'work' | 'rest', round: number) => {
    if (phase === 'work' && currentSection.type === 'EMOM') {
      const newStation = (round - 1) % (currentSection.blocks?.length || 1);
      setActiveStation(newStation);
      setCurrentRound(round);
      playVoice('station', undefined, { count: newStation + 1 });
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showRatingModal || showSectionMenu || showIntro) return;
      
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          handleNextSection();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePreviousSection();
          break;
        case 'Escape':
          if (showSectionMenu) {
            setShowSectionMenu(false);
          } else {
            router.push('/workouts');
          }
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          setShowSectionMenu(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleNextSection, handlePreviousSection, showRatingModal, showSectionMenu, showIntro, router]);

  // Render section content
  const renderSectionContent = () => {
    if (isHyrox && currentSection.type === 'EMOM') {
      return (
        <HyroxDeck
          section={currentSection}
          currentRound={currentRound}
          activeStation={activeStation}
          onPhaseChange={handlePhaseChange}
        />
      );
    }

    switch (currentSection.type) {
      case 'EMOM':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center" style={{ gap: '1rem', maxHeight: '100%' }}>
            <div style={{ flexShrink: 0 }}>
              <DeckTimer
                key={`emom-${currentSection.id}-${safeSectionIndex}`}
                type="EMOM"
                workSec={currentSection.emomWorkSec || 45}
                restSec={currentSection.emomRestSec || 15}
                rounds={currentSection.emomRounds || 12}
                onPhaseChange={handlePhaseChange}
                autoStart={false}
                showPreCountdown={true}
              />
            </div>
            <div style={{ flexShrink: 0 }}>
              <StationIndicator
                totalStations={currentSection.blocks?.length || 1}
                activeStation={activeStation}
                currentRound={currentRound}
                totalRounds={currentSection.emomRounds || 12}
                nextStation={(activeStation + 1) % (currentSection.blocks?.length || 1)}
                stationNames={currentSection.blocks?.map((b: any) => b.exerciseName)}
              />
            </div>
            <div
              className="grid justify-center w-full"
              style={{
                gridTemplateColumns: `repeat(${Math.min(currentSection.blocks?.length || 1, getExerciseGridColumns('EMOM'))}, 1fr)`,
                gap: '0.75rem',
                flex: '1 1 auto',
                minHeight: 0,
                maxHeight: '100%',
                overflow: 'hidden',
              }}
            >
              {currentSection.blocks?.map((block: any, idx: number) => (
                <CollapsibleExerciseCard
                  key={`${currentSection.id}-block-${block.id || idx}`}
                  block={block}
                  isActive={idx === activeStation}
                  sectionColor={sectionColor}
                  compact={true}
                />
              ))}
            </div>
          </div>
        );

      case 'AMRAP':
      case 'CIRCUIT':
      case 'FOR_TIME':
        // Parse tier target rounds from note
        const parseTierTargets = (note: string | undefined) => {
          if (!note) return null;
          const targetMatch = note.match(/Target rounds:\s*SILVER\s+([\d-]+)\s+rounds?,\s*GOLD\s+([\d-]+)\s+rounds?,\s*BLACK\s+([\d-]+)\s+rounds?/i);
          if (targetMatch) {
            return {
              silver: targetMatch[1],
              gold: targetMatch[2],
              black: targetMatch[3],
            };
          }
          return null;
        };
        
        const tierTargets = parseTierTargets(currentSection.note);
        
        return (
          <div className="w-full h-full flex flex-col items-center justify-center" style={{ gap: '1rem', maxHeight: '100%' }}>
            <div style={{ flexShrink: 0 }}>
              <DeckTimer
                key={`amrap-${currentSection.id}-${safeSectionIndex}`}
                type="AMRAP"
                durationSec={currentSection.durationSec || 720}
                autoStart={false}
                showPreCountdown={true}
              />
            </div>
            
            {/* Tier Target Rounds Display - Brutalist */}
            {tierTargets && (
              <div className="flex items-center gap-3" style={{ flexShrink: 0 }}>
                <div className="text-xs text-muted-text uppercase tracking-wider font-mono">Target Rounds:</div>
                <div className="flex items-center gap-2">
                  <div className="bg-panel thin-border px-3 py-1.5">
                    <div className="text-xs text-muted-text uppercase tracking-wider font-mono mb-0.5">SILVER</div>
                    <div className="text-sm font-bold text-node-volt">{tierTargets.silver}</div>
                  </div>
                  <div className="bg-panel thin-border px-3 py-1.5" style={{ borderColor: '#ffd700' }}>
                    <div className="text-xs text-muted-text uppercase tracking-wider font-mono mb-0.5">GOLD</div>
                    <div className="text-sm font-bold" style={{ color: '#ffd700' }}>{tierTargets.gold}</div>
                  </div>
                  <div className="bg-panel thin-border px-3 py-1.5" style={{ borderColor: 'rgba(255, 255, 255, 0.4)' }}>
                    <div className="text-xs text-muted-text uppercase tracking-wider font-mono mb-0.5">BLACK</div>
                    <div className="text-sm font-bold text-white">{tierTargets.black}</div>
                  </div>
                </div>
              </div>
            )}
            
            <div
              className="grid justify-center w-full"
              style={{
                gridTemplateColumns: `repeat(${Math.min(currentSection.blocks?.length || 1, getExerciseGridColumns())}, 1fr)`,
                gap: '0.75rem',
                flex: '1 1 auto',
                minHeight: 0,
                maxHeight: '100%',
                overflow: 'hidden',
              }}
            >
              {currentSection.blocks?.map((block: any, idx: number) => (
                <CollapsibleExerciseCard 
                  key={`${currentSection.id}-block-${block.id || idx}`} 
                  block={block}
                  sectionColor={sectionColor}
                  compact={true}
                />
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center" style={{ gap: '1rem', maxHeight: '100%' }}>
            {currentSection.durationSec && (
              <div style={{ flexShrink: 0 }}>
                <DeckTimer
                  key={`countdown-${currentSection.id}-${safeSectionIndex}`}
                  type="COUNTDOWN"
                  durationSec={currentSection.durationSec}
                  autoStart={false}
                  showPreCountdown={true}
                />
              </div>
            )}
            <div
              className="grid justify-center w-full"
              style={{
                gridTemplateColumns: `repeat(${Math.min(currentSection.blocks?.length || 1, getExerciseGridColumns())}, 1fr)`,
                gap: '0.75rem',
                flex: '1 1 auto',
                minHeight: 0,
                maxHeight: '100%',
                overflow: 'hidden',
              }}
            >
              {currentSection.blocks?.map((block: any, idx: number) => (
                <CollapsibleExerciseCard 
                  key={`${currentSection.id}-block-${block.id || idx}`} 
                  block={block}
                  sectionColor={sectionColor}
                  compact={true}
                />
              ))}
            </div>
          </div>
        );
    }
  };

  // Render intro card
  const renderIntroCard = () => {
    const totalDuration = workout.sections.reduce((acc, section) => {
      if (section.type === 'EMOM' && section.emomRounds && section.emomWorkSec && section.emomRestSec) {
        return acc + (section.emomRounds * (section.emomWorkSec + section.emomRestSec));
      }
      return acc + (section.durationSec || 0);
    }, 0);
    const totalMinutes = Math.ceil(totalDuration / 60);

    const getSectionTypeDescription = (type: string) => {
      const descriptions: Record<string, string> = {
        WARMUP: 'Prepare your body for the work ahead',
        EMOM: 'Every Minute On the Minute - complete work in the minute, rest the remainder',
        AMRAP: 'As Many Rounds As Possible - push your limits',
        CIRCUIT: 'Complete all exercises in sequence, repeat for time',
        FOR_TIME: 'Complete the work as fast as possible',
        WAVE: 'Strength wave sets with progressive loading',
        SUPERSET: 'Push/pull or squat/hinge supersets',
        CAPACITY: 'Long engine blocks for sustained capacity',
        FLOW: 'Tempo work, KB flows, and controlled movement',
        FINISHER: 'Final push to complete exhaustion',
        COOLDOWN: 'Recovery and mobility work',
      };
      return descriptions[type] || 'Training section';
    };

    return (
      <div
        className="fixed inset-0 bg-dark overflow-hidden"
        onMouseMove={handleMouseMove}
        style={{
          fontFamily: 'var(--font-manrope)',
          overflow: 'hidden',
          height: '100vh',
          width: '100vw',
        }}
      >
        {/* Top Bar - Navbar Style (same as live deck) */}
        {showControls && !isFullscreen && (
          <div className="absolute top-0 left-0 right-0 z-40 bg-dark border-b thin-border pt-2 pb-2 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Logo showOS={false} className="text-base" />
                <div className="bg-panel thin-border px-3 py-1.5">
                  <div className="text-muted-text text-xs font-mono uppercase tracking-wider">
                    PREVIEW
                  </div>
                  {workout.displayCode && (
                    <div className="text-node-volt text-[10px] font-mono uppercase tracking-wider mt-0.5">
                      {workout.displayCode}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AudioControls compact={isMobile} />
                {/* Compact Participants Display */}
                {participants.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap max-w-[120px]">
                    {participants.map((p, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1 bg-panel/90 thin-border rounded px-1.5 py-0.5"
                      >
                        {p.avatarUrl ? (
                          <img src={p.avatarUrl} alt={p.name} className="w-4 h-4 rounded-full" />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-node-volt/20 flex items-center justify-center text-[10px] font-bold text-node-volt">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <button
                          onClick={() => setParticipants(prev => prev.filter((_, i) => i !== idx))}
                          className="text-muted-text hover:text-text-white"
                        >
                          <Icons.X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {/* ParticipantManager - Compact version in header */}
                <div className="flex items-center gap-1">
                  <ParticipantManager
                    participants={participants}
                    onAdd={(p) => setParticipants(prev => [...prev, p])}
                    onRemove={(idx) => setParticipants(prev => prev.filter((_, i) => i !== idx))}
                  />
                </div>
                {/* Start Button */}
                <button
                  onClick={handleStartWorkout}
                  className={`bg-node-volt text-dark font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5 ${isMobile ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}`}
                  style={{
                    fontFamily: 'var(--font-space-grotesk)',
                  }}
                >
                  <Icons.PLAY size={isMobile ? 14 : 16} />
                  <span className={isMobile ? 'hidden sm:inline' : ''}>Start</span>
                </button>
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="bg-panel thin-border text-text-white px-3 py-1.5 hover:border-node-volt transition-colors"
                  title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                {/* Fullscreen Toggle */}
                <button
                  onClick={toggleFullscreen}
                  className="bg-panel thin-border text-text-white px-3 py-1.5 hover:border-node-volt transition-colors"
                >
                  {isFullscreen ? <Icons.MINIMIZE size={16} /> : <Icons.MAXIMIZE size={16} />}
                </button>
              </div>
          </div>
        )}

        {/* Main Content Area - Below Navbar */}
        <div
          className="h-full w-full flex items-center justify-center overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            paddingTop: showControls && !isFullscreen ? (isMobile ? '60px' : '80px') : '0',
            paddingLeft: isMobile ? '0.5rem' : '1rem',
            paddingRight: isMobile ? '0.5rem' : '1rem',
            paddingBottom: isMobile ? '0.5rem' : '1rem',
            height: '100vh',
          }}
        >
          {isMobile ? (
            /* Mobile: Swipeable Slides */
            <div className="relative w-full h-full max-w-5xl">
              <div 
                className="flex transition-transform duration-300 ease-out h-full"
                style={{ transform: `translateX(-${introSlideIndex * 100}%)` }}
              >
                {/* Slide 1: Overview */}
                <div className="min-w-full h-full flex-shrink-0">
                  <div className="bg-panel thin-border rounded-2xl h-full overflow-y-auto flex flex-col p-4">
                    {/* Header */}
                    <div className="text-center mb-4 flex-shrink-0">
                      <h1
                        className="font-bold mb-2"
                        style={{
                          fontFamily: 'var(--font-space-grotesk)',
                          fontSize: '1.75rem',
                          color: 'var(--node-volt)',
                          lineHeight: 1.1,
                        }}
                      >
                        {workout.name}
                      </h1>
                      {workout.displayCode && (
                        <div className="text-node-volt font-mono text-sm mb-2">
                          {workout.displayCode}
                        </div>
                      )}
                      {workout.description && (
                        <p className="text-text-white text-sm max-w-2xl mx-auto mb-2">
                          {workout.description}
                        </p>
                      )}
                      {workout.archetype && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-node-volt/10 border border-node-volt/30 rounded-lg">
                          {(() => {
                            const ArchetypeIcon = Icons[workout.archetype as keyof typeof Icons] || Icons.WORKOUT;
                            return <ArchetypeIcon size={14} className="text-node-volt" />;
                          })()}
                          <span className="text-node-volt font-bold uppercase tracking-wider text-xs">{workout.archetype}</span>
                        </div>
                      )}
                    </div>

                    {/* Workout Overview */}
                    <div className="grid grid-cols-3 gap-3 mb-4 flex-shrink-0">
                      <div className={`thin-border rounded-lg p-3 text-center ${theme === 'light' ? 'bg-gray-100 border-gray-300' : 'bg-dark-contrast'}`}>
                        <div className={`text-xs mb-1 uppercase tracking-wider ${theme === 'light' ? 'text-gray-600' : 'text-text-white'}`}>Sections</div>
                        <div className={`text-2xl font-bold text-node-volt`}>{workout.sections.length}</div>
                      </div>
                      <div className={`thin-border rounded-lg p-3 text-center ${theme === 'light' ? 'bg-gray-100 border-gray-300' : 'bg-dark-contrast'}`}>
                        <div className={`text-xs mb-1 uppercase tracking-wider ${theme === 'light' ? 'text-gray-600' : 'text-text-white'}`}>Duration</div>
                        <div className={`text-2xl font-bold text-node-volt`}>{totalMinutes} min</div>
                      </div>
                      <div className={`thin-border rounded-lg p-3 text-center ${theme === 'light' ? 'bg-gray-100 border-gray-300' : 'bg-dark-contrast'}`}>
                        <div className={`text-xs mb-1 uppercase tracking-wider ${theme === 'light' ? 'text-gray-600' : 'text-text-white'}`}>Archetype</div>
                        <div className={`text-lg font-bold text-node-volt`}>{workout.archetype || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>

          {/* Detailed Sections List - Grid layout for better space usage - Now with more vertical space */}
          <div className={`flex-1 min-h-0 flex flex-col`}>
            <h2 className={`font-bold mb-1.5 text-text-white flex-shrink-0 ${isMobile ? 'text-base' : isTablet ? 'text-lg' : 'text-xl'}`} style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Workout Breakdown
            </h2>
            <div className={`flex-1 min-h-0 ${isMobile ? 'overflow-y-auto' : 'overflow-hidden'}`}>
              <div className={`grid ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3'} gap-2 auto-rows-fr h-full`}>
              {workout.sections.map((section, idx) => {
                const sectionColor = SECTION_COLORS[section.type] || '#ccff00';
                const blockCount = section.blocks?.length || 0;
                const totalExercises = blockCount;
                
                return (
                  <div
                    key={section.id || idx}
                    className={`thin-border rounded-lg ${isMobile ? 'p-3' : 'p-2.5'} ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-dark-contrast'} flex flex-col h-full`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div
                          className={`rounded-lg flex items-center justify-center font-bold flex-shrink-0 ${isMobile ? 'w-10 h-10 text-base' : 'w-8 h-8 text-sm'}`}
                          style={{ backgroundColor: `${sectionColor}20`, color: sectionColor }}
                        >
                          {idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`font-bold text-text-white ${isMobile ? 'text-base' : 'text-sm'} truncate`}>{section.title}</div>
                          <div className={`text-node-volt uppercase tracking-wider ${isMobile ? 'text-xs' : 'text-[10px]'}`}>{section.type}</div>
                          <div className={`text-text-white ${isMobile ? 'text-xs' : 'text-[10px]'} line-clamp-1`}>{getSectionTypeDescription(section.type)}</div>
                        </div>
                      </div>
                    </div>
                    
                    {section.note && (
                      <div className={`mb-2 p-2 rounded-lg ${theme === 'light' ? 'bg-gray-100' : 'bg-panel/50'}`}>
                        <p className={`text-text-white italic ${isMobile ? 'text-xs' : 'text-[10px]'} line-clamp-1`}>{section.note}</p>
                      </div>
                    )}

                    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2`}>
                      {section.type === 'EMOM' && (
                        <>
                          {section.emomRounds && (
                            <div className={`rounded p-1.5 ${theme === 'light' ? 'bg-gray-100' : 'bg-panel/30'}`}>
                              <div className={`text-text-white mb-0.5 ${isMobile ? 'text-[10px]' : 'text-[9px]'}`}>Rounds</div>
                              <div className={`font-bold text-node-volt ${isMobile ? 'text-xs' : 'text-[10px]'}`}>{section.emomRounds}</div>
                            </div>
                          )}
                          {section.emomWorkSec && (
                            <div className={`rounded p-1.5 ${theme === 'light' ? 'bg-gray-100' : 'bg-panel/30'}`}>
                              <div className={`text-text-white mb-0.5 ${isMobile ? 'text-[10px]' : 'text-[9px]'}`}>Work</div>
                              <div className={`font-bold text-node-volt ${isMobile ? 'text-xs' : 'text-[10px]'}`}>{section.emomWorkSec}s</div>
                            </div>
                          )}
                          {section.emomRestSec && (
                            <div className={`rounded p-1.5 ${theme === 'light' ? 'bg-gray-100' : 'bg-panel/30'}`}>
                              <div className={`text-text-white mb-0.5 ${isMobile ? 'text-[10px]' : 'text-[9px]'}`}>Rest</div>
                              <div className={`font-bold text-node-volt ${isMobile ? 'text-xs' : 'text-[10px]'}`}>{section.emomRestSec}s</div>
                            </div>
                          )}
                        </>
                      )}
                      {section.durationSec && (
                        <div className={`rounded p-1.5 ${theme === 'light' ? 'bg-gray-100' : 'bg-panel/30'}`}>
                          <div className={`text-text-white mb-0.5 ${isMobile ? 'text-[10px]' : 'text-[9px]'}`}>Duration</div>
                          <div className={`font-bold text-node-volt ${isMobile ? 'text-xs' : 'text-[10px]'}`}>{Math.ceil(section.durationSec / 60)} min</div>
                        </div>
                      )}
                      {totalExercises > 0 && (
                        <div className={`rounded p-1.5 ${theme === 'light' ? 'bg-gray-100' : 'bg-panel/30'}`}>
                          <div className={`text-text-white mb-0.5 ${isMobile ? 'text-[10px]' : 'text-[9px]'}`}>Exercises</div>
                          <div className={`font-bold text-node-volt ${isMobile ? 'text-xs' : 'text-[10px]'}`}>{totalExercises}</div>
                        </div>
                      )}
                    </div>

                    {/* Exercise List */}
                    {section.blocks && section.blocks.length > 0 && (
                      <div className="mt-1.5">
                        <div className={`text-text-white uppercase tracking-wider mb-1 ${isMobile ? 'text-[10px]' : 'text-[9px]'}`}>Exercises</div>
                        <div className="flex flex-wrap gap-1">
                          {section.blocks.map((block: any, blockIdx: number) => (
                            <div
                              key={blockIdx}
                              className={`px-2 py-1 thin-border rounded ${theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-panel/50'} ${isMobile ? 'text-xs' : 'text-[10px]'}`}
                            >
                              {block.label && <span className="text-node-volt font-mono mr-1">{block.label}</span>}
                              <span className="text-text-white truncate max-w-[120px] sm:max-w-[200px]">{block.exerciseName}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          </div>
          {isMobile ? (
            /* Mobile: Close slides container and add indicators */
            <>
              {/* Slide 2: Workout Breakdown */}
              <div className="min-w-full h-full flex-shrink-0">
                <div className="bg-panel thin-border rounded-2xl h-full overflow-y-auto flex flex-col p-4">
                  <h2 className="font-bold mb-4 text-text-white text-xl" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    Workout Breakdown
                  </h2>
                  <div className="flex-1 space-y-3">
                    {workout.sections.map((section, idx) => {
                      const sectionColor = SECTION_COLORS[section.type] || '#ccff00';
                      const blockCount = section.blocks?.length || 0;
                      const totalExercises = blockCount;
                      
                      return (
                        <div
                          key={section.id || idx}
                          className={`thin-border rounded-lg p-3 ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-dark-contrast'}`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base flex-shrink-0"
                              style={{ backgroundColor: `${sectionColor}20`, color: sectionColor }}
                            >
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-text-white text-base">{section.title}</div>
                              <div className="text-node-volt uppercase tracking-wider text-xs">{section.type}</div>
                            </div>
                          </div>
                          {section.note && (
                            <p className="text-text-white text-xs mb-2 italic">{section.note}</p>
                          )}
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            {section.durationSec && (
                              <div className={`rounded p-2 ${theme === 'light' ? 'bg-gray-100' : 'bg-panel/30'}`}>
                                <div className="text-text-white text-xs mb-1">Duration</div>
                                <div className="font-bold text-node-volt text-sm">{Math.ceil(section.durationSec / 60)} min</div>
                              </div>
                            )}
                            {totalExercises > 0 && (
                              <div className={`rounded p-2 ${theme === 'light' ? 'bg-gray-100' : 'bg-panel/30'}`}>
                                <div className="text-text-white text-xs mb-1">Exercises</div>
                                <div className="font-bold text-node-volt text-sm">{totalExercises}</div>
                              </div>
                            )}
                          </div>
                          {section.blocks && section.blocks.length > 0 && (
                            <div className="mt-2">
                              <div className="text-text-white uppercase tracking-wider text-xs mb-2">Exercises</div>
                              <div className="flex flex-wrap gap-1">
                                {section.blocks.map((block: any, blockIdx: number) => (
                                  <div
                                    key={blockIdx}
                                    className={`px-2 py-1 thin-border rounded text-xs ${theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-panel/50'}`}
                                  >
                                    {block.label && <span className="text-node-volt font-mono mr-1">{block.label}</span>}
                                    <span className="text-text-white">{block.exerciseName}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Slide 3: Participants & Start */}
              <div className="min-w-full h-full flex-shrink-0">
                <div className="bg-panel thin-border rounded-2xl h-full overflow-y-auto flex flex-col p-4">
                  <h2 className="font-bold mb-4 text-text-white text-xl" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    Participants
                  </h2>
                  <div className="mb-6">
                    <ParticipantManager
                      participants={participants}
                      onAdd={(p) => setParticipants(prev => [...prev, p])}
                      onRemove={(idx) => setParticipants(prev => prev.filter((_, i) => i !== idx))}
                    />
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <button
                      onClick={handleStartWorkout}
                      className="bg-node-volt text-dark font-bold px-8 py-4 rounded-lg hover:opacity-90 transition-opacity text-lg flex items-center gap-3 w-full justify-center"
                      style={{
                        fontFamily: 'var(--font-space-grotesk)',
                        minHeight: config.touchTargetSize,
                      }}
                    >
                      <Icons.PLAY size={24} />
                      Start Workout
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40 flex gap-2">
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setIntroSlideIndex(idx)}
                  className={`thin-border transition-all ${
                    idx === introSlideIndex
                      ? 'bg-node-volt border-node-volt'
                      : 'bg-panel hover:border-node-volt'
                  }`}
                  style={{
                    width: idx === introSlideIndex ? '24px' : '8px',
                    height: '8px',
                  }}
                />
              ))}
            </div>
          </>
          ) : (
            /* Desktop/Tablet: Single Screen */
            <div className={`bg-panel thin-border rounded-2xl max-w-5xl w-full h-[calc(100vh-100px)] overflow-hidden flex flex-col p-3 sm:p-4 md:p-6`}>
              {/* Header */}
              <div className="text-center mb-2 sm:mb-3 flex-shrink-0">
                <h1
                  className="font-bold mb-1 sm:mb-2"
                  style={{
                    fontFamily: 'var(--font-space-grotesk)',
                    fontSize: isTablet ? '2.5rem' : '3rem',
                    color: 'var(--node-volt)',
                    lineHeight: 1.1,
                  }}
                >
                  {workout.name}
                </h1>
                {workout.displayCode && (
                  <div className="text-node-volt font-mono text-base md:text-lg mb-1 sm:mb-2">
                    {workout.displayCode}
                  </div>
                )}
                {workout.description && (
                  <p className="text-text-white text-sm md:text-base max-w-2xl mx-auto mb-1 sm:mb-2">
                    {workout.description}
                  </p>
                )}
                {workout.archetype && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-node-volt/10 border border-node-volt/30 rounded-lg">
                    {(() => {
                      const ArchetypeIcon = Icons[workout.archetype as keyof typeof Icons] || Icons.WORKOUT;
                      return <ArchetypeIcon size={14} className="text-node-volt" />;
                    })()}
                    <span className="text-node-volt font-bold uppercase tracking-wider text-xs">{workout.archetype}</span>
                  </div>
                )}
              </div>

              {/* Workout Overview */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-2 sm:mb-3 flex-shrink-0">
                <div className={`thin-border rounded-lg p-2 sm:p-3 text-center ${theme === 'light' ? 'bg-gray-100 border-gray-300' : 'bg-dark-contrast'}`}>
                  <div className={`text-xs sm:text-sm mb-1 uppercase tracking-wider ${theme === 'light' ? 'text-gray-600' : 'text-text-white'}`}>Sections</div>
                  <div className={`text-xl sm:text-2xl md:text-3xl font-bold text-node-volt`}>{workout.sections.length}</div>
                </div>
                <div className={`thin-border rounded-lg p-2 sm:p-3 text-center ${theme === 'light' ? 'bg-gray-100 border-gray-300' : 'bg-dark-contrast'}`}>
                  <div className={`text-xs sm:text-sm mb-1 uppercase tracking-wider ${theme === 'light' ? 'text-gray-600' : 'text-text-white'}`}>Duration</div>
                  <div className={`text-xl sm:text-2xl md:text-3xl font-bold text-node-volt`}>{totalMinutes} min</div>
                </div>
                <div className={`thin-border rounded-lg p-2 sm:p-3 text-center ${theme === 'light' ? 'bg-gray-100 border-gray-300' : 'bg-dark-contrast'}`}>
                  <div className={`text-xs sm:text-sm mb-1 uppercase tracking-wider ${theme === 'light' ? 'text-gray-600' : 'text-text-white'}`}>Archetype</div>
                  <div className={`text-base sm:text-lg md:text-xl font-bold text-node-volt`}>{workout.archetype || 'N/A'}</div>
                </div>
              </div>

              {/* Detailed Sections List - Grid layout */}
              <div className={`flex-1 min-h-0 flex flex-col`}>
                <h2 className={`font-bold mb-1.5 text-text-white flex-shrink-0 ${isTablet ? 'text-lg' : 'text-xl'}`} style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Workout Breakdown
                </h2>
                <div className={`flex-1 min-h-0 overflow-hidden`}>
                  <div className={`grid ${isTablet ? 'grid-cols-2' : 'grid-cols-3'} gap-2 auto-rows-fr h-full`}>
                    {workout.sections.map((section, idx) => {
                      const sectionColor = SECTION_COLORS[section.type] || '#ccff00';
                      const blockCount = section.blocks?.length || 0;
                      const totalExercises = blockCount;
                      
                      return (
                        <div
                          key={section.id || idx}
                          className={`thin-border rounded-lg p-2.5 ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-dark-contrast'} flex flex-col h-full`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div
                                className="rounded-lg flex items-center justify-center font-bold flex-shrink-0 w-8 h-8 text-sm"
                                style={{ backgroundColor: `${sectionColor}20`, color: sectionColor }}
                              >
                                {idx + 1}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-text-white text-sm truncate">{section.title}</div>
                                <div className="text-node-volt uppercase tracking-wider text-[10px]">{section.type}</div>
                                <div className="text-text-white text-[10px] line-clamp-1">{getSectionTypeDescription(section.type)}</div>
                              </div>
                            </div>
                          </div>
                          
                          {section.note && (
                            <div className={`mb-2 p-2 rounded-lg ${theme === 'light' ? 'bg-gray-100' : 'bg-panel/50'}`}>
                              <p className={`text-text-white italic text-[10px] line-clamp-1`}>{section.note}</p>
                            </div>
                          )}

                          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2`}>
                            {section.type === 'EMOM' && (
                              <>
                                {section.emomRounds && (
                                  <div className={`rounded p-1.5 ${theme === 'light' ? 'bg-gray-100' : 'bg-panel/30'}`}>
                                    <div className={`text-text-white mb-0.5 text-[9px]`}>Rounds</div>
                                    <div className={`font-bold text-node-volt text-[10px]`}>{section.emomRounds}</div>
                                  </div>
                                )}
                                {section.emomWorkSec && (
                                  <div className={`rounded p-1.5 ${theme === 'light' ? 'bg-gray-100' : 'bg-panel/30'}`}>
                                    <div className={`text-text-white mb-0.5 text-[9px]`}>Work</div>
                                    <div className={`font-bold text-node-volt text-[10px]`}>{section.emomWorkSec}s</div>
                                  </div>
                                )}
                                {section.emomRestSec && (
                                  <div className={`rounded p-1.5 ${theme === 'light' ? 'bg-gray-100' : 'bg-panel/30'}`}>
                                    <div className={`text-text-white mb-0.5 text-[9px]`}>Rest</div>
                                    <div className={`font-bold text-node-volt text-[10px]`}>{section.emomRestSec}s</div>
                                  </div>
                                )}
                              </>
                            )}
                            {section.durationSec && (
                              <div className={`rounded p-1.5 ${theme === 'light' ? 'bg-gray-100' : 'bg-panel/30'}`}>
                                <div className={`text-text-white mb-0.5 text-[9px]`}>Duration</div>
                                <div className={`font-bold text-node-volt text-[10px]`}>{Math.ceil(section.durationSec / 60)} min</div>
                              </div>
                            )}
                            {totalExercises > 0 && (
                              <div className={`rounded p-1.5 ${theme === 'light' ? 'bg-gray-100' : 'bg-panel/30'}`}>
                                <div className={`text-text-white mb-0.5 text-[9px]`}>Exercises</div>
                                <div className={`font-bold text-node-volt text-[10px]`}>{totalExercises}</div>
                              </div>
                            )}
                          </div>

                          {/* Exercise List */}
                          {section.blocks && section.blocks.length > 0 && (
                            <div className="mt-1.5">
                              <div className={`text-text-white uppercase tracking-wider mb-1 text-[9px]`}>Exercises</div>
                              <div className="flex flex-wrap gap-1">
                                {section.blocks.map((block: any, blockIdx: number) => (
                                  <div
                                    key={blockIdx}
                                    className={`px-2 py-1 thin-border rounded ${theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-panel/50'} text-[10px]`}
                                  >
                                    {block.label && <span className="text-node-volt font-mono mr-1">{block.label}</span>}
                                    <span className="text-text-white truncate max-w-[120px] sm:max-w-[200px]">{block.exerciseName}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (showIntro) {
    return renderIntroCard();
  }

  return (
    <div
      className="fixed inset-0 bg-dark"
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        fontFamily: 'var(--font-manrope)',
        overflow: 'hidden',
        height: '100vh',
        width: '100vw',
      }}
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-panel/30 z-50">
        <div
          className="h-full bg-node-volt transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 z-[70] pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-node-volt rounded-full animate-confetti-fall"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Top Bar - Brutalist Style */}
      {showControls && (
        <div className="absolute top-0 left-0 right-0 z-40 bg-dark border-b thin-border pt-2 pb-2 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo showOS={false} className="text-base" />
              <div className="bg-panel thin-border px-3 py-1.5">
                <div className="text-muted-text text-xs font-mono uppercase tracking-wider">
                  {safeSectionIndex + 1} / {workout.sections.length}
                </div>
                {workout.displayCode && (
                  <div className="text-node-volt text-[10px] font-mono uppercase tracking-wider mt-0.5">
                    {workout.displayCode}
                  </div>
                )}
              </div>
              {isHyrox && (
                <div className="bg-panel thin-border px-3 py-1.5">
                  <div className="text-red-400 text-xs font-bold uppercase tracking-wider">HYROX</div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <AudioControls compact={isMobile} />
              <button
                onClick={toggleTheme}
                className="bg-panel thin-border text-text-white px-3 py-1.5 hover:border-node-volt transition-colors"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button
                onClick={() => setShowSectionMenu(true)}
                className="bg-panel thin-border text-text-white px-3 py-1.5 hover:border-node-volt transition-colors text-xs font-medium uppercase tracking-wider hidden sm:flex items-center gap-2"
              >
                <Icons.MENU size={14} />
                Sections
              </button>
              <button
                onClick={toggleFullscreen}
                className="bg-panel thin-border text-text-white px-3 py-1.5 hover:border-node-volt transition-colors"
              >
                {isFullscreen ? <Icons.MINIMIZE size={16} /> : <Icons.MAXIMIZE size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Brutalist Style, No Scrolling */}
      <div
        ref={sectionRef}
        className={`h-full w-full flex items-center justify-center ${getTransitionClass()}`}
        style={{
          background: 'var(--dark)',
          paddingTop: showControls ? (isMobile ? '60px' : '80px') : '0',
          paddingBottom: showControls ? (isMobile ? '80px' : '100px') : (isMobile ? '60px' : '80px'),
          paddingLeft: isMobile ? '0.5rem' : '1rem',
          paddingRight: isMobile ? '0.5rem' : '1rem',
          overflow: 'hidden',
          height: '100vh',
        }}
      >
        <div className="w-full h-full max-w-7xl flex flex-col items-center justify-center" style={{ 
          maxHeight: 'calc(100vh - 180px)',
          gap: isMobile ? '0.5rem' : '0.75rem',
        }}>
          {/* Section Title - Brutalist */}
          <div className="text-center" style={{ flexShrink: 0 }}>
            <h1
              className="font-bold uppercase tracking-wider mb-1"
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                color: 'var(--node-volt)',
                fontSize: isMobile ? '1.25rem' : isTablet ? '1.75rem' : '2rem',
                lineHeight: 1.1,
              }}
            >
              {currentSection.title}
            </h1>
            {currentSection.note && !isMobile && (
              <p className="text-text-white text-xs uppercase tracking-wider max-w-2xl mx-auto">
                {currentSection.note}
              </p>
            )}
          </div>

          {/* Section Content - Fits in viewport, no scrolling */}
          <div className="flex flex-col items-center justify-center w-full flex-1" style={{ 
            minHeight: 0, 
            maxHeight: '100%',
            overflow: 'hidden',
          }}>
            {renderSectionContent()}
          </div>
        </div>
      </div>

      {/* Navigation Dots - Brutalist */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40 flex gap-2 justify-center">
        {workout.sections.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleJumpToSection(idx)}
            className={`thin-border transition-all ${
              idx === safeSectionIndex
                ? 'bg-node-volt border-node-volt'
                : 'bg-panel hover:border-node-volt'
            }`}
            style={{
              width: idx === safeSectionIndex ? '24px' : '8px',
              height: '8px',
            }}
            title={workout.sections[idx].title}
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      {showControls && (
        <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 right-4 sm:right-8 z-40 flex justify-between pointer-events-none">
          <button
            onClick={handlePreviousSection}
            disabled={isFirstSection}
            className={`bg-panel thin-border text-text-white px-4 py-2 hover:border-node-volt transition-colors pointer-events-auto flex items-center gap-2 uppercase tracking-wider text-xs font-medium ${
              isFirstSection ? 'opacity-30 cursor-not-allowed' : ''
            }`}
            style={{ minWidth: config.touchTargetSize, minHeight: config.touchTargetSize }}
          >
            <Icons.CHEVRON_LEFT size={16} />
            <span className="hidden sm:inline">Previous</span>
          </button>
          <button
            onClick={isLastSection ? () => setShowRatingModal(true) : handleNextSection}
            className="bg-node-volt text-dark font-bold px-4 py-2 sm:px-6 sm:py-3 hover:opacity-90 transition-opacity pointer-events-auto flex items-center gap-2 uppercase tracking-wider text-xs font-medium"
            style={{
              fontFamily: 'var(--font-space-grotesk)',
              minWidth: config.touchTargetSize,
              minHeight: config.touchTargetSize,
            }}
          >
            <span>{isLastSection ? 'Complete' : 'Next'}</span>
            {!isLastSection && <Icons.CHEVRON_RIGHT size={16} />}
          </button>
        </div>
      )}

      {/* Section Jump Menu - Brutalist */}
      {showSectionMenu && (
        <div className="fixed inset-0 bg-dark/95 z-50 flex items-center justify-center p-4">
          <div className="bg-panel thin-border max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b thin-border flex items-center justify-between">
              <h2 className="text-xl font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Jump to Section
              </h2>
              <button
                onClick={() => setShowSectionMenu(false)}
                className="bg-panel thin-border text-text-white px-2 py-1 hover:border-node-volt transition-colors"
              >
                <Icons.X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {workout.sections.map((section, idx) => (
                <button
                  key={`${workout.id}-section-${section.id || idx}`}
                  onClick={() => handleJumpToSection(idx)}
                  className={`w-full text-left p-3 transition-colors ${
                    idx === safeSectionIndex
                      ? 'bg-node-volt text-dark border-2 border-node-volt'
                      : 'bg-panel thin-border hover:border-node-volt'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm uppercase tracking-wider mb-1">{section.title}</div>
                      <div className="text-xs text-muted-text uppercase tracking-wider font-mono">
                        {section.type}
                      </div>
                    </div>
                    <div className={`font-mono font-bold text-lg ${idx === safeSectionIndex ? 'text-dark' : 'text-node-volt'}`}>
                      {idx + 1}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <RatingModal
          workoutId={workout.id}
          sessionLogId={sessionId || undefined}
          onComplete={handleRatingComplete}
          onCancel={() => {
            setShowRatingModal(false);
            handleCompleteWorkout();
          }}
        />
      )}
    </div>
  );
}

