'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userApi, sessionsApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface TodaySession {
  workout: {
    id: string;
    name: string;
    displayCode?: string;
  };
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

        {/* Today's Session */}
        {todaySession && (
          <div className="bg-concrete-grey border border-border-dark rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Today's Session</h2>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-medium mb-1">
                  {todaySession.workout.displayCode && (
                    <span className="text-node-volt">{todaySession.workout.displayCode}</span>
                  )}{' '}
                  {todaySession.workout.name}
                </h3>
                <p className="text-muted-text">Ready to train?</p>
              </div>
              <Link
                href={`/workouts/${todaySession.workout.id}`}
                className="bg-node-volt text-deep-asphalt font-bold px-6 py-3 rounded hover:opacity-90 transition-opacity"
              >
                Start Session
              </Link>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-concrete-grey border border-border-dark rounded-lg p-6">
            <div className="text-muted-text text-sm mb-1">Current Streak</div>
            <div className="text-3xl font-bold text-node-volt">{stats.streak} days</div>
          </div>
          <div className="bg-concrete-grey border border-border-dark rounded-lg p-6">
            <div className="text-muted-text text-sm mb-1">Sessions Completed</div>
            <div className="text-3xl font-bold text-node-volt">{stats.completed}</div>
          </div>
        </div>

        {/* Upcoming Sessions */}
        {upcomingSessions.length > 0 && (
          <div className="bg-concrete-grey border border-border-dark rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Upcoming Sessions</h2>
            <div className="space-y-3">
              {upcomingSessions.map((session, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-border-dark last:border-0">
                  <div>
                    <div className="font-medium">
                      {session.workout.displayCode && (
                        <span className="text-node-volt">{session.workout.displayCode}</span>
                      )}{' '}
                      {session.workout.name}
                    </div>
                    <div className="text-sm text-muted-text">
                      {new Date(session.date).toLocaleDateString()}
                    </div>
                  </div>
                  <Link
                    href={`/workouts/${session.workout.id}`}
                    className="text-node-volt hover:underline"
                  >
                    View →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <div className="bg-concrete-grey border border-border-dark rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Recent Sessions</h2>
            <div className="space-y-3">
              {recentSessions.map((session: any) => (
                <div key={session.id} className="flex items-center justify-between py-2 border-b border-border-dark last:border-0">
                  <div>
                    <div className="font-medium">
                      {session.workout.displayCode && (
                        <span className="text-node-volt">{session.workout.displayCode}</span>
                      )}{' '}
                      {session.workout.name}
                    </div>
                    <div className="text-sm text-muted-text">
                      {new Date(session.performedAt).toLocaleDateString()}
                      {session.rpe && ` • RPE: ${session.rpe}`}
                      {session.completed && <span className="text-node-volt ml-2">✓ Completed</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!todaySession && upcomingSessions.length === 0 && (
          <div className="bg-concrete-grey border border-border-dark rounded-lg p-8 text-center">
            <p className="text-muted-text mb-4">No active program. Start a program to begin training.</p>
            <Link
              href="/programs"
              className="inline-block bg-node-volt text-deep-asphalt font-bold px-6 py-3 rounded hover:opacity-90 transition-opacity"
            >
              Browse Programs
            </Link>
        </div>
        )}
      </main>
    </div>
  );
}
