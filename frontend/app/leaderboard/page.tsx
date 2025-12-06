'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Using router instead of Link to avoid TypeScript module resolution issues
import { analyticsApi, networkApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Icons } from '@/lib/iconMapping';
import { ArrowUp, ArrowDown, Minus, TrendingUp } from 'lucide-react';
import { ClickableUserName } from '@/components/user/ClickableUserName';

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
  previousRank?: number;
  rankChange?: number;
  trend?: 'up' | 'down' | 'new' | 'same' | null;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const router = useRouter(); // Navigation handler - using router.push instead of Link component
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'sessions' | 'hours' | 'rpe' | 'streak'>('sessions');
  const [showTrending, setShowTrending] = useState(true);
  const [trendPeriod, setTrendPeriod] = useState<'7d' | '30d'>('7d');
  const [loading, setLoading] = useState(true);
  const [networkConnections, setNetworkConnections] = useState<Map<string, string>>(new Map());
  const [loadingConnections, setLoadingConnections] = useState(true);

  useEffect(() => {
    loadLeaderboard();
    if (user) {
      loadNetworkConnections();
    }
  }, [selectedMetric, user, showTrending, trendPeriod]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await analyticsApi.getLeaderboard(selectedMetric, 50, showTrending, trendPeriod);
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNetworkConnections = async () => {
    try {
      setLoadingConnections(true);
      const network = await networkApi.getNetwork();
      const connectionMap = new Map<string, string>();
      network.forEach((conn: any) => {
        connectionMap.set(conn.id, 'ACCEPTED');
      });
      
      // Also check pending requests
      const pending = await networkApi.getPending();
      pending.forEach((req: any) => {
        connectionMap.set(req.requester.id, 'PENDING');
      });
      
      setNetworkConnections(connectionMap);
    } catch (error) {
      console.error('Failed to load network connections:', error);
    } finally {
      setLoadingConnections(false);
    }
  };

  const handleAddToNetwork = async (userId: string) => {
    try {
      await networkApi.sendRequest(userId);
      await loadNetworkConnections();
      alert('Network request sent!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send network request');
    }
  };

  const getConnectionStatus = (userId: string): 'connected' | 'pending' | null => {
    const status = networkConnections.get(userId);
    if (status === 'ACCEPTED') return 'connected';
    if (status === 'PENDING') return 'pending';
    return null;
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

  const getRankIcon = (rank: number) => {
    if (rank === 1) return Icons.RANK_1;
    if (rank === 2) return Icons.RANK_2;
    if (rank === 3) return Icons.RANK_3;
    return null;
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
        {/* Metric Selector & Trending Controls */}
        <div className="bg-concrete-grey border border-border-dark rounded-xl p-6 mb-8 space-y-4">
          <div className="flex flex-wrap gap-3">
            {(['sessions', 'hours', 'rpe', 'streak'] as const).map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  selectedMetric === metric
                    ? 'bg-node-volt text-dark shadow-lg shadow-node-volt/30 scale-105'
                    : 'bg-tech-grey text-muted-text hover:text-text-white hover:bg-tech-grey/80 border border-border-dark'
                }`}
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {getMetricLabel(metric)}
              </button>
            ))}
          </div>
          
          {/* Trending Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-border-dark">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTrending}
                  onChange={(e) => setShowTrending(e.target.checked)}
                  className="w-4 h-4 rounded border-border-dark bg-tech-grey text-node-volt focus:ring-node-volt focus:ring-2"
                />
                <span className="text-sm text-muted-text font-heading">Show Trending</span>
              </label>
              {showTrending && (
                <div className="flex gap-2">
                  {(['7d', '30d'] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => setTrendPeriod(period)}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                        trendPeriod === period
                          ? 'bg-node-volt text-dark'
                          : 'bg-tech-grey text-muted-text hover:text-text-white'
                      }`}
                    >
                      {period === '7d' ? '7 Days' : '30 Days'}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {showTrending && (
              <div className="text-xs text-muted-text flex items-center gap-2">
                <TrendingUp size={14} />
                <span>Rank changes vs {trendPeriod === '7d' ? 'last week' : 'last month'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-node-volt border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-muted-text">Loading leaderboard...</div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12 text-muted-text">No data available yet.</div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.userId}
                className={`relative bg-gradient-to-r ${getRankColor(entry.rank)} border rounded-xl p-6 hover:scale-[1.01] transition-all group overflow-hidden ${
                  showTrending && entry.trend === 'up' ? 'ring-2 ring-green-500/30' :
                  showTrending && entry.trend === 'down' ? 'ring-2 ring-red-500/30' :
                  ''
                } ${
                  user && entry.userId === user.id ? 'ring-2 ring-node-volt shadow-lg shadow-node-volt/20' : ''
                }`}
              >
                {/* Current user indicator */}
                {user && entry.userId === user.id && (
                  <div className="absolute top-2 right-2 bg-node-volt text-dark px-2 py-1 rounded text-xs font-bold">
                    YOU
                  </div>
                )}
                {/* Trending indicator bar */}
                {showTrending && entry.trend === 'up' && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-400" />
                )}
                {showTrending && entry.trend === 'down' && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-400" />
                )}
                {showTrending && entry.trend === 'new' && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-node-volt to-yellow-400" />
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    {/* Rank with Trending */}
                    <div className="flex-shrink-0 w-20 text-center">
                      {getRankIcon(entry.rank) ? (
                        <div className="flex flex-col items-center gap-1">
                          {(() => {
                            const RankIcon = getRankIcon(entry.rank);
                            return RankIcon ? <RankIcon size={32} className="text-node-volt" /> : null;
                          })()}
                          {showTrending && entry.trend && entry.trend !== 'same' && (
                            <div className={`flex items-center gap-1 text-xs font-bold ${
                              entry.trend === 'up' ? 'text-green-400' :
                              entry.trend === 'down' ? 'text-red-400' :
                              'text-node-volt'
                            }`}>
                              {entry.trend === 'up' && <ArrowUp size={12} />}
                              {entry.trend === 'down' && <ArrowDown size={12} />}
                              {entry.trend === 'new' && <span className="text-[10px]">NEW</span>}
                              {entry.rankChange && entry.rankChange !== 0 && (
                                <span>{Math.abs(entry.rankChange)}</span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <div className="text-3xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                            #{entry.rank}
                          </div>
                          {showTrending && entry.trend && (
                            <div className={`flex items-center gap-1 text-xs font-bold ${
                              entry.trend === 'up' ? 'text-green-400' :
                              entry.trend === 'down' ? 'text-red-400' :
                              entry.trend === 'new' ? 'text-node-volt' :
                              'text-muted-text'
                            }`}>
                              {entry.trend === 'up' && <ArrowUp size={12} />}
                              {entry.trend === 'down' && <ArrowDown size={12} />}
                              {entry.trend === 'same' && <Minus size={12} />}
                              {entry.trend === 'new' && <span className="text-[10px]">NEW</span>}
                              {entry.rankChange && entry.rankChange !== 0 && (
                                <span>{Math.abs(entry.rankChange)}</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {/* Profile avatar - using router.push for navigation (no Link import) */}
                        <div 
                          onClick={() => router.push(`/profile/${entry.userId}`)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              router.push(`/profile/${entry.userId}`);
                            }
                          }}
                          className="w-12 h-12 rounded-full bg-node-volt/20 border border-node-volt/50 flex items-center justify-center text-node-volt font-bold text-lg hover:bg-node-volt/30 transition-colors cursor-pointer" 
                          style={{ fontFamily: 'var(--font-space-grotesk)' }}
                        >
                          {entry.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                            <ClickableUserName
                              userId={entry.userId}
                              name={entry.name}
                              email={entry.email}
                              className="text-text-white"
                            />
                          </h3>
                          <p className="text-sm text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                            {entry.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Network Action */}
                  {user && entry.userId !== user.id && (
                    <div className="flex items-center">
                      {(() => {
                        const status = getConnectionStatus(entry.userId);
                        if (status === 'connected') {
                          return (
                            <span className="text-xs text-node-volt px-3 py-1 bg-node-volt/10 rounded-lg">
                              Connected
                            </span>
                          );
                        }
                        if (status === 'pending') {
                          return (
                            <span className="text-xs text-muted-text px-3 py-1 bg-dark rounded-lg">
                              Pending
                            </span>
                          );
                        }
                        return (
                          <button
                            onClick={() => handleAddToNetwork(entry.userId)}
                            className="bg-node-volt text-dark font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm flex items-center gap-2"
                          >
                            <Icons.PLUS size={16} />
                            Add to Network
                          </button>
                        );
                      })()}
                    </div>
                  )}

                  {/* Stats Grid - Enhanced */}
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="text-center px-3 py-2 bg-dark/40 rounded-lg">
                      <div className="text-xs text-muted-text mb-1 uppercase tracking-[0.1em]" style={{ fontFamily: 'var(--font-manrope)' }}>
                        Sessions
                      </div>
                      <div className="text-xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {entry.totalSessions}
                      </div>
                    </div>
                    <div className="text-center px-3 py-2 bg-dark/40 rounded-lg">
                      <div className="text-xs text-muted-text mb-1 uppercase tracking-[0.1em]" style={{ fontFamily: 'var(--font-manrope)' }}>
                        Hours
                      </div>
                      <div className="text-xl font-bold text-blue-400" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {entry.totalHours}
                      </div>
                    </div>
                    <div className="text-center px-3 py-2 bg-dark/40 rounded-lg">
                      <div className="text-xs text-muted-text mb-1 uppercase tracking-[0.1em]" style={{ fontFamily: 'var(--font-manrope)' }}>
                        Intensity
                      </div>
                      <div className="text-xl font-bold text-purple-400" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {entry.avgRPE.toFixed(1)}
                      </div>
                    </div>
                    <div className="text-center px-3 py-2 bg-dark/40 rounded-lg">
                      <div className="text-xs text-muted-text mb-1 uppercase tracking-[0.1em]" style={{ fontFamily: 'var(--font-manrope)' }}>
                        Streak
                      </div>
                      <div className="text-xl font-bold text-orange-400 flex items-center justify-center gap-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {entry.streak} <Icons.STREAK size={16} />
                      </div>
                    </div>
                    <div className="text-center min-w-[120px] px-4 py-2 bg-node-volt/10 border border-node-volt/30 rounded-lg">
                      <div className="text-xs text-muted-text mb-1 uppercase tracking-[0.1em]" style={{ fontFamily: 'var(--font-manrope)' }}>
                        {getMetricLabel(selectedMetric)}
                      </div>
                      <div className="text-2xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
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

        {/* Info Box - Enhanced */}
        <div className="mt-12 bg-gradient-to-br from-concrete-grey to-tech-grey border border-border-dark rounded-xl p-6">
          <div className="flex items-center justify-center gap-3">
            <Icons.SESSIONS size={24} className="text-node-volt" />
            <p className="text-muted-text text-center" style={{ fontFamily: 'var(--font-manrope)' }}>
              Rankings are updated in real-time. Keep training to climb the leaderboard!
            </p>
            {showTrending && (
              <div className="flex items-center gap-2 text-xs text-muted-text">
                <TrendingUp size={16} />
                <span>Trending shows rank changes vs {trendPeriod === '7d' ? 'last 7 days' : 'last 30 days'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
