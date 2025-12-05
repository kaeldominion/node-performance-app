'use client';

import { useState, useEffect } from 'react';
import { networkApi, analyticsApi } from '@/lib/api';
import { Icons } from '@/lib/iconMapping';
import { AddNetworkModal } from './AddNetworkModal';

interface FindFriendsTabProps {
  currentUserNetworkCode?: string;
  onNetworkAdded?: () => void;
}

export function FindFriendsTab({ currentUserNetworkCode, onNetworkAdded }: FindFriendsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [directoryUsers, setDirectoryUsers] = useState<any[]>([]);
  const [directoryPage, setDirectoryPage] = useState(1);
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const [directoryPagination, setDirectoryPagination] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [activeView, setActiveView] = useState<'search' | 'directory' | 'leaderboard'>('search');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    if (activeView === 'directory') {
      loadDirectory();
    } else if (activeView === 'leaderboard') {
      loadLeaderboard();
    }
  }, [activeView, directoryPage]);

  const loadDirectory = async () => {
    try {
      setDirectoryLoading(true);
      const data = await networkApi.getDirectory({
        page: directoryPage,
        limit: 20,
      });
      setDirectoryUsers(data.users);
      setDirectoryPagination(data.pagination);
    } catch (error) {
      console.error('Failed to load directory:', error);
    } finally {
      setDirectoryLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      setLeaderboardLoading(true);
      const data = await analyticsApi.getLeaderboard('sessions', 50);
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      // Check if it's a username (starts with @)
      if (searchQuery.startsWith('@')) {
        const username = searchQuery.substring(1);
        try {
          const user = await networkApi.searchByUsername(username);
          setSearchResults([user]);
        } catch (error: any) {
          alert(error.response?.data?.message || 'User not found');
          setSearchResults([]);
        }
      } else if (/^NT[A-Z0-9]+$/.test(searchQuery.trim().toUpperCase())) {
        // Network code
        const user = await networkApi.searchByCode(searchQuery.trim().toUpperCase());
        setSearchResults([user]);
      } else {
        // Regular search
        const results = await networkApi.search(searchQuery);
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Failed to search:', error);
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
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send network request');
    }
  };

  const getConnectionStatus = (user: any) => {
    if (user.connectionStatus === 'ACCEPTED') return 'Connected';
    if (user.connectionStatus === 'PENDING') return 'Pending';
    return null;
  };

  const renderUserCard = (user: any, showAddButton: boolean = true) => {
    const status = getConnectionStatus(user);
    return (
      <div
        key={user.id}
        className="flex items-center justify-between bg-panel thin-border rounded-lg p-4 hover:border-node-volt transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-node-volt/20 border border-node-volt flex items-center justify-center text-sm font-bold text-node-volt">
            {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-text-white">{user.name || user.email}</div>
            {user.username && (
              <div className="text-xs text-node-volt">@{user.username}</div>
            )}
            {user.name && <div className="text-xs text-muted-text">{user.email}</div>}
            <div className="text-xs text-node-volt mt-1">
              Level {user.level} • {user.xp?.toLocaleString() || 0} XP
            </div>
          </div>
        </div>
        {showAddButton && (
          <div className="flex items-center gap-2">
            {status && (
              <span className="text-xs text-muted-text px-2 py-1 bg-dark rounded">
                {status}
              </span>
            )}
            {!status && (
              <button
                onClick={() => handleAddNetwork(user.id)}
                className="bg-node-volt text-dark font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm"
              >
                Add to Network
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* View Selector */}
      <div className="flex gap-2 border-b thin-border">
        <button
          onClick={() => setActiveView('search')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeView === 'search'
              ? 'border-node-volt text-node-volt'
              : 'border-transparent text-muted-text hover:text-text-white'
          }`}
        >
          Search
        </button>
        <button
          onClick={() => setActiveView('directory')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeView === 'directory'
              ? 'border-node-volt text-node-volt'
              : 'border-transparent text-muted-text hover:text-text-white'
          }`}
        >
          Directory
        </button>
        <button
          onClick={() => setActiveView('leaderboard')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeView === 'leaderboard'
              ? 'border-node-volt text-node-volt'
              : 'border-transparent text-muted-text hover:text-text-white'
          }`}
        >
          Leaderboard
        </button>
      </div>

      {/* Search View */}
      {activeView === 'search' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              placeholder="Search by username (@username), network code (NT...), email, or name"
              className="flex-1 bg-dark thin-border rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((user) => renderUserCard(user))}
            </div>
          )}
        </div>
      )}

      {/* Directory View */}
      {activeView === 'directory' && (
        <div className="space-y-4">
          {directoryLoading ? (
            <div className="text-center py-8 text-muted-text">Loading directory...</div>
          ) : directoryUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-text">No users found</div>
          ) : (
            <>
              <div className="space-y-2">
                {directoryUsers.map((user) => renderUserCard(user))}
              </div>
              {directoryPagination && directoryPagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setDirectoryPage(Math.max(1, directoryPage - 1))}
                    disabled={directoryPage === 1}
                    className="bg-dark thin-border text-text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-muted-text">
                    Page {directoryPage} of {directoryPagination.totalPages}
                  </span>
                  <button
                    onClick={() => setDirectoryPage(Math.min(directoryPagination.totalPages, directoryPage + 1))}
                    disabled={directoryPage >= directoryPagination.totalPages}
                    className="bg-dark thin-border text-text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Leaderboard View */}
      {activeView === 'leaderboard' && (
        <div className="space-y-4">
          {leaderboardLoading ? (
            <div className="text-center py-8 text-muted-text">Loading leaderboard...</div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8 text-muted-text">No leaderboard data available</div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry) => {
                const user = {
                  id: entry.userId,
                  name: entry.name,
                  email: entry.email,
                  username: entry.username,
                  level: entry.level || 1,
                  xp: entry.xp || 0,
                  connectionStatus: entry.connectionStatus,
                };
                return renderUserCard(user);
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Network Modal */}
      {showAddModal && (
        <AddNetworkModal
          onClose={() => {
            setShowAddModal(false);
            setSelectedUser(null);
          }}
          onNetworkAdded={() => {
            if (onNetworkAdded) {
              onNetworkAdded();
            }
            setShowAddModal(false);
            setSelectedUser(null);
          }}
          currentUserNetworkCode={currentUserNetworkCode}
        />
      )}
    </div>
  );
}

