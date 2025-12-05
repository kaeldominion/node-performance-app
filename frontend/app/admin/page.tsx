'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsApi, gamificationApi } from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { LevelUpModal } from '@/components/gamification/LevelUpModal';

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

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLevelUpPreview, setShowLevelUpPreview] = useState(false);
  const [previewLevel, setPreviewLevel] = useState(5);
  const [previewStats, setPreviewStats] = useState<any>(null);

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
      setSystemStats(data);
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

  const handlePreviewLevelUp = async () => {
    try {
      // Get current stats to use for preview
      const stats = await gamificationApi.getStats();
      setPreviewStats({
        ...stats,
        level: previewLevel,
        levelName: getLevelName(previewLevel),
        nextLevel: previewLevel < 100 ? previewLevel + 1 : null,
        nextLevelName: previewLevel < 100 ? getLevelName(previewLevel + 1) : null,
        xpToNextLevel: previewLevel < 100 ? 100 : 0,
      });
      setShowLevelUpPreview(true);
    } catch (error) {
      // Fallback if API fails
      setPreviewStats({
        level: previewLevel,
        levelName: getLevelName(previewLevel),
        nextLevel: previewLevel < 100 ? previewLevel + 1 : null,
        nextLevelName: previewLevel < 100 ? getLevelName(previewLevel + 1) : null,
        xpToNextLevel: 100,
      });
      setShowLevelUpPreview(true);
    }
  };

  // Helper function to get level name (should match backend)
  const getLevelName = (level: number): string => {
    const names: Record<number, string> = {
      1: 'Init', 2: 'Node', 3: 'Link', 4: 'Route', 5: 'Packet', 6: 'Stream', 7: 'Buffer', 8: 'Cache',
      9: 'Query', 10: 'Index', 11: 'Schema', 12: 'Table', 13: 'Join', 14: 'Filter', 15: 'Map',
      16: 'Reduce', 17: 'Async', 18: 'Promise', 19: 'Thread', 20: 'Process', 21: 'Cluster', 22: 'Server',
      23: 'Gateway', 24: 'Router', 25: 'Switch', 26: 'Bridge', 27: 'Proxy', 28: 'Load Balancer',
      29: 'Firewall', 30: 'DNS', 31: 'API', 32: 'Endpoint', 33: 'Webhook', 34: 'Socket', 35: 'Protocol',
      36: 'TCP', 37: 'UDP', 38: 'HTTP', 39: 'HTTPS', 40: 'GraphQL', 41: 'REST', 42: 'gRPC',
      43: 'WebSocket', 44: 'SSH', 45: 'TLS', 46: 'OAuth', 47: 'JWT', 48: 'Hash', 49: 'Encrypt',
      50: 'Decrypt', 51: 'Genome', 52: 'Sequence', 53: 'Strand', 54: 'Helix', 55: 'Base Pair',
      56: 'Codon', 57: 'Gene', 58: 'Chromosome', 59: 'Nucleotide', 60: 'Mutation', 61: 'Expression',
      62: 'Transcription', 63: 'Translation', 64: 'Replication', 65: 'Synthesis', 66: 'Polymerase',
      67: 'Ligase', 68: 'Helicase', 69: 'Primase', 70: 'Topoisomerase', 71: 'Exon', 72: 'Intron',
      73: 'Promoter', 74: 'Enhancer', 75: 'Silencer', 76: 'Ribosome', 77: 'mRNA', 78: 'tRNA',
      79: 'rRNA', 80: 'Protein', 81: 'Enzyme', 82: 'Catalyst', 83: 'Substrate', 84: 'Active Site',
      85: 'Allosteric', 86: 'Kinase', 87: 'Phosphatase', 88: 'Isomerase', 89: 'Hydrolase',
      90: 'Oxidase', 91: 'Reductase', 92: 'Transferase', 93: 'Lyase', 94: 'Ligase', 95: 'Synthase',
      96: 'Core', 97: 'Kernel', 98: 'Root', 99: 'Master', 100: 'DOMINUS',
    };
    return names[level] || `Level ${level}`;
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

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Admin Dashboard
          </h1>
          <p className="text-muted-text">System analytics, gamification preview, and management</p>
        </div>

        {/* System Stats Grid - Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Users */}
          <div className="bg-panel thin-border rounded-lg p-6">
            <div className="text-muted-text text-sm mb-2">Total Users</div>
            <div className="text-3xl font-bold text-node-volt mb-1">
              {systemStats?.users.total || 0}
            </div>
            <div className="text-sm text-muted-text">
              {systemStats?.users.active || 0} active (30d)
            </div>
          </div>

          {/* Workouts */}
          <div className="bg-panel thin-border rounded-lg p-6">
            <div className="text-muted-text text-sm mb-2">Total Workouts</div>
            <div className="text-3xl font-bold text-node-volt mb-1">
              {systemStats?.workouts.total || 0}
            </div>
            <div className="text-sm text-muted-text">
              {systemStats?.workouts.recommended || 0} recommended
            </div>
          </div>

          {/* Sessions */}
          <div className="bg-panel thin-border rounded-lg p-6">
            <div className="text-muted-text text-sm mb-2">Total Sessions</div>
            <div className="text-3xl font-bold text-node-volt mb-1">
              {systemStats?.sessions.total || 0}
            </div>
            <div className="text-sm text-muted-text">
              {systemStats?.sessions.last30Days || 0} in last 30d
            </div>
          </div>

          {/* Exercises */}
          <div className="bg-panel thin-border rounded-lg p-6">
            <div className="text-muted-text text-sm mb-2">Total Exercises</div>
            <div className="text-3xl font-bold text-node-volt mb-1">
              {systemStats?.exercises.total || 0}
            </div>
            <div className="text-sm text-muted-text">
              {systemStats?.exercises.aiGenerated || 0} AI-generated
            </div>
          </div>
        </div>

        {/* Gamification Preview Section */}
        <div className="bg-panel thin-border rounded-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              🎮 Gamification Preview
            </h2>
            <button
              onClick={handlePreviewLevelUp}
              className="bg-node-volt text-dark font-bold px-6 py-2 rounded hover:opacity-90 transition-opacity"
            >
              Preview Level Up
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-tech-grey border border-border-dark rounded-lg p-6">
              <div className="text-muted-text text-sm mb-2">Total XP Awarded</div>
              <div className="text-3xl font-bold text-node-volt">
                {systemStats?.gamification.totalXP.toLocaleString() || 0}
              </div>
            </div>
            <div className="bg-tech-grey border border-border-dark rounded-lg p-6">
              <div className="text-muted-text text-sm mb-2">Average User Level</div>
              <div className="text-3xl font-bold text-node-volt">
                L{systemStats?.gamification.avgLevel || 1}
              </div>
            </div>
            <div className="bg-tech-grey border border-border-dark rounded-lg p-6">
              <div className="text-muted-text text-sm mb-2">Top Users</div>
              <div className="text-3xl font-bold text-node-volt">
                {systemStats?.gamification.topUsers.length || 0}
              </div>
            </div>
          </div>

          {/* Top Users Leaderboard */}
          {systemStats?.gamification.topUsers && systemStats.gamification.topUsers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Top Users by XP</h3>
              <div className="space-y-2">
                {systemStats.gamification.topUsers.slice(0, 5).map((user, idx) => (
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

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Quick Actions */}
          <div className="bg-panel thin-border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/admin/exercises"
                className="bg-node-volt text-dark font-bold py-3 px-6 rounded hover:opacity-90 transition-opacity text-center"
              >
                Manage Exercises
              </Link>
              <Link
                href="/admin/workouts"
                className="bg-node-volt text-dark font-bold py-3 px-6 rounded hover:opacity-90 transition-opacity text-center"
              >
                Manage Workouts
              </Link>
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
                <span className="font-bold text-node-volt">{systemStats?.sessions.completed || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-text">Completion Rate</span>
                <span className="font-bold text-node-volt">
                  {systemStats?.sessions.completionRate.toFixed(1) || 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-text">Sessions (Last 30d)</span>
                <span className="font-bold">{systemStats?.sessions.last30Days || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-panel thin-border rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Recent Activity (Last 24 Hours)
          </h3>
          {systemStats?.recentActivity && systemStats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {systemStats.recentActivity.slice(0, 10).map((activity) => (
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
        {showLevelUpPreview && previewStats && (
          <LevelUpModal
            level={previewStats.level}
            levelName={previewStats.levelName}
            nextLevel={previewStats.nextLevel}
            nextLevelName={previewStats.nextLevelName}
            xpToNextLevel={previewStats.xpToNextLevel}
            onClose={() => {
              setShowLevelUpPreview(false);
              setPreviewLevel(previewLevel + 1);
            }}
          />
        )}
      </div>
    </div>
  );
}

