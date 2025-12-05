'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { programsApi, userApi, scheduleApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import ArchetypeBadge from '@/components/workout/ArchetypeBadge';
import Link from 'next/link';
import { Icons } from '@/lib/iconMapping';

interface Program {
  id: string;
  name: string;
  slug: string;
  description?: string;
  level?: string;
  goal?: string;
  durationWeeks?: number;
  workouts: Array<{
    id: string;
    name: string;
    displayCode?: string;
    dayIndex?: number;
    archetype?: string;
  }>;
}

export default function ProgramDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showScheduleWorkoutModal, setShowScheduleWorkoutModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && slug) {
      loadProgram();
    }
  }, [user, authLoading, slug]);

  const loadProgram = async () => {
    try {
      const data = await programsApi.getBySlug(slug);
      setProgram(data);
    } catch (error) {
      console.error('Failed to load program:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartProgram = async () => {
    if (!program) return;

    setStarting(true);
    try {
      await userApi.startProgram({
        programId: program.id,
        startDate: new Date().toISOString(),
      });
      router.push('/');
    } catch (error) {
      console.error('Failed to start program:', error);
      alert('Failed to start program. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  const handleScheduleProgram = () => {
    setShowScheduleModal(true);
  };

  const handleScheduleWorkout = (workout: { id: string; name: string }) => {
    setSelectedWorkout(workout);
    setShowScheduleWorkoutModal(true);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-muted-text">Loading...</div>
      </div>
    );
  }

  if (!user || !program) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/workouts?tab=programs" className="text-muted-text hover:text-text-white mb-4 inline-block">
          ← Back to Programs
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 font-heading">{program.name}</h1>
          {program.description && (
            <p className="text-muted-text text-lg mb-4 font-body">{program.description}</p>
          )}
          <div className="flex gap-4 text-sm">
            {program.level && (
              <span className="text-node-volt">Level: {program.level}</span>
            )}
            {program.goal && (
              <span className="text-muted-text">Goal: {program.goal}</span>
            )}
            {program.durationWeeks && (
              <span className="text-muted-text">Duration: {program.durationWeeks} weeks</span>
            )}
          </div>
        </div>

        <div className="bg-panel thin-border rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 font-heading">Workouts</h2>
          <div className="space-y-3">
            {program.workouts.map((workout) => (
              <div
                key={workout.id}
                className="group p-4 bg-panel thin-border rounded hover:border-node-volt transition-colors"
              >
                <div className="flex items-center justify-between">
                  <Link
                    href={`/workouts/${workout.id}`}
                    className="flex-1 flex items-center gap-3"
                  >
                    <div>
                      {workout.displayCode && (
                        <span className="text-node-volt font-mono">{workout.displayCode}</span>
                      )}{' '}
                      <span className="font-medium font-body">{workout.name}</span>
                      {workout.dayIndex !== null && workout.dayIndex !== undefined && (
                        <span className="text-muted-text ml-2">Day {workout.dayIndex + 1}</span>
                      )}
                    </div>
                    {workout.archetype && <ArchetypeBadge archetype={workout.archetype} size="sm" />}
                  </Link>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleScheduleWorkout({ id: workout.id, name: workout.name });
                      }}
                      className="opacity-0 group-hover:opacity-100 bg-node-volt/20 hover:bg-node-volt/30 text-node-volt px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1"
                      title="Schedule this workout"
                    >
                      <Icons.TIMER size={14} />
                      Schedule
                    </button>
                    <span className="text-muted-text">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleScheduleProgram}
            className="bg-node-volt text-dark font-bold px-8 py-3 rounded hover:opacity-90 transition-opacity font-heading flex items-center gap-2"
          >
            <Icons.TIMER size={20} />
            Schedule Program
          </button>
          <button
            onClick={handleStartProgram}
            disabled={starting}
            className="bg-panel thin-border text-text-white px-8 py-3 rounded hover:bg-panel transition-colors font-heading"
          >
            {starting ? 'Starting...' : 'Start Program'}
          </button>
        </div>
      </main>

      {/* Schedule Program Modal */}
      {showScheduleModal && program && (
        <ScheduleProgramModal
          programId={program.id}
          programName={program.name}
          workouts={program.workouts}
          onClose={() => setShowScheduleModal(false)}
          onSuccess={() => {
            setShowScheduleModal(false);
            router.push('/workouts?tab=schedule');
          }}
        />
      )}

      {/* Schedule Individual Workout Modal */}
      {showScheduleWorkoutModal && selectedWorkout && (
        <ScheduleWorkoutModal
          workoutId={selectedWorkout.id}
          workoutName={selectedWorkout.name}
          onClose={() => {
            setShowScheduleWorkoutModal(false);
            setSelectedWorkout(null);
          }}
          onSuccess={() => {
            setShowScheduleWorkoutModal(false);
            setSelectedWorkout(null);
          }}
        />
      )}
    </div>
  );
}

// Schedule Program Modal
function ScheduleProgramModal({
  programId,
  programName,
  workouts,
  onClose,
  onSuccess,
}: {
  programId: string;
  programName: string;
  workouts: Array<{ id: string; dayIndex?: number }>;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set default to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const handleSchedule = async () => {
    if (!selectedDate) return;

    try {
      setLoading(true);
      await scheduleApi.scheduleProgram({
        programId,
        startDate: selectedDate,
        startTime: selectedTime,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to schedule program:', error);
      alert('Failed to schedule program. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-panel thin-border rounded-lg max-w-md w-full p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Schedule Program
          </h2>
          <button onClick={onClose} className="text-muted-text hover:text-text-white">
            <Icons.X size={24} />
          </button>
        </div>

        <div>
          <p className="text-muted-text mb-4">
            Schedule <strong className="text-text-white">{programName}</strong> with {workouts.length} workouts
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-text">Start Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-dark thin-border rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-muted-text">Start Time</label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full bg-dark thin-border rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
            />
          </div>

          <div className="bg-dark/50 thin-border rounded-lg p-4">
            <p className="text-sm text-muted-text mb-2">Workouts will be scheduled:</p>
            <ul className="text-sm text-text-white space-y-1">
              {workouts.map((workout, idx) => (
                <li key={workout.id}>
                  Day {workout.dayIndex !== null && workout.dayIndex !== undefined ? workout.dayIndex + 1 : idx + 1} at {selectedTime}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-panel thin-border text-text-white px-6 py-3 rounded-lg hover:bg-panel transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            disabled={loading || !selectedDate}
            className="flex-1 bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            {loading ? 'Scheduling...' : 'Schedule Program'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Schedule Individual Workout Modal
function ScheduleWorkoutModal({
  workoutId,
  workoutName,
  onClose,
  onSuccess,
}: {
  workoutId: string;
  workoutName: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set default to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const handleSchedule = async () => {
    if (!selectedDate) return;

    try {
      setLoading(true);
      const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}`);
      await scheduleApi.create({
        workoutId,
        scheduledDate: scheduledDateTime.toISOString(),
        duration: 60, // Default 60 minutes
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to schedule workout:', error);
      alert('Failed to schedule workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-panel thin-border rounded-lg max-w-md w-full p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Schedule Workout
          </h2>
          <button onClick={onClose} className="text-muted-text hover:text-text-white">
            <Icons.X size={24} />
          </button>
        </div>

        <div>
          <p className="text-muted-text mb-4">
            Schedule <strong className="text-text-white">{workoutName}</strong>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-text">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-dark thin-border rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-muted-text">Time</label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full bg-dark thin-border rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-panel thin-border text-text-white px-6 py-3 rounded-lg hover:bg-panel transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            disabled={loading || !selectedDate}
            className="flex-1 bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            {loading ? 'Scheduling...' : 'Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
}

