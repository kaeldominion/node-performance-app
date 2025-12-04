'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
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
  const router = useRouter();
  const [todaySession, setTodaySession] = useState<TodaySession | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [stats, setStats] = useState({ streak: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      loadDashboardData();
    }
  }, [user, authLoading]);

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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-deep-asphalt flex items-center justify-center">
        <div className="text-muted-text">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-deep-asphalt">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 font-heading">
            Welcome back, {user.name || 'Athlete'}
          </h1>
          <p className="text-muted-text font-body">Ready to train?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-concrete-grey border border-border-dark rounded-lg p-6">
            <div className="text-muted-text text-sm mb-2 font-body">Streak</div>
            <div className="text-3xl font-bold text-node-volt font-heading">
              {stats.streak} days
            </div>
          </div>
          <div className="bg-concrete-grey border border-border-dark rounded-lg p-6">
            <div className="text-muted-text text-sm mb-2 font-body">Completed</div>
            <div className="text-3xl font-bold text-node-volt font-heading">
              {stats.completed} workouts
            </div>
          </div>
          <div className="bg-concrete-grey border border-border-dark rounded-lg p-6">
            <div className="text-muted-text text-sm mb-2 font-body">This Week</div>
            <div className="text-3xl font-bold text-node-volt font-heading">
              {recentSessions.length}
            </div>
          </div>
        </div>

        {/* Today's Session */}
        {todaySession && (
          <div className="bg-concrete-grey border border-border-dark rounded-lg p-6 mb-8">
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
                className="bg-node-volt text-deep-asphalt font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-heading"
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
            className="bg-concrete-grey border border-border-dark rounded-lg p-6 hover:border-node-volt transition-colors"
          >
            <h3 className="text-xl font-bold mb-2 font-heading">
              Browse Programs
            </h3>
            <p className="text-muted-text font-body">Explore training programs</p>
          </Link>
          <Link
            href="/ai/workout-builder"
            className="bg-concrete-grey border border-border-dark rounded-lg p-6 hover:border-node-volt transition-colors"
          >
            <h3 className="text-xl font-bold mb-2 font-heading">
              AI Workout Builder
            </h3>
            <p className="text-muted-text font-body">Generate custom workouts</p>
          </Link>
        </div>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <div className="bg-concrete-grey border border-border-dark rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 font-heading">
              Recent Sessions
            </h2>
            <div className="space-y-3">
              {recentSessions.map((session: any) => (
                <div
                  key={session.id}
                  className="bg-tech-grey border border-border-dark rounded-lg p-4 flex items-center justify-between"
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

