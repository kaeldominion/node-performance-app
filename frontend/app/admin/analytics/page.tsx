'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsApi, gamificationApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Icon } from '@/components/icons';
import { LevelUpModal } from '@/components/gamification/LevelUpModal';
import Link from 'next/link';
import { Icons } from '@/lib/iconMapping';

interface SystemStats {
  users: {
    total: number;
    active: number;
    inactive: number;
    roleBreakdown: Record<string, number>;
  };
  workouts: {
    total: number;
    recommended: number;
    aiGenerated: number;
  };
  sessions: {
    total: number;
    completed: number;
    completionRate: number;
    last30Days: number;
  };
  exercises: {
    total: number;
    aiGenerated: number;
  };
  gamification: {
    totalXP: number;
    avgLevel: number;
    topUsers: Array<{
      id: string;
      name: string | null;
      email: string;
      xp: number;
      level: number;
    }>;
  };
  recentActivity: Array<{
    id: string;
    startedAt: Date;
    completed: boolean;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
    workout: {
      id: string;
      name: string;
      archetype: string | null;
    };
  }>;
}

export default function AdminAnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLevelUpPreview, setShowLevelUpPreview] = useState(false);
  const [previewLevel, setPreviewLevel] = useState(5);

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push('/');
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.isAdmin) {
      loadStats();
      // Refresh every 30 seconds
      const interval = setInterval(loadStats, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await analyticsApi.getSystemStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load system stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-muted-text">Loading analytics...</div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                System Analytics
              </h1>
              <p className="text-muted-text">Live stats, gamification preview, and system insights</p>
            </div>
            <Link
              href="/admin"
              className="text-node-volt hover:text-node-volt/80 transition-colors"
            >
              ← Back to Admin
            </Link>
          </div>
        </div>

        {/* Gamification Preview Section */}
        <div className="bg-panel thin-border rounded-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              <Icons.GAMIFICATION size={24} className="text-node-volt" />
              Gamification Preview
            </h2>
            <button
              onClick={() => {
                setPreviewLevel(previewLevel + 1);
                setShowLevelUpPreview(true);
              }}
              className="bg-node-volt text-dark font-bold px-6 py-2 rounded hover:opacity-90 transition-opacity"
            >
              Preview Level Up
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-tech-grey border border-border-dark rounded-lg p-6">
              <div className="text-muted-text text-sm mb-2">Total XP Awarded</div>
              <div className="text-3xl font-bold text-node-volt">
                {stats?.gamification.totalXP.toLocaleString() || 0}
              </div>
            </div>
            <div className="bg-tech-grey border border-border-dark rounded-lg p-6">
              <div className="text-muted-text text-sm mb-2">Average User Level</div>
              <div className="text-3xl font-bold text-node-volt">
                L{stats?.gamification.avgLevel || 1}
              </div>
            </div>
            <div className="bg-tech-grey border border-border-dark rounded-lg p-6">
              <div className="text-muted-text text-sm mb-2">Top Users</div>
              <div className="text-3xl font-bold text-node-volt">
                {stats?.gamification.topUsers.length || 0}
              </div>
            </div>
          </div>

          {/* Top Users Leaderboard */}
          {stats?.gamification.topUsers && stats.gamification.topUsers.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Top Users by XP</h3>
              <div className="space-y-2">
                {stats.gamification.topUsers.map((user, idx) => (
                  <div
                    key={user.id}
                    className="bg-tech-grey border border-border-dark rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-node-volt/20 border border-node-volt rounded-full flex items-center justify-center font-bold text-node-volt">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{user.name || user.email}</div>
                        <div className="text-sm text-muted-text">Level {user.level}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-node-volt font-bold">{user.xp.toLocaleString()} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* System Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Users */}
          <div className="bg-panel thin-border rounded-lg p-6">
            <div className="text-muted-text text-sm mb-2">Total Users</div>
            <div className="text-3xl font-bold text-node-volt mb-1">
              {stats?.users.total || 0}
            </div>
            <div className="text-sm text-muted-text">
              {stats?.users.active || 0} active (30d)
            </div>
          </div>

          {/* Workouts */}
          <div className="bg-panel thin-border rounded-lg p-6">
            <div className="text-muted-text text-sm mb-2">Total Workouts</div>
            <div className="text-3xl font-bold text-node-volt mb-1">
              {stats?.workouts.total || 0}
            </div>
            <div className="text-sm text-muted-text">
              {stats?.workouts.recommended || 0} recommended
            </div>
          </div>

          {/* Sessions */}
          <div className="bg-panel thin-border rounded-lg p-6">
            <div className="text-muted-text text-sm mb-2">Total Sessions</div>
            <div className="text-3xl font-bold text-node-volt mb-1">
              {stats?.sessions.total || 0}
            </div>
            <div className="text-sm text-muted-text">
              {stats?.sessions.last30Days || 0} in last 30d
            </div>
          </div>

          {/* Exercises */}
          <div className="bg-panel thin-border rounded-lg p-6">
            <div className="text-muted-text text-sm mb-2">Total Exercises</div>
            <div className="text-3xl font-bold text-node-volt mb-1">
              {stats?.exercises.total || 0}
            </div>
            <div className="text-sm text-muted-text">
              {stats?.exercises.aiGenerated || 0} AI-generated
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Breakdown */}
          <div className="bg-panel thin-border rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              User Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-text">Active Users (30d)</span>
                <span className="font-bold text-node-volt">{stats?.users.active || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-text">Inactive Users</span>
                <span className="font-bold">{stats?.users.inactive || 0}</span>
              </div>
              {stats?.users.roleBreakdown && Object.entries(stats.users.roleBreakdown).map(([role, count]) => (
                <div key={role} className="flex justify-between items-center">
                  <span className="text-muted-text">{role}</span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Session Stats */}
          <div className="bg-panel thin-border rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Session Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-text">Completed Sessions</span>
                <span className="font-bold text-node-volt">{stats?.sessions.completed || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-text">Completion Rate</span>
                <span className="font-bold text-node-volt">
                  {stats?.sessions.completionRate.toFixed(1) || 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-text">Sessions (Last 30d)</span>
                <span className="font-bold">{stats?.sessions.last30Days || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-panel thin-border rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Recent Activity (Last 24 Hours)
          </h3>
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-tech-grey border border-border-dark rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${activity.completed ? 'bg-green-400' : 'bg-yellow-400'}`} />
                    <div>
                      <div className="font-semibold">
                        {activity.user.name || activity.user.email}
                      </div>
                      <div className="text-sm text-muted-text">
                        {activity.workout.name}
                        {activity.workout.archetype && ` • ${activity.workout.archetype}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-text">
                    {formatTimeAgo(activity.startedAt)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-text">
              No activity in the last 24 hours
            </div>
          )}
        </div>

        {/* Level Up Modal Preview */}
        {showLevelUpPreview && (
          <LevelUpModal
            level={previewLevel}
            levelName={`Level ${previewLevel}`}
            nextLevel={previewLevel + 1}
            nextLevelName={`Level ${previewLevel + 1}`}
            xpToNextLevel={1000}
            onClose={() => setShowLevelUpPreview(false)}
          />
        )}
      </div>
    </div>
  );
}

