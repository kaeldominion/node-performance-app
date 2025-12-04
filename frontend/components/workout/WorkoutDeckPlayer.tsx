'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { WorkoutDeckSlide } from './WorkoutDeckSlide';
import { WorkoutTimer } from './WorkoutTimer';
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

interface WorkoutDeckPlayerProps {
  workout: Workout;
  sessionId: string | null;
  onComplete: (rpe: number, notes: string) => void;
}

export function WorkoutDeckPlayer({ workout, sessionId, onComplete }: WorkoutDeckPlayerProps) {
  const router = useRouter();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [deckMode, setDeckMode] = useState(true);
  const [rpe, setRpe] = useState(5);
  const [notes, setNotes] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  
  const { playCue } = useAudioCues();
  const { progress, updateProgress } = useWorkoutProgress(workout.sections.length);
  
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const sectionRef = useRef<HTMLDivElement>(null);

  const currentSection = workout.sections[currentSectionIndex];
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === workout.sections.length - 1;

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (deckMode && isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [deckMode, isPlaying, currentSectionIndex]);

  // Show controls on mouse move
  const handleMouseMove = useCallback(() => {
    if (deckMode) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    }
  }, [deckMode, isPlaying]);

  const handleNextSection = useCallback(() => {
    if (currentSectionIndex < workout.sections.length - 1) {
      playCue('transition');
      setCurrentSectionIndex(currentSectionIndex + 1);
      updateProgress(currentSectionIndex + 1);
      
      // Scroll to top with smooth transition
      if (sectionRef.current) {
        sectionRef.current.scrollTop = 0;
      }
    } else {
      setShowCompleteModal(true);
    }
  }, [currentSectionIndex, workout.sections.length, playCue, updateProgress]);

  const handlePreviousSection = useCallback(() => {
    if (currentSectionIndex > 0) {
      playCue('transition');
      setCurrentSectionIndex(currentSectionIndex - 1);
      updateProgress(currentSectionIndex - 1);
      
      if (sectionRef.current) {
        sectionRef.current.scrollTop = 0;
      }
    }
  }, [currentSectionIndex, playCue, updateProgress]);

  const handleSectionComplete = useCallback(() => {
    playCue('complete');
    setTimeout(() => {
      handleNextSection();
    }, 500);
  }, [handleNextSection, playCue]);

  const handleCompleteWorkout = async () => {
    await onComplete(rpe, notes);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNextSection();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePreviousSection();
      } else if (e.key === 'Escape') {
        setShowCompleteModal(true);
      } else if (e.key === 'f' || e.key === 'F') {
        // Toggle fullscreen
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleNextSection, handlePreviousSection]);

  // Section color mapping
  const getSectionColor = (type: string) => {
    const colors: Record<string, string> = {
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
    return colors[type] || '#ccff00';
  };

  if (deckMode) {
    return (
      <div
        className="fixed inset-0 bg-deep-asphalt overflow-hidden"
        onMouseMove={handleMouseMove}
        style={{ fontFamily: 'var(--font-manrope)' }}
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-tech-grey z-50">
          <div
            className="h-full bg-node-volt transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Section Indicator */}
        <div className="absolute top-4 left-4 z-40">
          <div className="bg-concrete-grey/90 backdrop-blur-sm border border-border-dark rounded-lg px-4 py-2">
            <div className="text-muted-text text-sm font-medium">
              {currentSectionIndex + 1} / {workout.sections.length}
            </div>
            <div className="text-node-volt text-xs font-mono mt-1">
              {workout.displayCode || workout.name}
            </div>
          </div>
        </div>

        {/* Controls (auto-hide) */}
        {showControls && (
          <div className="absolute top-4 right-4 z-40 flex gap-2">
            <button
              onClick={() => setDeckMode(false)}
              className="bg-concrete-grey/90 backdrop-blur-sm border border-border-dark text-text-white px-4 py-2 rounded-lg hover:bg-tech-grey transition-colors text-sm font-medium"
            >
              Exit Deck
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-concrete-grey/90 backdrop-blur-sm border border-border-dark text-text-white px-4 py-2 rounded-lg hover:bg-tech-grey transition-colors text-sm font-medium"
            >
              Exit Workout
            </button>
          </div>
        )}

        {/* Main Deck Slide */}
        <div
          ref={sectionRef}
          className="h-full w-full flex items-center justify-center p-8"
          style={{
            background: `linear-gradient(135deg, ${getSectionColor(currentSection.type)}15 0%, ${getSectionColor(currentSection.type)}05 100%)`,
          }}
        >
          <WorkoutDeckSlide
            section={currentSection}
            workout={workout}
            onComplete={handleSectionComplete}
            onNext={handleNextSection}
            onPrevious={handlePreviousSection}
            isFirst={isFirstSection}
            isLast={isLastSection}
          />
        </div>

        {/* Navigation Dots */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40 flex gap-2">
          {workout.sections.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentSectionIndex(idx);
                updateProgress(idx);
                playCue('transition');
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentSectionIndex
                  ? 'bg-node-volt w-8'
                  : 'bg-tech-grey hover:bg-concrete-grey'
              }`}
            />
          ))}
        </div>

        {/* Complete Modal */}
        {showCompleteModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-concrete-grey border border-border-dark rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Complete Workout
              </h2>

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
                    className="w-full bg-tech-grey border border-border-dark rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt resize-none"
                    rows={4}
                    placeholder="How did it feel? Any notes?"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="flex-1 bg-tech-grey border border-border-dark text-text-white px-6 py-3 rounded-lg hover:bg-concrete-grey transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteWorkout}
                  className="flex-1 bg-node-volt text-deep-asphalt font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
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

  // Fallback to regular view
  return null;
}

