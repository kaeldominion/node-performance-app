'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userApi, sessionsApi, analyticsApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Icon } from '@/components/icons';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [todaySession, setTodaySession] = useState<any>(null);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) {
      return;
    }
    
    // Only redirect if we're sure there's no user
    if (!user) {
      console.log('No user found, redirecting to login...');
      router.push('/auth/login');
      return;
    }

    if (user) {
      loadDashboardData();
    }
  }, [user, authLoading, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [scheduleData, recent, statsData, trendsData] = await Promise.all([
        userApi.getSchedule().catch(() => ({ schedule: [], progress: { completed: 0, total: 0, percentage: 0 } })),
        sessionsApi.getRecent().catch(() => []),
        analyticsApi.getStats().catch(() => null),
        analyticsApi.getTrends(7).catch(() => []),
      ]);

      // Find today's workout from schedule
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayWorkout = scheduleData.schedule?.find((item: any) => {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate.getTime() === today.getTime();
      });
      setTodaySession(todayWorkout || null);
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
  const totalHours = stats?.totalDurationSec ? Math.round(stats.totalDurationSec / 3600) : 0;
  const weeklyGoal = 5; // Target sessions per week
  const weeklyProgress = recentSessions.filter((s: any) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(s.startedAt) >= weekAgo;
  }).length;

  return (
    <div className="min-h-screen bg-deep-asphalt">
      <Navbar />
      
      {/* Hero Section with Gradient Background */}
      <div className="relative bg-gradient-to-br from-deep-asphalt via-concrete-grey to-deep-asphalt border-b border-border-dark overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-node-volt rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-node-volt rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <div className="inline-block mb-4 px-4 py-2 bg-node-volt/20 border border-node-volt/50 rounded-full">
                <span className="text-node-volt text-sm font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {streak > 0 ? `${streak} Day Streak` : 'Ready to Start'}
                </span>
              </div>
              <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-text-white to-node-volt bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Welcome back,<br />
                <span className="text-node-volt">{user.name || 'Athlete'}</span>
              </h1>
              <p className="text-xl text-muted-text mb-6" style={{ fontFamily: 'var(--font-manrope)' }}>
                {streak > 0 
                  ? `Keep the momentum going! You're on fire.`
                  : 'Ready to push your limits today?'
                }
              </p>
              
              {/* Weekly Progress Bar */}
              <div className="max-w-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                    Weekly Progress
                  </span>
                  <span className="text-sm font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {weeklyProgress} / {weeklyGoal} sessions
                  </span>
                </div>
                <div className="w-full bg-tech-grey rounded-full h-3 overflow-hidden border border-border-dark">
                  <div 
                    className="h-full bg-gradient-to-r from-node-volt to-node-volt/70 transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min((weeklyProgress / weeklyGoal) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {todaySession && (
              <div className="flex-shrink-0">
                <Link
                  href={`/workouts/${todaySession.workoutId}`}
                  className="group relative bg-node-volt text-deep-asphalt font-bold px-10 py-6 rounded-xl hover:opacity-90 transition-all text-lg shadow-2xl shadow-node-volt/30 hover:scale-105 transform"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  <span className="relative z-10">Start Today's Workout →</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-node-volt to-node-volt/80 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="group relative bg-gradient-to-br from-concrete-grey to-tech-grey border border-border-dark rounded-xl p-8 hover:border-node-volt transition-all hover:scale-105 hover:shadow-xl hover:shadow-node-volt/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-node-volt/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="text-muted-text text-sm font-medium" style={{ fontFamily: 'var(--font-manrope)' }}>
                  Current Streak
                </div>
                <Icon name="streak" size={48} color="var(--node-volt)" className="transform group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-5xl font-bold text-node-volt mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                {streak}
              </div>
              <div className="text-xs text-muted-text">days in a row</div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-concrete-grey to-tech-grey border border-border-dark rounded-xl p-8 hover:border-node-volt transition-all hover:scale-105 hover:shadow-xl hover:shadow-node-volt/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-node-volt/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="text-muted-text text-sm font-medium" style={{ fontFamily: 'var(--font-manrope)' }}>
                  Total Sessions
                </div>
                <Icon name="sessions" size={48} color="var(--node-volt)" className="transform group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-5xl font-bold text-node-volt mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                {stats?.totalSessions || 0}
              </div>
              <div className="text-xs text-muted-text">workouts completed</div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-concrete-grey to-tech-grey border border-border-dark rounded-xl p-8 hover:border-node-volt transition-all hover:scale-105 hover:shadow-xl hover:shadow-node-volt/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-node-volt/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="text-muted-text text-sm font-medium" style={{ fontFamily: 'var(--font-manrope)' }}>
                  Total Hours
                </div>
                <Icon name="hours" size={48} color="var(--node-volt)" className="transform group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-5xl font-bold text-node-volt mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                {totalHours}
              </div>
              <div className="text-xs text-muted-text">hours trained</div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-concrete-grey to-tech-grey border border-border-dark rounded-xl p-8 hover:border-node-volt transition-all hover:scale-105 hover:shadow-xl hover:shadow-node-volt/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-node-volt/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="text-muted-text text-sm font-medium" style={{ fontFamily: 'var(--font-manrope)' }}>
                  Avg Intensity
                </div>
                <Icon name="intensity" size={48} color="var(--node-volt)" className="transform group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-5xl font-bold text-node-volt mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                {stats?.avgRPE ? stats.avgRPE.toFixed(1) : '0.0'}
              </div>
              <div className="text-xs text-muted-text">RPE average</div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* 7-Day Activity Chart */}
          {trends.length > 0 && (
            <div className="bg-gradient-to-br from-concrete-grey to-tech-grey border border-border-dark rounded-xl p-6 hover:border-node-volt transition-colors">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  7-Day Activity
                </h2>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-node-volt"></div>
                  <span className="text-sm text-muted-text">Sessions</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
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
                    dot={{ fill: '#ccff00', r: 5 }}
                    name="Sessions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Quick Stats Card */}
          <div className="bg-gradient-to-br from-concrete-grey to-tech-grey border border-border-dark rounded-xl p-6 hover:border-node-volt transition-colors">
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Quick Stats
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-tech-grey rounded-lg border border-border-dark">
                <span className="text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                  Completion Rate
                </span>
                <span className="text-xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {stats?.completionRate ? `${stats.completionRate}%` : '0%'}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-tech-grey rounded-lg border border-border-dark">
                <span className="text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                  Active Days
                </span>
                <span className="text-xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {stats?.workoutDays || 0}
                </span>
              </div>
              <Link
                href="/leaderboard"
                className="block w-full mt-6 text-center bg-node-volt/20 border border-node-volt/50 text-node-volt font-bold px-6 py-3 rounded-lg hover:bg-node-volt/30 transition-colors"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                View Leaderboard →
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link
            href="/programs"
            className="group relative bg-gradient-to-br from-concrete-grey to-tech-grey border border-border-dark rounded-xl p-8 hover:border-node-volt transition-all hover:scale-105 hover:shadow-xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-node-volt/10 rounded-full blur-xl -mr-12 -mt-12"></div>
            <div className="relative z-10">
              <Icon name="programs" size={64} color="var(--node-volt)" className="mb-4 transform group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2 group-hover:text-node-volt transition-colors" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Browse Programs
              </h3>
              <p className="text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                Explore structured training programs
              </p>
            </div>
          </Link>

          <Link
            href="/ai/workout-builder"
            className="group relative bg-gradient-to-br from-concrete-grey to-tech-grey border border-border-dark rounded-xl p-8 hover:border-node-volt transition-all hover:scale-105 hover:shadow-xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-node-volt/10 rounded-full blur-xl -mr-12 -mt-12"></div>
            <div className="relative z-10">
              <Icon name="ai" size={64} color="var(--node-volt)" className="mb-4 transform group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2 group-hover:text-node-volt transition-colors" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                AI Workout Builder
              </h3>
              <p className="text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                Generate custom workouts with AI
              </p>
            </div>
          </Link>

          <Link
            href="/exercises"
            className="group relative bg-gradient-to-br from-concrete-grey to-tech-grey border border-border-dark rounded-xl p-8 hover:border-node-volt transition-all hover:scale-105 hover:shadow-xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-node-volt/10 rounded-full blur-xl -mr-12 -mt-12"></div>
            <div className="relative z-10">
              <Icon name="exercises" size={64} color="var(--node-volt)" className="mb-4 transform group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2 group-hover:text-node-volt transition-colors" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Exercise Library
              </h3>
              <p className="text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                Browse and learn about exercises
              </p>
            </div>
          </Link>
        </div>

        {/* Today's Workout Card */}
        {todaySession && (
          <div className="relative bg-gradient-to-r from-node-volt/20 via-node-volt/10 to-concrete-grey border-2 border-node-volt rounded-xl p-8 mb-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-node-volt/5 to-transparent"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="inline-block mb-3 px-4 py-1 bg-node-volt/30 border border-node-volt rounded-full">
                    <span className="text-node-volt text-sm font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      TODAY'S WORKOUT
                    </span>
                  </div>
                  <h2 className="text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {todaySession.workoutName}
                  </h2>
                  <p className="text-muted-text text-lg" style={{ fontFamily: 'var(--font-manrope)' }}>
                    Day {todaySession.dayIndex} of your program
                  </p>
                </div>
                <Link
                  href={`/workouts/${todaySession.workoutId}`}
                  className="bg-node-volt text-deep-asphalt font-bold px-10 py-5 rounded-xl hover:opacity-90 transition-all text-lg shadow-xl shadow-node-volt/30 hover:scale-105 transform"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Start Now →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <div className="bg-gradient-to-br from-concrete-grey to-tech-grey border border-border-dark rounded-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Recent Sessions
              </h2>
              <Link
                href="/progress"
                className="text-node-volt hover:underline text-sm font-medium flex items-center gap-2"
              >
                View All <span>→</span>
              </Link>
            </div>
            <div className="space-y-4">
              {recentSessions.map((session: any, index: number) => (
                <Link
                  key={session.id}
                  href={`/workouts/${session.workoutId}`}
                  className="group block bg-tech-grey border border-border-dark rounded-lg p-5 hover:border-node-volt hover:bg-tech-grey/80 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-node-volt/20 border border-node-volt/50 flex items-center justify-center text-node-volt font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-text-white text-lg mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                          {session.workout?.name || 'Workout'}
                        </div>
                        <div className="text-sm text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                          {new Date(session.startedAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {session.rpe && (
                        <div className="text-right">
                          <div className="text-xs text-muted-text mb-1">RPE</div>
                          <div className="text-node-volt font-bold text-xl">{session.rpe}</div>
                        </div>
                      )}
                      {session.durationSec && (
                        <div className="text-right">
                          <div className="text-xs text-muted-text mb-1">Duration</div>
                          <div className="text-text-white font-medium">
                            {Math.floor(session.durationSec / 60)}m
                          </div>
                        </div>
                      )}
                      <div className="text-node-volt text-2xl group-hover:translate-x-1 transition-transform">→</div>
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
