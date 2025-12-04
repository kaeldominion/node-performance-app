'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
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

const COLORS = ['#ccff00', '#4a9eff', '#ff6b6b', '#9b59b6', '#f39c12'];

export default function ProgressPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [strengthData, setStrengthData] = useState<any>(null);
  const [engineData, setEngineData] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      loadData();
    }
  }, [user, authLoading, timeRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, strength, engine, trendsData] = await Promise.all([
        analyticsApi.getStats(),
        analyticsApi.getStrengthProgress(),
        analyticsApi.getEngineProgress(),
        analyticsApi.getTrends(30),
      ]);

      setStats(statsData);
      setStrengthData(strength);
      setEngineData(engine);
      setTrends(trendsData);
    } catch (error) {
      console.error('Failed to load progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-muted-text">Loading progress...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Progress Tracking
          </h1>
          <p className="text-muted-text">Your training analytics and performance metrics</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-panel thin-border rounded-lg p-6">
            <div className="text-muted-text text-sm mb-2">Total Sessions</div>
            <div className="text-3xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {stats?.totalSessions || 0}
            </div>
          </div>
          <div className="bg-panel thin-border rounded-lg p-6">
            <div className="text-muted-text text-sm mb-2">Total Hours</div>
            <div className="text-3xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {stats?.totalDurationHours ? Math.round(stats.totalDurationHours * 10) / 10 : 0}
            </div>
          </div>
          <div className="bg-panel thin-border rounded-lg p-6">
            <div className="text-muted-text text-sm mb-2">Average RPE</div>
            <div className="text-3xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {stats?.avgRPE || 0}
            </div>
          </div>
          <div className="bg-panel thin-border rounded-lg p-6">
            <div className="text-muted-text text-sm mb-2">Completion Rate</div>
            <div className="text-3xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {stats?.completionRate || 0}%
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
    </div>
  );
}

