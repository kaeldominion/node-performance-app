'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { workoutsApi, programsApi, scheduleApi } from '@/lib/api';
import { Icons } from '@/lib/iconMapping';
import { copyToClipboard } from '@/lib/clipboard';
import ArchetypeBadge from '@/components/workout/ArchetypeBadge';
import { WorkoutScheduler } from '@/components/schedule/WorkoutScheduler';
import { Calendar } from 'lucide-react';
import { WorkoutDetailsModal } from '@/components/workout/WorkoutDetailsModal';
import { WorkoutShareModal } from '@/components/workout/WorkoutShareModal';

interface Workout {
  id: string;
  name: string;
  displayCode?: string;
  archetype?: string;
  description?: string;
  sections: any[];
  createdAt: string;
  averageRating?: number | null;
  ratingCount?: number;
}

export default function WorkoutsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'my-workouts' | 'programs' | 'recommended' | 'schedule' | 'favorites' | 'top-rated'>(() => {
    // Check URL params for tab
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['my-workouts', 'programs', 'recommended', 'schedule', 'favorites', 'top-rated'].includes(tab)) {
        return tab as any;
      }
    }
    return 'my-workouts';
  });
  
  // Force reload when tab changes or when timestamp param is present (indicates fresh navigation)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('_t') && user) {
        // Fresh navigation detected, force reload
        loadWorkouts();
        // Clean up the timestamp param
        params.delete('_t');
        const newUrl = params.toString() 
          ? `${window.location.pathname}?${params.toString()}`
          : window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [user]);
  const [myWorkouts, setMyWorkouts] = useState<Workout[]>([]);
  const [myPrograms, setMyPrograms] = useState<any[]>([]);
  const [recommendedWorkouts, setRecommendedWorkouts] = useState<Workout[]>([]);
  const [recommendedPrograms, setRecommendedPrograms] = useState<any[]>([]);
  const [favoriteWorkouts, setFavoriteWorkouts] = useState<Workout[]>([]);
  const [topRatedWorkouts, setTopRatedWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedWorkoutForSchedule, setSelectedWorkoutForSchedule] = useState<{ id: string; name: string } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [selectedWorkoutForDetails, setSelectedWorkoutForDetails] = useState<Workout | null>(null);
  const [selectedWorkoutForShare, setSelectedWorkoutForShare] = useState<Workout | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      loadWorkouts();
    }
  }, [user, authLoading, activeTab]);

  // Refresh workouts when page becomes visible (e.g., when navigating back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user && activeTab === 'my-workouts') {
        loadWorkouts();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, activeTab]);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Always load favorites to get favoriteIds for all tabs
      try {
        const favorites = await workoutsApi.getFavorites();
        console.log('Loaded favorites:', favorites);
        
        // Ensure we have an array - backend should return array of WorkoutFavorite objects with nested workout
        let favoriteWorkoutsList: any[] = [];
        
        if (Array.isArray(favorites)) {
          favoriteWorkoutsList = favorites;
        } else if (favorites && typeof favorites === 'object') {
          // If it's an object, try to extract array from common properties
          if (Array.isArray(favorites.workouts)) {
            favoriteWorkoutsList = favorites.workouts;
          } else if (Array.isArray(favorites.data)) {
            favoriteWorkoutsList = favorites.data;
          } else {
            // If it's not an array, default to empty array
            console.warn('Favorites is not an array:', typeof favorites, favorites);
            favoriteWorkoutsList = [];
          }
        } else {
          // If it's null, undefined, or other non-array, default to empty array
          console.warn('Favorites is not an array or object:', typeof favorites, favorites);
          favoriteWorkoutsList = [];
        }
        
        // Extract workout IDs from the list (each favorite has a nested workout object)
        const favoriteIdsList = favoriteWorkoutsList
          .map((f: any) => {
            // Handle WorkoutFavorite objects with nested workout
            if (f && f.workout && f.workout.id) {
              return f.workout.id;
            }
            // Handle direct workout objects
            if (f && f.id) {
              return f.id;
            }
            // Handle workoutId property
            if (f && f.workoutId) {
              return f.workoutId;
            }
            return null;
          })
          .filter((id): id is string => id !== null && id !== undefined);
        
        setFavoriteIds(new Set(favoriteIdsList));
        
        if (activeTab === 'favorites') {
          // Extract actual workout objects for display
          const workoutsForDisplay = favoriteWorkoutsList
            .map((f: any) => {
              // If it's a WorkoutFavorite object, extract the workout
              if (f && f.workout) {
                return f.workout;
              }
              // If it's already a workout object, use it directly
              if (f && f.id && f.name) {
                return f;
              }
              return null;
            })
            .filter((w: any): w is any => w !== null && w !== undefined && w.id);
          setFavoriteWorkouts(workoutsForDisplay);
        }
      } catch (favError) {
        console.error('Failed to load favorites:', favError);
        setFavoriteIds(new Set());
        if (activeTab === 'favorites') {
          setFavoriteWorkouts([]);
        }
      }
      
      if (activeTab === 'my-workouts') {
        try {
          const workouts = await workoutsApi.getMyWorkouts();
          console.log('Loaded my workouts:', workouts);
          // Ensure it's an array
          setMyWorkouts(Array.isArray(workouts) ? workouts : []);
        } catch (error) {
          console.error('Failed to load my workouts:', error);
          setMyWorkouts([]);
          setError('Failed to load your workouts. Please try again.');
        }
      } else if (activeTab === 'programs') {
        const programs = await programsApi.getAll().catch(() => []);
        setMyPrograms(Array.isArray(programs) ? programs : []);
      } else if (activeTab === 'recommended') {
        const [workouts, programs] = await Promise.all([
          workoutsApi.getRecommended().catch(() => []),
          programsApi.getAll().catch(() => []),
        ]);
        setRecommendedWorkouts(Array.isArray(workouts) ? workouts : []);
        setRecommendedPrograms(Array.isArray(programs) ? programs : []);
      } else if (activeTab === 'top-rated') {
        const topRated = await workoutsApi.getTopRated(20).catch(() => []);
        setTopRatedWorkouts(Array.isArray(topRated) ? topRated : []);
      }
    } catch (error) {
      console.error('Failed to load workouts:', error);
      setError('Failed to load workouts. Please try again.');
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

  if (error && activeTab === 'my-workouts') {
    return (
      <div className="min-h-screen bg-dark">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={loadWorkouts}
              className="bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Retry
            </button>
          </div>
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
            className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'my-workouts'
                ? 'border-node-volt text-node-volt'
                : 'border-transparent text-muted-text hover:text-text-white'
            }`}
          >
            <Icons.WORKOUT size={18} />
            My Workouts
          </button>
          <button
            onClick={() => setActiveTab('programs')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'programs'
                ? 'border-node-volt text-node-volt'
                : 'border-transparent text-muted-text hover:text-text-white'
            }`}
          >
            <Icons.PROGRAMS size={18} />
            Programs
          </button>
          <button
            onClick={() => setActiveTab('recommended')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'recommended'
                ? 'border-node-volt text-node-volt'
                : 'border-transparent text-muted-text hover:text-text-white'
            }`}
          >
            <Icons.RECOMMENDED size={18} />
            Recommended
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'schedule'
                ? 'border-node-volt text-node-volt'
                : 'border-transparent text-muted-text hover:text-text-white'
            }`}
          >
            <Calendar size={18} />
            Schedule
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'favorites'
                ? 'border-node-volt text-node-volt'
                : 'border-transparent text-muted-text hover:text-text-white'
            }`}
          >
            <Icons.HEART size={18} />
            Favorites
          </button>
          <button
            onClick={() => setActiveTab('top-rated')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'top-rated'
                ? 'border-node-volt text-node-volt'
                : 'border-transparent text-muted-text hover:text-text-white'
            }`}
          >
            <Icons.STAR size={18} />
            Top Rated
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

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <>
            {favoriteWorkouts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-text text-lg mb-4">
                  No favorite workouts yet
                </p>
                <p className="text-muted-text text-sm mb-6">
                  Click the heart icon on any workout to add it to your favorites
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteWorkouts.map((workout) => (
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
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await workoutsApi.removeFavorite(workout.id);
                            setFavoriteWorkouts(favoriteWorkouts.filter((w) => w.id !== workout.id));
                            setFavoriteIds(new Set(Array.from(favoriteIds).filter((id) => id !== workout.id)));
                          } catch (error) {
                            console.error('Failed to remove favorite:', error);
                            alert('Failed to remove favorite');
                          }
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Remove from favorites"
                      >
                        <Icons.HEART size={20} className="fill-current" />
                      </button>
                    </div>
                    {workout.description && (
                      <p className="text-muted-text text-sm mb-4 line-clamp-2">
                        {workout.description}
                      </p>
                    )}
                    {workout.averageRating !== null && workout.averageRating !== undefined && workout.ratingCount !== undefined && workout.ratingCount > 0 && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Icons.STAR
                              key={i}
                              size={14}
                              className={i < Math.round(workout.averageRating!) ? 'text-yellow-400 fill-current' : 'text-muted-text'}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-text">
                          {workout.averageRating.toFixed(1)} ({workout.ratingCount} {workout.ratingCount === 1 ? 'rating' : 'ratings'})
                        </span>
                      </div>
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

        {/* Top Rated Tab */}
        {activeTab === 'top-rated' && (
          <>
            {topRatedWorkouts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-text text-lg mb-4">
                  No rated workouts yet
                </p>
                <p className="text-muted-text text-sm">
                  Workouts will appear here once users start rating them
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topRatedWorkouts.map((workout: any) => (
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
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const isFavorite = favoriteIds.has(workout.id);
                          try {
                            if (isFavorite) {
                              await workoutsApi.removeFavorite(workout.id);
                              setFavoriteIds(new Set(Array.from(favoriteIds).filter((id) => id !== workout.id)));
                            } else {
                              await workoutsApi.addFavorite(workout.id);
                              setFavoriteIds(new Set([...favoriteIds, workout.id]));
                            }
                          } catch (error) {
                            console.error('Failed to toggle favorite:', error);
                            alert('Failed to update favorite. Please try again.');
                          }
                        }}
                        className={`opacity-0 group-hover:opacity-100 p-2 hover:bg-panel rounded transition-all ${
                          favoriteIds.has(workout.id) ? 'opacity-100 text-yellow-400' : 'text-muted-text'
                        }`}
                        title={favoriteIds.has(workout.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Icons.STAR size={18} className={favoriteIds.has(workout.id) ? 'fill-current' : ''} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Icons.STAR
                            key={i}
                            size={16}
                            className={i < Math.round(workout.averageRating) ? 'text-yellow-400 fill-current' : 'text-muted-text'}
                          />
                        ))}
                        <span className="text-sm text-muted-text ml-1">
                          {workout.averageRating.toFixed(1)} ({workout.ratingCount} {workout.ratingCount === 1 ? 'rating' : 'ratings'})
                        </span>
                      </div>
                    </div>
                    {workout.creator && (
                      <p className="text-xs text-muted-text mb-2">
                        by {workout.creator.username || workout.creator.name || workout.creator.email}
                      </p>
                    )}
                    {workout.description && (
                      <p className="text-muted-text text-sm mb-4 line-clamp-2">
                        {workout.description}
                      </p>
                    )}
                    <Link href={`/workouts/${workout.id}`}>
                      <div className="flex items-center justify-between text-sm text-muted-text">
                        <span>{workout.sections?.length || 0} sections</span>
                        <span className="text-node-volt font-semibold">View →</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
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
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const isFavorite = favoriteIds.has(workout.id);
                                  try {
                                    if (isFavorite) {
                                      await workoutsApi.removeFavorite(workout.id);
                                      setFavoriteIds(new Set(Array.from(favoriteIds).filter((id) => id !== workout.id)));
                                    } else {
                                      await workoutsApi.addFavorite(workout.id);
                                      setFavoriteIds(new Set([...favoriteIds, workout.id]));
                                    }
                                  } catch (error) {
                                    console.error('Failed to toggle favorite:', error);
                                    alert('Failed to update favorite. Please try again.');
                                  }
                                }}
                                className={`opacity-0 group-hover:opacity-100 p-2 hover:bg-panel rounded transition-all ${
                                  favoriteIds.has(workout.id) ? 'opacity-100 text-yellow-400' : 'text-muted-text'
                                }`}
                                title={favoriteIds.has(workout.id) ? 'Remove from favorites' : 'Add to favorites'}
                              >
                                <Icons.STAR size={18} className={favoriteIds.has(workout.id) ? 'fill-current' : ''} />
                              </button>
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
                          {workout.averageRating !== null && workout.averageRating !== undefined && workout.ratingCount !== undefined && workout.ratingCount > 0 && (
                            <div className="flex items-center gap-2 mb-4">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Icons.STAR
                                    key={i}
                                    size={14}
                                    className={i < Math.round(workout.averageRating!) ? 'text-yellow-400 fill-current' : 'text-muted-text'}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-text">
                                {workout.averageRating.toFixed(1)} ({workout.ratingCount} {workout.ratingCount === 1 ? 'rating' : 'ratings'})
                              </span>
                            </div>
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
                          onClick={async (e) => {
                            e.stopPropagation();
                            const isFavorite = favoriteIds.has(workout.id);
                            try {
                              if (isFavorite) {
                                await workoutsApi.removeFavorite(workout.id);
                                setFavoriteIds(new Set(Array.from(favoriteIds).filter((id) => id !== workout.id)));
                              } else {
                                await workoutsApi.addFavorite(workout.id);
                                setFavoriteIds(new Set([...favoriteIds, workout.id]));
                              }
                            } catch (error) {
                              console.error('Failed to toggle favorite:', error);
                              alert('Failed to update favorite. Please try again.');
                            }
                          }}
                          className={`opacity-0 group-hover:opacity-100 p-2 hover:bg-panel rounded transition-all ${
                            favoriteIds.has(workout.id) ? 'opacity-100 text-yellow-400' : 'text-muted-text'
                          }`}
                          title={favoriteIds.has(workout.id) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Icons.STAR size={18} className={favoriteIds.has(workout.id) ? 'fill-current' : ''} />
                        </button>
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    setSelectedWorkoutForShare(workout);
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
                    {workout.averageRating !== null && workout.averageRating !== undefined && workout.ratingCount !== undefined && workout.ratingCount > 0 && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Icons.STAR
                              key={i}
                              size={14}
                              className={i < Math.round(workout.averageRating!) ? 'text-yellow-400 fill-current' : 'text-muted-text'}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-text">
                          {workout.averageRating.toFixed(1)} ({workout.ratingCount} {workout.ratingCount === 1 ? 'rating' : 'ratings'})
                        </span>
                      </div>
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
            // Refresh the schedule if we're on the schedule tab
            if (activeTab === 'schedule') {
              // Force a reload by triggering a state change
              window.dispatchEvent(new Event('schedule-updated'));
            }
          }}
        />
      )}

      {/* Workout Details Modal */}
      {selectedWorkoutForDetails && (
        <WorkoutDetailsModal
          workout={selectedWorkoutForDetails}
          onClose={() => setSelectedWorkoutForDetails(null)}
        />
      )}

      {/* Share Modal */}
      {selectedWorkoutForShare && (
        <WorkoutShareModal
          isOpen={!!selectedWorkoutForShare}
          onClose={() => setSelectedWorkoutForShare(null)}
          workout={selectedWorkoutForShare}
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
      // Notify dashboard and other components that schedule was updated
      window.dispatchEvent(new Event('schedule-updated'));
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

