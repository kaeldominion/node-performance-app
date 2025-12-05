'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { networkApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { AddNetworkModal } from '@/components/network/AddNetworkModal';
import { TerminalActivityFeed } from '@/components/activity/TerminalActivityFeed';
import { FindFriendsTab } from '@/components/network/FindFriendsTab';
import { Icons } from '@/lib/iconMapping';

type Tab = 'network' | 'find' | 'activity';

export default function NetworkPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('network');
  const [network, setNetwork] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentUserNetworkCode, setCurrentUserNetworkCode] = useState<string | undefined>();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      loadNetworkData();
      if (user.networkCode) {
        setCurrentUserNetworkCode(user.networkCode);
      }
    }
  }, [user, authLoading]);

  const loadNetworkData = async () => {
    try {
      setLoading(true);
      const [networkData, pendingData] = await Promise.all([
        networkApi.getNetwork().catch(() => []),
        networkApi.getPending().catch(() => []),
      ]);

      setNetwork(networkData);
      setPendingRequests(pendingData);

      // Get sent requests (requests where current user is the requester)
      // We need to check all network connections where status is PENDING
      // and requesterId is current user
      const allPending = await networkApi.getNetwork().catch(() => []);
      // Note: We'll need to enhance the API to get sent requests separately
      // For now, we'll show received requests in pendingRequests
    } catch (error) {
      console.error('Failed to load network data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await networkApi.acceptRequest(requestId);
      await loadNetworkData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await networkApi.rejectRequest(requestId);
      await loadNetworkData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleRemoveNetwork = async (networkUserId: string) => {
    if (!confirm('Are you sure you want to remove this connection?')) {
      return;
    }
    try {
      await networkApi.remove(networkUserId);
      await loadNetworkData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to remove connection');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-muted-text">Loading network...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-deep-asphalt">
      <Navbar />

      {/* Header */}
      <div className="relative bg-gradient-to-br from-deep-asphalt via-concrete-grey to-deep-asphalt border-b border-border-dark overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-node-volt rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-text-white to-node-volt bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Network
              </h1>
              <p className="text-xl text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                Connect with friends and track your training community
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Icons.PLUS size={20} />
              Add to Network
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs */}
        <div className="flex gap-2 border-b thin-border mb-8">
          <button
            onClick={() => setActiveTab('network')}
            className={`px-6 py-3 font-bold transition-colors border-b-2 ${
              activeTab === 'network'
                ? 'border-node-volt text-node-volt'
                : 'border-transparent text-muted-text hover:text-text-white'
            }`}
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            My Network ({network.length})
          </button>
          <button
            onClick={() => setActiveTab('find')}
            className={`px-6 py-3 font-bold transition-colors border-b-2 ${
              activeTab === 'find'
                ? 'border-node-volt text-node-volt'
                : 'border-transparent text-muted-text hover:text-text-white'
            }`}
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Find Friends
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-6 py-3 font-bold transition-colors border-b-2 ${
              activeTab === 'activity'
                ? 'border-node-volt text-node-volt'
                : 'border-transparent text-muted-text hover:text-text-white'
            }`}
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Activity
          </button>
        </div>

        {/* Pending Requests Banner */}
        {pendingRequests.length > 0 && activeTab === 'network' && (
          <div className="bg-node-volt/10 border border-node-volt/30 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-bold mb-3 text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Pending Requests ({pendingRequests.length})
            </h3>
            <div className="space-y-2">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between bg-dark thin-border rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-node-volt/20 border border-node-volt flex items-center justify-center text-sm font-bold text-node-volt">
                      {request.requester.name?.charAt(0).toUpperCase() || request.requester.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-text-white">{request.requester.name || request.requester.email}</div>
                      {request.requester.name && (
                        <div className="text-xs text-muted-text">{request.requester.email}</div>
                      )}
                      <div className="text-xs text-node-volt mt-1">
                        Level {request.requester.level} • {request.requester.xp?.toLocaleString() || 0} XP
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="bg-node-volt text-dark font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="bg-dark thin-border text-text-white font-bold px-4 py-2 rounded-lg hover:bg-concrete-grey transition-colors text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Network Tab */}
        {activeTab === 'network' && (
          <div className="space-y-4">
            {network.length === 0 ? (
              <div className="text-center py-12 bg-panel thin-border rounded-lg">
                <p className="text-muted-text mb-4">No network connections yet</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Add to Network
                </button>
              </div>
            ) : (
              network.map((networkUser) => (
                <div
                  key={networkUser.id}
                  className="bg-panel thin-border rounded-lg p-6 hover:border-node-volt transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-node-volt/20 border border-node-volt flex items-center justify-center text-lg font-bold text-node-volt">
                        {networkUser.name?.charAt(0).toUpperCase() || networkUser.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-text-white text-lg" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                          {networkUser.name || networkUser.email}
                        </div>
                        {networkUser.username && (
                          <div className="text-sm text-muted-text">@{networkUser.username}</div>
                        )}
                        {networkUser.name && (
                          <div className="text-xs text-muted-text">{networkUser.email}</div>
                        )}
                        <div className="text-sm text-node-volt mt-1">
                          Level {networkUser.level} • {networkUser.xp?.toLocaleString() || 0} XP
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveNetwork(networkUser.id)}
                      className="text-muted-text hover:text-red-500 transition-colors"
                    >
                      <Icons.X size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Find Friends Tab */}
        {activeTab === 'find' && (
          <FindFriendsTab
            currentUserNetworkCode={currentUserNetworkCode}
            onNetworkAdded={loadNetworkData}
          />
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="h-[600px] bg-black rounded-lg overflow-hidden thin-border">
            <TerminalActivityFeed
              onUsernameClick={(userId, username) => {
                router.push(`/profile/${userId}`);
              }}
            />
          </div>
        )}
      </div>

      {/* Add Network Modal */}
      {showAddModal && (
        <AddNetworkModal
          onClose={() => setShowAddModal(false)}
          onNetworkAdded={() => {
            loadNetworkData();
            setShowAddModal(false);
          }}
          currentUserNetworkCode={currentUserNetworkCode}
        />
      )}
    </div>
  );
}

