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
import { DeckTimer, DeckTimerRef } from './DeckTimer';
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
  intervalWorkSec?: number;
  intervalRestSec?: number;
  intervalRounds?: number;
  stationDurationSec?: number; // For timed stations format (5-10 min per station)
  isTimedStations?: boolean; // Flag for timed stations format vs rounds format
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
  averageRating?: number;
  ratingCount?: number;
}

interface LiveDeckPlayerProps {
  workout: Workout;
  sessionId: string | null;
  onComplete?: (rpe: number, notes: string) => void;
  onCreateSession?: () => Promise<void>;
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
  FINISHER: '#0066ff', // Blue to match timer color scheme
  COOLDOWN: '#4a9eff',
};

export function LiveDeckPlayer({ workout, sessionId, onComplete, onCreateSession }: LiveDeckPlayerProps) {
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [introSlideIndex, setIntroSlideIndex] = useState(0); // For mobile intro slides
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false);
  const [showSectionCelebration, setShowSectionCelebration] = useState(false);
  const [celebratedSectionIndex, setCelebratedSectionIndex] = useState<number | null>(null);
  const [showCoachAdminBypassConfirm, setShowCoachAdminBypassConfirm] = useState(false);
  const [pendingCompletion, setPendingCompletion] = useState<any>(null);
  const [participants, setParticipants] = useState<Array<{ id?: string; name: string; email?: string; isSignedUp: boolean; avatarUrl?: string }>>([]);
  const [activeStation, setActiveStation] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  // Track active exercise for AMRAP/CIRCUIT/FOR_TIME sections
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  // Track current phase for rest highlighting
  const [currentPhase, setCurrentPhase] = useState<'work' | 'rest'>('work');
  // Track which card is expanded on mobile (accordion behavior)
  const [expandedCardIndex, setExpandedCardIndex] = useState<number | null>(null);
  // Track auto-expanded cards (cards that should be expanded based on available space)
  const [autoExpandedCards, setAutoExpandedCards] = useState<Set<number>>(new Set());
  // Track which sections have completed their timers
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  // Track total elapsed time for timed stations sections
  const [timedStationsElapsedTime, setTimedStationsElapsedTime] = useState(0);
  // Track if session has been started (only when timer is actually started)
  const [sessionStarted, setSessionStarted] = useState(false);
  
  // Timer refs for all section types (must be at top level for Hooks rules)
  // Use a map to store refs by section index
  const timerRefs = useRef<Map<number, DeckTimerRef | null>>(new Map());
  
  // Track timer states for start button visibility
  const [showStartButton, setShowStartButton] = useState(true);
  
  const { config, isMobile, isTablet, isDesktop, isTV, getExerciseGridColumns, breakpoint } = useResponsiveLayout();
  const { playSound, playVoice } = useAudioSystem();
  const { triggerTransition, triggerCelebration, getTransitionClass } = useDeckAnimations();
  const { showConfetti, trigger: triggerConfetti } = useConfetti();
  const { theme, toggleTheme } = useTheme();
  
  const controlsTimeoutRef = useRef<number | undefined>(undefined);
  const introControlsTimeoutRef = useRef<number | undefined>(undefined);
  const sectionRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<number | null>(null);
  const touchEndRef = useRef<number | null>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

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
  
  // Helper to get current timer ref
  const getCurrentTimerRef = (): DeckTimerRef | null => {
    return timerRefs.current.get(safeSectionIndex) || null;
  };
  
  // Sync timer state for start button
  useEffect(() => {
    // Reset start button visibility when section changes
    setShowStartButton(true);
    
    const interval = setInterval(() => {
      const currentRef = timerRefs.current.get(safeSectionIndex);
      if (currentRef) {
        setShowStartButton(!currentRef.isRunning && !currentRef.isPaused);
      } else {
        setShowStartButton(true);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [safeSectionIndex]);
  
  useEffect(() => {
    if (safeSectionIndex !== currentSectionIndex) {
      setCurrentSectionIndex(safeSectionIndex);
    }
  }, [safeSectionIndex, currentSectionIndex]);

  // Reset active exercise index when section changes
  useEffect(() => {
    setActiveExerciseIndex(0);
    setExpandedCardIndex(null); // Reset expanded card when section changes
    setAutoExpandedCards(new Set()); // Reset auto-expanded cards
  }, [safeSectionIndex]);

  const currentSection = workout.sections[safeSectionIndex];
  if (!currentSection) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-muted-text">Workout section not found</div>
      </div>
    );
  }
  
  // Debug: Log breakpoint in development (after currentSection is defined)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      console.log('📱 Responsive Layout:', {
        breakpoint,
        isMobile,
        width: window.innerWidth,
        sectionType: currentSection?.type,
      });
    }
  }, [breakpoint, isMobile, currentSection?.type]);
  
  // Auto-expand cards on mobile based on available space
  useEffect(() => {
    if (!isMobile || !cardsContainerRef.current || !currentSection?.blocks || currentSection.blocks.length === 0) return;
    
    const calculateAutoExpanded = () => {
      const container = cardsContainerRef.current;
      if (!container) return;
      
      const containerHeight = container.clientHeight;
      if (containerHeight === 0) return; // Container not yet rendered
      
      const gap = 6; // 0.375rem = 6px (tighter spacing)
      const collapsedCardHeight = 60; // maxHeight of collapsed cards
      const expandedCardMinHeight = 180; // Estimated minimum height for expanded card
      const totalCards = currentSection.blocks.length;
      const newAutoExpanded = new Set<number>();
      
      // Only use 2-column layout if 5+ cards, otherwise single column
      if (totalCards >= 5) {
        // 2-column grid layout
        const rows = Math.ceil(totalCards / 2); // Number of rows in 2-column grid
        const availableHeightPerRow = containerHeight / rows;
        
        // For each row, check if cards can be expanded
        for (let row = 0; row < rows; row++) {
          const card1Index = row * 2;
          const card2Index = row * 2 + 1;
          
          // Check if we have space to expand cards in this row
          const canExpandBoth = availableHeightPerRow >= expandedCardMinHeight + gap;
          const canExpandOne = availableHeightPerRow >= (expandedCardMinHeight + collapsedCardHeight) / 2 + gap;
          
          if (canExpandBoth) {
            // Both cards in this row can be expanded
            if (card1Index < totalCards) newAutoExpanded.add(card1Index);
            if (card2Index < totalCards) newAutoExpanded.add(card2Index);
          } else if (canExpandOne) {
            // Only first card in row can be expanded
            if (card1Index < totalCards) newAutoExpanded.add(card1Index);
          }
          // Otherwise, both cards stay collapsed (default state)
        }
      } else {
        // Single column layout (< 5 cards)
        let usedHeight = 0;
        
        for (let i = 0; i < totalCards; i++) {
          const cardHeight = expandedCardMinHeight;
          const neededHeight = cardHeight + (i > 0 ? gap : 0);
          const remainingCards = totalCards - i - 1;
          const remainingCollapsedHeight = remainingCards > 0 ? remainingCards * (collapsedCardHeight + gap) : 0;
          
          if (usedHeight + neededHeight + remainingCollapsedHeight <= containerHeight) {
            // This card can be expanded and all remaining cards fit collapsed
            newAutoExpanded.add(i);
            usedHeight += neededHeight;
          } else {
            // This card should be collapsed
            usedHeight += collapsedCardHeight + (i > 0 ? gap : 0);
          }
        }
      }
      
      setAutoExpandedCards(newAutoExpanded);
    };
    
    // Calculate after a short delay to ensure layout is complete
    const timeout = setTimeout(calculateAutoExpanded, 150);
    
    // Also recalculate on window resize
    window.addEventListener('resize', calculateAutoExpanded);
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', calculateAutoExpanded);
    };
  }, [isMobile, currentSection?.blocks, safeSectionIndex]);

  // Calculate total pages (intro + sections) - available throughout component
  const totalPages = workout.sections.length + 1; // +1 for intro
  const currentPage = showIntro ? 1 : safeSectionIndex + 2; // Intro is page 1, first section is page 2

  const isFirstSection = safeSectionIndex === 0 && !showIntro;
  const isLastSection = safeSectionIndex === workout.sections.length - 1;
  const sectionColor = SECTION_COLORS[currentSection.type] || '#ccff00';
  const isHyrox = isHyroxWorkout(workout);

  // Calculate progress (includes intro)
  const progress = showIntro 
    ? (1 / totalPages) * 100 
    : ((safeSectionIndex + 2) / totalPages) * 100; // +2 because intro is page 1, first section is page 2

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
      // If on intro screen and mobile, handle intro slide navigation
      if (showIntro && isMobile) {
        if (diff > 0) {
          // Swipe left - next slide
          setIntroSlideIndex((prev) => Math.min(prev + 1, 2));
        } else {
          // Swipe right - previous slide
          setIntroSlideIndex((prev) => Math.max(prev - 1, 0));
        }
      } else if (!showIntro) {
        // Regular workout section navigation
      if (diff > 0) {
        handleNextSection();
      } else {
        handlePreviousSection();
        }
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

  // Check if all timers have been completed
  const allTimersCompleted = useCallback(() => {
    // Count sections that have timers (WARMUP, COOLDOWN, and FINISHER don't require timer completion)
    const sectionsWithTimers = workout.sections.filter((section, idx) => {
      // Skip WARMUP, COOLDOWN, and FINISHER - they don't need timer completion
      if (section.type === 'WARMUP' || section.type === 'COOLDOWN' || section.type === 'FINISHER') {
        return false;
      }
      return section.durationSec || 
             ((section.type === 'EMOM' || section.type === 'E2MOM') && section.emomWorkSec) ||
             (section.type === 'INTERVAL' && section.intervalWorkSec);
    });
    
    // If no sections have timers, allow completion (e.g., all WARMUP/COOLDOWN)
    if (sectionsWithTimers.length === 0) {
      return true;
    }
    
    // Check if all sections with timers have been completed
    return sectionsWithTimers.every((section) => {
      const sectionIndex = workout.sections.indexOf(section);
      return completedSections.has(sectionIndex);
    });
  }, [workout.sections, completedSections]);

  const handleSectionTimerComplete = useCallback((sectionIndex: number) => {
    setCompletedSections((prev) => new Set([...prev, sectionIndex]));
    
    // Trigger celebration for section completion
    const section = workout.sections[sectionIndex];
    // Only celebrate main sections (not warmup, cooldown, finisher)
    if (section && section.type !== 'WARMUP' && section.type !== 'COOLDOWN' && section.type !== 'FINISHER') {
      triggerCelebration();
      triggerConfetti();
      playSound('complete');
      setCelebratedSectionIndex(sectionIndex);
      setShowSectionCelebration(true);
      
      // Auto-hide celebration after 3 seconds
      setTimeout(() => {
        setShowSectionCelebration(false);
        setCelebratedSectionIndex(null);
      }, 3000);
    }
  }, [workout.sections, triggerCelebration, triggerConfetti, playSound]);

  // Reset active station and elapsed time when entering a timed stations section
  useEffect(() => {
    if (currentSection.type === 'FOR_TIME' && currentSection.isTimedStations) {
      setActiveStation(0);
      setActiveExerciseIndex(0);
      setCurrentRound(1);
      setTimedStationsElapsedTime(0);
    }
  }, [currentSectionIndex, currentSection.type, currentSection.isTimedStations]);

  const handleNextSection = useCallback(() => {
    const safeIndex = Math.min(Math.max(0, currentSectionIndex), workout.sections.length - 1);
    if (safeIndex < workout.sections.length - 1) {
      playSound('transition');
      triggerTransition('forward', 500);
      setCurrentSectionIndex(safeIndex + 1);
      setActiveStation(0);
      setCurrentRound(1);
      setActiveExerciseIndex(0); // Reset active exercise when moving to next section
      if (sectionRef.current) {
        sectionRef.current.scrollTop = 0;
      }
    } else {
      // Only show rating modal if all timers have been completed
      if (allTimersCompleted()) {
      setShowRatingModal(true);
      } else {
        // Show warning modal that timers were skipped
        setShowIncompleteWarning(true);
      }
    }
  }, [currentSectionIndex, workout.sections.length, playSound, triggerTransition, allTimersCompleted]);

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
      setActiveExerciseIndex(0); // Reset active exercise when moving to previous section
      if (sectionRef.current) {
        sectionRef.current.scrollTop = 0;
      }
    } else if (safeIndex === 0) {
      // Go back to intro from first section
      playSound('transition');
      setShowIntro(true);
      if (sectionRef.current) {
        sectionRef.current.scrollTop = 0;
      }
    }
  }, [currentSectionIndex, playSound, triggerTransition]);

  const handleJumpToSection = (index: number) => {
    if (index === -1) {
      // Jump to intro
      playSound('transition');
      setShowIntro(true);
      setShowSectionMenu(false);
    } else if (index >= 0 && index < workout.sections.length) {
      playSound('transition');
      const safeIndex = Math.min(Math.max(0, currentSectionIndex), workout.sections.length - 1);
      triggerTransition(index > safeIndex ? 'forward' : 'backward', 500);
      setShowIntro(false);
      setCurrentSectionIndex(index);
      setActiveStation(0);
      setCurrentRound(1);
      setActiveExerciseIndex(0); // Reset active exercise when jumping to section
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
    setCurrentPhase(phase);
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
      case 'E2MOM':
        const emomBlockCount = currentSection.blocks?.length || 0;
        const emomMaxColumns = isHyrox ? 8 : 6; // HYROX can have more
        const emomActualColumns = Math.min(emomBlockCount, emomMaxColumns);
        const emomIsSmallLayout = emomBlockCount >= 2 && emomBlockCount <= 4;
        const emomIsSingleCard = emomBlockCount === 1;
        // For EMOM, use larger cards to show more info - only compact if 5+ exercises
        const emomShouldBeCompact = emomBlockCount >= 5;
        
        return (
          <div className="w-full h-full flex flex-col" style={{ gap: isMobile ? '0.75rem' : '1rem', maxHeight: '100%', padding: isMobile ? '0.5rem' : '1rem' }}>
            {/* Timer and Station Indicator - Always Visible, Fixed at Top */}
            <div className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <div style={{ flexShrink: 0 }}>
            <DeckTimer
                  ref={(ref) => {
                    // Always update the ref when it changes
                    if (ref) {
                      timerRefs.current.set(safeSectionIndex, ref);
                      // Force a re-check of start button state
                      setTimeout(() => {
                        setShowStartButton(!ref.isRunning && !ref.isPaused);
                      }, 50);
                    } else {
                      // Only delete if we're sure the component is unmounting
                      // Don't delete on every null ref (which happens during re-renders)
                      const timer = timerRefs.current.get(safeSectionIndex);
                      if (timer === ref) {
                        timerRefs.current.delete(safeSectionIndex);
                      }
                    }
                  }}
                  key={`${currentSection.type.toLowerCase()}-${currentSection.id}-${safeSectionIndex}`}
              type={currentSection.type === 'E2MOM' ? 'E2MOM' : 'EMOM'}
              workSec={currentSection.emomWorkSec || (currentSection.type === 'E2MOM' ? 90 : 45)}
              restSec={currentSection.emomRestSec || (currentSection.type === 'E2MOM' ? 30 : 15)}
              rounds={currentSection.emomRounds || 12}
              onPhaseChange={handlePhaseChange}
              autoStart={false}
              showPreCountdown={true}
              hideControls={true}
                  onComplete={async () => {
                    handleSectionTimerComplete(safeSectionIndex);
                    // Create session when first timer is started (if not already created)
                    if (!sessionStarted && !sessionId && onCreateSession) {
                      await onCreateSession();
                      setSessionStarted(true);
                    } else if (!sessionStarted && sessionId) {
                      setSessionStarted(true);
                    }
                  }}
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
            </div>
            
            {/* Cards - Show all on mobile if space allows, otherwise grid layout */}
            <div
              className={isMobile ? "grid w-full flex-1 min-h-0" : "grid justify-center w-full flex-1 min-h-0"}
              style={isMobile ? {
                // Use 2 columns only if 5+ cards, otherwise single column
                gridTemplateColumns: emomBlockCount >= 5 ? 'repeat(2, 1fr)' : '1fr',
                gap: '1rem', // Proper spacing between cards
                maxWidth: '100%',
                overflow: 'hidden', // No scrolling - accordion behavior
              } : {
                gridTemplateColumns: emomIsSingleCard ? '1fr' : `repeat(${emomActualColumns}, 1fr)`,
                gap: emomIsSmallLayout ? '1.5rem' : '1rem',
                maxWidth: emomIsSingleCard ? '600px' : '100%',
                alignContent: 'start',
              }}
            >
              {currentSection.blocks?.map((block: any, idx: number) => {
                const isActive = idx === activeStation;
                const nextStation = (activeStation + 1) % (currentSection.blocks?.length || 1);
                const isNext = idx === nextStation;
                // During rest phase, highlight the next exercise with "get ready" style
                const isRestPhase = currentPhase === 'rest' && isNext && !isActive;
                // For mobile, use compact layout if 5+ cards, otherwise larger
                const mobileCompact = isMobile && emomBlockCount >= 5;
                const mobileLargeText = isMobile && emomBlockCount < 5;
                // On mobile, collapse non-active cards by default, but allow manual expansion
                // Track which cards are manually expanded (separate from active station)
                const isManuallyExpanded = isMobile && expandedCardIndex === idx;
                const isExpandedOnMobile = isMobile ? (isActive || isManuallyExpanded) : undefined;
                const isCompactOnMobile = isMobile && !isActive && !isManuallyExpanded;
                
                return (
                  <CollapsibleExerciseCard
                    key={`${currentSection.id}-block-${block.id || idx}`}
                    block={block}
                    isActive={isActive}
                    isRestPhase={isRestPhase}
                    sectionColor={sectionColor}
                    compact={isMobile ? (isCompactOnMobile || mobileCompact) : emomShouldBeCompact}
                    largeText={isMobile ? (isExpandedOnMobile ? mobileLargeText : false) : (emomIsSmallLayout || emomIsSingleCard)}
                    showFullDescription={emomBlockCount <= 2}
                    showTiersAlways={true}
                    isExpanded={isExpandedOnMobile}
                    onExpandChange={(expanded) => {
                      if (isMobile) {
                        // Allow manual expansion/collapse without changing active station
                        setExpandedCardIndex(expanded ? idx : null);
                      }
                    }}
                  />
                );
              })}
            </div>
          </div>
        );

      case 'INTERVAL':
        // Sprint/interval sessions: short work periods with long rest
        const intervalBlockCount = currentSection.blocks?.length || 0;
        const intervalMaxColumns = isHyrox ? 8 : 6;
        const intervalActualColumns = Math.min(intervalBlockCount, intervalMaxColumns);
        const intervalIsSmallLayout = intervalBlockCount >= 2 && intervalBlockCount <= 4;
        const intervalIsSingleCard = intervalBlockCount === 1;
        
        return (
          <div className="w-full h-full flex flex-col" style={{ gap: '1rem', maxHeight: '100%', padding: isMobile ? '0.5rem' : '1rem' }}>
            {/* Timer - Always Visible, Fixed at Top */}
            <div style={{ flexShrink: 0 }}>
              <DeckTimer
                ref={(ref) => {
                  // Always update the ref when it changes
                  if (ref) {
                    timerRefs.current.set(safeSectionIndex, ref);
                    // Force a re-check of start button state
                    setTimeout(() => {
                      setShowStartButton(!ref.isRunning && !ref.isPaused);
                    }, 50);
                  } else {
                    // Only delete if we're sure the component is unmounting
                    // Don't delete on every null ref (which happens during re-renders)
                    const timer = timerRefs.current.get(safeSectionIndex);
                    if (timer === ref) {
                      timerRefs.current.delete(safeSectionIndex);
                    }
                  }
                }}
                key={`interval-${currentSection.id}-${safeSectionIndex}`}
                type="INTERVAL"
                workSec={currentSection.intervalWorkSec || 20}
                restSec={currentSection.intervalRestSec || 100}
                rounds={currentSection.intervalRounds || 8}
                onPhaseChange={handlePhaseChange}
                autoStart={false}
                showPreCountdown={true}
                hideControls={true}
                onComplete={async () => {
                  handleSectionTimerComplete(safeSectionIndex);
                  // Create session when first timer is started (if not already created)
                  if (!sessionStarted && !sessionId && onCreateSession) {
                    await onCreateSession();
                    setSessionStarted(true);
                  } else if (!sessionStarted && sessionId) {
                    setSessionStarted(true);
                  }
                }}
              />
            </div>
            {/* Cards - Conditional Layout on Mobile, Grid on Desktop */}
            <div
              ref={cardsContainerRef}
              className={isMobile ? "grid w-full flex-1 min-h-0" : "grid justify-center w-full flex-1 min-h-0"}
              style={isMobile ? {
                // Use 2 columns only if 5+ cards, otherwise single column
                gridTemplateColumns: intervalBlockCount >= 5 ? 'repeat(2, 1fr)' : '1fr',
                gap: '1rem', // Proper spacing between cards
                maxWidth: '100%',
                overflow: 'hidden', // No scrolling - accordion behavior
              } : {
                gridTemplateColumns: intervalIsSingleCard ? '1fr' : `repeat(${intervalActualColumns}, 1fr)`,
                gap: intervalIsSmallLayout ? '1.5rem' : '0.75rem',
                maxWidth: intervalIsSingleCard ? '600px' : '100%',
                alignContent: 'start',
              }}
            >
              {currentSection.blocks?.map((block: any, idx: number) => {
                const isManuallyExpanded = expandedCardIndex === idx;
                const isAutoExpanded = expandedCardIndex === null && autoExpandedCards.has(idx);
                const isExpanded = isMobile ? (isManuallyExpanded || isAutoExpanded) : undefined;
                const isCompact = isMobile ? (expandedCardIndex !== null && !isManuallyExpanded) || (expandedCardIndex === null && !isAutoExpanded) : (!intervalIsSmallLayout && !intervalIsSingleCard);
                // Expanded cards should span full width (both columns)
                const shouldSpanFullWidth = isMobile && intervalBlockCount >= 5 && isExpanded;
                
                return (
                  <CollapsibleExerciseCard
                    key={`${currentSection.id}-block-${block.id || idx}`}
                    block={block}
                    isActive={idx === activeExerciseIndex}
                    sectionColor={sectionColor}
                    compact={isCompact}
                    largeText={isMobile ? isExpanded : (intervalIsSmallLayout || intervalIsSingleCard)}
                    showFullDescription={intervalBlockCount <= 2 && !isMobile}
                    onClick={() => setActiveExerciseIndex(idx)}
                    isExpanded={isExpanded}
                    onExpandChange={(expanded) => {
                      if (isMobile) {
                        setExpandedCardIndex(expanded ? idx : null);
                        if (expanded) {
                          setAutoExpandedCards(prev => {
                            const next = new Set(prev);
                            next.delete(idx);
                            return next;
                          });
                        }
                      }
                    }}
                    style={shouldSpanFullWidth ? { gridColumn: '1 / -1' } : undefined}
                  />
                );
              })}
            </div>
          </div>
        );

      case 'FOR_TIME':
        // Check if this is timed stations format
        if (currentSection.isTimedStations && currentSection.stationDurationSec) {
          // TIMED STATIONS FORMAT: Each station has fixed duration, then moves to next
          const timedStationsBlockCount = currentSection.blocks?.length || 0;
          const timedStationsMaxColumns = isHyrox ? 8 : 6;
          const timedStationsActualColumns = Math.min(timedStationsBlockCount, timedStationsMaxColumns);
          const timedStationsIsSmallLayout = timedStationsBlockCount >= 2 && timedStationsBlockCount <= 4;
          const timedStationsIsSingleCard = timedStationsBlockCount === 1;
          const timedStationsShouldBeCompact = timedStationsBlockCount >= 5;
          
          // Calculate total rounds possible (for display)
          const stationDuration = currentSection.stationDurationSec;
          const totalDuration = currentSection.durationSec || 3600;
          const estimatedRounds = Math.floor(totalDuration / (stationDuration * timedStationsBlockCount));
          
          return (
            <div className="w-full h-full flex flex-col" style={{ gap: isMobile ? '0.75rem' : '1rem', maxHeight: '100%', padding: isMobile ? '0.5rem' : '1rem' }}>
              {/* Timer and Station Indicator - Top Row */}
              <div className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <div style={{ flexShrink: 0 }}>
                  <DeckTimer
                    ref={(ref) => {
                      if (ref) {
                        timerRefs.current.set(safeSectionIndex, ref);
                      } else {
                        timerRefs.current.delete(safeSectionIndex);
                      }
                    }}
                    key={`timed-station-${currentSection.id}-${safeSectionIndex}-${activeStation}`}
                    type="COUNTDOWN"
                    durationSec={stationDuration}
                    autoStart={false}
                    showPreCountdown={true}
                    hideControls={true}
                    onComplete={async () => {
                      // Add this station's duration to elapsed time
                      let shouldAdvance = false;
                      let newElapsed = 0;
                      
                      setTimedStationsElapsedTime(prev => {
                        newElapsed = prev + stationDuration;
                        
                        // Check if total time cap is reached
                        if (newElapsed >= totalDuration) {
                          // Time cap reached - mark section as complete
                          handleSectionTimerComplete(safeSectionIndex);
                          return newElapsed;
                        }
                        
                        // Time cap not reached - will advance to next station
                        shouldAdvance = true;
                        return newElapsed;
                      });
                      
                      // Move to next station if time cap not reached
                      if (shouldAdvance && newElapsed < totalDuration) {
                        const nextStation = (activeStation + 1) % timedStationsBlockCount;
                        setActiveStation(nextStation);
                        setActiveExerciseIndex(nextStation);
                        
                        // If we've completed all stations, increment round
                        if (nextStation === 0) {
                          setCurrentRound(prev => prev + 1);
                        }
                      }
                      
                      // Create session when first timer is started (if not already created)
                      if (!sessionStarted && !sessionId && onCreateSession) {
                        await onCreateSession();
                        setSessionStarted(true);
                      } else if (!sessionStarted && sessionId) {
                        setSessionStarted(true);
                      }
                    }}
                  />
                </div>
                <div style={{ flexShrink: 0 }}>
                  <StationIndicator
                    totalStations={timedStationsBlockCount}
                    activeStation={activeStation}
                    currentRound={currentRound}
                    totalRounds={estimatedRounds}
                    nextStation={(activeStation + 1) % timedStationsBlockCount}
                    stationNames={currentSection.blocks?.map((b: any) => b.exerciseName)}
                  />
                </div>
              </div>
              
              {/* Cards - Show all on mobile if space allows */}
              <div
                className={isMobile ? "grid w-full flex-1 min-h-0" : "grid justify-center w-full flex-1 min-h-0"}
                style={isMobile ? {
                  // Use 2 columns only if 5+ cards, otherwise single column
                  gridTemplateColumns: timedStationsBlockCount >= 5 ? 'repeat(2, 1fr)' : '1fr',
                  gap: '1rem', // Proper spacing between cards
                  maxWidth: '100%',
                  overflow: 'hidden', // No scrolling - accordion behavior
                } : {
                  gridTemplateColumns: timedStationsIsSingleCard ? '1fr' : `repeat(${timedStationsActualColumns}, 1fr)`,
                  gap: timedStationsIsSmallLayout ? '1.5rem' : '1rem',
                  maxWidth: timedStationsIsSingleCard ? '600px' : '100%',
                  alignContent: 'start',
                }}
              >
                {currentSection.blocks?.map((block: any, idx: number) => {
                  const isActive = idx === activeStation;
                  // For mobile, use compact layout if 5+ cards, otherwise larger
                  const mobileCompact = isMobile && timedStationsBlockCount >= 5;
                  const mobileLargeText = isMobile && timedStationsBlockCount < 5;
                  // On mobile, collapse non-active cards by default, but allow manual expansion
                  const isManuallyExpanded = isMobile && expandedCardIndex === idx;
                  const isExpandedOnMobile = isMobile ? (isActive || isManuallyExpanded) : undefined;
                  const isCompactOnMobile = isMobile && !isActive && !isManuallyExpanded;
                  
                  return (
                    <CollapsibleExerciseCard
                      key={`${currentSection.id}-block-${block.id || idx}`}
                      block={block}
                      isActive={isActive}
                      sectionColor={sectionColor}
                      compact={isMobile ? (isCompactOnMobile || mobileCompact) : timedStationsShouldBeCompact}
                      largeText={isMobile ? (isExpandedOnMobile ? mobileLargeText : false) : (timedStationsIsSmallLayout || timedStationsIsSingleCard)}
                      showFullDescription={timedStationsBlockCount <= 2}
                      showTiersAlways={true}
                      isExpanded={isExpandedOnMobile}
                      onExpandChange={(expanded) => {
                        if (isMobile) {
                          // Allow manual expansion/collapse without changing active station
                          setExpandedCardIndex(expanded ? idx : null);
                        }
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        }
        
        // Regular FOR_TIME format (rounds-based)
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
        const blockCount = currentSection.blocks?.length || 0;
        const maxColumns = isHyrox ? 8 : 6; // HYROX can have more
        const actualColumns = Math.min(blockCount, maxColumns);
        const isSmallLayout = blockCount >= 2 && blockCount <= 5; // Include 5 cards for larger text
        const isSingleCard = blockCount === 1;
        
        return (
          <div className="w-full h-full flex flex-col" style={{ gap: '1rem', maxHeight: '100%', padding: isMobile ? '0.5rem' : '1rem' }}>
            {/* Timer and Targets - Always Visible, Fixed at Top */}
            <div className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <div style={{ flexShrink: 0 }}>
            <DeckTimer
                ref={(ref) => {
                  // Always update the ref when it changes
                  if (ref) {
                    timerRefs.current.set(safeSectionIndex, ref);
                    // Force a re-check of start button state
                    setTimeout(() => {
                      setShowStartButton(!ref.isRunning && !ref.isPaused);
                    }, 50);
                  } else {
                    // Only delete if we're sure the component is unmounting
                    // Don't delete on every null ref (which happens during re-renders)
                    const timer = timerRefs.current.get(safeSectionIndex);
                    if (timer === ref) {
                      timerRefs.current.delete(safeSectionIndex);
                    }
                  }
                }}
                key={`amrap-${currentSection.id}-${safeSectionIndex}`}
              type="AMRAP"
              durationSec={currentSection.durationSec || 720}
              autoStart={false}
              showPreCountdown={true}
              hideControls={true}
              onComplete={async () => {
                handleSectionTimerComplete(safeSectionIndex);
                // Create session when first timer is started (if not already created)
                if (!sessionStarted && !sessionId && onCreateSession) {
                  await onCreateSession();
                  setSessionStarted(true);
                } else if (!sessionStarted && sessionId) {
                  setSessionStarted(true);
                }
              }}
            />
            </div>
            {/* Target Rounds - Right Side */}
            {tierTargets && (
              <div className="flex flex-col items-center gap-3">
                <div className="bg-panel thin-border px-4 py-3 flex flex-col items-center gap-2">
                  <div className="text-xs text-muted-text uppercase tracking-wider font-mono">Target:</div>
                  <div className="flex items-center gap-2">
                    <div className="bg-panel thin-border px-2 py-1.5 flex flex-col items-center">
                      <div className="text-[10px] text-muted-text uppercase tracking-wider font-mono">SILVER</div>
                      <div className="text-sm font-bold text-node-volt">{tierTargets.silver}</div>
                    </div>
                    <div className="bg-panel thin-border px-2 py-1.5 flex flex-col items-center" style={{ borderColor: '#ffd700' }}>
                      <div className="text-[10px] text-muted-text uppercase tracking-wider font-mono">GOLD</div>
                      <div className="text-sm font-bold" style={{ color: '#ffd700' }}>{tierTargets.gold}</div>
                    </div>
                    <div className="bg-dark thin-border px-2 py-1.5 flex flex-col items-center" style={{ borderColor: 'rgba(255, 255, 255, 0.4)' }}>
                      <div className="text-[10px] text-text-white uppercase tracking-wider font-mono">BLACK</div>
                      <div className="text-sm font-bold text-text-white">{tierTargets.black}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
            
            {/* Cards - Conditional Layout on Mobile, Grid on Desktop */}
            <div
              ref={cardsContainerRef}
              className={isMobile ? "grid w-full flex-1 min-h-0" : "grid justify-center w-full flex-1 min-h-0"}
              style={isMobile ? {
                // Use 2 columns only if 5+ cards, otherwise single column
                gridTemplateColumns: blockCount >= 5 ? 'repeat(2, 1fr)' : '1fr',
                gap: '1rem', // Proper spacing between cards
                maxWidth: '100%',
                overflow: 'hidden', // No scrolling - accordion behavior
              } : {
                gridTemplateColumns: isSingleCard ? '1fr' : `repeat(${actualColumns}, 1fr)`,
                gap: isSmallLayout ? '1.5rem' : '0.75rem',
                maxWidth: isSingleCard ? '600px' : '100%',
                alignContent: 'start',
              }}
            >
              {currentSection.blocks?.map((block: any, idx: number) => {
                const isManuallyExpanded = expandedCardIndex === idx;
                const isAutoExpanded = expandedCardIndex === null && autoExpandedCards.has(idx);
                const isExpanded = isMobile ? (isManuallyExpanded || isAutoExpanded) : undefined;
                const isCompact = isMobile ? (expandedCardIndex !== null && !isManuallyExpanded) || (expandedCardIndex === null && !isAutoExpanded) : (!isSmallLayout && !isSingleCard);
                // Expanded cards should span full width (both columns)
                const shouldSpanFullWidth = isMobile && blockCount >= 5 && isExpanded;
                
                return (
                  <CollapsibleExerciseCard 
                    key={`${currentSection.id}-block-${block.id || idx}`} 
                    block={block}
                    isActive={idx === activeExerciseIndex}
                    sectionColor={sectionColor}
                    compact={isCompact}
                    largeText={isMobile ? isExpanded : (isSmallLayout || isSingleCard)}
                    showFullDescription={blockCount <= 2 && !isMobile}
                    onClick={() => setActiveExerciseIndex(idx)}
                    isExpanded={isExpanded}
                    onExpandChange={(expanded) => {
                      if (isMobile) {
                        setExpandedCardIndex(expanded ? idx : null);
                        if (expanded) {
                          setAutoExpandedCards(prev => {
                            const next = new Set(prev);
                            next.delete(idx);
                            return next;
                          });
                        }
                      }
                    }}
                    style={shouldSpanFullWidth ? { gridColumn: '1 / -1' } : undefined}
                  />
                );
              })}
            </div>
          </div>
        );

      case 'AMRAP':
      case 'CIRCUIT':
        // Parse tier target rounds from note
        const parseTierTargetsAmrap = (note: string | undefined) => {
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
        
        const tierTargetsAmrap = parseTierTargetsAmrap(currentSection.note);
        const blockCountAmrap = currentSection.blocks?.length || 0;
        const maxColumnsAmrap = isHyrox ? 8 : 6; // HYROX can have more
        const actualColumnsAmrap = Math.min(blockCountAmrap, maxColumnsAmrap);
        const isSmallLayoutAmrap = blockCountAmrap >= 2 && blockCountAmrap <= 5; // Include 5 cards for larger text
        const isSingleCardAmrap = blockCountAmrap === 1;
        
        return (
          <div className="w-full h-full flex flex-col" style={{ gap: '1rem', maxHeight: '100%', padding: isMobile ? '0.5rem' : '1rem' }}>
            {/* Timer and Targets - Always Visible, Fixed at Top */}
            <div className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <div style={{ flexShrink: 0 }}>
            <DeckTimer
                ref={(ref) => {
                  // Always update the ref when it changes
                  if (ref) {
                    timerRefs.current.set(safeSectionIndex, ref);
                    // Force a re-check of start button state
                    setTimeout(() => {
                      setShowStartButton(!ref.isRunning && !ref.isPaused);
                    }, 50);
                  } else {
                    // Only delete if we're sure the component is unmounting
                    // Don't delete on every null ref (which happens during re-renders)
                    const timer = timerRefs.current.get(safeSectionIndex);
                    if (timer === ref) {
                      timerRefs.current.delete(safeSectionIndex);
                    }
                  }
                }}
                key={`amrap-${currentSection.id}-${safeSectionIndex}`}
              type="AMRAP"
              durationSec={currentSection.durationSec || 720}
              autoStart={false}
              showPreCountdown={true}
              hideControls={true}
              onComplete={async () => {
                handleSectionTimerComplete(safeSectionIndex);
                // Create session when first timer is started (if not already created)
                if (!sessionStarted && !sessionId && onCreateSession) {
                  await onCreateSession();
                  setSessionStarted(true);
                } else if (!sessionStarted && sessionId) {
                  setSessionStarted(true);
                }
              }}
            />
            </div>
            {/* Target Rounds - Right Side */}
            {tierTargetsAmrap && (
              <div className="flex flex-col items-center gap-3">
                <div className="bg-panel thin-border px-4 py-3 flex flex-col items-center gap-2">
                  <div className="text-xs text-muted-text uppercase tracking-wider font-mono">Target:</div>
                  <div className="flex items-center gap-2">
                    <div className="bg-panel thin-border px-2 py-1.5 flex flex-col items-center">
                      <div className="text-[10px] text-muted-text uppercase tracking-wider font-mono">SILVER</div>
                      <div className="text-sm font-bold text-node-volt">{tierTargetsAmrap.silver}</div>
                    </div>
                    <div className="bg-panel thin-border px-2 py-1.5 flex flex-col items-center" style={{ borderColor: '#ffd700' }}>
                      <div className="text-[10px] text-muted-text uppercase tracking-wider font-mono">GOLD</div>
                      <div className="text-sm font-bold" style={{ color: '#ffd700' }}>{tierTargetsAmrap.gold}</div>
                    </div>
                    <div className="bg-dark thin-border px-2 py-1.5 flex flex-col items-center" style={{ borderColor: 'rgba(255, 255, 255, 0.4)' }}>
                      <div className="text-[10px] text-text-white uppercase tracking-wider font-mono">BLACK</div>
                      <div className="text-sm font-bold text-text-white">{tierTargetsAmrap.black}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
            
            {/* Cards - Conditional Layout on Mobile, Grid on Desktop */}
            <div
              ref={cardsContainerRef}
              className={isMobile ? "grid w-full flex-1 min-h-0" : "grid justify-center w-full flex-1 min-h-0"}
              style={isMobile ? {
                // Use 2 columns only if 5+ cards, otherwise single column
                gridTemplateColumns: blockCountAmrap >= 5 ? 'repeat(2, 1fr)' : '1fr',
                gap: '1rem', // Proper spacing between cards
                maxWidth: '100%',
                overflow: 'hidden', // No scrolling - accordion behavior
              } : {
                gridTemplateColumns: isSingleCardAmrap ? '1fr' : `repeat(${actualColumnsAmrap}, 1fr)`,
                gap: isSmallLayoutAmrap ? '1.5rem' : '0.75rem',
                maxWidth: isSingleCardAmrap ? '600px' : '100%',
                alignContent: 'start',
              }}
            >
              {currentSection.blocks?.map((block: any, idx: number) => {
                // Auto-expand logic: expand cards that fit, starting from first
                // If user manually expanded a card, use that; otherwise use auto-expanded
                const isManuallyExpanded = expandedCardIndex === idx;
                const isAutoExpanded = expandedCardIndex === null && autoExpandedCards.has(idx);
                const isExpanded = isMobile ? (isManuallyExpanded || isAutoExpanded) : undefined;
                const isCompact = isMobile ? (expandedCardIndex !== null && !isManuallyExpanded) || (expandedCardIndex === null && !isAutoExpanded) : (!isSmallLayoutAmrap && !isSingleCardAmrap);
                // Expanded cards should span full width (both columns)
                const shouldSpanFullWidth = isMobile && blockCountAmrap >= 5 && isExpanded;
                
                return (
                  <CollapsibleExerciseCard 
                    key={`${currentSection.id}-block-${block.id || idx}`} 
                    block={block}
                    isActive={idx === activeExerciseIndex}
                    sectionColor={sectionColor}
                    compact={isCompact}
                    largeText={isMobile ? isExpanded : (isSmallLayoutAmrap || isSingleCardAmrap)}
                    showFullDescription={blockCountAmrap <= 2 && !isMobile}
                    onClick={() => setActiveExerciseIndex(idx)}
                    isExpanded={isExpanded}
                    onExpandChange={(expanded) => {
                      if (isMobile) {
                        setExpandedCardIndex(expanded ? idx : null);
                        // Remove from auto-expanded when manually toggled
                        if (expanded) {
                          setAutoExpandedCards(prev => {
                            const next = new Set(prev);
                            next.delete(idx);
                            return next;
                          });
                        }
                      }
                    }}
                    style={shouldSpanFullWidth ? { gridColumn: '1 / -1' } : undefined}
                  />
                );
              })}
            </div>
          </div>
        );

      default:
        const defaultBlockCount = currentSection.blocks?.length || 0;
        const defaultMaxColumns = isHyrox ? 8 : 6; // HYROX can have more
        const defaultActualColumns = Math.min(defaultBlockCount, defaultMaxColumns);
        const defaultIsSmallLayout = defaultBlockCount >= 2 && defaultBlockCount <= 4;
        const defaultIsSingleCard = defaultBlockCount === 1;
        
        return (
          <div className="w-full h-full flex flex-col" style={{ gap: '1rem', maxHeight: '100%', padding: isMobile ? '0.5rem' : '1rem' }}>
            {/* Timer - Always Visible, Fixed at Top */}
            {currentSection.durationSec && (
              <div className="flex-shrink-0 flex justify-center">
              <DeckTimer
                  ref={(ref) => {
                    if (ref) {
                      timerRefs.current.set(safeSectionIndex, ref);
                    } else {
                      timerRefs.current.delete(safeSectionIndex);
                    }
                  }}
                  key={`countdown-${currentSection.id}-${safeSectionIndex}`}
                type="COUNTDOWN"
                durationSec={currentSection.durationSec}
                autoStart={false}
                showPreCountdown={true}
                hideControls={true}
              onComplete={async () => {
                handleSectionTimerComplete(safeSectionIndex);
                // Create session when first timer is started (if not already created)
                if (!sessionStarted && !sessionId && onCreateSession) {
                  await onCreateSession();
                  setSessionStarted(true);
                } else if (!sessionStarted && sessionId) {
                  setSessionStarted(true);
                }
              }}
              />
              </div>
            )}
            {/* Cards - Conditional Layout on Mobile, Grid on Desktop */}
            <div
              ref={cardsContainerRef}
              className={isMobile ? "grid w-full flex-1 min-h-0" : "grid justify-center w-full flex-1 min-h-0"}
              style={isMobile ? {
                // Use 2 columns only if 5+ cards, otherwise single column
                gridTemplateColumns: defaultBlockCount >= 5 ? 'repeat(2, 1fr)' : '1fr',
                gap: '1rem', // Proper spacing between cards
                maxWidth: '100%',
                overflow: 'hidden', // No scrolling - accordion behavior
              } : {
                gridTemplateColumns: defaultIsSingleCard ? '1fr' : `repeat(${defaultActualColumns}, 1fr)`,
                gap: defaultIsSmallLayout ? '1.5rem' : '0.75rem',
                maxWidth: defaultIsSingleCard ? '600px' : '100%',
                alignContent: 'start',
              }}
            >
              {currentSection.blocks?.map((block: any, idx: number) => {
                const isManuallyExpanded = expandedCardIndex === idx;
                const isAutoExpanded = expandedCardIndex === null && autoExpandedCards.has(idx);
                const isExpanded = isMobile ? (isManuallyExpanded || isAutoExpanded) : undefined;
                const isCompact = isMobile ? (expandedCardIndex !== null && !isManuallyExpanded) || (expandedCardIndex === null && !isAutoExpanded) : (!defaultIsSmallLayout && !defaultIsSingleCard);
                // Expanded cards should span full width (both columns)
                const shouldSpanFullWidth = isMobile && defaultBlockCount >= 5 && isExpanded;
                
                return (
                  <CollapsibleExerciseCard 
                    key={`${currentSection.id}-block-${block.id || idx}`} 
                    block={block}
                    isActive={idx === activeExerciseIndex}
                    sectionColor={sectionColor}
                    compact={isCompact}
                    largeText={isMobile ? isExpanded : (defaultIsSmallLayout || defaultIsSingleCard)}
                    showFullDescription={defaultBlockCount <= 2 && !isMobile}
                    onClick={() => setActiveExerciseIndex(idx)}
                    isExpanded={isExpanded}
                    onExpandChange={(expanded) => {
                      if (isMobile) {
                        setExpandedCardIndex(expanded ? idx : null);
                        if (expanded) {
                          setAutoExpandedCards(prev => {
                            const next = new Set(prev);
                            next.delete(idx);
                            return next;
                          });
                        }
                      }
                    }}
                    style={shouldSpanFullWidth ? { gridColumn: '1 / -1' } : undefined}
                  />
                );
              })}
            </div>
          </div>
        );
    }
  };

  // Render intro card (content only, no navbar - navbar is handled in parent)
  const renderIntroCard = () => {
    const totalDuration = workout.sections.reduce((acc, section) => {
      if ((section.type === 'EMOM' || section.type === 'E2MOM') && section.emomRounds && section.emomWorkSec && section.emomRestSec) {
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
    <div className="w-full h-full">
          {isMobile ? (
            <div className="w-full h-full overflow-y-auto">
              <div className="bg-panel thin-border rounded-2xl flex flex-col p-4">
                {/* Header */}
                <div className="text-center mb-3 flex-shrink-0">
                  {workout.archetype && (
                    <div className="flex justify-center mb-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-node-volt/10 border border-node-volt/30 rounded-lg">
                        {(() => {
                          const ArchetypeIcon = Icons[workout.archetype as keyof typeof Icons] || Icons.WORKOUT;
                          return <ArchetypeIcon size={14} className="text-node-volt" />;
                        })()}
                        <span className="text-node-volt font-bold uppercase tracking-wider text-xs">{workout.archetype}</span>
                      </div>
                    </div>
                  )}
                  <h1
                    className="font-bold mb-1"
                    style={{
                      fontFamily: 'var(--font-space-grotesk)',
                      fontSize: '1.5rem',
                      color: 'var(--node-volt)',
                      lineHeight: 1.1,
                    }}
                  >
                    {workout.name}
                  </h1>
                  {workout.displayCode && (
                    <div className="text-node-volt font-mono text-xs mb-2">
                      {workout.displayCode}
                    </div>
                  )}
                  {workout.description && (
                    <p className="text-text-white text-xs mb-3 line-clamp-3">
                      {workout.description}
                    </p>
                  )}
                  
                  {/* Duration Only */}
                  <div className={`thin-border rounded-lg p-3 text-center inline-block ${theme === 'light' ? 'bg-gray-100 border-gray-300' : 'bg-dark-contrast'}`}>
                    <div className={`text-[10px] mb-1 uppercase tracking-wider ${theme === 'light' ? 'text-gray-600' : 'text-text-white'}`}>Duration</div>
                    <div className={`text-2xl font-bold text-node-volt`}>{totalMinutes} min</div>
                  </div>
                </div>

                {/* Workout Breakdown */}
                <div className="mb-4">
                  <h2 className="font-bold mb-2 text-text-white text-base flex-shrink-0" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    Workout Breakdown
                  </h2>
                  <div className="space-y-2">
                    {workout.sections.map((section, idx) => {
                      const sectionColor = SECTION_COLORS[section.type] || '#ccff00';
                      const blockCount = section.blocks?.length || 0;
                      const totalExercises = blockCount;

  return (
    <div
                          key={section.id || idx}
                          className="bg-panel thin-border rounded-lg p-3"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                              style={{ backgroundColor: `${sectionColor}20`, color: sectionColor }}
                            >
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-text-white text-sm truncate">{section.title}</div>
                              <div className="text-node-volt uppercase tracking-wider text-xs">{section.type}</div>
                            </div>
                          </div>
                          {section.note && (
                            <p className="text-text-white text-xs mb-2 italic line-clamp-2">{section.note}</p>
                          )}
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            {section.durationSec && (
                              <div className={`rounded p-2 ${theme === 'light' ? 'bg-gray-100' : 'bg-panel/30'}`}>
                                <div className="text-text-white text-[10px] mb-0.5">Duration</div>
                                <div className="font-bold text-node-volt text-sm">{Math.ceil(section.durationSec / 60)} min</div>
                              </div>
                            )}
                            {totalExercises > 0 && (
                              <div className={`rounded p-2 ${theme === 'light' ? 'bg-gray-100' : 'bg-panel/30'}`}>
                                <div className="text-text-white text-[10px] mb-0.5">Exercises</div>
                                <div className="font-bold text-node-volt text-sm">{totalExercises}</div>
                              </div>
                            )}
                          </div>
                          {section.blocks && section.blocks.length > 0 && (
                            <div className="mt-2">
                              <div className="text-text-white uppercase tracking-wider text-[10px] mb-1.5">Exercises</div>
                              <div className="flex flex-wrap gap-1.5">
                                {section.blocks.map((block: any, blockIdx: number) => (
                                  <div
                                    key={blockIdx}
                                    className={`px-2 py-1 thin-border rounded text-xs ${theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-panel/50'}`}
                                  >
                                    {block.label && <span className="text-node-volt font-mono mr-1 text-[10px]">{block.label}</span>}
                                    <span className="text-text-white truncate">{block.exerciseName}</span>
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

                {/* Participants */}
                <div className="mb-4">
                  <h2 className="font-bold mb-2 text-text-white text-base flex-shrink-0" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    Participants
                  </h2>
                  <div className="mb-3">
                    <ParticipantManager
                      participants={participants}
                      onAdd={(p) => setParticipants(prev => [...prev, p])}
                      onRemove={(idx) => setParticipants(prev => prev.filter((_, i) => i !== idx))}
                    />
                  </div>
                  {participants.length > 0 && (
                    <div className="space-y-2">
                      {participants.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-dark-contrast thin-border rounded-lg p-2">
                          {p.avatarUrl ? (
                            <img src={p.avatarUrl} alt={p.name} className="w-8 h-8 rounded-full" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-node-volt/20 flex items-center justify-center text-xs font-bold text-node-volt">
                              {p.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-text-white text-sm flex-1 truncate">{p.name}</span>
                          <button
                            onClick={() => setParticipants(prev => prev.filter((_, i) => i !== idx))}
                            className="text-muted-text hover:text-text-white"
                          >
                            <Icons.X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Start Button at Bottom */}
                <div className="sticky bottom-0 pt-4 pb-2 bg-panel -mx-4 -mb-4 px-4">
                  <button
                    onClick={() => {
                      setShowIntro(false);
                      setCurrentSectionIndex(0);
                    }}
                    className="bg-node-volt text-dark font-bold px-6 py-4 rounded-lg hover:opacity-90 transition-opacity text-base flex items-center gap-2 w-full justify-center"
                    style={{
                      fontFamily: 'var(--font-space-grotesk)',
                      minHeight: config.touchTargetSize,
                    }}
                  >
                    <Icons.PLAY size={20} />
                    Start Workout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div 
              className="bg-panel thin-border rounded-2xl w-full overflow-hidden flex flex-col relative"
              style={{
                height: showControls && !isFullscreen 
                  ? (isTablet ? 'calc(100vh - 100px)' : 'calc(100vh - 130px)')
                  : 'calc(100vh - 20px)',
                maxHeight: '100vh',
                padding: isTablet ? '1.5rem' : (isDesktop ? '2rem' : '1.5rem'),
              }}
            >
              {/* Duration - Top Right Corner */}
              <div className="absolute top-6 right-6 z-10 flex-shrink-0">
                <div className={`thin-border rounded-lg text-center ${theme === 'light' ? 'bg-gray-100 border-gray-300' : 'bg-dark-contrast'}`} style={{ 
                  padding: isDesktop ? '1rem 1.5rem' : '0.75rem 1rem',
                  minWidth: isDesktop ? '120px' : '100px',
                }}>
                  <div className={`uppercase tracking-wider ${theme === 'light' ? 'text-gray-600' : 'text-text-white'}`} style={{ 
                    fontSize: isDesktop ? '0.75rem' : '0.688rem', 
                    marginBottom: isDesktop ? '0.5rem' : '0.375rem',
                    letterSpacing: '0.05em',
                  }}>Duration</div>
                  <div className={`font-bold text-node-volt`} style={{ fontSize: isDesktop ? '2.25rem' : '1.75rem', lineHeight: 1 }}>{totalMinutes} min</div>
                </div>
              </div>

              {/* Header - Clean Layout */}
              <div className="mb-3 flex-shrink-0" style={{ paddingRight: isDesktop ? '140px' : '0' }}>
                {workout.archetype && (
                  <div className="flex justify-center mb-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-node-volt/10 border border-node-volt/30 rounded-lg">
                      {(() => {
                        const ArchetypeIcon = Icons[workout.archetype as keyof typeof Icons] || Icons.WORKOUT;
                        return <ArchetypeIcon size={isDesktop ? 18 : 14} className="text-node-volt" />;
                      })()}
                      <span className="text-node-volt font-bold uppercase tracking-wider" style={{ fontSize: isDesktop ? '0.875rem' : '0.75rem' }}>{workout.archetype}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className="flex-1 text-center">
                    <h1
                      className="font-bold mb-2"
                      style={{
                        fontFamily: 'var(--font-space-grotesk)',
                        fontSize: isTablet ? '2.5rem' : (isDesktop ? '3.5rem' : '2.5rem'),
                        color: 'var(--node-volt)',
                        lineHeight: 1.1,
                      }}
                    >
                      {workout.name}
                    </h1>
                    {workout.displayCode && (
                      <div className="text-node-volt font-mono mb-2" style={{ fontSize: isDesktop ? '1rem' : '0.875rem' }}>
                        {workout.displayCode}
                      </div>
                    )}
                  </div>
                  {(workout.description || workout.averageRating) && (
                    <div className="bg-panel thin-border rounded-lg" style={{ 
                      padding: isDesktop ? '1rem 1.25rem' : '0.75rem 1rem',
                      minWidth: isDesktop ? '280px' : '200px',
                      maxWidth: isDesktop ? '320px' : '240px',
                    }}>
                      {workout.description && (
                        <p className="text-text-white mb-2" style={{ 
                          fontSize: isDesktop ? '0.875rem' : '0.75rem', 
                          lineHeight: 1.5,
                        }}>
                          {workout.description}
                        </p>
                      )}
                      {workout.averageRating && workout.averageRating > 0 && (
                        <div className="flex items-center gap-2 pt-2 border-t thin-border">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Icons.STAR
                                key={star}
                                size={isDesktop ? 16 : 14}
                                className={star <= Math.round(workout.averageRating) ? 'text-node-volt fill-node-volt' : 'text-muted-text'}
                              />
                            ))}
                          </div>
                          <div className="text-text-white" style={{ fontSize: isDesktop ? '0.875rem' : '0.75rem' }}>
                            {workout.averageRating.toFixed(1)}
                            {workout.ratingCount && workout.ratingCount > 0 && (
                              <span className="text-muted-text ml-1">({workout.ratingCount})</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Detailed Sections List - Grid layout - Fill space */}
              <div className="flex-1 min-h-0 flex flex-col">
                <h2 className="font-bold mb-2 text-text-white flex-shrink-0" style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: isDesktop ? '1.25rem' : '1rem' }}>
                  Workout Breakdown
                </h2>
                <div className="flex-1 min-h-0 overflow-y-auto">
                  <div 
                    className={`grid ${isTablet ? 'grid-cols-2' : isDesktop ? 'grid-cols-3' : 'grid-cols-3'}`}
                    style={{ gap: isDesktop ? '1rem' : '0.5rem' }}
                  >
                    {workout.sections.map((section, idx) => {
                      const sectionColor = SECTION_COLORS[section.type] || '#ccff00';
                      const blockCount = section.blocks?.length || 0;
                      const totalExercises = blockCount;
                      
                      return (
                        <div
                          key={section.id || idx}
                          className="bg-panel thin-border rounded-lg flex flex-col"
                          style={{ padding: isDesktop ? '1.25rem' : '0.5rem' }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <div
                                className="rounded-lg flex items-center justify-center font-bold flex-shrink-0"
                                style={{ 
                                  backgroundColor: `${sectionColor}20`, 
                                  color: sectionColor,
                                  width: isDesktop ? '2.5rem' : '1.75rem',
                                  height: isDesktop ? '2.5rem' : '1.75rem',
                                  fontSize: isDesktop ? '1.125rem' : '0.75rem',
                                }}
                              >
                                {idx + 1}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-text-white truncate" style={{ fontSize: isDesktop ? '1rem' : '0.75rem' }}>{section.title}</div>
                                <div className="text-node-volt uppercase tracking-wider" style={{ fontSize: isDesktop ? '0.688rem' : '0.563rem' }}>{section.type}</div>
                              </div>
                            </div>
                          </div>
                          
                          {section.note && (
                            <div className={`mb-2 rounded-lg ${theme === 'light' ? 'bg-gray-100' : 'bg-panel/50'}`} style={{ padding: isDesktop ? '0.75rem' : '0.375rem' }}>
                              <p className={`text-text-white italic ${isDesktop ? 'line-clamp-3' : 'line-clamp-2'}`} style={{ fontSize: isDesktop ? '0.813rem' : '0.563rem' }}>{section.note}</p>
                            </div>
                          )}

                          <div className="grid grid-cols-2 mb-2" style={{ gap: isDesktop ? '0.625rem' : '0.25rem' }}>
                            {section.type === 'EMOM' && (
                              <>
                                {section.emomRounds && (
                                  <div className={`rounded ${theme === 'light' ? 'bg-gray-100' : 'bg-panel/30'}`} style={{ padding: isDesktop ? '0.625rem' : '0.25rem' }}>
                                    <div className={`text-text-white mb-0.5`} style={{ fontSize: isDesktop ? '0.688rem' : '0.5rem' }}>Rounds</div>
                                    <div className={`font-bold text-node-volt`} style={{ fontSize: isDesktop ? '0.938rem' : '0.563rem' }}>{section.emomRounds}</div>
                                  </div>
                                )}
                                {section.emomWorkSec && (
                                  <div className={`rounded ${theme === 'light' ? 'bg-gray-100' : 'bg-panel/30'}`} style={{ padding: isDesktop ? '0.625rem' : '0.25rem' }}>
                                    <div className={`text-text-white mb-0.5`} style={{ fontSize: isDesktop ? '0.688rem' : '0.5rem' }}>Work</div>
                                    <div className={`font-bold text-node-volt`} style={{ fontSize: isDesktop ? '0.938rem' : '0.563rem' }}>{section.emomWorkSec}s</div>
                                  </div>
                                )}
                                {section.emomRestSec && (
                                  <div className={`rounded ${theme === 'light' ? 'bg-gray-100' : 'bg-panel/30'}`} style={{ padding: isDesktop ? '0.625rem' : '0.25rem' }}>
                                    <div className={`text-text-white mb-0.5`} style={{ fontSize: isDesktop ? '0.688rem' : '0.5rem' }}>Rest</div>
                                    <div className={`font-bold text-node-volt`} style={{ fontSize: isDesktop ? '0.938rem' : '0.563rem' }}>{section.emomRestSec}s</div>
                                  </div>
                                )}
                              </>
                            )}
                            {section.durationSec && (
                              <div className={`rounded ${theme === 'light' ? 'bg-gray-100' : 'bg-panel/30'}`} style={{ padding: isDesktop ? '0.625rem' : '0.25rem' }}>
                                <div className={`text-text-white mb-0.5`} style={{ fontSize: isDesktop ? '0.688rem' : '0.5rem' }}>Duration</div>
                                <div className={`font-bold text-node-volt`} style={{ fontSize: isDesktop ? '0.938rem' : '0.563rem' }}>{Math.ceil(section.durationSec / 60)} min</div>
                              </div>
                            )}
                            {totalExercises > 0 && (
                              <div className={`rounded ${theme === 'light' ? 'bg-gray-100' : 'bg-panel/30'}`} style={{ padding: isDesktop ? '0.625rem' : '0.25rem' }}>
                                <div className={`text-text-white mb-0.5`} style={{ fontSize: isDesktop ? '0.688rem' : '0.5rem' }}>Exercises</div>
                                <div className={`font-bold text-node-volt`} style={{ fontSize: isDesktop ? '0.938rem' : '0.563rem' }}>{totalExercises}</div>
                              </div>
                            )}
                          </div>

                          {/* Exercise List */}
                          {section.blocks && section.blocks.length > 0 && (
                            <div className="mt-1.5">
                              <div className={`text-text-white uppercase tracking-wider mb-1.5`} style={{ fontSize: isDesktop ? '0.688rem' : '0.5rem' }}>Exercises</div>
                              <div className="flex flex-wrap gap-1.5">
                                {section.blocks.map((block: any, blockIdx: number) => (
                                  <div
                                    key={blockIdx}
                                    className={`thin-border rounded ${theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-panel/50'}`}
                                    style={{ 
                                      padding: isDesktop ? '0.438rem 0.625rem' : '0.25rem 0.375rem',
                                      fontSize: isDesktop ? '0.813rem' : '0.563rem',
                                    }}
                                  >
                                    {block.label && <span className="text-node-volt font-mono mr-1" style={{ fontSize: isDesktop ? '0.688rem' : '0.5rem' }}>{block.label}</span>}
                                    <span className="text-text-white truncate">{block.exerciseName}</span>
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
  );
};

  // If showing intro, render it with the same layout as live deck
  if (showIntro) {
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
            style={{ width: `${(1 / totalPages) * 100}%` }}
          />
        </div>

        {/* Top Bar - Brutalist Style (Same as Live Deck) */}
        {showControls && (
          <div className="absolute top-0 left-0 right-0 z-40 bg-dark border-b thin-border pt-2 pb-2 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Exit Button */}
                <button
                  onClick={() => router.back()}
                  className="bg-panel thin-border text-text-white px-3 py-1.5 hover:border-node-volt transition-colors flex items-center gap-1.5"
                  title="Go back"
                >
                  <Icons.X size={16} />
                  {!isMobile && <span className="text-xs font-medium">Exit</span>}
                </button>
                <Logo showOS={false} className="text-base" />
                <div className="bg-panel thin-border px-3 py-1.5">
                  <div className="text-muted-text text-xs font-mono uppercase tracking-wider">
                    {currentPage} / {totalPages}
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
                {/* Begin Workout Button */}
                <button
                  onClick={() => {
                    setShowIntro(false);
                    setCurrentSectionIndex(0);
                  }}
                  className="bg-node-volt text-dark font-bold px-4 py-2 hover:opacity-90 transition-opacity flex items-center gap-1.5 text-sm"
                  style={{
                    fontFamily: 'var(--font-space-grotesk)',
                  }}
                >
                  <Icons.PLAY size={16} />
                  <span className="hidden sm:inline">BEGIN WORKOUT</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Intro Card */}
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            paddingTop: showControls ? (isMobile ? '60px' : '80px') : '0',
            paddingBottom: showControls ? (isMobile ? '80px' : '100px') : (isMobile ? '60px' : '80px'),
            paddingLeft: isMobile ? '0.5rem' : '1rem',
            paddingRight: isMobile ? '0.5rem' : '1rem',
            overflow: 'hidden',
            height: '100vh',
          }}
        >
          {renderIntroCard()}
        </div>

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
                  className="bg-panel thin-border text-text-white px-3 py-1.5 hover:border-node-volt transition-colors"
                >
                  <Icons.X size={16} />
                </button>
              </div>
              <div className="p-4">
                {/* Intro/Preview Option */}
                <button
                  onClick={() => {
                    setShowIntro(true);
                    setShowSectionMenu(false);
                  }}
                  className={`w-full text-left p-3 mb-2 thin-border rounded transition-colors ${
                    showIntro ? 'bg-node-volt/20 border-node-volt' : 'bg-panel hover:border-node-volt'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-node-volt font-mono text-sm mb-1">00</div>
                      <div className="font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        Preview
                      </div>
                      <div className="text-muted-text text-xs mt-1">Workout overview and details</div>
                    </div>
                    {showIntro && <Icons.CHECK size={16} className="text-node-volt" />}
                  </div>
                </button>
                {/* Section Options */}
                {workout.sections.map((section: any, idx: number) => (
                  <button
                    key={section.id || idx}
                    onClick={() => {
                      setShowIntro(false);
                      setCurrentSectionIndex(idx);
                      setShowSectionMenu(false);
                    }}
                    className={`w-full text-left p-3 mb-2 thin-border rounded transition-colors ${
                      !showIntro && safeSectionIndex === idx ? 'bg-node-volt/20 border-node-volt' : 'bg-panel hover:border-node-volt'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-node-volt font-mono text-sm mb-1">
                          {(idx + 1).toString().padStart(2, '0')}
                        </div>
                        <div className="font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                          {section.title}
                        </div>
                        <div className="text-muted-text text-xs mt-1">{section.type}</div>
                      </div>
                      {!showIntro && safeSectionIndex === idx && <Icons.CHECK size={16} className="text-node-volt" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
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
                  {currentPage} / {totalPages}
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

      {/* Navigation Dots - Brutalist (includes intro) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40 flex gap-2 justify-center">
        {/* Intro dot */}
        <button
          onClick={() => {
            setShowIntro(true);
            setCurrentSectionIndex(0);
          }}
          className={`thin-border transition-all ${
            showIntro
              ? 'bg-node-volt border-node-volt'
              : 'bg-panel hover:border-node-volt'
          }`}
          style={{
            width: showIntro ? '24px' : '8px',
            height: '8px',
          }}
          title="Preview"
        />
        {/* Section dots */}
        {workout.sections.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleJumpToSection(idx)}
            className={`thin-border transition-all ${
              !showIntro && idx === safeSectionIndex
                ? 'bg-node-volt border-node-volt'
                : 'bg-panel hover:border-node-volt'
            }`}
            style={{
              width: !showIntro && idx === safeSectionIndex ? '24px' : '8px',
              height: '8px',
            }}
            title={workout.sections[idx].title}
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      {showControls && (
        <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 right-4 sm:right-8 z-40 flex justify-between items-center pointer-events-none">
          <button
            onClick={handlePreviousSection}
            className="bg-panel thin-border text-text-white px-4 py-2 hover:border-node-volt transition-colors pointer-events-auto flex items-center gap-2 uppercase tracking-wider text-xs font-medium"
            style={{ minWidth: config.touchTargetSize, minHeight: config.touchTargetSize }}
          >
            <Icons.CHEVRON_LEFT size={16} />
            <span className="hidden sm:inline">{isFirstSection ? 'Preview' : 'Previous'}</span>
          </button>
          
          {/* Start Button - Center, Highlighted */}
          {showStartButton && !showIntro && (currentSection.durationSec || currentSection.emomWorkSec || currentSection.intervalWorkSec || currentSection.stationDurationSec) && (
            <button
              onClick={() => {
                // Try to get the timer ref - it might not be set immediately, so try a few times
                const tryStartTimer = () => {
                  const currentRef = getCurrentTimerRef();
                  if (currentRef) {
                    currentRef.start();
                    setShowStartButton(false);
                  } else {
                    // If ref not available yet, try again after a short delay
                    setTimeout(() => {
                      const retryRef = getCurrentTimerRef();
                      if (retryRef) {
                        retryRef.start();
                        setShowStartButton(false);
                      }
                    }, 100);
                  }
                };
                tryStartTimer();
              }}
              className="bg-node-volt text-dark font-bold px-6 py-3 hover:opacity-90 transition-opacity pointer-events-auto flex items-center gap-2 uppercase tracking-wider text-sm font-medium shadow-lg"
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                minWidth: config.touchTargetSize,
                minHeight: config.touchTargetSize,
                boxShadow: '0 0 20px rgba(204, 255, 0, 0.4)',
              }}
            >
              <Icons.PLAY size={18} />
              <span>Start</span>
            </button>
          )}
          
          <div className="flex items-center gap-2">
            {/* Skip Finisher Button - Only show for FINISHER sections */}
            {currentSection.type === 'FINISHER' && (
              <button
                onClick={() => {
                  // Skip finisher and complete workout
                  if (allTimersCompleted()) {
                    setShowRatingModal(true);
                  } else {
                    setShowIncompleteWarning(true);
                  }
                }}
                className="bg-panel/80 thin-border text-text-white px-4 py-2 hover:border-node-volt transition-colors pointer-events-auto flex items-center gap-2 uppercase tracking-wider text-xs font-medium"
                style={{ minWidth: config.touchTargetSize, minHeight: config.touchTargetSize }}
              >
                <span>Skip Finisher</span>
              </button>
            )}
            <button
              onClick={isLastSection ? handleNextSection : handleNextSection}
              className="bg-panel thin-border text-text-white px-4 py-2 sm:px-6 sm:py-3 hover:border-node-volt transition-colors pointer-events-auto flex items-center gap-2 uppercase tracking-wider text-xs font-medium"
              style={{
                minWidth: config.touchTargetSize,
                minHeight: config.touchTargetSize,
              }}
            >
              <span>{isLastSection ? 'Complete' : 'Next'}</span>
              {!isLastSection && <Icons.CHEVRON_RIGHT size={16} />}
            </button>
          </div>
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
              {/* Intro/Preview Option */}
              <button
                onClick={() => {
                  setShowIntro(true);
                  setShowSectionMenu(false);
                }}
                className={`w-full text-left p-3 transition-colors ${
                  showIntro
                    ? 'bg-node-volt text-dark border-2 border-node-volt'
                    : 'bg-panel thin-border hover:border-node-volt'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm uppercase tracking-wider mb-1">Preview</div>
                    <div className="text-xs text-muted-text uppercase tracking-wider font-mono">
                      Workout Overview
                    </div>
                  </div>
                  <div className={`font-mono font-bold text-lg ${showIntro ? 'text-dark' : 'text-node-volt'}`}>
                    00
                  </div>
                </div>
              </button>
              {/* Section Options */}
              {workout.sections.map((section, idx) => (
                <button
                  key={`${workout.id}-section-${section.id || idx}`}
                  onClick={() => handleJumpToSection(idx)}
                  className={`w-full text-left p-3 transition-colors ${
                    !showIntro && idx === safeSectionIndex
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
                    <div className={`font-mono font-bold text-lg ${!showIntro && idx === safeSectionIndex ? 'text-dark' : 'text-node-volt'}`}>
                      {(idx + 1).toString().padStart(2, '0')}
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

      {/* Section Completion Celebration */}
      {showSectionCelebration && celebratedSectionIndex !== null && (
        <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center">
          <div className="text-center animate-fadeIn pointer-events-none mb-8">
            <div className="mb-4">
              <div
                className="text-6xl sm:text-8xl font-bold mb-4 animate-bounce"
                style={{
                  fontFamily: 'var(--font-space-grotesk)',
                  color: sectionColor,
                  textShadow: `0 0 40px ${sectionColor}80`,
                }}
              >
                🎉
              </div>
              <h2
                className="text-4xl sm:text-6xl font-bold mb-2 animate-pulse"
                style={{
                  fontFamily: 'var(--font-space-grotesk)',
                  color: sectionColor,
                  textShadow: `0 0 30px ${sectionColor}60`,
                }}
              >
                Section Complete!
              </h2>
              <p
                className="text-2xl sm:text-3xl text-muted-text"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Great work! 💪
              </p>
            </div>
          </div>
          {/* Prominent Next Section Button */}
          <button
            onClick={() => {
              setShowSectionCelebration(false);
              setCelebratedSectionIndex(null);
              handleNextSection();
            }}
            className="bg-node-volt text-dark font-bold px-8 py-4 sm:px-12 sm:py-6 rounded-lg hover:opacity-90 transition-opacity text-xl sm:text-2xl uppercase tracking-wider pointer-events-auto shadow-2xl animate-fadeIn"
            style={{
              fontFamily: 'var(--font-space-grotesk)',
              boxShadow: `0 0 40px ${sectionColor}60`,
            }}
          >
            {isLastSection ? 'Finish Workout' : 'Move to Next Section →'}
          </button>
        </div>
      )}

      {/* Incomplete Workout Warning Modal - Brutalist Style */}
      {showIncompleteWarning && (
        <div className="fixed inset-0 bg-dark/95 z-[60] flex items-center justify-center p-4">
          <div className="bg-panel thin-border max-w-md w-full">
            <div className="p-6">
              <h2 
                className="text-2xl font-bold uppercase tracking-wider mb-4 text-node-volt"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Are You Sure?
              </h2>
              <p className="text-text-white mb-2 leading-relaxed">
                The workout timers were skipped, so this workout will <strong>not</strong> be marked as complete in your profile.
              </p>
              <p className="text-muted-text text-sm mb-6">
                Browsing through sections does not count as completion. All timers must be completed to log this workout.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowIncompleteWarning(false);
                    router.push('/workouts');
                  }}
                  className="bg-node-volt text-dark font-bold px-6 py-3 hover:opacity-90 transition-opacity uppercase tracking-wider text-sm flex-1"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Exit Without Completing
                </button>
                <button
                  onClick={() => {
                    setShowIncompleteWarning(false);
                  }}
                  className="bg-panel thin-border text-text-white px-6 py-3 hover:border-node-volt transition-colors uppercase tracking-wider text-sm flex-1"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Back / Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

