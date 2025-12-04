'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userApi, sessionsApi, analyticsApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [todaySession, setTodaySession] = useState<any>(null);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
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
      setLoading(true);
      const [schedule, recent, statsData, trendsData] = await Promise.all([
        userApi.getSchedule().catch(() => ({ today: null, upcoming: [] })),
        sessionsApi.getRecent().catch(() => []),
        analyticsApi.getStats().catch(() => null),
        analyticsApi.getTrends(7).catch(() => []),
      ]);

      setTodaySession(schedule.today || null);
      setRecentSessions(recent.slice(0, 5) || []);
      setStats(statsData);
      
      // Format trends for chart
      if (trendsData?.dailyStats) {
        setTrends(trendsData.dailyStats.map((day: any) => ({
          date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
          sessions: day.sessions,
          duration: Math.round(day.totalDuration / 60), // minutes
        })));
      }
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

  // Calculate streak
  const calculateStreak = () => {
    if (!recentSessions.length) return 0;
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasSession = recentSessions.some((s: any) => {
        const sessionDate = new Date(s.startedAt).toISOString().split('T')[0];
        return sessionDate === dateStr && s.completed;
      });
      
      if (hasSession) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak();

  return (
    <div className="min-h-screen bg-deep-asphalt">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-deep-asphalt via-concrete-grey to-deep-asphalt border-b border-border-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Welcome back, <span className="text-node-volt">{user.name || 'Athlete'}</span>
              </h1>
              <p className="text-xl text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                Ready to push your limits today?
              </p>
            </div>
            {todaySession && (
              <Link
                href={`/workouts/${todaySession.workoutId}`}
                className="bg-node-volt text-deep-asphalt font-bold px-8 py-4 rounded-lg hover:opacity-90 transition-opacity text-lg shadow-lg shadow-node-volt/20"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Start Today's Workout →
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-concrete-grey border border-border-dark rounded-lg p-6 hover:border-node-volt transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div className="text-muted-text text-sm" style={{ fontFamily: 'var(--font-manrope)' }}>
                Current Streak
              </div>
              <div className="text-2xl">🔥</div>
            </div>
            <div className="text-4xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {streak}
            </div>
            <div className="text-xs text-muted-text mt-1">days in a row</div>
          </div>

          <div className="bg-concrete-grey border border-border-dark rounded-lg p-6 hover:border-node-volt transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div className="text-muted-text text-sm" style={{ fontFamily: 'var(--font-manrope)' }}>
                Total Sessions
              </div>
              <div className="text-2xl">💪</div>
            </div>
            <div className="text-4xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {stats?.totalSessions || 0}
            </div>
            <div className="text-xs text-muted-text mt-1">workouts completed</div>
          </div>

          <div className="bg-concrete-grey border border-border-dark rounded-lg p-6 hover:border-node-volt transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div className="text-muted-text text-sm" style={{ fontFamily: 'var(--font-manrope)' }}>
                Total Hours
              </div>
              <div className="text-2xl">⏱️</div>
            </div>
            <div className="text-4xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {stats?.totalDurationSec ? Math.round(stats.totalDurationSec / 3600) : 0}
            </div>
            <div className="text-xs text-muted-text mt-1">hours trained</div>
          </div>

          <div className="bg-concrete-grey border border-border-dark rounded-lg p-6 hover:border-node-volt transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div className="text-muted-text text-sm" style={{ fontFamily: 'var(--font-manrope)' }}>
                Avg RPE
              </div>
              <div className="text-2xl">⚡</div>
            </div>
            <div className="text-4xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {stats?.avgRPE ? stats.avgRPE.toFixed(1) : '0.0'}
            </div>
            <div className="text-xs text-muted-text mt-1">rate of perceived exertion</div>
          </div>
        </div>

        {/* 7-Day Activity Chart */}
        {trends.length > 0 && (
          <div className="bg-concrete-grey border border-border-dark rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              7-Day Activity
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#b0b0b0" />
                <YAxis stroke="#b0b0b0" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e1e1e',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  stroke="#ccff00"
                  strokeWidth={3}
                  dot={{ fill: '#ccff00', r: 4 }}
                  name="Sessions"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/programs"
            className="group bg-concrete-grey border border-border-dark rounded-lg p-6 hover:border-node-volt transition-all hover:scale-105"
          >
            <div className="text-4xl mb-3">📋</div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-node-volt transition-colors" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Browse Programs
            </h3>
            <p className="text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
              Explore structured training programs
            </p>
          </Link>

          <Link
            href="/ai/workout-builder"
            className="group bg-concrete-grey border border-border-dark rounded-lg p-6 hover:border-node-volt transition-all hover:scale-105"
          >
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-node-volt transition-colors" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              AI Workout Builder
            </h3>
            <p className="text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
              Generate custom workouts with AI
            </p>
          </Link>

          <Link
            href="/exercises"
            className="group bg-concrete-grey border border-border-dark rounded-lg p-6 hover:border-node-volt transition-all hover:scale-105"
          >
            <div className="text-4xl mb-3">📚</div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-node-volt transition-colors" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Exercise Library
            </h3>
            <p className="text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
              Browse and learn about exercises
            </p>
          </Link>
        </div>

        {/* Today's Workout Card */}
        {todaySession && (
          <div className="bg-gradient-to-r from-concrete-grey to-tech-grey border border-node-volt rounded-lg p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-node-volt text-sm font-medium mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  TODAY'S WORKOUT
                </div>
                <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {todaySession.workoutName}
                </h2>
                <p className="text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                  Day {todaySession.dayIndex} of your program
                </p>
              </div>
              <Link
                href={`/workouts/${todaySession.workoutId}`}
                className="bg-node-volt text-deep-asphalt font-bold px-8 py-4 rounded-lg hover:opacity-90 transition-opacity text-lg"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Start Now →
              </Link>
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <div className="bg-concrete-grey border border-border-dark rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Recent Sessions
              </h2>
              <Link
                href="/progress"
                className="text-node-volt hover:underline text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {recentSessions.map((session: any) => (
                <Link
                  key={session.id}
                  href={`/workouts/${session.workoutId}`}
                  className="block bg-tech-grey border border-border-dark rounded-lg p-4 hover:border-node-volt transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {session.workout?.name || 'Workout'}
                      </div>
                      <div className="text-sm text-muted-text mt-1" style={{ fontFamily: 'var(--font-manrope)' }}>
                        {new Date(session.startedAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {session.rpe && (
                        <div className="text-right">
                          <div className="text-xs text-muted-text">RPE</div>
                          <div className="text-node-volt font-bold text-lg">{session.rpe}</div>
                        </div>
                      )}
                      {session.durationSec && (
                        <div className="text-right">
                          <div className="text-xs text-muted-text">Duration</div>
                          <div className="text-text-white font-medium">
                            {Math.floor(session.durationSec / 60)}m
                          </div>
                        </div>
                      )}
                      <div className="text-node-volt">→</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
