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
  sections: any[];
}

export default function RecommendedWorkoutsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading) {
      loadRecommendedWorkouts();
    }
  }, [authLoading]);

  const loadRecommendedWorkouts = async () => {
    try {
      setLoading(true);
      const data = await workoutsApi.getRecommended();
      setWorkouts(data);
    } catch (err: any) {
      console.error('Failed to load recommended workouts:', err);
      setError('Failed to load recommended workouts');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-muted-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Recommended Workouts
          </h1>
          <p className="text-muted-text text-lg">
            Curated workouts selected by our team. Quick access to proven, effective training sessions.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {workouts.length === 0 ? (
          <div className="bg-panel thin-border rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">💪</div>
            <h2 className="text-2xl font-bold mb-2">No Recommended Workouts Yet</h2>
            <p className="text-muted-text mb-6">
              Check back soon for curated workouts from our team.
            </p>
            <Link
              href="/ai/workout-builder"
              className="inline-block bg-node-volt text-dark font-bold px-6 py-3 rounded hover:opacity-90 transition-opacity"
            >
              Generate Your Own Workout
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workouts.map((workout) => (
              <Link
                key={workout.id}
                href={`/workouts/${workout.id}`}
                className="bg-panel thin-border rounded-lg p-6 hover:border-node-volt transition-all hover:shadow-lg hover:shadow-node-volt/20 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {workout.displayCode && (
                      <div className="text-node-volt font-mono text-sm mb-1">
                        {workout.displayCode}
                      </div>
                    )}
                    <h3 className="text-xl font-bold mb-2 group-hover:text-node-volt transition-colors">
                      {workout.name}
                    </h3>
                    {workout.archetype && (
                      <span className="inline-block px-2 py-1 bg-node-volt/20 text-node-volt text-xs rounded mb-2">
                        {workout.archetype}
                      </span>
                    )}
                  </div>
                  <span className="text-muted-text group-hover:text-node-volt transition-colors">→</span>
                </div>
                
                {workout.description && (
                  <p className="text-muted-text text-sm mb-4 line-clamp-2">
                    {workout.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-muted-text">
                  <span>{workout.sections?.length || 0} sections</span>
                  <span className="text-node-volt font-semibold">Start Workout →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

