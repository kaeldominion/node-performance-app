'use client';

import { useEffect, useState } from 'react';
import { userApi, networkApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Icons } from '@/lib/iconMapping';
import { ProfileShareModal } from './ProfileShareModal';
import { Share2 } from 'lucide-react';

interface UserProfileModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ userId, isOpen, onClose }: UserProfileModalProps) {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadProfile();
    } else {
      setProfile(null);
    }
  }, [isOpen, userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profileData, statsData] = await Promise.all([
        userApi.getPublicProfile(userId).catch(() => null),
        userApi.getPublicProfileStats(userId).catch(() => null),
      ]);
      if (profileData) {
        setProfile({ ...profileData, enhancedStats: statsData?.stats });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
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
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send network request');
    } finally {
      setSendingRequest(false);
    }
  };

  if (!isOpen) return null;

  const isOwnProfile = currentUser?.id === userId;
  const isConnected = profile?.networkStatus?.status === 'ACCEPTED';
  const hasPendingRequest = profile?.networkStatus?.status === 'PENDING';
  const canSendRequest = !isOwnProfile && !isConnected && !hasPendingRequest;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-panel thin-border rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-deep-asphalt via-concrete-grey to-deep-asphalt border-b border-border-dark p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-text hover:text-text-white transition-colors"
          >
            <Icons.X size={24} />
          </button>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="text-muted-text">Loading profile...</div>
            </div>
          ) : !profile ? (
            <div className="text-center py-8">
              <div className="text-muted-text">Profile not found</div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-node-volt/20 border-2 border-node-volt flex items-center justify-center text-2xl font-bold text-node-volt flex-shrink-0">
                {profile.name?.charAt(0).toUpperCase() || profile.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold mb-1 truncate" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {profile.name || profile.email}
                </h2>
                {profile.username && (
                  <div className="text-sm text-muted-text mb-2">@{profile.username}</div>
                )}
                <div className="flex items-center gap-3 text-sm text-node-volt">
                  <span>Level {profile.stats?.level || profile.level || 1}</span>
                  <span>•</span>
                  <span>{(profile.stats?.xp || profile.xp || 0).toLocaleString()} XP</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {profile && (
          <div className="p-6 space-y-6">
            {/* Share Profile Button (for own profile) */}
            {isOwnProfile && (
              <button
                onClick={() => setShowShareModal(true)}
                className="w-full bg-node-volt text-dark font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Share2 size={18} />
                Share My Profile
              </button>
            )}
            
            {/* Network Status / Action */}
            {canSendRequest && (
              <button
                onClick={handleSendRequest}
                disabled={sendingRequest}
                className="w-full bg-node-volt text-dark font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Icons.USER_PLUS size={18} />
                {sendingRequest ? 'Sending...' : 'Add to Network'}
              </button>
            )}
            {hasPendingRequest && (
              <div className="w-full bg-node-volt/10 border border-node-volt/30 text-node-volt px-4 py-2 rounded-lg text-center text-sm">
                Request Pending
              </div>
            )}
            {isConnected && (
              <div className="w-full bg-green-500/10 border border-green-500/30 text-green-500 px-4 py-2 rounded-lg text-center text-sm">
                Connected
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark thin-border rounded-lg p-4">
                <div className="text-muted-text text-xs mb-1">Total Sessions</div>
                <div className="text-2xl font-bold text-node-volt">{profile.stats?.totalSessions || profile._count?.sessions || 0}</div>
                {profile.enhancedStats?.totalHours && (
                  <div className="text-xs text-muted-text mt-1">{Math.round(profile.enhancedStats.totalHours)}h</div>
                )}
              </div>
              <div className="bg-dark thin-border rounded-lg p-4">
                <div className="text-muted-text text-xs mb-1">Sessions/Wk</div>
                <div className="text-2xl font-bold text-node-volt">
                  {profile.enhancedStats?.sessionsPerWeek ? profile.enhancedStats.sessionsPerWeek.toFixed(1) : '—'}
                </div>
                <div className="text-xs text-muted-text mt-1">Last 30d</div>
              </div>
              <div className="bg-dark thin-border rounded-lg p-4">
                <div className="text-muted-text text-xs mb-1">Avg Intensity</div>
                <div className="text-2xl font-bold text-node-volt">
                  {profile.enhancedStats?.avgRPE ? profile.enhancedStats.avgRPE.toFixed(1) : '—'}
                </div>
                <div className="text-xs text-muted-text mt-1">RPE</div>
              </div>
              <div className="bg-dark thin-border rounded-lg p-4">
                <div className="text-muted-text text-xs mb-1">Current Streak</div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-node-volt">{profile.enhancedStats?.streak || 0}</div>
                  {profile.enhancedStats?.streak && profile.enhancedStats.streak >= 7 && (
                    <Icons.STREAK size={20} className="text-node-volt" />
                  )}
                </div>
                <div className="text-xs text-muted-text mt-1">days</div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-dark thin-border rounded-lg p-4 text-center">
                <div className="text-muted-text text-xs mb-1">Programs</div>
                <div className="text-xl font-bold text-node-volt">{profile.stats?.totalPrograms || profile._count?.programs || 0}</div>
              </div>
              <div className="bg-dark thin-border rounded-lg p-4 text-center">
                <div className="text-muted-text text-xs mb-1">Network</div>
                <div className="text-xl font-bold text-node-volt">
                  {profile.stats?.networkCount || (profile._count?.networkAsRequester || 0) + (profile._count?.networkAsAddressee || 0)}
                </div>
              </div>
              <div className="bg-dark thin-border rounded-lg p-4 text-center">
                <div className="text-muted-text text-xs mb-1">Level</div>
                <div className="text-xl font-bold text-node-volt">{profile.stats?.level || profile.level || 1}</div>
              </div>
            </div>

            {/* View Full Profile Link */}
            <div className="pt-4 border-t thin-border">
              <a
                href={`/profile/${userId}`}
                className="block text-center text-node-volt hover:underline text-sm font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
              >
                View Full Profile →
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Profile Share Modal */}
      {showShareModal && profile && (
        <ProfileShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          profile={{
            name: profile.name || profile.email,
            username: profile.username,
            level: profile.stats?.level || profile.level || 1,
            xp: profile.stats?.xp || profile.xp || 0,
            stats: profile.enhancedStats || {
              totalSessions: profile.stats?.totalSessions || profile._count?.sessions || 0,
              totalHours: profile.enhancedStats?.totalHours || 0,
              avgRPE: profile.enhancedStats?.avgRPE || 0,
              streak: profile.enhancedStats?.streak || 0,
              sessionsPerWeek: profile.enhancedStats?.sessionsPerWeek || 0,
            },
          }}
        />
      )}
    </div>
  );
}

