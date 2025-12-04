'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { workoutsApi, sessionsApi } from '@/lib/api';
import { WorkoutDeckPlayer } from '@/components/workout/WorkoutDeckPlayer';
import SectionWarmup from '@/components/workout/SectionWarmup';
import SectionEMOM from '@/components/workout/SectionEMOM';
import SectionAMRAP from '@/components/workout/SectionAMRAP';
import SectionFinisher from '@/components/workout/SectionFinisher';
import SectionCooldown from '@/components/workout/SectionCooldown';
import SectionWave from '@/components/workout/SectionWave';
import SectionSuperset from '@/components/workout/SectionSuperset';
import SectionCapacity from '@/components/workout/SectionCapacity';
import SectionFlow from '@/components/workout/SectionFlow';
import ArchetypeBadge from '@/components/workout/ArchetypeBadge';

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

export default function WorkoutPlayerPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const workoutId = params.id as string;
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [rpe, setRpe] = useState(5);
  const [notes, setNotes] = useState('');
  const [deckMode, setDeckMode] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && workoutId) {
      loadWorkout();
      startSession();
    }
  }, [user, authLoading, workoutId]);

  const loadWorkout = async () => {
    try {
      const data = await workoutsApi.getById(workoutId);
      setWorkout(data);
    } catch (error) {
      console.error('Failed to load workout:', error);
    } finally {
      setLoading(false);
    }
  };

  const startSession = async () => {
    try {
      const session = await sessionsApi.create({ workoutId });
      setSessionId(session.id);
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const handleNextSection = () => {
    if (workout && currentSection < workout.sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      setShowCompleteModal(true);
    }
  };

  const handlePreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleCompleteWorkout = async (finalRpe: number, finalNotes: string) => {
    if (!sessionId) return;

    try {
      await sessionsApi.complete(sessionId, {
        completed: true,
        rpe: finalRpe,
        notes: finalNotes,
      });
      router.push('/');
    } catch (error) {
      console.error('Failed to complete session:', error);
      alert('Failed to save session. Please try again.');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-deep-asphalt flex items-center justify-center">
        <div className="text-muted-text">Loading workout...</div>
      </div>
    );
  }

  if (!user || !workout) {
    return null;
  }

  // Use deck mode by default
  if (deckMode) {
    return (
      <WorkoutDeckPlayer
        workout={workout}
        sessionId={sessionId}
        onComplete={handleCompleteWorkout}
      />
    );
  }

  // Fallback to regular view
  const section = workout.sections[currentSection];
  const isFirstSection = currentSection === 0;
  const isLastSection = currentSection === workout.sections.length - 1;

  const renderSection = () => {
    switch (section.type) {
      case 'WARMUP':
        return <SectionWarmup title={section.title} note={section.note} blocks={section.blocks} />;
      case 'EMOM':
        return (
          <SectionEMOM
            title={section.title}
            note={section.note}
            blocks={section.blocks}
            workSec={section.emomWorkSec || 45}
            restSec={section.emomRestSec || 15}
            rounds={section.emomRounds || 12}
          />
        );
      case 'AMRAP':
      case 'CIRCUIT':
        return (
          <SectionAMRAP
            title={section.title}
            note={section.note}
            blocks={section.blocks}
            durationSec={section.durationSec || 720}
          />
        );
      case 'WAVE':
        return <SectionWave title={section.title} note={section.note} blocks={section.blocks} />;
      case 'SUPERSET':
        return <SectionSuperset title={section.title} note={section.note} blocks={section.blocks} />;
      case 'CAPACITY':
        return (
          <SectionCapacity
            title={section.title}
            note={section.note}
            blocks={section.blocks}
            durationSec={section.durationSec || 1080}
          />
        );
      case 'FLOW':
        return <SectionFlow title={section.title} note={section.note} blocks={section.blocks} />;
      case 'FINISHER':
        return <SectionFinisher title={section.title} note={section.note} blocks={section.blocks} />;
      case 'COOLDOWN':
        return <SectionCooldown title={section.title} note={section.note} blocks={section.blocks} />;
      default:
        return <SectionWarmup title={section.title} note={section.note} blocks={section.blocks} />;
    }
  };

  return (
    <div className="h-screen bg-deep-asphalt overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-concrete-grey border-b border-border-dark px-8 py-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              {workout.displayCode && <span className="text-node-volt">{workout.displayCode}</span>}{' '}
              {workout.name}
            </h1>
            {workout.archetype && <ArchetypeBadge archetype={workout.archetype} size="sm" />}
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-muted-text hover:text-text-white transition-colors"
          >
            Exit
          </button>
        </div>
        {workout.description && (
          <p className="text-muted-text text-sm mb-2 italic">{workout.description}</p>
        )}
        <p className="text-muted-text text-sm">
          Section {currentSection + 1} of {workout.sections.length}
        </p>
      </div>

      {/* Section Navigation */}
      <div className="bg-tech-grey border-b border-border-dark px-8 py-2 flex items-center justify-between">
        <div className="flex gap-2">
          {workout.sections.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSection(idx)}
              className={`px-4 py-1 rounded text-sm font-medium transition-colors ${
                idx === currentSection
                  ? 'bg-node-volt text-deep-asphalt'
                  : 'bg-concrete-grey text-muted-text hover:text-text-white'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {!isFirstSection && (
            <button
              onClick={handlePreviousSection}
              className="bg-concrete-grey border border-border-dark text-text-white px-4 py-1 rounded hover:opacity-90"
            >
              ← Previous
            </button>
          )}
          <button
            onClick={handleNextSection}
            className="bg-node-volt text-deep-asphalt font-bold px-6 py-1 rounded hover:opacity-90"
          >
            {isLastSection ? 'Complete' : 'Next →'}
          </button>
        </div>
      </div>

      {/* Section Content */}
      <div className="flex-1 overflow-auto">
        {renderSection()}
      </div>

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-concrete-grey border border-border-dark rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Complete Workout</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">RPE (Rate of Perceived Exertion)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={rpe}
                  onChange={(e) => setRpe(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-node-volt font-bold text-xl mt-2">{rpe}/10</div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-tech-grey border border-border-dark rounded px-4 py-2 text-text-white focus:outline-none focus:border-node-volt"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 bg-tech-grey border border-border-dark text-text-white px-4 py-2 rounded hover:opacity-90"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCompleteWorkout(rpe, notes)}
                className="flex-1 bg-node-volt text-deep-asphalt font-bold px-4 py-2 rounded hover:opacity-90"
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

