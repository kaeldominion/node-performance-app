'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsApi, gamificationApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { ShareStatsModal } from '@/components/stats/ShareStatsModal';
import { AchievementIcon } from '@/components/achievements/AchievementIcon';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Icons } from '@/lib/iconMapping';

const COLORS = ['#ccff00', '#4a9eff', '#ff6b6b', '#9b59b6', '#f39c12'];

export default function ProgressPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [strengthData, setStrengthData] = useState<any>(null);
  const [engineData, setEngineData] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [percentiles, setPercentiles] = useState<any>(null);
  const [trendComparison, setTrendComparison] = useState<any>(null);
  const [userRank, setUserRank] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trendPeriod, setTrendPeriod] = useState<'1m' | '3m' | '6m' | '1y'>('1m');
  const [showShareModal, setShowShareModal] = useState(false);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [xpStats, setXpStats] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      loadData();
    }
  }, [user, authLoading, trendPeriod]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, strength, engine, trendsData, percentilesData, rankData, trendData, achievementsData, xpData] = await Promise.all([
        analyticsApi.getStats(),
        analyticsApi.getStrengthProgress(),
        analyticsApi.getEngineProgress(),
        analyticsApi.getTrends(30),
        analyticsApi.getPercentiles().catch(() => null),
        analyticsApi.getMyRank().catch(() => null),
        analyticsApi.getTrendComparison(trendPeriod).catch(() => null),
        gamificationApi.getAchievements().catch(() => []),
        gamificationApi.getStats().catch(() => null),
      ]);

      setStats(statsData);
      setStrengthData(strength);
      setEngineData(engine);
      setTrends(trendsData);
      setPercentiles(percentilesData);
      setUserRank(rankData);
      setTrendComparison(trendData);
      setAchievements(achievementsData || []);
      setXpStats(xpData);
    } catch (error) {
      console.error('Failed to load progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-node-volt border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="text-muted-text">Loading your stats...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Calculate sessions per week
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSessions = stats?.sessions?.filter((s: any) => new Date(s.startedAt) >= thirtyDaysAgo) || [];
  const daysDiff = Math.max(1, Math.floor((Date.now() - thirtyDaysAgo.getTime()) / (1000 * 60 * 60 * 24)));
  const sessionsPerWeek = (recentSessions.length / daysDiff) * 7;

  // Calculate PR count
  const prCount = strengthData?.prs ? Object.keys(strengthData.prs).length : 0;

  // Calculate streak
  const calculateStreak = () => {
    if (!stats?.sessions || stats.sessions.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasSession = stats.sessions.some((s: any) => {
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

  // Prepare chart data
  const rpeChartData = stats?.rpeDistribution
    ? stats.rpeDistribution.map((count: number, index: number) => ({
        rpe: index + 1,
        count,
      }))
    : [];

  const archetypeChartData = stats?.archetypeCounts
    ? Object.entries(stats.archetypeCounts).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const trendsChartData = trends?.dailyStats
    ? trends.dailyStats.map((day: any) => ({
        date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sessions: day.sessions,
        avgRPE: Math.round(day.avgRPE * 10) / 10,
        duration: Math.round(day.totalDuration / 60), // minutes
      }))
    : [];

  // Stats cards configuration - matching landing page
  const statsCards = [
    {
      label: 'Completion',
      value: stats?.completionRate ? `${Math.round(stats.completionRate)}%` : '0%',
      percentileKey: 'completionRate',
      trendKey: 'completionRate',
      demoPercentile: 5,
      demoTrend: 12,
      icon: Icons.CHECK,
    },
    {
      label: 'Avg RPE',
      value: stats?.avgRPE ? stats.avgRPE.toFixed(1) : '0.0',
      percentileKey: 'avgRPE',
      trendKey: 'avgRPE',
      demoPercentile: 12,
      demoTrend: -5,
      icon: Icons.INTENSITY,
    },
    {
      label: 'Sessions/Wk',
      value: Math.round(sessionsPerWeek * 10) / 10,
      percentileKey: 'sessionsPerWeek',
      trendKey: 'sessionsPerWeek',
      demoPercentile: 8,
      demoTrend: 18,
      icon: Icons.SESSIONS,
    },
    {
      label: 'PRs This Cycle',
      value: prCount,
      percentileKey: 'prCount',
      trendKey: 'prCount',
      demoPercentile: 15,
      demoTrend: 25,
      icon: Icons.RANK_1,
    },
  ];

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '1m': return '1 month ago';
      case '3m': return '3 months ago';
      case '6m': return '6 months ago';
      case '1y': return '1 year ago';
      default: return '1 month ago';
    }
  };

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard" className="text-muted-text hover:text-text-white mb-4 inline-block transition-colors flex items-center gap-2">
          <span>←</span>
          <span>Back to Dashboard</span>
        </Link>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Progress Tracking
            </h1>
            <p className="text-muted-text">Your training analytics and performance metrics</p>
          </div>
          <button
            onClick={() => setShowShareModal(true)}
            className="bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Icons.SHARE size={20} />
            Share Stats
          </button>
        </div>

        {/* Leaderboard Position Card - Enhanced */}
        {userRank && (
          <div className="relative bg-gradient-to-br from-concrete-grey via-tech-grey to-concrete-grey border border-border-dark rounded-xl p-8 mb-8 hover:border-node-volt transition-all duration-300 overflow-hidden group">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-node-volt/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    Leaderboard Position
                  </h2>
                  <p className="text-sm text-muted-text">Your ranking across all metrics</p>
                </div>
                <Link
                  href="/leaderboard"
                  className="bg-node-volt text-dark font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 text-sm"
                >
                  View Full Leaderboard <span>→</span>
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Sessions', rank: userRank.sessions, icon: Icons.SESSIONS, color: 'text-node-volt' },
                  { label: 'Hours', rank: userRank.hours, icon: Icons.TIMER, color: 'text-blue-400' },
                  { label: 'Intensity', rank: userRank.rpe, icon: Icons.INTENSITY, color: 'text-purple-400' },
                  { label: 'Streak', rank: userRank.streak, icon: Icons.STREAK, color: 'text-orange-400' },
                ].map((metric) => (
                  <div key={metric.label} className="text-center p-6 bg-panel/60 rounded-lg border border-border-dark hover:border-node-volt transition-all duration-300">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      {metric.icon && <metric.icon size={24} className={metric.color} />}
                    </div>
                    <div className="text-xs text-muted-text uppercase tracking-[0.2em] font-heading mb-2">{metric.label}</div>
                    {metric.rank ? (
                      <div className={`text-4xl font-bold ${metric.color} mb-1`} style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        #{metric.rank}
                      </div>
                    ) : (
                      <div className="text-lg text-muted-text">—</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Time Period Filter - Enhanced */}
        <div className="mb-8 flex flex-wrap items-center gap-4 p-4 bg-panel/40 thin-border rounded-lg">
          <span className="text-sm text-muted-text font-heading uppercase tracking-[0.1em]">Compare to:</span>
          <div className="flex flex-wrap gap-2">
            {(['1m', '3m', '6m', '1y'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTrendPeriod(period)}
                className={`px-4 py-2 rounded-lg font-bold transition-all text-sm ${
                  trendPeriod === period
                    ? 'bg-node-volt text-dark shadow-lg shadow-node-volt/30 scale-105'
                    : 'bg-tech-grey text-muted-text hover:text-text-white hover:bg-tech-grey/80 thin-border hover:border-node-volt/50'
                }`}
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {getPeriodLabel(period)}
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Stats Overview - Matching Landing Page Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat) => {
            const percentile = percentiles?.[stat.percentileKey] ?? stat.demoPercentile;
            const trend = trendComparison?.[stat.trendKey] ?? stat.demoTrend;
            const isPositive = trend !== null && trend > 0;
            const isNegative = trend !== null && trend < 0;
            
            return (
              <div 
                key={stat.label} 
                className="relative p-6 thin-border bg-panel/80 hover:border-node-volt transition-all duration-300 rounded-lg group overflow-hidden"
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-node-volt/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-text font-heading">{stat.label}</p>
                    {stat.icon && <stat.icon size={20} className="text-node-volt opacity-60" />}
                  </div>
                  <p className="text-4xl font-heading font-bold text-text-white mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {stat.value}
                  </p>
                  {percentile !== null && percentile !== undefined && (
                    <p className="text-sm font-heading font-bold text-node-volt mb-3">
                      Top {percentile}% of NØDE NETWORK
                    </p>
                  )}
                  {trend !== null && (
                    <div className="flex items-center gap-1.5 text-sm font-heading font-bold">
                      {isPositive && (
                        <>
                          <ArrowUp size={14} className="text-node-volt" />
                          <span className="text-node-volt">+{Math.abs(trend)}%</span>
                        </>
                      )}
                      {isNegative && (
                        <>
                          <ArrowDown size={14} className="text-red-500" />
                          <span className="text-red-500">{trend}%</span>
                        </>
                      )}
                      {!isPositive && !isNegative && trend === 0 && (
                        <span className="text-muted-text">No change</span>
                      )}
                      <span className="text-muted-text text-xs ml-1">vs {getPeriodLabel(trendPeriod)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Achievements Section - Enhanced */}
        <div className="bg-panel thin-border rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Achievements
              </h2>
              <p className="text-sm text-muted-text">Your earned badges and milestones</p>
            </div>
            {achievements.length > 6 && (
              <Link
                href="/progress?tab=achievements"
                className="text-node-volt hover:underline text-sm font-medium flex items-center gap-1"
              >
                View All ({achievements.length}) <span>→</span>
              </Link>
            )}
          </div>
          {achievements.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {achievements.slice(0, 6).map((achievement: any) => (
                <div
                  key={achievement.id}
                  className="relative bg-tech-grey thin-border rounded-lg p-4 hover:border-node-volt transition-all text-center group overflow-hidden"
                >
                  {/* Rarity glow effect */}
                  <div 
                    className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity ${
                      achievement.achievement.rarity === 'LEGENDARY' ? 'bg-yellow-500' :
                      achievement.achievement.rarity === 'EPIC' ? 'bg-purple-500' :
                      achievement.achievement.rarity === 'RARE' ? 'bg-blue-500' :
                      'bg-gray-500'
                    }`}
                  />
                  <div className="relative z-10">
                    <AchievementIcon
                      icon={achievement.achievement.icon}
                      rarity={achievement.achievement.rarity}
                      size="md"
                      className="mx-auto mb-2"
                    />
                    <div className="text-xs font-bold text-text-white mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                      {achievement.achievement.name}
                    </div>
                    <div className="text-[10px] text-muted-text mb-1">
                      {new Date(achievement.earnedAt).toLocaleDateString()}
                    </div>
                    <div className={`text-[9px] uppercase tracking-[0.1em] font-bold ${
                      achievement.achievement.rarity === 'LEGENDARY' ? 'text-yellow-400' :
                      achievement.achievement.rarity === 'EPIC' ? 'text-purple-400' :
                      achievement.achievement.rarity === 'RARE' ? 'text-blue-400' :
                      'text-gray-400'
                    }`}>
                      {achievement.achievement.rarity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-text">
              <Icons.GAMIFICATION size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-bold mb-2">No achievements yet</p>
              <p className="text-sm">Complete workouts to unlock achievements!</p>
            </div>
          )}
        </div>

        {/* Additional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="relative p-6 thin-border bg-panel/80 hover:border-node-volt transition-all duration-300 rounded-lg group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-node-volt/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-text font-heading">Current Streak</p>
                {Icons.STREAK && <Icons.STREAK size={28} className="text-node-volt" />}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-5xl font-heading font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {streak}
                </div>
                <div className="flex-1">
                  <div className="text-sm text-muted-text mb-2">days in a row</div>
                  {streak >= 7 && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-node-volt/20 border border-node-volt/30 rounded text-xs text-node-volt font-bold">
                      🔥 Streak Master
                    </div>
                  )}
                  {streak >= 30 && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-400 font-bold ml-2">
                      ⚡ Unstoppable
                    </div>
                  )}
                  {streak >= 100 && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded text-xs text-yellow-400 font-bold ml-2">
                      👑 Legendary
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="relative p-6 thin-border bg-panel/80 hover:border-node-volt transition-all duration-300 rounded-lg group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-text font-heading">Total Hours</p>
                {Icons.TIMER && <Icons.TIMER size={28} className="text-blue-400" />}
              </div>
              <div className="text-5xl font-heading font-bold text-text-white mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                {stats?.totalDurationHours ? Math.round(stats.totalDurationHours * 10) / 10 : 0}
              </div>
              <div className="text-sm text-muted-text">hours trained</div>
              {stats?.totalDurationHours && stats.totalDurationHours >= 100 && (
                <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-400 font-bold">
                  💪 Dedicated
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* RPE Distribution */}
          <div className="bg-panel thin-border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              RPE Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rpeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="rpe" stroke="#b0b0b0" />
                <YAxis stroke="#b0b0b0" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e1e1e',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" fill="#ccff00" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Archetype Breakdown */}
          <div className="bg-panel thin-border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Workout Archetypes
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={archetypeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {archetypeChartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e1e1e',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trends Chart */}
        <div className="bg-panel thin-border rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            30-Day Trends
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendsChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#b0b0b0" />
              <YAxis yAxisId="left" stroke="#b0b0b0" />
              <YAxis yAxisId="right" orientation="right" stroke="#b0b0b0" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e1e1e',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="sessions"
                stroke="#ccff00"
                strokeWidth={2}
                name="Sessions"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgRPE"
                stroke="#4a9eff"
                strokeWidth={2}
                name="Avg RPE"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="duration"
                stroke="#ff6b6b"
                strokeWidth={2}
                name="Duration (min)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Strength PRs */}
        {strengthData?.prs && Object.keys(strengthData.prs).length > 0 && (
          <div className="bg-panel thin-border rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Personal Records (PRs)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(strengthData.prs).map(([exercise, pr]: [string, any]) => (
                <div
                  key={exercise}
                  className="bg-panel thin-border rounded-lg p-4"
                >
                  <div className="text-node-volt font-bold text-lg mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {exercise}
                  </div>
                  <div className="text-text-white text-2xl font-bold mb-1">
                    {pr.weight}kg × {pr.reps}
                  </div>
                  <div className="text-muted-text text-sm">
                    Volume: {pr.volume}kg • {new Date(pr.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        {stats?.sessions && stats.sessions.length > 0 && (
          <div className="bg-panel thin-border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Recent Sessions
            </h2>
            <div className="space-y-3">
              {stats.sessions.map((session: any) => (
                <div
                  key={session.id}
                  className="bg-panel thin-border rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="text-text-white font-medium text-lg">
                      {session.workout.name}
                    </div>
                    <div className="text-muted-text text-sm">
                      {new Date(session.startedAt).toLocaleDateString()} •{' '}
                      {session.durationSec ? Math.round(session.durationSec / 60) : 0} min
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {session.rpe && (
                      <div className="text-center">
                        <div className="text-muted-text text-xs">RPE</div>
                        <div className="text-node-volt font-bold text-xl">
                          {session.rpe}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareStatsModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        stats={{
          name: user?.name || 'Athlete',
          level: xpStats?.level || 1,
          xp: xpStats?.xp || 0,
          totalSessions: stats?.totalSessions || 0,
          totalHours: stats?.totalDurationHours || 0,
          avgRPE: stats?.avgRPE || 0,
          streak: streak,
          sessionsPerWeek: Math.round(sessionsPerWeek * 10) / 10,
        }}
        achievements={achievements.map((a: any) => ({
          code: a.achievement.code,
          name: a.achievement.name,
          description: a.achievement.description,
          icon: a.achievement.icon,
          rarity: a.achievement.rarity,
          earnedAt: a.earnedAt,
          value: a.metadata?.value,
        }))}
      />
    </div>
  );
}
