'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@clerk/nextjs';
import { userApi, sessionsApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface TodaySession {
  workoutId: string;
  workoutName: string;
  dayIndex: number;
  date: string;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { isSignedIn, isLoaded: clerkLoaded } = useUser();
  const router = useRouter();
  const [todaySession, setTodaySession] = useState<TodaySession | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [stats, setStats] = useState({ streak: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  useEffect(() => {
    // Wait for Clerk to load
    if (!clerkLoaded) {
      return;
    }

    // Use Clerk's isSignedIn as source of truth - only redirect if NOT signed in
    if (!isSignedIn) {
      router.replace('/auth/login');
      return;
    }

    // Load dashboard data once we're signed in (only once)
    if (isSignedIn && !hasLoadedData) {
      setHasLoadedData(true);
      loadDashboardData();
    }
  }, [isSignedIn, clerkLoaded, hasLoadedData, router]);

  const loadDashboardData = async () => {
    try {
      const [schedule, recent] = await Promise.all([
        userApi.getSchedule().catch(() => ({ today: null, upcoming: [] })),
        sessionsApi.getRecent().catch(() => []),
      ]);

      setTodaySession(schedule.today || null);
      setUpcomingSessions(schedule.upcoming || []);
      setRecentSessions(recent.slice(0, 5) || []);

      // Calculate stats
      const completed = recent.filter((s: any) => s.completed).length;
      setStats({ streak: 0, completed });
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while Clerk is loading or dashboard data is loading
  if (!clerkLoaded || loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="loading-spinner"></div>
          <div className="text-muted-text font-body animate-pulse-glow">Loading...</div>
        </div>
      </div>
    );
  }

  // If not signed in, don't render (redirect will happen)
  if (!isSignedIn) {
    return null;
  }

  // Use user from context, or fallback to a basic user object if not loaded yet
  const displayUser = user || { name: 'Athlete', email: '' };

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 font-heading">
            Welcome back, {displayUser.name || 'Athlete'}
          </h1>
          <p className="text-muted-text font-body">Ready to train?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Streak', value: `${stats.streak} days`, delay: '0s' },
            { label: 'Completed', value: `${stats.completed} workouts`, delay: '0.1s' },
            { label: 'This Week', value: `${recentSessions.length}`, delay: '0.2s' },
          ].map((stat, idx) => (
            <div
              key={stat.label}
              className="bg-panel thin-border rounded-lg p-6 hover:border-node-volt transition-colors animate-fade-in"
              style={{ animationDelay: stat.delay }}
            >
              <div className="text-muted-text text-sm mb-2 font-body">{stat.label}</div>
              <div className="text-3xl font-bold text-node-volt font-heading animate-pulse-glow">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Today's Session */}
        {todaySession && (
          <div className="bg-panel thin-border rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 font-heading">
              Today's Workout
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2 font-heading">{todaySession.workoutName}</h3>
                <p className="text-muted-text font-body">Day {todaySession.dayIndex}</p>
              </div>
              <Link
                href={`/workouts/${todaySession.workoutId}`}
                className="bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-heading"
              >
                Start Workout
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/programs"
            className="bg-panel thin-border rounded-lg p-6 hover:border-node-volt transition-colors"
          >
            <h3 className="text-xl font-bold mb-2 font-heading">
              Browse Programs
            </h3>
            <p className="text-muted-text font-body">Explore training programs</p>
          </Link>
          <Link
            href="/ai/workout-builder"
            className="bg-panel thin-border rounded-lg p-6 hover:border-node-volt transition-colors"
          >
            <h3 className="text-xl font-bold mb-2 font-heading">
              AI Workout Builder
            </h3>
            <p className="text-muted-text font-body">Generate custom workouts</p>
          </Link>
        </div>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <div className="bg-panel thin-border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 font-heading">
              Recent Sessions
            </h2>
            <div className="space-y-3">
              {recentSessions.map((session: any) => (
                <div
                  key={session.id}
                  className="bg-panel thin-border rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium font-body">{session.workout?.name || 'Workout'}</div>
                    <div className="text-sm text-muted-text font-body">
                      {new Date(session.startedAt).toLocaleDateString()}
                    </div>
                  </div>
                  {session.rpe && (
                    <div className="text-node-volt font-bold font-heading">RPE: {session.rpe}</div>
                  )}
                </div>
              ))}
            </div>
            <Link
              href="/progress"
              className="block text-center text-node-volt hover:underline mt-4"
            >
              View All Progress →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

