'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { workoutsApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Icon } from '@/components/icons';
import Link from 'next/link';
import { Icons } from '@/lib/iconMapping';

interface Workout {
  id: string;
  name: string;
  displayCode?: string;
  archetype?: string;
  description?: string;
  isRecommended: boolean;
  createdAt: string;
  createdBy?: string | null;
  creator?: {
    id: string;
    email: string;
    name?: string | null;
    username?: string | null;
  } | null;
  sectionCount?: number;
}

export default function AdminWorkoutsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArchetype, setFilterArchetype] = useState<string>('');
  const [filterRecommended, setFilterRecommended] = useState<string>('all'); // 'all', 'true', 'false'
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [filterHyrox, setFilterHyrox] = useState<boolean>(false);

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push('/');
      return;
    }
    if (user?.isAdmin) {
      loadWorkouts();
    }
  }, [user, authLoading, router]);

  // Reload when filters change
  useEffect(() => {
    if (user?.isAdmin) {
      const timeoutId = setTimeout(() => {
        loadWorkouts();
      }, 300); // Debounce search
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, filterArchetype, filterRecommended, filterStartDate, filterEndDate, filterHyrox]);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const filters: any = {};
      if (searchTerm) filters.search = searchTerm;
      if (filterArchetype) filters.archetype = filterArchetype;
      if (filterRecommended !== 'all') {
        filters.isRecommended = filterRecommended === 'true';
      }
      if (filterStartDate) filters.startDate = filterStartDate;
      if (filterEndDate) filters.endDate = filterEndDate;
      if (filterHyrox) filters.isHyrox = true;
      
      console.log('Loading workouts with filters:', filters);
      const data = await workoutsApi.getAll(filters);
      console.log('Received workouts data:', data);
      setWorkouts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load workouts:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(err.response?.data?.message || err.message || 'Failed to load workouts');
      setWorkouts([]);
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

  const archetypes = ['PR1ME', 'FORGE', 'ENGIN3', 'CIRCUIT_X', 'CAPAC1TY', 'FLOWSTATE', 'HYROX'];

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

        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-panel thin-border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-text mb-2">Search</label>
              <input
                type="text"
                placeholder="Name, code, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-dark thin-border rounded-lg px-4 py-2 text-text-white placeholder-muted-text focus:outline-none focus:border-node-volt"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-text mb-2">Archetype</label>
              <select
                value={filterArchetype}
                onChange={(e) => setFilterArchetype(e.target.value)}
                className="w-full bg-dark thin-border rounded-lg px-4 py-2 text-text-white focus:outline-none focus:border-node-volt"
              >
                <option value="">All</option>
                {archetypes.map(arch => (
                  <option key={arch} value={arch}>{arch}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-text mb-2">HYROX Only</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterHyrox}
                  onChange={(e) => setFilterHyrox(e.target.checked)}
                  className="w-5 h-5 rounded border-border-dark bg-tech-grey text-node-volt focus:ring-node-volt"
                />
                <span className="text-sm text-text-white">Show HYROX workouts only</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-text mb-2">Recommended</label>
              <select
                value={filterRecommended}
                onChange={(e) => setFilterRecommended(e.target.value)}
                className="w-full bg-dark thin-border rounded-lg px-4 py-2 text-text-white focus:outline-none focus:border-node-volt"
              >
                <option value="all">All</option>
                <option value="true">Recommended</option>
                <option value="false">Not Recommended</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-text mb-2">Start Date</label>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="w-full bg-dark thin-border rounded-lg px-4 py-2 text-text-white focus:outline-none focus:border-node-volt"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-text mb-2">End Date</label>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="w-full bg-dark thin-border rounded-lg px-4 py-2 text-text-white focus:outline-none focus:border-node-volt"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterArchetype('');
                setFilterRecommended('all');
                setFilterStartDate('');
                setFilterEndDate('');
                setFilterHyrox(false);
              }}
              className="px-4 py-2 text-sm text-muted-text hover:text-text-white transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-panel thin-border rounded-lg p-12 text-center">
            <div className="mb-4 flex justify-center"><Icons.SESSIONS size={64} className="text-node-volt animate-pulse" /></div>
            <h2 className="text-2xl font-bold mb-2">Loading Workouts...</h2>
          </div>
        ) : error ? (
          <div className="bg-panel thin-border rounded-lg p-12 text-center">
            <div className="mb-4 flex justify-center"><Icons.SESSIONS size={64} className="text-red-400" /></div>
            <h2 className="text-2xl font-bold mb-2 text-red-400">Error Loading Workouts</h2>
            <p className="text-muted-text mb-6">{error}</p>
            <button
              onClick={loadWorkouts}
              className="inline-block bg-node-volt text-dark font-bold px-6 py-3 rounded hover:opacity-90 transition-opacity"
            >
              Retry
            </button>
          </div>
        ) : workouts.length === 0 ? (
          <div className="bg-panel thin-border rounded-lg p-12 text-center">
            <div className="mb-4 flex justify-center"><Icons.SESSIONS size={64} className="text-node-volt" /></div>
            <h2 className="text-2xl font-bold mb-2">No Workouts Found</h2>
            <p className="text-muted-text mb-6">
              {searchTerm || filterArchetype || filterRecommended !== 'all' || filterStartDate || filterEndDate || filterHyrox
                ? 'Try adjusting your filters to see more results.'
                : 'No workouts have been created yet.'}
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
            <div className="mb-4 flex items-center justify-between">
              <div className="text-muted-text">
                Showing {workouts.length} workout{workouts.length !== 1 ? 's' : ''}
              </div>
              <button
                onClick={loadWorkouts}
                className="px-4 py-2 bg-panel thin-border rounded-lg text-text-white hover:border-node-volt transition-colors text-sm"
              >
                Refresh
              </button>
            </div>

            <div className="space-y-3">
              {workouts.map((workout) => (
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
                        <span className="px-2 py-1 bg-node-volt/20 text-node-volt text-xs rounded flex items-center gap-1">
                          <Icons.RECOMMENDED size={14} /> Recommended
                        </span>
                      )}
                      {workout.archetype && (
                        <span className="px-2 py-1 bg-panel border border-border-dark text-muted-text text-xs rounded">
                          {workout.archetype}
                        </span>
                      )}
                    </div>
                    {workout.description && (
                      <p className="text-muted-text text-sm mb-2">{workout.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-text mt-2">
                      <span>
                        Created: {new Date(workout.createdAt).toLocaleDateString()}
                      </span>
                      {workout.creator && (
                        <span>
                          By: {workout.creator.name || workout.creator.email}
                          {workout.creator.username && ` (@${workout.creator.username})`}
                        </span>
                      )}
                      {workout.sectionCount !== undefined && (
                        <span>{workout.sectionCount} section{workout.sectionCount !== 1 ? 's' : ''}</span>
                      )}
                    </div>
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
                      {workout.isRecommended ? (
                        <>
                          <Icons.RECOMMENDED size={16} /> Recommended
                        </>
                      ) : (
                        'Mark as Recommended'
                      )}
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

