'use client';

import { useState, useEffect } from 'react';
import { networkApi } from '@/lib/api';
import { Icons } from '@/lib/iconMapping';
import { ShowQRCodeModal } from './ShowQRCodeModal';
import dynamic from 'next/dynamic';

const QRCodeSVG = dynamic(() => import('qrcode.react').then((mod) => mod.QRCodeSVG), {
  ssr: false,
});

interface AddNetworkModalProps {
  onClose: () => void;
  onNetworkAdded?: () => void;
  currentUserNetworkCode?: string;
}

export function AddNetworkModal({ onClose, onNetworkAdded, currentUserNetworkCode }: AddNetworkModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'qr'>('search');
  const [networkCode, setNetworkCode] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    loadPendingRequests();
    if (currentUserNetworkCode) {
      setNetworkCode(currentUserNetworkCode);
    } else {
      generateNetworkCode();
    }
  }, [currentUserNetworkCode]);

  const generateNetworkCode = async () => {
    try {
      setIsGeneratingCode(true);
      const result = await networkApi.generateCode();
      setNetworkCode(result.networkCode);
    } catch (error) {
      console.error('Failed to generate network code:', error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const loadPendingRequests = async () => {
    try {
      const requests = await networkApi.getPending();
      setPendingRequests(requests);
    } catch (error) {
      console.error('Failed to load pending requests:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      const results = await networkApi.search(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchByCode = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      const user = await networkApi.searchByCode(searchQuery.trim().toUpperCase());
      setSearchResults([user]);
    } catch (error: any) {
      alert(error.response?.data?.message || 'User not found with this code');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddNetwork = async (userId: string) => {
    try {
      await networkApi.sendRequest(userId);
      alert('Network request sent!');
      if (onNetworkAdded) {
        onNetworkAdded();
      }
      setSearchQuery('');
      setSearchResults([]);
      loadPendingRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send network request');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await networkApi.acceptRequest(requestId);
      alert('Network request accepted!');
      if (onNetworkAdded) {
        onNetworkAdded();
      }
      loadPendingRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to accept network request');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-panel thin-border rounded-lg max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Add to Network
          </h2>
          <button onClick={onClose} className="text-muted-text hover:text-text-white">
            <Icons.X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b thin-border">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'search'
                ? 'border-node-volt text-node-volt'
                : 'border-transparent text-muted-text hover:text-text-white'
            }`}
          >
            Search
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'qr'
                ? 'border-node-volt text-node-volt'
                : 'border-transparent text-muted-text hover:text-text-white'
            }`}
          >
            QR Code
          </button>
        </div>

        {/* Show My QR Code Button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setShowQRModal(true)}
            className="px-4 py-2 bg-node-volt/10 border border-node-volt/30 text-node-volt font-medium rounded-lg hover:bg-node-volt/20 transition-colors flex items-center gap-2 text-sm"
          >
            <Icons.SHARE size={16} />
            Show My QR Code
          </button>
        </div>

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    // Check if it looks like a network code (starts with NT and is uppercase)
                    if (/^NT[A-Z0-9]+$/.test(searchQuery.trim().toUpperCase())) {
                      handleSearchByCode();
                    } else {
                      handleSearch();
                    }
                  }
                }}
                placeholder="Search by username, email, or network code (NT...)"
                className="flex-1 bg-dark thin-border rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
              />
              <button
                onClick={() => {
                  if (/^NT[A-Z0-9]+$/.test(searchQuery.trim().toUpperCase())) {
                    handleSearchByCode();
                  } else {
                    handleSearch();
                  }
                }}
                disabled={isSearching || !searchQuery.trim()}
                className="bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between bg-dark thin-border rounded-lg p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-node-volt/20 border border-node-volt flex items-center justify-center text-sm font-bold text-node-volt">
                        {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-text-white">{user.name || user.email}</div>
                        {user.name && <div className="text-xs text-muted-text">{user.email}</div>}
                        <div className="text-xs text-node-volt mt-1">
                          Level {user.level} • {user.xp?.toLocaleString() || 0} XP
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddNetwork(user.id)}
                      className="bg-node-volt text-dark font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm"
                    >
                      Add to Network
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Pending Network Requests
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
                          <div className="font-medium text-text-white">
                            {request.requester.name || request.requester.email}
                          </div>
                          {request.requester.name && (
                            <div className="text-xs text-muted-text">{request.requester.email}</div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="bg-node-volt text-dark font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm"
                      >
                        Accept
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* QR Code Tab */}
        {activeTab === 'qr' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-muted-text mb-4">
                Share your network code or scan someone else's QR code
              </p>
              
              {networkCode ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <QRCodeSVG value={networkCode} size={200} />
                  </div>
                  <div className="bg-dark thin-border rounded-lg p-4">
                    <div className="text-sm text-muted-text mb-1">Your Network Code</div>
                    <div className="text-2xl font-bold text-node-volt font-mono">{networkCode}</div>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(networkCode);
                      alert('Network code copied to clipboard!');
                    }}
                    className="text-node-volt hover:underline text-sm"
                  >
                    Copy Code
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  {isGeneratingCode ? (
                    <div className="text-muted-text">Generating code...</div>
                  ) : (
                    <button
                      onClick={generateNetworkCode}
                      className="bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Generate Network Code
                    </button>
                  )}
                </div>
              )}

              <div className="mt-6">
                <label className="block text-sm font-medium mb-2 text-muted-text">
                  Enter Network Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchByCode();
                      }
                    }}
                    placeholder="FR..."
                    className="flex-1 bg-dark thin-border rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt font-mono uppercase"
                  />
                  <button
                    onClick={handleSearchByCode}
                    disabled={isSearching || !searchQuery.trim()}
                    className="bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isSearching ? 'Searching...' : 'Add'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Show QR Code Modal */}
      {showQRModal && (
        <ShowQRCodeModal
          onClose={() => setShowQRModal(false)}
          currentUserNetworkCode={currentUserNetworkCode || networkCode || undefined}
        />
      )}
    </div>
  );
}

