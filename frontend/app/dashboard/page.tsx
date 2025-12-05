'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userApi, sessionsApi, analyticsApi, workoutsApi, scheduleApi, gamificationApi, networkApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Icons } from '@/lib/iconMapping';
import { AddNetworkModal } from '@/components/network/AddNetworkModal';
import { NetworkActivity } from '@/components/network/NetworkActivity';

// Mini AI Form Component
function AIMiniForm() {
  const router = useRouter();
  const [goal, setGoal] = useState('HYBRID');
  const [archetype, setArchetype] = useState('');
  const [workoutType, setWorkoutType] = useState<'single' | 'fourDay' | 'week' | 'month'>('single');

  const handleGenerate = () => {
    const params = new URLSearchParams();
    params.set('goal', goal);
    params.set('workoutType', workoutType);
    if (archetype) params.set('archetype', archetype);
    
    router.push(`/ai/workout-builder?${params.toString()}`);
  };

  const goalIcons: Record<string, any> = {
    'HYBRID': Icons.GOAL_HYBRID,
    'STRENGTH': Icons.GOAL_STRENGTH,
    'CONDITIONING': Icons.GOAL_CONDITIONING,
  };

  const archetypeIcons: Record<string, any> = {
    'PR1ME': Icons.PR1ME,
    'FORGE': Icons.FORGE,
    'ENGIN3': Icons.ENGIN3,
    'CIRCUIT_X': Icons.CIRCUIT_X,
  };

  const workoutTypeOptions = [
    { value: 'single', label: '1 Day' },
    { value: 'fourDay', label: '4 Days' },
    { value: 'week', label: '7 Days' },
    { value: 'month', label: '4 Weeks' },
  ];

  return (
    <div className="relative bg-dark/90 backdrop-blur-sm border border-node-volt/30 rounded-lg p-4 hover:border-node-volt transition-all duration-300 min-w-[280px]">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-node-volt rounded-full animate-pulse" />
        <span className="text-[10px] text-node-volt font-mono uppercase tracking-[0.2em]">AI Workout Builder</span>
      </div>
      
      <div className="space-y-3">
        {/* Goal Selection */}
        <div>
          <label className="text-[10px] text-muted-text uppercase tracking-[0.2em] mb-1.5 block">Goal</label>
          <div className="grid grid-cols-3 gap-1.5">
            {['HYBRID', 'STRENGTH', 'CONDITIONING'].map((g) => {
              const Icon = goalIcons[g];
              return (
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  className={`px-2 py-1.5 text-[9px] font-heading font-bold transition-all flex items-center justify-center gap-1 ${
                    goal === g
                      ? 'bg-node-volt text-dark'
                      : 'bg-dark/80 thin-border text-text-white'
                  }`}
                >
                  {Icon && <Icon size={12} className={goal === g ? 'text-dark' : 'text-node-volt'} />}
                  <span>{g}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Archetype Selection */}
        <div>
          <label className="text-[10px] text-muted-text uppercase tracking-[0.2em] mb-1.5 block">Archetype (Optional)</label>
          <div className="grid grid-cols-2 gap-1.5">
            {['PR1ME', 'FORGE', 'ENGIN3', 'CIRCUIT_X'].map((arch) => {
              const Icon = archetypeIcons[arch];
              return (
                <button
                  key={arch}
                  onClick={() => setArchetype(arch === archetype ? '' : arch)}
                  className={`px-2 py-1.5 text-[9px] font-heading font-bold transition-all flex items-center justify-center gap-1 ${
                    archetype === arch
                      ? 'bg-node-volt text-dark border-node-volt'
                      : 'bg-dark/80 thin-border text-text-white'
                  }`}
                >
                  {Icon && <Icon size={12} className={archetype === arch ? 'text-dark' : 'text-node-volt'} />}
                  <span>{arch}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Workout Type Selection */}
        <div>
          <label className="text-[10px] text-muted-text uppercase tracking-[0.2em] mb-1.5 block">Duration</label>
          <div className="grid grid-cols-4 gap-1.5">
            {workoutTypeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setWorkoutType(option.value as any)}
                className={`px-2 py-1.5 text-[9px] font-heading font-bold transition-all ${
                  workoutType === option.value
                    ? 'bg-node-volt text-dark'
                    : 'bg-dark/80 thin-border text-text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          className="w-full bg-node-volt text-dark font-heading font-bold text-[10px] uppercase tracking-[0.2em] py-2.5 hover:bg-text-white transition-all flex items-center justify-center gap-2"
        >
          <Icons.AI_BUILDER size={14} />
          <span>Generate Workout</span>
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [todaySession, setTodaySession] = useState<any>(null);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [myWorkouts, setMyWorkouts] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [xpStats, setXpStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddNetworkModal, setShowAddNetworkModal] = useState(false);
  const [currentUserNetworkCode, setCurrentUserNetworkCode] = useState<string | null>(null);

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
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7); // Next 7 days
      endDate.setHours(23, 59, 59, 999);

      const [schedule, recent, statsData, trendsData, workouts, scheduled, xpData, userData] = await Promise.all([
        userApi.getSchedule().catch(() => ({ today: null, upcoming: [] })),
        sessionsApi.getRecent().catch(() => []),
        analyticsApi.getStats().catch(() => null),
        analyticsApi.getTrends(7).catch(() => []),
        workoutsApi.getMyWorkouts().catch(() => []),
        scheduleApi.getSchedule(startDate.toISOString(), endDate.toISOString()).catch(() => []),
        gamificationApi.getStats().catch(() => null),
        userApi.getMe().catch(() => null),
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
      setMyWorkouts(workouts.slice(0, 6) || []);
      setUpcomingSessions((scheduled || []).slice(0, 5) || []);
      setXpStats(xpData);
      setCurrentUserNetworkCode((userData as any)?.networkCode || null);
      
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
              <div className="inline-block mb-4 px-4 py-2 bg-node-volt/20 border border-node-volt/50 rounded-full flex items-center gap-2">
                {streak > 0 && <Icons.STREAK size={16} className="text-node-volt" />}
                <span className="text-node-volt text-sm font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {streak > 0 ? `${streak} Day Streak` : 'Ready to Start'}
                </span>
              </div>
              <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-text-white to-node-volt bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Welcome back,<br />
                <span className="text-node-volt">{user.name || 'Athlete'}</span>
              </h1>
              <p className="text-xl text-muted-text mb-6 flex items-center gap-2" style={{ fontFamily: 'var(--font-manrope)' }}>
                {streak > 0 && <Icons.STREAK size={20} className="text-node-volt" />}
                <span>
                  {streak > 0 
                    ? `Keep the momentum going! You're on fire.`
                    : 'Ready to push your limits today?'
                  }
                </span>
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
            
            <div className="flex-shrink-0 space-y-4 flex flex-col items-center">
              {todaySession && (
                <Link
                  href={`/workouts/${todaySession.workoutId}`}
                  className="group relative bg-node-volt text-dark font-bold px-10 py-6 rounded-xl hover:opacity-90 transition-all text-lg shadow-2xl shadow-node-volt/30 hover:scale-105 transform block"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  <span className="relative z-10">Start Today's Workout →</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-node-volt to-node-volt/80 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
              )}
              
              {/* Mini AI Workout Generator Form */}
              <AIMiniForm />
            </div>
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
                <Icons.STREAK size={32} className="text-node-volt transform group-hover:scale-110 transition-transform" />
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
                <Icons.SESSIONS size={32} className="text-node-volt transform group-hover:scale-110 transition-transform" />
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
                <Icons.TIMER size={32} className="text-node-volt transform group-hover:scale-110 transition-transform" />
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
                <Icons.INTENSITY size={32} className="text-node-volt transform group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-5xl font-bold text-node-volt mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                {stats?.avgRPE ? stats.avgRPE.toFixed(1) : '0.0'}
              </div>
              <div className="text-xs text-muted-text">RPE average</div>
            </div>
          </div>
        </div>

        {/* XP Details Card */}
        {xpStats && (
          <div className="bg-gradient-to-br from-concrete-grey to-tech-grey border border-border-dark rounded-xl p-8 mb-12 hover:border-node-volt transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Experience & Level
              </h2>
              <div className="flex items-center gap-3">
                <div className="text-node-volt font-heading font-bold text-2xl">
                  Level {xpStats.level}
                </div>
                {xpStats.levelName && (
                  <div className="text-muted-text text-sm">
                    {xpStats.levelName}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              {/* XP Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-text text-sm" style={{ fontFamily: 'var(--font-manrope)' }}>
                    {xpStats.xp?.toLocaleString() || 0} XP
                  </span>
                  {xpStats.xpToNextLevel && (
                    <span className="text-node-volt text-sm font-bold">
                      {xpStats.xpToNextLevel.toLocaleString()} XP to Level {xpStats.nextLevel || xpStats.level + 1}
                    </span>
                  )}
                </div>
                <div className="w-full h-4 bg-tech-grey rounded-full overflow-hidden border border-border-dark">
                  <div
                    className="h-full bg-gradient-to-r from-node-volt to-node-volt/70 transition-all duration-500 rounded-full"
                    style={{ width: `${Math.round((xpStats.progress?.progress || 0) * 100)}%` }}
                  />
                </div>
                {xpStats.nextLevelName && (
                  <div className="text-xs text-muted-text mt-1 text-right">
                    Next: {xpStats.nextLevelName}
                  </div>
                )}
              </div>

              {/* XP Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border-dark">
                <div>
                  <div className="text-muted-text text-xs mb-1" style={{ fontFamily: 'var(--font-manrope)' }}>
                    Total XP
                  </div>
                  <div className="text-xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {xpStats.xp?.toLocaleString() || 0}
                  </div>
                </div>
                {xpStats.xpToNextLevel && (
                  <div>
                    <div className="text-muted-text text-xs mb-1" style={{ fontFamily: 'var(--font-manrope)' }}>
                      XP to Next
                    </div>
                    <div className="text-xl font-bold text-text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      {xpStats.xpToNextLevel.toLocaleString()}
                    </div>
                  </div>
                )}
                {xpStats.currentLevelXp && (
                  <div>
                    <div className="text-muted-text text-xs mb-1" style={{ fontFamily: 'var(--font-manrope)' }}>
                      Level XP
                    </div>
                    <div className="text-xl font-bold text-text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      {xpStats.currentLevelXp.toLocaleString()}
                    </div>
                  </div>
                )}
                {xpStats.level && (
                  <div>
                    <div className="text-muted-text text-xs mb-1" style={{ fontFamily: 'var(--font-manrope)' }}>
                      Current Level
                    </div>
                    <div className="text-xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      {xpStats.level}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Quick Stats
              </h2>
              <Link
                href="/progress"
                className="text-node-volt hover:underline text-sm font-medium flex items-center gap-1"
              >
                View Progress <span>→</span>
              </Link>
            </div>
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

          {/* Upcoming Sessions */}
          <div className="bg-gradient-to-br from-concrete-grey to-tech-grey border border-border-dark rounded-xl p-6 hover:border-node-volt transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Upcoming Sessions
              </h2>
              <Link
                href="/workouts?tab=schedule"
                className="text-node-volt hover:underline text-sm font-medium flex items-center gap-1"
              >
                View Full Schedule <span>→</span>
              </Link>
            </div>
            {upcomingSessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-text text-sm mb-4" style={{ fontFamily: 'var(--font-manrope)' }}>
                  No upcoming sessions scheduled
                </p>
                <Link
                  href="/workouts?tab=schedule"
                  className="inline-block text-node-volt hover:underline text-sm font-medium"
                >
                  Schedule a workout →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((session: any) => {
                  const sessionDate = new Date(session.scheduledDate);
                  const workout = session.workout;
                  const program = session.program;
                  
                  return (
                    <Link
                      key={session.id}
                      href={workout ? `/workouts/${workout.id}` : program ? `/programs/${program.slug}` : '#'}
                      className="block p-4 bg-tech-grey rounded-lg border border-border-dark hover:border-node-volt hover:bg-tech-grey/80 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-text-white mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                            {workout?.name || program?.name || 'Scheduled Workout'}
                          </div>
                          <div className="text-sm text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                            {sessionDate.toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                            {' at '}
                            {sessionDate.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </div>
                          {session.duration && (
                            <div className="text-xs text-muted-text mt-1">
                              {session.duration} min
                            </div>
                          )}
                        </div>
                        <span className="text-node-volt text-xl">→</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
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
                  className="bg-node-volt text-dark font-bold px-10 py-5 rounded-xl hover:opacity-90 transition-all text-lg shadow-xl shadow-node-volt/30 hover:scale-105 transform"
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

        {/* My Workouts */}
        {myWorkouts.length > 0 && (
          <div className="bg-gradient-to-br from-concrete-grey to-tech-grey border border-border-dark rounded-xl p-8 mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                My Workouts
              </h2>
              <Link
                href="/workouts"
                className="text-node-volt hover:underline text-sm font-medium flex items-center gap-2"
              >
                View All <span>→</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myWorkouts.map((workout: any) => (
                <Link
                  key={workout.id}
                  href={`/workouts/${workout.id}`}
                  className="group bg-tech-grey border border-border-dark rounded-lg p-5 hover:border-node-volt hover:bg-tech-grey/80 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      {workout.displayCode && (
                        <div className="text-node-volt font-mono text-xs mb-1">
                          {workout.displayCode}
                        </div>
                      )}
                      <h3 className="font-bold text-lg mb-1 group-hover:text-node-volt transition-colors" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {workout.name}
                      </h3>
                    </div>
                    <span className="text-node-volt text-xl group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-text">
                    <span>{workout.sections?.length || 0} sections</span>
                    <span className="text-node-volt font-semibold">Start</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Network Activity Section */}
        <div className="bg-gradient-to-br from-concrete-grey to-tech-grey border border-border-dark rounded-xl p-8 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Network Activity
            </h2>
            <button
              onClick={() => setShowAddNetworkModal(true)}
              className="bg-node-volt text-dark font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm flex items-center gap-2"
            >
              <Icons.SHARE size={16} />
              Add to Network
            </button>
          </div>
          <NetworkActivity />
        </div>
      </div>

      {/* Add Network Modal */}
      {showAddNetworkModal && (
        <AddNetworkModal
          onClose={() => setShowAddNetworkModal(false)}
          onNetworkAdded={() => {
            // Refresh network activity if needed
            setShowAddNetworkModal(false);
          }}
          currentUserNetworkCode={currentUserNetworkCode || undefined}
        />
      )}
    </div>
  );
}
