'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { networkApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { AddNetworkModal } from '@/components/network/AddNetworkModal';
import { Icons } from '@/lib/iconMapping';

export default function ConnectPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const code = params?.code as string;
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (code && user) {
      loadUserData();
    }
  }, [code, user, authLoading]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if it's a network code (starts with NT) or user ID
      if (code.startsWith('NT')) {
        const user = await networkApi.searchByCode(code);
        setUserData(user);
      } else {
        // Try as user ID - we'll need to add an endpoint for this or use search
        // For now, try searching by code first
        try {
          const user = await networkApi.searchByCode(code);
          setUserData(user);
        } catch (err) {
          // If not found, it might be a user ID
          // We could add a new endpoint to search by user ID
          setError('User not found. Please check the link and try again.');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'User not found. Please check the link and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToNetwork = async () => {
    if (!userData) return;

    try {
      await networkApi.sendRequest(userData.id);
      alert('Network request sent!');
      router.push('/network');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send network request');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-muted-text">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-deep-asphalt">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error ? (
          <div className="bg-panel thin-border rounded-lg p-8 text-center">
            <Icons.X size={48} className="mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-2 text-text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Connection Not Found
            </h2>
            <p className="text-muted-text mb-6">{error}</p>
            <button
              onClick={() => router.push('/network')}
              className="bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Go to Network
            </button>
          </div>
        ) : userData ? (
          <div className="bg-panel thin-border rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Connect with {userData.name || userData.email}
            </h2>

            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-node-volt/20 border border-node-volt flex items-center justify-center text-2xl font-bold text-node-volt">
                  {userData.name?.charAt(0).toUpperCase() || userData.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-text-white text-lg" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {userData.name || userData.email}
                  </div>
                  {userData.username && (
                    <div className="text-sm text-node-volt">@{userData.username}</div>
                  )}
                  {userData.name && (
                    <div className="text-sm text-muted-text">{userData.email}</div>
                  )}
                  <div className="text-sm text-node-volt mt-1">
                    Level {userData.level} • {userData.xp?.toLocaleString() || 0} XP
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToNetwork}
                  className="flex-1 bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Icons.PLUS size={20} />
                  Add to Network
                </button>
                <button
                  onClick={() => router.push('/network')}
                  className="bg-dark thin-border text-text-white font-bold px-6 py-3 rounded-lg hover:bg-concrete-grey transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-text">Loading user data...</div>
        )}
      </div>

      {/* Add Network Modal (fallback) */}
      {showAddModal && (
        <AddNetworkModal
          onClose={() => setShowAddModal(false)}
          onNetworkAdded={() => {
            router.push('/network');
          }}
        />
      )}
    </div>
  );
}

