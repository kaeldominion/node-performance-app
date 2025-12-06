'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { workoutsApi, programsApi } from '@/lib/api';

interface UnsavedWorkout {
  id: string;
  workout: any;
  generatedAt: Date;
  formData: any;
}

interface WorkoutGenerationContextType {
  generatingWorkouts: Set<string>;
  unsavedWorkouts: UnsavedWorkout[];
  startGeneration: (generationId: string) => void;
  completeGeneration: (generationId: string, workout: any, formData: any) => void;
  removeUnsavedWorkout: (id: string) => void;
  clearAllUnsaved: () => void;
  isGenerating: (generationId: string) => boolean;
}

const WorkoutGenerationContext = createContext<WorkoutGenerationContextType | undefined>(undefined);

const STORAGE_KEY = 'node_unsaved_workouts';
const MAX_UNSAVED_WORKOUTS = 10;

export function WorkoutGenerationProvider({ children }: { children: React.ReactNode }) {
  const [generatingWorkouts, setGeneratingWorkouts] = useState<Set<string>>(new Set());
  const [unsavedWorkouts, setUnsavedWorkouts] = useState<UnsavedWorkout[]>([]);

  // Load unsaved workouts from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const workouts = parsed.map((w: any) => ({
          ...w,
          generatedAt: new Date(w.generatedAt),
        }));
        setUnsavedWorkouts(workouts);
      }
    } catch (error) {
      console.error('Failed to load unsaved workouts:', error);
    }
  }, []);

  // Save unsaved workouts to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unsavedWorkouts));
    } catch (error) {
      console.error('Failed to save unsaved workouts:', error);
    }
  }, [unsavedWorkouts]);

  const startGeneration = useCallback((generationId: string) => {
    setGeneratingWorkouts((prev) => new Set([...prev, generationId]));
  }, []);

  const completeGeneration = useCallback((generationId: string, workout: any, formData: any) => {
    console.log('🎯 completeGeneration called:', { generationId, hasWorkout: !!workout, workoutType: Array.isArray(workout) ? 'array' : typeof workout });
    
    setGeneratingWorkouts((prev) => {
      const next = new Set(prev);
      next.delete(generationId);
      console.log('✅ Removed from generatingWorkouts:', generationId);
      return next;
    });

    const newWorkout: UnsavedWorkout = {
      id: generationId,
      workout,
      generatedAt: new Date(),
      formData,
    };

    setUnsavedWorkouts((prev) => {
      // Add new workout at the beginning, keep only last MAX_UNSAVED_WORKOUTS
      const updated = [newWorkout, ...prev].slice(0, MAX_UNSAVED_WORKOUTS);
      console.log('💾 Saved unsaved workout:', { generationId, totalUnsaved: updated.length });
      return updated;
    });

    // Dispatch custom event for notification system
    // Use setTimeout to ensure state updates are complete before dispatching
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        try {
          const event = new CustomEvent('workout-generated', {
            detail: { generationId, workout, formData },
            bubbles: true,
            cancelable: true,
          });
          const dispatched = window.dispatchEvent(event);
          console.log('📢 Dispatched workout-generated event:', { 
            generationId, 
            hasWorkout: !!workout,
            eventDispatched: dispatched,
            workoutName: workout?.name || workout?.workouts?.[0]?.name || 'Unknown',
          });
        } catch (error) {
          console.error('❌ Failed to dispatch workout-generated event:', error);
        }
      } else {
        console.warn('⚠️ Window not available, cannot dispatch event');
      }
    }, 100);
  }, []);

  const removeUnsavedWorkout = useCallback((id: string) => {
    setUnsavedWorkouts((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const clearAllUnsaved = useCallback(() => {
    setUnsavedWorkouts([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear unsaved workouts:', error);
    }
  }, []);

  const isGenerating = useCallback((generationId: string) => {
    return generatingWorkouts.has(generationId);
  }, [generatingWorkouts]);

  return (
    <WorkoutGenerationContext.Provider
      value={{
        generatingWorkouts,
        unsavedWorkouts,
        startGeneration,
        completeGeneration,
        removeUnsavedWorkout,
        clearAllUnsaved,
        isGenerating,
      }}
    >
      {children}
    </WorkoutGenerationContext.Provider>
  );
}

export function useWorkoutGeneration() {
  const context = useContext(WorkoutGenerationContext);
  if (context === undefined) {
    throw new Error('useWorkoutGeneration must be used within a WorkoutGenerationProvider');
  }
  return context;
}

