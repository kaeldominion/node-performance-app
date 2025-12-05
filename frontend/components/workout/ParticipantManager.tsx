'use client';

import { useState } from 'react';
import { Icons } from '@/lib/iconMapping';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface Participant {
  id?: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  isSignedUp: boolean;
}

interface ParticipantManagerProps {
  participants: Participant[];
  onAdd: (participant: Participant) => void;
  onRemove: (index: number) => void;
  onSearch?: (query: string) => Promise<Participant[]>;
}

export function ParticipantManager({
  participants,
  onAdd,
  onRemove,
  onSearch,
}: ParticipantManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Participant[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const { config } = useResponsiveLayout();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      if (onSearch) {
        const results = await onSearch(searchQuery);
        setSearchResults(results);
      } else {
        // Fallback: create participant from search query
        const emailMatch = searchQuery.match(/[\w\.-]+@[\w\.-]+\.\w+/);
        const email = emailMatch ? emailMatch[0] : undefined;
        const name = email ? searchQuery.replace(email, '').trim() || email.split('@')[0] : searchQuery.trim();
        
        if (!participants.some(p => p.email === email || p.name.toLowerCase() === name.toLowerCase())) {
          setSearchResults([{
            name,
            email,
            isSignedUp: false,
          }]);
        } else {
          setSearchResults([]);
        }
      }
    } catch (error) {
      console.error('Failed to search:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddParticipant = (participant: Participant) => {
    onAdd(participant);
    setSearchQuery('');
    setSearchResults([]);
    setShowAddModal(false);
  };

  return (
    <>
      {/* Participants Display */}
      {participants.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {participants.map((p, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-panel/90 backdrop-blur-sm thin-border rounded-lg px-3 py-1.5"
            >
              {p.avatarUrl ? (
                <img src={p.avatarUrl} alt={p.name} className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-node-volt/20 border border-node-volt flex items-center justify-center text-xs font-bold text-node-volt">
                  {p.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium">{p.name}</span>
              <button
                onClick={() => onRemove(idx)}
                className="text-muted-text hover:text-text-white transition-colors"
                style={{ minWidth: config.touchTargetSize, minHeight: config.touchTargetSize }}
              >
                <Icons.X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Button - NØDE Branded */}
      <button
        onClick={() => setShowAddModal(true)}
        className="bg-node-volt text-dark font-bold px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium flex items-center gap-2 shadow-lg shadow-node-volt/20"
        style={{
          fontFamily: 'var(--font-space-grotesk)',
          minWidth: config.touchTargetSize,
          minHeight: config.touchTargetSize,
        }}
      >
        <Icons.USER_PLUS size={18} />
        <span>Add People</span>
      </button>

      {/* Add Participant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-panel thin-border rounded-lg max-w-md w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Add Participants
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="text-muted-text hover:text-text-white transition-colors"
              >
                <Icons.X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter name or email"
                  className="flex-1 bg-dark thin-border rounded-lg px-4 py-2 text-text-white focus:outline-none focus:border-node-volt"
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className="bg-node-volt text-dark font-bold px-6 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSearching ? '...' : 'Search'}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAddParticipant(result)}
                      className="w-full text-left bg-dark thin-border rounded-lg p-3 hover:bg-panel transition-colors flex items-center gap-3"
                    >
                      {result.avatarUrl ? (
                        <img src={result.avatarUrl} alt={result.name} className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-node-volt/20 border border-node-volt flex items-center justify-center text-sm font-bold text-node-volt">
                          {result.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{result.name}</div>
                        {result.email && <div className="text-xs text-muted-text">{result.email}</div>}
                      </div>
                      <Icons.PLUS size={20} className="text-node-volt" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

