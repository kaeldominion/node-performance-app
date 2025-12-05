'use client';

import { useState, useEffect, useRef } from 'react';
import { activityApi } from '@/lib/api';
import { Icons } from '@/lib/iconMapping';
import { useTheme } from '@/contexts/ThemeContext';

interface ActivityLog {
  id: string;
  userId: string | null;
  type: string;
  message: string;
  metadata: any;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    username: string | null;
    level: number;
    xp: number;
  } | null;
}

interface TerminalActivityFeedProps {
  paused?: boolean;
  onPauseChange?: (paused: boolean) => void;
  onUsernameClick?: (userId: string, username: string) => void;
  className?: string;
  friendIds?: string[]; // Array of friend user IDs for filtering
  showFriendFilter?: boolean; // Show friends/all filter tabs
}

export function TerminalActivityFeed({
  paused: externalPaused,
  onPauseChange,
  onUsernameClick,
  className = '',
  friendIds = [],
  showFriendFilter = false,
}: TerminalActivityFeedProps) {
  const { theme } = useTheme();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [internalPaused, setInternalPaused] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [friendFilter, setFriendFilter] = useState<'all' | 'friends' | 'non-friends'>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastActivityIdRef = useRef<string | null>(null);

  const paused = externalPaused !== undefined ? externalPaused : internalPaused;
  const isDark = theme === 'dark';

  useEffect(() => {
    loadActivities();
    const interval = setInterval(() => {
      if (!paused) {
        loadActivities(true); // Only fetch new activities
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [paused]);

  const loadActivities = async (onlyNew = false) => {
    try {
      setError(null);
      const data = await activityApi.getRecent(50);
      const newActivities = Array.isArray(data) ? data : data.activities || [];

      if (onlyNew && lastActivityIdRef.current) {
        // Only add new activities that don't already exist
        setActivities((prev) => {
          const existingIds = new Set(prev.map(a => a.id));
          const newOnes = newActivities.filter(
            (activity: ActivityLog) => !existingIds.has(activity.id),
          );
          if (newOnes.length > 0) {
            const combined = [...newOnes, ...prev];
            // Deduplicate by ID to ensure no duplicates
            const unique = combined.reduce((acc, activity) => {
              if (!acc.find(a => a.id === activity.id)) {
                acc.push(activity);
              }
              return acc;
            }, [] as ActivityLog[]);
            return unique.slice(0, 100); // Keep max 100 items
          }
          return prev;
        });
        if (newActivities.length > 0) {
          lastActivityIdRef.current = newActivities[0]?.id || null;
        }
      } else {
        // Deduplicate activities by ID
        const unique = newActivities.reduce((acc, activity) => {
          if (!acc.find(a => a.id === activity.id)) {
            acc.push(activity);
          }
          return acc;
        }, [] as ActivityLog[]);
        setActivities(unique);
        if (unique.length > 0) {
          lastActivityIdRef.current = unique[0].id;
        }
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Failed to load activities:', err);
      setError(err.message || 'Failed to load activity feed');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-scroll to bottom when new activities arrive
    if (scrollContainerRef.current && !paused) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [activities, paused]);

  const handlePauseToggle = () => {
    const newPaused = !paused;
    if (externalPaused === undefined) {
      setInternalPaused(newPaused);
    }
    if (onPauseChange) {
      onPauseChange(newPaused);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatMessage = (message: string) => {
    // Extract usernames (format: @username)
    const parts = message.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const username = part.substring(1);
        return (
          <span
            key={index}
            className={`cursor-pointer hover:underline ${
              isDark 
                ? 'text-yellow-400 hover:text-yellow-300' 
                : 'text-yellow-600 hover:text-yellow-700'
            }`}
            onClick={() => {
              const activity = activities.find((a) => a.message === message);
              if (activity?.user && onUsernameClick) {
                onUsernameClick(activity.user.id, username);
              }
            }}
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const getActivityIcon = (type: string) => {
    const getColor = (light: string, dark: string) => isDark ? dark : light;
    
    switch (type) {
      case 'USER_REGISTERED':
        return <Icons.USER_PLUS size={14} className={getColor('text-green-600', 'text-green-400')} />;
      case 'USER_LEVEL_UP':
        return <Icons.CELEBRATION size={14} className={getColor('text-purple-600', 'text-purple-400')} />;
      case 'WORKOUT_CREATED':
        return <Icons.WORKOUT size={14} className={getColor('text-blue-600', 'text-blue-400')} />;
      case 'SESSION_STARTED':
        return <Icons.PLAY size={14} className={getColor('text-blue-500', 'text-cyan-400')} />;
      case 'SESSION_COMPLETED':
        return <Icons.CHECK size={14} className={getColor('text-green-600', 'text-green-400')} />;
      case 'NETWORK_CONNECTED':
        return <Icons.USERS size={14} className={getColor('text-yellow-600', 'text-yellow-400')} />;
      case 'PROGRAM_STARTED':
        return <Icons.CLIPBOARD_LIST size={14} className={getColor('text-purple-600', 'text-purple-400')} />;
      default:
        return <span className={getColor('text-blue-500', 'text-cyan-400')}>•</span>;
    }
  };

  const filteredActivities = activities.filter((activity) => {
    // Filter by activity type
    if (filter !== 'all' && activity.type !== filter) {
      return false;
    }

    // Filter by friends/non-friends
    if (showFriendFilter && friendIds.length > 0) {
      if (friendFilter === 'friends' && (!activity.userId || !friendIds.includes(activity.userId))) {
        return false;
      }
      if (friendFilter === 'non-friends' && (activity.userId && friendIds.includes(activity.userId))) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Terminal Header */}
      <div className={`flex flex-col gap-2 p-3 border-b ${
        isDark 
          ? 'bg-black/50 border-cyan-500/30' 
          : 'bg-gray-200/90 border-blue-500/50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className={`text-sm font-mono ${isDark ? 'text-green-400' : 'text-blue-600'}`}>
              activity_feed.log
            </span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`border text-xs px-2 py-1 rounded font-mono focus:outline-none ${
                isDark
                  ? 'bg-black/50 border-cyan-500/30 text-cyan-400 focus:border-cyan-400'
                  : 'bg-white/80 border-blue-500/40 text-blue-700 focus:border-blue-600'
              }`}
            >
              <option value="all">All Types</option>
              <option value="USER_REGISTERED">Users</option>
              <option value="WORKOUT_CREATED">Workouts</option>
              <option value="SESSION_STARTED">Sessions</option>
              <option value="SESSION_COMPLETED">Completions</option>
              <option value="NETWORK_CONNECTED">Network</option>
              <option value="USER_LEVEL_UP">Level Ups</option>
            </select>
            <button
              onClick={handlePauseToggle}
              className={`px-3 py-1 border text-xs rounded font-mono transition-colors ${
                isDark
                  ? 'bg-black/50 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400'
                  : 'bg-white/80 border-blue-500/40 text-blue-700 hover:bg-blue-100 hover:border-blue-600'
              }`}
            >
              {paused ? '▶ Resume' : '⏸ Pause'}
            </button>
          </div>
        </div>
        {showFriendFilter && (
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>
              Filter:
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setFriendFilter('all')}
                className={`px-3 py-1 text-xs rounded font-mono transition-colors ${
                  friendFilter === 'all'
                    ? isDark
                      ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-400'
                      : 'bg-blue-100 border border-blue-600 text-blue-700'
                    : isDark
                      ? 'bg-black/50 border border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10'
                      : 'bg-white/80 border border-blue-500/40 text-blue-600 hover:bg-blue-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFriendFilter('friends')}
                className={`px-3 py-1 text-xs rounded font-mono transition-colors ${
                  friendFilter === 'friends'
                    ? isDark
                      ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-400'
                      : 'bg-blue-100 border border-blue-600 text-blue-700'
                    : isDark
                      ? 'bg-black/50 border border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10'
                      : 'bg-white/80 border border-blue-500/40 text-blue-600 hover:bg-blue-50'
                }`}
              >
                Friends
              </button>
              <button
                onClick={() => setFriendFilter('non-friends')}
                className={`px-3 py-1 text-xs rounded font-mono transition-colors ${
                  friendFilter === 'non-friends'
                    ? isDark
                      ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-400'
                      : 'bg-blue-100 border border-blue-600 text-blue-700'
                    : isDark
                      ? 'bg-black/50 border border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10'
                      : 'bg-white/80 border border-blue-500/40 text-blue-600 hover:bg-blue-50'
                }`}
              >
                Others
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Terminal Content */}
      <div
        ref={scrollContainerRef}
        className={`flex-1 overflow-y-auto font-mono text-sm p-4 ${
          isDark ? 'bg-black text-green-400' : 'bg-gray-100 text-green-700'
        }`}
        style={{
          fontFamily: "'Courier New', 'Monaco', 'Consolas', monospace",
          scrollBehavior: 'smooth',
        }}
      >
        {loading && activities.length === 0 ? (
          <div className={isDark ? 'text-green-400' : 'text-blue-600'}>
            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>$ </span>
            <span className="animate-pulse">Loading activity feed...</span>
          </div>
        ) : error ? (
          <div className={isDark ? 'text-red-400' : 'text-red-600'}>
            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>$ </span>
            <span>Error: {error}</span>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className={isDark ? 'text-gray-500' : 'text-gray-400'}>
            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>$ </span>
            <span>No activity to display</span>
          </div>
        ) : (
          filteredActivities.map((activity, index) => (
            <div
              key={activity.id}
              className={`mb-1 flex items-start gap-2 transition-colors py-1 px-2 rounded ${
                isDark ? 'hover:bg-black/30' : 'hover:bg-gray-200'
              }`}
              style={{
                animation: `fadeIn 0.3s ease-in ${index * 0.02}s both`,
              }}
            >
              <span className={`flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                [{formatTime(activity.createdAt)}]
              </span>
              <span className={`flex-shrink-0 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>$</span>
              <span className="flex items-center gap-2 flex-1">
                <span className="flex-shrink-0">{getActivityIcon(activity.type)}</span>
                <span className="flex-1">{formatMessage(activity.message)}</span>
              </span>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

