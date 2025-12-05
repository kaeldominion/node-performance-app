'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { workoutsApi, programsApi, scheduleApi } from '@/lib/api';
import { Icons } from '@/lib/iconMapping';
import ArchetypeBadge from '@/components/workout/ArchetypeBadge';
import { WorkoutScheduler } from '@/components/schedule/WorkoutScheduler';

interface Workout {
  id: string;
  name: string;
  displayCode?: string;
  archetype?: string;
  description?: string;
  sections: any[];
  createdAt: string;
}

export default function WorkoutsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'my-workouts' | 'programs' | 'recommended' | 'schedule'>(() => {
    // Check URL params for tab
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['my-workouts', 'programs', 'recommended', 'schedule'].includes(tab)) {
        return tab as any;
      }
    }
    return 'my-workouts';
  });
  const [myWorkouts, setMyWorkouts] = useState<Workout[]>([]);
  const [myPrograms, setMyPrograms] = useState<any[]>([]);
  const [recommendedWorkouts, setRecommendedWorkouts] = useState<Workout[]>([]);
  const [recommendedPrograms, setRecommendedPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedWorkoutForSchedule, setSelectedWorkoutForSchedule] = useState<{ id: string; name: string } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      loadWorkouts();
    }
  }, [user, authLoading, activeTab]);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      if (activeTab === 'my-workouts') {
        const workouts = await workoutsApi.getMyWorkouts();
        setMyWorkouts(workouts);
      } else if (activeTab === 'programs') {
        const programs = await programsApi.getAll();
        setMyPrograms(programs);
      } else if (activeTab === 'recommended') {
        const [workouts, programs] = await Promise.all([
          workoutsApi.getRecommended().catch(() => []),
          programsApi.getAll().catch(() => []),
        ]);
        setRecommendedWorkouts(workouts);
        setRecommendedPrograms(programs);
      }
    } catch (error) {
      console.error('Failed to load workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentWorkouts = activeTab === 'my-workouts' ? myWorkouts : recommendedWorkouts;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-muted-text">Loading workouts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Workouts
          </h1>
          <p className="text-muted-text">
            Build, save, and track your training sessions
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b thin-border overflow-x-auto">
          <button
            onClick={() => setActiveTab('my-workouts')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'my-workouts'
                ? 'border-node-volt text-node-volt'
                : 'border-transparent text-muted-text hover:text-text-white'
            }`}
          >
            My Workouts
          </button>
          <button
            onClick={() => setActiveTab('programs')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'programs'
                ? 'border-node-volt text-node-volt'
                : 'border-transparent text-muted-text hover:text-text-white'
            }`}
          >
            Programs
          </button>
          <button
            onClick={() => setActiveTab('recommended')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'recommended'
                ? 'border-node-volt text-node-volt'
                : 'border-transparent text-muted-text hover:text-text-white'
            }`}
          >
            Recommended
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'schedule'
                ? 'border-node-volt text-node-volt'
                : 'border-transparent text-muted-text hover:text-text-white'
            }`}
          >
            Schedule
          </button>
        </div>

        {/* Programs Tab */}
        {activeTab === 'programs' && (
          <>
            {myPrograms.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-text text-lg mb-4">
                  You haven't created any programs yet
                </p>
                <p className="text-muted-text text-sm mb-6">
                  Create a 4-day, 7-day, or 4-week program using the AI Builder
                </p>
                <Link
                  href="/ai/workout-builder"
                  className="inline-block bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Create Program
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myPrograms.map((program: any) => (
                  <Link
                    key={program.id}
                    href={`/programs/${program.slug}`}
                    className="group bg-panel thin-border rounded-lg p-6 hover:border-node-volt transition-all hover:shadow-lg hover:shadow-node-volt/20"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-heading font-bold mb-2 group-hover:text-node-volt transition-colors">
                          {program.name}
                        </h3>
                        {program.description && (
                          <p className="text-muted-text text-sm mb-3 line-clamp-2">
                            {program.description}
                          </p>
                        )}
                        <div className="flex gap-4 text-xs text-muted-text">
                          {program.level && (
                            <span className="text-node-volt">Level: {program.level}</span>
                          )}
                          {program.durationWeeks && (
                            <span>{program.durationWeeks} weeks</span>
                          )}
                        </div>
                      </div>
                      <span className="text-muted-text group-hover:text-node-volt transition-colors">→</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-text">
                      <span>{program.workouts?.length || 0} workouts</span>
                      <span className="text-node-volt font-semibold">View →</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <WorkoutScheduler />
        )}

        {/* Recommended Tab - Shows both workouts and programs */}
        {activeTab === 'recommended' && (
          <>
            {recommendedWorkouts.length === 0 && recommendedPrograms.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-text text-lg mb-4">
                  No recommended workouts or programs available
                </p>
                <Link
                  href="/ai/workout-builder"
                  className="inline-block bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Create Your First Workout
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Recommended Workouts */}
                {recommendedWorkouts.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      Recommended Workouts
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recommendedWorkouts.map((workout) => (
                        <div
                          key={workout.id}
                          className="group bg-panel thin-border rounded-lg p-6 hover:border-node-volt transition-all hover:shadow-lg hover:shadow-node-volt/20 relative"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <Link href={`/workouts/${workout.id}`} className="flex-1">
                              {workout.displayCode && (
                                <div className="text-node-volt font-mono text-sm mb-1">
                                  {workout.displayCode}
                                </div>
                              )}
                              <h3 className="text-xl font-heading font-bold mb-2 group-hover:text-node-volt transition-colors">
                                {workout.name}
                              </h3>
                              {workout.archetype && (
                                <ArchetypeBadge archetype={workout.archetype} size="sm" />
                              )}
                            </Link>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedWorkoutForSchedule({ id: workout.id, name: workout.name });
                                  setShowScheduleModal(true);
                                }}
                                className="opacity-0 group-hover:opacity-100 bg-node-volt/20 hover:bg-node-volt/30 text-node-volt px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1"
                                title="Schedule this workout"
                              >
                                <Icons.TIMER size={14} />
                                Schedule
                              </button>
                            </div>
                          </div>
                          {workout.description && (
                            <p className="text-muted-text text-sm mb-4 line-clamp-2">
                              {workout.description}
                            </p>
                          )}
                          <Link href={`/workouts/${workout.id}`}>
                            <div className="flex items-center justify-between text-sm text-muted-text">
                              <span>{workout.sections?.length || 0} sections</span>
                              <span className="text-node-volt font-semibold">Start →</span>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Programs */}
                {recommendedPrograms.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      Recommended Programs
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recommendedPrograms.map((program: any) => (
                        <Link
                          key={program.id}
                          href={`/programs/${program.slug}`}
                          className="group bg-panel thin-border rounded-lg p-6 hover:border-node-volt transition-all hover:shadow-lg hover:shadow-node-volt/20"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-heading font-bold mb-2 group-hover:text-node-volt transition-colors">
                                {program.name}
                              </h3>
                              {program.description && (
                                <p className="text-muted-text text-sm mb-3 line-clamp-2">
                                  {program.description}
                                </p>
                              )}
                              <div className="flex gap-4 text-xs text-muted-text">
                                {program.level && (
                                  <span className="text-node-volt">Level: {program.level}</span>
                                )}
                                {program.durationWeeks && (
                                  <span>{program.durationWeeks} weeks</span>
                                )}
                              </div>
                            </div>
                            <span className="text-muted-text group-hover:text-node-volt transition-colors">→</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-text">
                            <span>{program.workouts?.length || 0} workouts</span>
                            <span className="text-node-volt font-semibold">View →</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* My Workouts Tab */}
        {activeTab === 'my-workouts' && (
          <>
            {myWorkouts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-text text-lg mb-4">
                  You haven't saved any workouts yet
                </p>
                <Link
                  href="/ai/workout-builder"
                  className="inline-block bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Create Your First Workout
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myWorkouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="group bg-panel thin-border rounded-lg p-6 hover:border-node-volt transition-all hover:shadow-lg hover:shadow-node-volt/20 relative"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <Link href={`/workouts/${workout.id}`} className="flex-1">
                        {workout.displayCode && (
                          <div className="text-node-volt font-mono text-sm mb-1">
                            {workout.displayCode}
                          </div>
                        )}
                        <h3 className="text-xl font-heading font-bold mb-2 group-hover:text-node-volt transition-colors">
                          {workout.name}
                        </h3>
                        {workout.archetype && (
                          <ArchetypeBadge archetype={workout.archetype} size="sm" />
                        )}
                      </Link>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWorkoutForSchedule({ id: workout.id, name: workout.name });
                            setShowScheduleModal(true);
                          }}
                          className="opacity-0 group-hover:opacity-100 bg-node-volt/20 hover:bg-node-volt/30 text-node-volt px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1"
                          title="Schedule this workout"
                        >
                          <Icons.TIMER size={14} />
                          Schedule
                        </button>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === workout.id ? null : workout.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-panel rounded transition-all"
                            title="More options"
                          >
                            <Icons.MORE_VERTICAL size={18} className="text-muted-text" />
                          </button>
                          {openMenuId === workout.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div className="absolute right-0 top-10 z-20 bg-panel thin-border rounded-lg shadow-lg min-w-[160px] overflow-hidden">
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    try {
                                      const shareData = await workoutsApi.generateShareLink(workout.id);
                                      await navigator.clipboard.writeText(shareData.shareUrl);
                                      alert('Share link copied to clipboard!');
                                    } catch (error) {
                                      console.error('Failed to generate share link:', error);
                                      alert('Failed to generate share link. Please try again.');
                                    }
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-dark transition-colors flex items-center gap-2 text-sm"
                                >
                                  <Icons.SHARE size={16} className="text-muted-text" />
                                  Share Workout
                                </button>
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    if (confirm('Are you sure you want to delete this workout? This action cannot be undone.')) {
                                      try {
                                        await workoutsApi.delete(workout.id);
                                        loadWorkouts();
                                      } catch (error) {
                                        console.error('Failed to delete workout:', error);
                                        alert('Failed to delete workout. Please try again.');
                                      }
                                    }
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-dark transition-colors flex items-center gap-2 text-sm text-red-400"
                                >
                                  <Icons.TRASH size={16} />
                                  Delete Workout
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {workout.description && (
                      <p className="text-muted-text text-sm mb-4 line-clamp-2">
                        {workout.description}
                      </p>
                    )}
                    <Link href={`/workouts/${workout.id}`}>
                      <div className="flex items-center justify-between text-sm text-muted-text">
                        <span>{workout.sections?.length || 0} sections</span>
                        <span className="text-node-volt font-semibold">Start →</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Schedule Workout Modal */}
      {showScheduleModal && selectedWorkoutForSchedule && (
        <ScheduleWorkoutModal
          workoutId={selectedWorkoutForSchedule.id}
          workoutName={selectedWorkoutForSchedule.name}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedWorkoutForSchedule(null);
          }}
          onSuccess={() => {
            setShowScheduleModal(false);
            setSelectedWorkoutForSchedule(null);
          }}
        />
      )}
    </div>
  );
}

// Schedule Workout Modal Component
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

