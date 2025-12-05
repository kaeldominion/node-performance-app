'use client';

import { useEffect, useState } from 'react';
import { networkApi } from '@/lib/api';
import { Icons } from '@/lib/iconMapping';
import Link from 'next/link';

interface NetworkActivity {
  id: string;
  name: string;
  email: string;
  xp: number;
  level: number;
  totalSessions: number;
  recentSessions: number;
  recentActivity: Array<{
    workoutName: string;
    workoutId: string;
    performedAt: string;
    rpe?: number;
    durationSec?: number;
  }>;
}

export function NetworkActivity() {
  const [network, setNetwork] = useState<NetworkActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNetworkActivity();
  }, []);

  const loadNetworkActivity = async () => {
    try {
      setLoading(true);
      const activity = await networkApi.getActivity();
      setNetwork(activity);
    } catch (error) {
      console.error('Failed to load network activity:', error);
      setNetwork([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-text">Loading network activity...</div>
      </div>
    );
  }

  if (network.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-text mb-4">No network connections yet</p>
        <p className="text-sm text-muted-text">Add to network to see their workout activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {network.map((networkUser) => (
        <div
          key={networkUser.id}
          className="bg-panel thin-border rounded-lg p-4 hover:border-node-volt transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-node-volt/20 border border-node-volt flex items-center justify-center text-sm font-bold text-node-volt">
                {networkUser.name?.charAt(0).toUpperCase() || networkUser.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-text-white">{networkUser.name || networkUser.email}</div>
                <div className="text-xs text-muted-text">
                  Level {networkUser.level} • {networkUser.xp.toLocaleString()} XP
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <div className="text-xs text-muted-text mb-1">Total Workouts</div>
              <div className="text-lg font-bold text-node-volt">{networkUser.totalSessions}</div>
            </div>
            <div>
              <div className="text-xs text-muted-text mb-1">This Week</div>
              <div className="text-lg font-bold text-text-white">{networkUser.recentSessions}</div>
            </div>
          </div>

          {networkUser.recentActivity.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border-dark">
              <div className="text-xs text-muted-text mb-2">Recent Activity</div>
              <div className="space-y-2">
                {networkUser.recentActivity.slice(0, 3).map((activity, idx) => (
                  <Link
                    key={idx}
                    href={`/workouts/${activity.workoutId}`}
                    className="block text-sm hover:text-node-volt transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{activity.workoutName}</span>
                      <span className="text-xs text-muted-text ml-2">
                        {new Date(activity.performedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

