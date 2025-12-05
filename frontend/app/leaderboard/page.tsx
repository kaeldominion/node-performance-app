'use client';

import { useEffect, useState } from 'react';
import { analyticsApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Icon } from '@/components/icons';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  email: string;
  totalSessions: number;
  totalHours: number;
  avgRPE: number;
  streak: number;
  score: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'sessions' | 'hours' | 'rpe' | 'streak'>('sessions');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedMetric]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await analyticsApi.getLeaderboard(selectedMetric);
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'sessions': return 'Total Sessions';
      case 'hours': return 'Total Hours';
      case 'rpe': return 'Avg Intensity';
      case 'streak': return 'Current Streak';
      default: return metric;
    }
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-500/30 to-yellow-600/20 border-yellow-500/50';
    if (rank === 2) return 'from-gray-400/30 to-gray-500/20 border-gray-400/50';
    if (rank === 3) return 'from-orange-600/30 to-orange-700/20 border-orange-600/50';
    return 'from-concrete-grey to-tech-grey border-border-dark';
  };

  return (
    <div className="min-h-screen bg-deep-asphalt">
      <Navbar />
      
      {/* Header */}
      <div className="relative bg-gradient-to-br from-deep-asphalt via-concrete-grey to-deep-asphalt border-b border-border-dark overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-node-volt rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-text-white to-node-volt bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Leaderboard
          </h1>
          <p className="text-xl text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
            See how you stack up against the NØDE community
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Metric Selector */}
        <div className="bg-concrete-grey border border-border-dark rounded-xl p-6 mb-8">
          <div className="flex flex-wrap gap-3">
            {(['sessions', 'hours', 'rpe', 'streak'] as const).map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  selectedMetric === metric
                    ? 'bg-node-volt text-deep-asphalt shadow-lg shadow-node-volt/30'
                    : 'bg-tech-grey text-muted-text hover:text-text-white hover:bg-tech-grey/80 border border-border-dark'
                }`}
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {getMetricLabel(metric)}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        {loading ? (
          <div className="text-center py-12 text-muted-text">Loading leaderboard...</div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12 text-muted-text">No data available yet.</div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.userId}
                className={`bg-gradient-to-r ${getRankColor(entry.rank)} border rounded-xl p-6 hover:scale-[1.02] transition-all`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-16 text-center">
                      <div className="text-3xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {getRankEmoji(entry.rank)}
                      </div>
                      {entry.rank > 3 && (
                        <div className="text-sm text-muted-text mt-1">#{entry.rank}</div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-node-volt/20 border border-node-volt/50 flex items-center justify-center text-node-volt font-bold text-lg" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                          {entry.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                            {entry.name}
                          </h3>
                          <p className="text-sm text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                            {entry.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-xs text-muted-text mb-1" style={{ fontFamily: 'var(--font-manrope)' }}>
                        Sessions
                      </div>
                      <div className="text-2xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {entry.totalSessions}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-text mb-1" style={{ fontFamily: 'var(--font-manrope)' }}>
                        Hours
                      </div>
                      <div className="text-2xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {entry.totalHours}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-text mb-1" style={{ fontFamily: 'var(--font-manrope)' }}>
                        Intensity
                      </div>
                      <div className="text-2xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {entry.avgRPE.toFixed(1)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-text mb-1" style={{ fontFamily: 'var(--font-manrope)' }}>
                        Streak
                      </div>
                      <div className="text-2xl font-bold text-node-volt flex items-center gap-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {entry.streak}
                        <Icon name="streak" size={20} color="var(--node-volt)" />
                      </div>
                    </div>
                    <div className="text-center min-w-[120px]">
                      <div className="text-xs text-muted-text mb-1" style={{ fontFamily: 'var(--font-manrope)' }}>
                        {getMetricLabel(selectedMetric)}
                      </div>
                      <div className="text-3xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {selectedMetric === 'hours' 
                          ? entry.score.toFixed(1)
                          : selectedMetric === 'rpe'
                          ? entry.score.toFixed(1)
                          : entry.score
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 bg-concrete-grey border border-border-dark rounded-xl p-6">
          <p className="text-muted-text text-center" style={{ fontFamily: 'var(--font-manrope)' }}>
            Rankings are updated in real-time. Keep training to climb the leaderboard!
          </p>
        </div>
      </div>
    </div>
  );
}
