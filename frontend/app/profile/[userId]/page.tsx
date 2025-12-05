'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userApi, networkApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Icons } from '@/lib/iconMapping';
import Link from 'next/link';

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const userId = params.userId as string;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId, currentUser]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profileData, statsData] = await Promise.all([
        userApi.getPublicProfile(userId).catch((err) => {
          console.error('Failed to load profile:', err);
          return null;
        }),
        userApi.getPublicProfileStats(userId).catch(() => null),
      ]);
      if (profileData) {
        setProfile({ ...profileData, enhancedStats: statsData?.stats });
      } else {
        setProfile(null);
      }
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!profile) return;
    
    try {
      setSendingRequest(true);
      await networkApi.sendRequest(profile.id);
      await loadProfile(); // Reload to update network status
      alert('Network request sent!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send network request');
    } finally {
      setSendingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-muted-text">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-muted-text">Profile not found</div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;
  const isConnected = profile.networkStatus?.status === 'ACCEPTED';
  const hasPendingRequest = profile.networkStatus?.status === 'PENDING';
  const canSendRequest = !isOwnProfile && !isConnected && !hasPendingRequest;

  return (
    <div className="min-h-screen bg-deep-asphalt">
      <Navbar />

      {/* Header */}
      <div className="relative bg-gradient-to-br from-deep-asphalt via-concrete-grey to-deep-asphalt border-b border-border-dark overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-node-volt rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <button
            onClick={() => router.back()}
            className="mb-6 text-muted-text hover:text-text-white transition-colors flex items-center gap-2"
          >
            <Icons.CHEVRON_LEFT size={20} />
            Back
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-node-volt/20 border-4 border-node-volt flex items-center justify-center text-4xl font-bold text-node-volt">
                {profile.name?.charAt(0).toUpperCase() || profile.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-text-white to-node-volt bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {profile.name || profile.email}
                </h1>
                {profile.username && (
                  <div className="text-xl text-muted-text mb-2">@{profile.username}</div>
                )}
                <div className="flex items-center gap-4 text-sm text-node-volt">
                  <span>Level {profile.stats?.level || profile.level || 1}</span>
                  <span>•</span>
                  <span>{(profile.stats?.xp || profile.xp || 0).toLocaleString()} XP</span>
                </div>
              </div>
            </div>
            {canSendRequest && (
              <button
                onClick={handleSendRequest}
                disabled={sendingRequest}
                className="bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
              >
                <Icons.USER_PLUS size={20} />
                {sendingRequest ? 'Sending...' : 'Add to Network'}
              </button>
            )}
            {hasPendingRequest && (
              <div className="bg-node-volt/10 border border-node-volt/30 text-node-volt px-6 py-3 rounded-lg">
                Request Pending
              </div>
            )}
            {isConnected && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-500 px-6 py-3 rounded-lg">
                Connected
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-panel thin-border rounded-lg p-6 hover:border-node-volt transition-colors">
            <div className="text-muted-text text-sm mb-2">Total Sessions</div>
            <div className="text-3xl font-bold text-node-volt">{profile.stats?.totalSessions || profile._count?.sessions || 0}</div>
            {profile.enhancedStats?.totalHours && (
              <div className="text-xs text-muted-text mt-1">{Math.round(profile.enhancedStats.totalHours)} hours</div>
            )}
          </div>
          <div className="bg-panel thin-border rounded-lg p-6 hover:border-node-volt transition-colors">
            <div className="text-muted-text text-sm mb-2">Sessions/Wk</div>
            <div className="text-3xl font-bold text-node-volt">
              {profile.enhancedStats?.sessionsPerWeek ? profile.enhancedStats.sessionsPerWeek.toFixed(1) : '—'}
            </div>
            <div className="text-xs text-muted-text mt-1">Last 30 days</div>
          </div>
          <div className="bg-panel thin-border rounded-lg p-6 hover:border-node-volt transition-colors">
            <div className="text-muted-text text-sm mb-2">Avg Intensity</div>
            <div className="text-3xl font-bold text-node-volt">
              {profile.enhancedStats?.avgRPE ? profile.enhancedStats.avgRPE.toFixed(1) : '—'}
            </div>
            <div className="text-xs text-muted-text mt-1">RPE average</div>
          </div>
          <div className="bg-panel thin-border rounded-lg p-6 hover:border-node-volt transition-colors">
            <div className="text-muted-text text-sm mb-2">Current Streak</div>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold text-node-volt">{profile.enhancedStats?.streak || 0}</div>
              {profile.enhancedStats?.streak && profile.enhancedStats.streak >= 7 && (
                <Icons.STREAK size={24} className="text-node-volt" />
              )}
            </div>
            <div className="text-xs text-muted-text mt-1">days in a row</div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-panel thin-border rounded-lg p-6 hover:border-node-volt transition-colors">
            <div className="text-muted-text text-sm mb-2">Level</div>
            <div className="text-3xl font-bold text-node-volt">{profile.stats?.level || profile.level || 1}</div>
            <div className="text-xs text-muted-text mt-1">{(profile.stats?.xp || profile.xp || 0).toLocaleString()} XP</div>
          </div>
          <div className="bg-panel thin-border rounded-lg p-6 hover:border-node-volt transition-colors">
            <div className="text-muted-text text-sm mb-2">Programs</div>
            <div className="text-3xl font-bold text-node-volt">{profile.stats?.totalPrograms || profile._count?.programs || 0}</div>
          </div>
          <div className="bg-panel thin-border rounded-lg p-6 hover:border-node-volt transition-colors">
            <div className="text-muted-text text-sm mb-2">Network</div>
            <div className="text-3xl font-bold text-node-volt">{profile.stats?.networkCount || (profile._count?.networkAsRequester || 0) + (profile._count?.networkAsAddressee || 0)}</div>
          </div>
          <div className="bg-panel thin-border rounded-lg p-6 hover:border-node-volt transition-colors">
            <div className="text-muted-text text-sm mb-2">View Leaderboard</div>
            <Link
              href="/leaderboard"
              className="text-node-volt hover:underline text-sm font-medium flex items-center gap-1 mt-2"
            >
              See Rankings <span>→</span>
            </Link>
          </div>
        </div>

        {/* Recent Sessions */}
        {profile.recentSessions && profile.recentSessions.length > 0 && (
          <div className="bg-panel thin-border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Recent Sessions
            </h2>
            <div className="space-y-3">
              {profile.recentSessions.map((session: any) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between bg-dark thin-border rounded-lg p-4 hover:border-node-volt transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-node-volt/20 border border-node-volt flex items-center justify-center">
                      <Icons.WORKOUT size={20} className="text-node-volt" />
                    </div>
                    <div>
                      <div className="font-bold text-text-white">
                        {session.workout?.name || 'Workout'}
                      </div>
                      {session.workout?.displayCode && (
                        <div className="text-sm text-muted-text">{session.workout.displayCode}</div>
                      )}
                      {session.completedAt && (
                        <div className="text-xs text-muted-text mt-1">
                          {new Date(session.completedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  {session.completed && (
                    <div className="flex items-center gap-2 text-green-500">
                      <Icons.CHECK size={20} />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

