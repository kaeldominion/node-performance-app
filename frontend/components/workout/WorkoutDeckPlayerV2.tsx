'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from '@/lib/iconMapping';
import { getTierDisplayValue, isErgMachine, isBodyweightRepExercise } from './tierDisplayUtils';
import { useAudioCues } from '@/hooks/useAudioCues';
import { useWorkoutProgress } from '@/hooks/useWorkoutProgress';

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

interface WorkoutDeckPlayerV2Props {
  workout: Workout;
  sessionId: string | null;
  onComplete?: (rpe: number, notes: string) => void;
}

// Section color mapping
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

// Enhanced Timer Component with Visual Effects
function SectionTimer({
  timeRemaining,
  isActive,
  onStart,
  onPause,
  onResume,
  phase = 'WORK',
  round = null,
  totalRounds = null,
  showFlashing = false,
}: {
  timeRemaining: number;
  isActive: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  phase?: 'WORK' | 'REST';
  round?: number | null;
  totalRounds?: number | null;
  showFlashing?: boolean;
}) {
  const [isPaused, setIsPaused] = useState(false);
  const [flashClass, setFlashClass] = useState('');
  const { playCue } = useAudioCues();

  // Flash effect for final seconds
  useEffect(() => {
    if (showFlashing && isActive && !isPaused && timeRemaining <= 5 && timeRemaining > 0) {
      const interval = setInterval(() => {
        setFlashClass(prev => prev === 'animate-pulse' ? '' : 'animate-pulse');
      }, 200);
      return () => clearInterval(interval);
    } else {
      setFlashClass('');
    }
  }, [showFlashing, isActive, isPaused, timeRemaining]);

  // Audio cues
  useEffect(() => {
    if (isActive && !isPaused) {
      if (timeRemaining === 3) {
        playCue('countdown', 3);
      } else if (timeRemaining === 0) {
        playCue('complete');
      }
    }
  }, [timeRemaining, isActive, isPaused, playCue]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeRemaining <= 5 && isActive && !isPaused) return '#ff6b6b';
    if (phase === 'WORK') return '#ccff00';
    return '#4a9eff';
  };

  const timerColor = getTimerColor();
  const isLowTime = timeRemaining <= 5 && isActive && !isPaused;

  return (
    <div className="text-center mb-8">
      <div 
        className={`inline-block thin-border rounded-lg p-6 sm:p-8 transition-all ${
          isLowTime ? 'border-2 border-node-volt' : ''
        } ${flashClass}`}
        style={{
          backgroundColor: 'var(--card-bg, rgba(var(--panel-rgb), 0.5))',
          boxShadow: isLowTime ? `0 0 30px ${timerColor}40` : undefined,
        }}
      >
        <div
          className={`text-5xl sm:text-6xl md:text-7xl font-bold mb-2 transition-all ${
            isLowTime ? 'scale-110' : ''
          }`}
          style={{
            fontFamily: 'var(--font-space-grotesk)',
            color: timerColor,
            textShadow: isLowTime ? `0 0 40px ${timerColor}80` : undefined,
          }}
        >
          {formatTime(timeRemaining)}
        </div>
        
        {phase && (
          <div className="text-sm sm:text-base text-muted-text mb-2 uppercase tracking-wider">
            {phase}
          </div>
        )}
        
        {round && totalRounds && (
          <div className="text-lg sm:text-xl font-bold text-node-volt mb-4">
            Round {round} / {totalRounds}
          </div>
        )}
        
        <div className="flex items-center justify-center gap-2">
          {!isActive && !isPaused && (
            <button
              onClick={() => {
                onStart();
                setIsPaused(false);
              }}
              className="bg-node-volt text-dark font-bold px-6 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base"
            >
              Start
            </button>
          )}
          {isActive && !isPaused && (
            <button
              onClick={() => {
                onPause();
                setIsPaused(true);
              }}
              className="bg-panel thin-border text-text-white px-6 py-2 rounded-lg hover:bg-panel transition-colors text-sm sm:text-base"
            >
              Pause
            </button>
          )}
          {isPaused && (
            <>
              <button
                onClick={() => {
                  onResume();
                  setIsPaused(false);
                }}
                className="bg-node-volt text-dark font-bold px-6 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base"
              >
                Resume
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function WorkoutDeckPlayerV2({ workout, sessionId, onComplete }: WorkoutDeckPlayerV2Props) {
  const router = useRouter();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [rpe, setRpe] = useState(5);
  const [notes, setNotes] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(10);
  const [participants, setParticipants] = useState<Array<{ id?: string; name: string; email?: string; isSignedUp: boolean; avatarUrl?: string }>>([]);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  
  const { playCue } = useAudioCues();
  const { progress, updateProgress } = useWorkoutProgress(workout.sections.length);
  
  const controlsTimeoutRef = useRef<number | undefined>(undefined);
  const sectionRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<number | null>(null);
  const touchEndRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | undefined>(undefined);

  const currentSection = workout.sections[currentSectionIndex];
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === workout.sections.length - 1;
  const sectionColor = SECTION_COLORS[currentSection.type] || '#ccff00';

  // Auto-hide controls
  useEffect(() => {
    if (showControls) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 4000);
    }
    return () => {
      if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, currentSectionIndex]);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Swipe gestures for mobile
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
  }, []);

  // Start countdown before section
  const startSectionCountdown = useCallback(() => {
    setShowCountdown(true);
    setCountdownValue(10);
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    countdownIntervalRef.current = window.setInterval(() => {
      setCountdownValue(prev => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          setShowCountdown(false);
          playCue('start');
          // Move to next section when countdown completes
          if (currentSectionIndex < workout.sections.length - 1) {
            setCurrentSectionIndex(prev => prev + 1);
            updateProgress(currentSectionIndex + 1);
            if (sectionRef.current) {
              sectionRef.current.scrollTop = 0;
            }
          }
          return 0;
        }
        playCue('countdown', prev - 1);
        return prev - 1;
      });
    }, 1000);
  }, [playCue, currentSectionIndex, workout.sections.length, updateProgress]);

  const handleNextSection = useCallback(() => {
    if (currentSectionIndex < workout.sections.length - 1) {
      playCue('transition');
      startSectionCountdown();
    } else {
      setShowCompleteModal(true);
    }
  }, [currentSectionIndex, workout.sections.length, playCue, startSectionCountdown]);

  const handlePreviousSection = useCallback(() => {
    if (currentSectionIndex > 0) {
      playCue('transition');
      setCurrentSectionIndex(prev => prev - 1);
      updateProgress(currentSectionIndex - 1);
      if (sectionRef.current) {
        sectionRef.current.scrollTop = 0;
      }
    }
  }, [currentSectionIndex, playCue, updateProgress]);

  const handleJumpToSection = (index: number) => {
    if (index >= 0 && index < workout.sections.length) {
      playCue('transition');
      setCurrentSectionIndex(index);
      updateProgress(index);
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

  const handleExitDeck = () => {
    // Navigate back to workout detail page
    router.push(`/workouts/${workout.id}?view=detail`);
  };

  const handleCompleteWorkout = async () => {
    if (onComplete) {
      await onComplete(rpe, notes);
    }
  };

  // Cleanup countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);


  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showCompleteModal || showSectionMenu || showCountdown) return;
      
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
            setShowCompleteModal(true);
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
  }, [handleNextSection, handlePreviousSection, showCompleteModal, showSectionMenu, showCountdown]);

  // Render section content based on type
  const renderSectionContent = () => {
    switch (currentSection.type) {
      case 'WARMUP':
      case 'COOLDOWN':
        return <WarmupCooldownSection section={currentSection} />;
      case 'EMOM':
        return <EMOMSection section={currentSection} />;
      case 'AMRAP':
      case 'CIRCUIT':
      case 'FOR_TIME':
        return <AMRAPSection section={currentSection} />;
      case 'CAPACITY':
        return <CapacitySection section={currentSection} />;
      case 'SUPERSET':
        return <SupersetSection section={currentSection} />;
      case 'WAVE':
        return <WaveSection section={currentSection} />;
      case 'FLOW':
        return <FlowSection section={currentSection} />;
      case 'FINISHER':
        return <FinisherSection section={currentSection} />;
      default:
        return <DefaultSection section={currentSection} />;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-dark overflow-hidden"
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ fontFamily: 'var(--font-manrope)' }}
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-panel/30 z-50">
        <div
          className="h-full bg-node-volt transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Countdown Overlay */}
      {showCountdown && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-sm"
          style={{
            backgroundColor: 'rgba(var(--dark-rgb), 0.95)',
          }}
        >
          <div className={`text-center transition-all ${countdownValue <= 3 ? 'animate-pulse scale-110' : ''}`}>
            <div
              className="text-9xl sm:text-[12rem] md:text-[16rem] font-bold"
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                color: countdownValue <= 3 ? '#ff6b6b' : 'var(--node-volt)',
                textShadow: `0 0 60px ${countdownValue <= 3 ? '#ff6b6b' : 'var(--node-volt)'}80`,
                transition: 'all 0.3s ease',
              }}
            >
              {countdownValue}
            </div>
            <div className="text-2xl sm:text-3xl text-muted-text mt-4 uppercase tracking-wider">
              Get Ready
            </div>
          </div>
        </div>
      )}

      {/* Top Bar - Section Info & Controls */}
      {showControls && !showCountdown && (
        <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-dark/95 to-transparent pt-2 pb-4 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-panel/90 backdrop-blur-sm thin-border rounded-lg px-3 py-1.5 sm:px-4 sm:py-2">
                <div className="text-muted-text text-xs sm:text-sm font-medium">
                  {currentSectionIndex + 1} / {workout.sections.length}
                </div>
                {workout.displayCode && (
                  <div className="text-node-volt text-[10px] sm:text-xs font-mono mt-0.5">
                    {workout.displayCode}
                  </div>
                )}
              </div>
              <div className="hidden sm:block bg-panel/90 backdrop-blur-sm thin-border rounded-lg px-3 py-1.5">
                <div className="text-xs text-muted-text uppercase tracking-wider">
                  {currentSection.type}
                </div>
              </div>
              {/* Participants Display */}
              {participants.length > 0 && (
                <div className="hidden sm:flex items-center gap-2 bg-panel/90 backdrop-blur-sm thin-border rounded-lg px-3 py-1.5">
                  <div className="flex -space-x-2">
                    {participants.slice(0, 3).map((p, idx) => (
                      <div
                        key={idx}
                        className="w-6 h-6 rounded-full bg-node-volt/20 border border-node-volt flex items-center justify-center text-xs font-bold text-node-volt"
                        title={p.name}
                      >
                        {p.avatarUrl ? (
                          <img src={p.avatarUrl} alt={p.name} className="w-full h-full rounded-full" />
                        ) : (
                          p.name.charAt(0).toUpperCase()
                        )}
                      </div>
                    ))}
                    {participants.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-panel border border-border flex items-center justify-center text-xs text-muted-text">
                        +{participants.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddParticipant(true)}
                className="bg-panel/90 backdrop-blur-sm thin-border text-text-white px-3 py-1.5 rounded-lg hover:bg-panel transition-colors text-xs sm:text-sm font-medium flex items-center gap-2"
                title="Add participants"
              >
                <Icons.USERS size={16} />
                <span className="hidden sm:inline">Add People</span>
              </button>
              <button
                onClick={() => setShowSectionMenu(true)}
                className="bg-panel/90 backdrop-blur-sm thin-border text-text-white px-3 py-1.5 rounded-lg hover:bg-panel transition-colors text-xs sm:text-sm font-medium hidden sm:flex items-center gap-2"
                title="Jump to section (M)"
              >
                <Icons.MENU size={16} />
                Sections
              </button>
              <button
                onClick={toggleFullscreen}
                className="bg-panel/90 backdrop-blur-sm thin-border text-text-white px-3 py-1.5 rounded-lg hover:bg-panel transition-colors text-xs sm:text-sm"
                title="Toggle fullscreen (F)"
              >
                {isFullscreen ? <Icons.MINIMIZE size={18} /> : <Icons.MAXIMIZE size={18} />}
              </button>
              <button
                onClick={handleExitDeck}
                className="bg-panel/90 backdrop-blur-sm thin-border text-text-white px-3 py-1.5 rounded-lg hover:bg-panel transition-colors text-xs sm:text-sm font-medium"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        ref={sectionRef}
        className="h-full w-full flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 overflow-y-auto"
        style={{
          background: `linear-gradient(135deg, ${sectionColor}08 0%, ${sectionColor}03 100%)`,
        }}
      >
        <div className="w-full max-w-7xl">
          {/* Section Title */}
          <div className="text-center mb-6 sm:mb-8">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-4"
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                color: sectionColor,
              }}
            >
              {currentSection.title}
            </h1>
            {currentSection.note && (
              <p className="text-muted-text text-sm sm:text-base max-w-2xl mx-auto">
                {currentSection.note}
              </p>
            )}
          </div>

          {/* Section Content */}
          {renderSectionContent()}
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-40 flex gap-2 flex-wrap justify-center max-w-[90vw]">
        {workout.sections.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleJumpToSection(idx)}
            className={`h-2 sm:h-2.5 rounded-full transition-all ${
              idx === currentSectionIndex
                ? 'bg-node-volt w-8 sm:w-12'
                : 'bg-panel/50 hover:bg-panel w-2 sm:w-2.5'
            }`}
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
            className={`bg-panel/90 backdrop-blur-sm thin-border text-text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-panel transition-all pointer-events-auto flex items-center gap-2 ${
              isFirstSection ? 'opacity-30 cursor-not-allowed' : ''
            }`}
          >
            <Icons.CHEVRON_LEFT size={20} />
            <span className="hidden sm:inline">Previous</span>
          </button>
          <button
            onClick={isLastSection ? () => setShowCompleteModal(true) : handleNextSection}
            className="bg-node-volt text-dark font-bold px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:opacity-90 transition-opacity pointer-events-auto flex items-center gap-2"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            <span>{isLastSection ? 'Complete' : 'Next'}</span>
            {!isLastSection && <Icons.CHEVRON_RIGHT size={20} />}
          </button>
        </div>
      )}

      {/* Section Jump Menu */}
      {showSectionMenu && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-panel thin-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b thin-border flex items-center justify-between">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Jump to Section
              </h2>
              <button
                onClick={() => setShowSectionMenu(false)}
                className="text-muted-text hover:text-text-white transition-colors"
              >
                <Icons.X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-2">
              {workout.sections.map((section, idx) => (
                <button
                  key={`${workout.id}-section-${section.id || idx}`}
                  onClick={() => handleJumpToSection(idx)}
                  className={`w-full text-left p-4 rounded-lg transition-all ${
                    idx === currentSectionIndex
                      ? 'bg-node-volt/20 border-2 border-node-volt'
                      : 'bg-panel/50 thin-border hover:bg-panel'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-lg mb-1">{section.title}</div>
                      <div className="text-sm text-muted-text uppercase tracking-wider">
                        {section.type}
                      </div>
                    </div>
                    <div className="text-node-volt font-mono font-bold">
                      {idx + 1}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Participant Modal */}
      {showAddParticipant && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-panel thin-border rounded-lg max-w-md w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Who's Working Out Today?
              </h2>
              <button
                onClick={() => setShowAddParticipant(false)}
                className="text-muted-text hover:text-text-white transition-colors"
              >
                <Icons.X size={24} />
              </button>
            </div>

            <AddParticipantForm
              onAdd={(participant) => {
                setParticipants(prev => [...prev, participant]);
                setShowAddParticipant(false);
              }}
              existingParticipants={participants}
            />

            {participants.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm text-muted-text mb-2">Participants:</div>
                {participants.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-dark thin-border rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      {p.avatarUrl ? (
                        <img src={p.avatarUrl} alt={p.name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-node-volt/20 border border-node-volt flex items-center justify-center text-sm font-bold text-node-volt">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{p.name}</div>
                        {p.email && <div className="text-xs text-muted-text">{p.email}</div>}
                      </div>
                    </div>
                    <button
                      onClick={() => setParticipants(prev => prev.filter((_, i) => i !== idx))}
                      className="text-muted-text hover:text-text-white transition-colors"
                    >
                      <Icons.X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-panel thin-border rounded-lg max-w-md w-full p-6 sm:p-8 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-node-volt/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.CHECK size={32} className="text-node-volt" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Workout Complete!
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3 text-muted-text">
                  RPE (Rate of Perceived Exertion)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={rpe}
                  onChange={(e) => setRpe(Number(e.target.value))}
                  className="w-full accent-node-volt"
                />
                <div className="text-center text-node-volt font-bold text-3xl mt-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {rpe}/10
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 text-muted-text">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-dark thin-border rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt resize-none"
                  rows={4}
                  placeholder="How did it feel? Any notes?"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 bg-panel thin-border text-text-white px-6 py-3 rounded-lg hover:bg-panel transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  // Share workout with participants
                  if (participants.length > 0) {
                    // TODO: Implement API calls to share workout
                    console.log('Sharing workout with participants:', participants);
                  }
                  await handleCompleteWorkout();
                }}
                className="flex-1 bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Save & Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Section Components with Timers
function WarmupCooldownSection({ section }: { section: WorkoutSection }) {
  const [timeRemaining, setTimeRemaining] = useState(section.durationSec || 300);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isActive, timeRemaining]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {section.durationSec && (
        <SectionTimer
          timeRemaining={timeRemaining}
          isActive={isActive}
          onStart={() => setIsActive(true)}
          onPause={() => setIsActive(false)}
          onResume={() => setIsActive(true)}
          showFlashing={true}
        />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {section.blocks.map((block: any, idx: number) => (
          <ExerciseCard key={block.id || idx} block={block} />
        ))}
      </div>
    </div>
  );
}

function EMOMSection({ section }: { section: WorkoutSection }) {
  const [currentRound, setCurrentRound] = useState(1);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [workTime, setWorkTime] = useState(section.emomWorkSec || 45);
  const [restTime, setRestTime] = useState(section.emomRestSec || 15);
  const [betweenRoundRestSec] = useState(60); // 1 minute rest between rounds
  const [isWorkPhase, setIsWorkPhase] = useState(true);
  const [isBetweenRoundRest, setIsBetweenRoundRest] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(workTime);
  const [isActive, setIsActive] = useState(false);
  const totalExercises = section.blocks.length;

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isActive && timeRemaining === 0) {
      if (isBetweenRoundRest) {
        // Between-round rest complete - move to next round
        if (currentRound < (section.emomRounds || 12)) {
          setCurrentRound(prev => prev + 1);
          setCurrentExerciseIndex(0);
          setIsWorkPhase(true);
          setIsBetweenRoundRest(false);
          setTimeRemaining(workTime);
        } else {
          // All rounds complete
          setIsActive(false);
        }
      } else if (isWorkPhase) {
        // Work phase complete - move to rest
        setIsWorkPhase(false);
        setTimeRemaining(restTime);
      } else {
        // Rest phase complete - check if we've done all exercises in this round
        const nextExerciseIndex = currentExerciseIndex + 1;
        if (nextExerciseIndex < totalExercises) {
          // Move to next exercise in the round
          setCurrentExerciseIndex(nextExerciseIndex);
          setIsWorkPhase(true);
          setTimeRemaining(workTime);
        } else {
          // All exercises in round complete - check if this is the last round
          if (currentRound >= (section.emomRounds || 12)) {
            // Last round - no rest after final round, workout complete
            setIsActive(false);
          } else {
            // Insert between-round rest (1 min) before next round
            setIsBetweenRoundRest(true);
            setTimeRemaining(betweenRoundRestSec);
          }
        }
      }
    }
  }, [isActive, timeRemaining, isWorkPhase, isBetweenRoundRest, workTime, restTime, betweenRoundRestSec, currentRound, currentExerciseIndex, totalExercises, section.emomRounds]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <SectionTimer
        timeRemaining={timeRemaining}
        isActive={isActive}
        onStart={() => setIsActive(true)}
        onPause={() => setIsActive(false)}
        onResume={() => setIsActive(true)}
        phase={isBetweenRoundRest ? 'REST' : (isWorkPhase ? 'WORK' : 'REST')}
        round={currentRound}
        totalRounds={section.emomRounds || 12}
        showFlashing={true}
      />
      {isBetweenRoundRest && (
        <div className="text-center text-lg text-muted-text mb-4">
          Rest between rounds - Get ready for Round {currentRound + 1}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {section.blocks.map((block: any, idx: number) => (
          <ExerciseCard key={block.id || idx} block={block} />
        ))}
      </div>
    </div>
  );
}

function AMRAPSection({ section }: { section: WorkoutSection }) {
  const [timeRemaining, setTimeRemaining] = useState(section.durationSec || 720);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isActive && timeRemaining === 0) {
      setIsActive(false);
    }
  }, [isActive, timeRemaining]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <SectionTimer
        timeRemaining={timeRemaining}
        isActive={isActive}
        onStart={() => setIsActive(true)}
        onPause={() => setIsActive(false)}
        onResume={() => setIsActive(true)}
        showFlashing={true}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {section.blocks.map((block: any, idx: number) => (
          <ExerciseCard key={block.id || idx} block={block} />
        ))}
      </div>
    </div>
  );
}

function CapacitySection({ section }: { section: WorkoutSection }) {
  const [timeRemaining, setTimeRemaining] = useState(section.durationSec || 1080);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isActive, timeRemaining]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <SectionTimer
        timeRemaining={timeRemaining}
        isActive={isActive}
        onStart={() => setIsActive(true)}
        onPause={() => setIsActive(false)}
        onResume={() => setIsActive(true)}
        showFlashing={true}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {section.blocks.map((block: any, idx: number) => (
          <ExerciseCard key={block.id || idx} block={block} />
        ))}
      </div>
    </div>
  );
}

function SupersetSection({ section }: { section: WorkoutSection }) {
  const [timeRemaining, setTimeRemaining] = useState(section.durationSec || 600);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isActive, timeRemaining]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {section.durationSec && (
        <SectionTimer
          timeRemaining={timeRemaining}
          isActive={isActive}
          onStart={() => setIsActive(true)}
          onPause={() => setIsActive(false)}
          onResume={() => setIsActive(true)}
          showFlashing={true}
        />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {section.blocks.map((block: any, idx: number) => (
          <ExerciseCard key={block.id || idx} block={block} />
        ))}
      </div>
    </div>
  );
}

function WaveSection({ section }: { section: WorkoutSection }) {
  const [timeRemaining, setTimeRemaining] = useState(section.durationSec || 600);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isActive, timeRemaining]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {section.durationSec && (
        <SectionTimer
          timeRemaining={timeRemaining}
          isActive={isActive}
          onStart={() => setIsActive(true)}
          onPause={() => setIsActive(false)}
          onResume={() => setIsActive(true)}
          showFlashing={true}
        />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {section.blocks.map((block: any, idx: number) => (
          <ExerciseCard key={block.id || idx} block={block} />
        ))}
      </div>
    </div>
  );
}

function FlowSection({ section }: { section: WorkoutSection }) {
  const [timeRemaining, setTimeRemaining] = useState(section.durationSec || 600);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isActive, timeRemaining]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {section.durationSec && (
        <SectionTimer
          timeRemaining={timeRemaining}
          isActive={isActive}
          onStart={() => setIsActive(true)}
          onPause={() => setIsActive(false)}
          onResume={() => setIsActive(true)}
          showFlashing={true}
        />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {section.blocks.map((block: any, idx: number) => (
          <ExerciseCard key={block.id || idx} block={block} />
        ))}
      </div>
    </div>
  );
}

function FinisherSection({ section }: { section: WorkoutSection }) {
  const [timeRemaining, setTimeRemaining] = useState(section.durationSec || 300);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isActive, timeRemaining]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {section.durationSec && (
        <SectionTimer
          timeRemaining={timeRemaining}
          isActive={isActive}
          onStart={() => setIsActive(true)}
          onPause={() => setIsActive(false)}
          onResume={() => setIsActive(true)}
          showFlashing={true}
        />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {section.blocks.map((block: any, idx: number) => (
          <ExerciseCard key={block.id || idx} block={block} />
        ))}
      </div>
    </div>
  );
}

function DefaultSection({ section }: { section: WorkoutSection }) {
  const [timeRemaining, setTimeRemaining] = useState(section.durationSec || 600);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isActive, timeRemaining]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {section.durationSec && (
        <SectionTimer
          timeRemaining={timeRemaining}
          isActive={isActive}
          onStart={() => setIsActive(true)}
          onPause={() => setIsActive(false)}
          onResume={() => setIsActive(true)}
          showFlashing={true}
        />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {section.blocks.map((block: any, idx: number) => (
          <ExerciseCard key={block.id || idx} block={block} />
        ))}
      </div>
    </div>
  );
}

// Add Participant Form Component
function AddParticipantForm({
  onAdd,
  existingParticipants,
}: {
  onAdd: (participant: { id?: string; name: string; email?: string; isSignedUp: boolean; avatarUrl?: string }) => void;
  existingParticipants: Array<{ id?: string; name: string; email?: string; isSignedUp: boolean; avatarUrl?: string }>;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; email: string; avatarUrl?: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // TODO: Implement user search API
      // For now, create a participant from the search query
      const emailMatch = searchQuery.match(/[\w\.-]+@[\w\.-]+\.\w+/);
      const email = emailMatch ? emailMatch[0] : undefined;
      const name = email ? searchQuery.replace(email, '').trim() || email.split('@')[0] : searchQuery.trim();
      
      // Check if already added
      if (existingParticipants.some(p => p.email === email || p.name.toLowerCase() === name.toLowerCase())) {
        alert('This person is already added');
        return;
      }

      onAdd({
        name,
        email,
        isSignedUp: false, // TODO: Check if user exists in system
        avatarUrl: undefined,
      });
      setSearchQuery('');
    } catch (error) {
      console.error('Failed to search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Enter name or email"
          className="flex-1 bg-dark thin-border rounded-lg px-4 py-2 text-text-white focus:outline-none focus:border-node-volt"
        />
        <button
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          className="bg-node-volt text-dark font-bold px-6 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </div>
  );
}

// Exercise Card Component - Display all tiers, no selection, no rep counters
function ExerciseCard({ block }: { block: any }) {
  const isErg = isErgMachine(block.exerciseName);
  const isBodyweightRep = isBodyweightRepExercise(block.exerciseName);

  const renderTierDisplay = (tier: any, tierName: string, tierColor: string) => {
    if (!tier) return null;
    
    const displayValue = getTierDisplayValue(tier, block.exerciseName, block);
    
    return (
      <div
        className="px-3 py-2 rounded-lg border-2"
        style={{
          borderColor: tierColor,
          backgroundColor: `${tierColor}15`,
        }}
      >
        <div className="text-xs text-muted-text mb-1 uppercase tracking-wider font-bold">
          {tierName}
        </div>
        <div className="text-lg sm:text-xl font-bold" style={{ color: tierColor }}>
          {displayValue}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="backdrop-blur-sm thin-border rounded-lg p-4 sm:p-6 hover:border-node-volt transition-all"
      style={{
        backgroundColor: 'var(--card-bg, rgba(var(--panel-rgb), 0.5))',
      }}
    >
      {block.label && (
        <div className="text-node-volt font-mono text-xl sm:text-2xl font-bold mb-2">
          {block.label}
        </div>
      )}
      <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
        {block.exerciseName}
      </h3>
      {/* ONLY show shortDescription, NEVER description or longDescription */}
      {block.shortDescription && block.shortDescription.length <= 80 && (
        <p className="text-muted-text text-xs sm:text-sm mb-3 sm:mb-4">{block.shortDescription}</p>
      )}
      
      {block.repScheme && !isErg && (
        <div className="text-lg sm:text-xl text-node-volt font-bold mb-3 sm:mb-4">{block.repScheme}</div>
      )}

      {/* Display All Tiers */}
      {(block.tierSilver || block.tierGold || block.tierBlack) && (
        <div className="space-y-2 mt-4">
          {block.tierSilver && renderTierDisplay(block.tierSilver, 'SILVER', '#9e9e9e')}
          {block.tierGold && renderTierDisplay(block.tierGold, 'GOLD', '#ffd700')}
          {block.tierBlack && renderTierDisplay(block.tierBlack, 'BLACK', '#000000')}
        </div>
      )}
    </div>
  );
}
