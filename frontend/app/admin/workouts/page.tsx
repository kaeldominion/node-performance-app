'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { workoutsApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Workout {
  id: string;
  name: string;
  displayCode?: string;
  archetype?: string;
  description?: string;
  isRecommended: boolean;
  createdAt: string;
}

export default function AdminWorkoutsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push('/');
      return;
    }
    if (user?.isAdmin) {
      loadWorkouts();
    }
  }, [user, authLoading, router]);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      // For now, we'll need to fetch all workouts - we can add a findAll endpoint later
      // For now, admins can mark workouts as recommended from the workout detail page
      setWorkouts([]);
    } catch (err: any) {
      console.error('Failed to load workouts:', err);
      setError('Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRecommended = async (workoutId: string, currentStatus: boolean) => {
    try {
      await workoutsApi.toggleRecommended(workoutId, !currentStatus);
      setWorkouts(workouts.map(w => 
        w.id === workoutId ? { ...w, isRecommended: !currentStatus } : w
      ));
    } catch (err: any) {
      console.error('Failed to toggle recommended status:', err);
      setError('Failed to update workout');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-muted-text">Loading...</div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  const filteredWorkouts = workouts.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.displayCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Manage Workouts</h1>
              <p className="text-muted-text">Mark workouts as recommended for quick user access</p>
            </div>
            <Link
              href="/admin"
              className="text-muted-text hover:text-text-white transition-colors"
            >
              ← Back to Admin
            </Link>
          </div>

          <div className="bg-node-volt/10 border border-node-volt rounded-lg p-4 mb-6">
            <p className="text-sm text-text-white">
              <strong>Note:</strong> To mark a workout as recommended, navigate to the workout detail page and use the "Mark as Recommended" button. 
              This page will show all workouts once we add a list endpoint.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {workouts.length === 0 ? (
          <div className="bg-panel thin-border rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">💪</div>
            <h2 className="text-2xl font-bold mb-2">No Workouts Found</h2>
            <p className="text-muted-text mb-6">
              Workout management features coming soon. For now, mark workouts as recommended from their detail pages.
            </p>
            <Link
              href="/admin"
              className="inline-block bg-node-volt text-dark font-bold px-6 py-3 rounded hover:opacity-90 transition-opacity"
            >
              Back to Admin Dashboard
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search workouts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-md bg-panel border border-border-dark rounded-lg px-4 py-2 text-text-white placeholder-muted-text focus:outline-none focus:border-node-volt"
              />
            </div>

            <div className="space-y-3">
              {filteredWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="bg-panel thin-border rounded-lg p-6 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {workout.displayCode && (
                        <span className="text-node-volt font-mono text-sm">
                          {workout.displayCode}
                        </span>
                      )}
                      <h3 className="text-xl font-bold">{workout.name}</h3>
                      {workout.isRecommended && (
                        <span className="px-2 py-1 bg-node-volt/20 text-node-volt text-xs rounded">
                          ⭐ Recommended
                        </span>
                      )}
                      {workout.archetype && (
                        <span className="px-2 py-1 bg-panel border border-border-dark text-muted-text text-xs rounded">
                          {workout.archetype}
                        </span>
                      )}
                    </div>
                    {workout.description && (
                      <p className="text-muted-text text-sm">{workout.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/workouts/${workout.id}`}
                      className="text-node-volt hover:underline text-sm"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleToggleRecommended(workout.id, workout.isRecommended)}
                      className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                        workout.isRecommended
                          ? 'bg-node-volt/20 text-node-volt border border-node-volt'
                          : 'bg-panel text-muted-text border border-border-dark hover:border-node-volt'
                      }`}
                    >
                      {workout.isRecommended ? '⭐ Recommended' : 'Mark as Recommended'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

