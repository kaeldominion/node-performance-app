'use client';

import { useEffect, useState } from 'react';
import { Icons } from '@/lib/iconMapping';

interface Activity {
  id: number;
  type: 'workout' | 'xp' | 'connection';
  user: string;
  message: string;
  time: string;
  icon: any;
}

export function NetworkActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Generate mock activities
    const mockActivities: Activity[] = [
      {
        id: 1,
        type: 'workout',
        user: 'Alex',
        message: 'just completed PR1ME',
        time: '2m ago',
        icon: Icons.PR1ME,
      },
      {
        id: 2,
        type: 'xp',
        user: 'Jordan',
        message: 'reached Level 15',
        time: '5m ago',
        icon: Icons.CELEBRATION,
      },
      {
        id: 3,
        type: 'connection',
        user: 'Sam',
        message: 'connected with Taylor',
        time: '8m ago',
        icon: Icons.USERS,
      },
      {
        id: 4,
        type: 'workout',
        user: 'Morgan',
        message: 'finished FORGE',
        time: '12m ago',
        icon: Icons.FORGE,
      },
      {
        id: 5,
        type: 'xp',
        user: 'Casey',
        message: 'leveled up to Level 22',
        time: '15m ago',
        icon: Icons.CELEBRATION,
      },
      {
        id: 6,
        type: 'workout',
        user: 'Riley',
        message: 'completed ENGIN3',
        time: '18m ago',
        icon: Icons.ENGIN3,
      },
      {
        id: 7,
        type: 'connection',
        user: 'Quinn',
        message: 'added Avery to network',
        time: '22m ago',
        icon: Icons.USERS,
      },
      {
        id: 8,
        type: 'workout',
        user: 'Blake',
        message: 'finished CIRCUIT_X',
        time: '25m ago',
        icon: Icons.CIRCUIT_X,
      },
    ];

    setActivities(mockActivities);

    // Simulate new activities appearing
    const interval = setInterval(() => {
      const newActivity: Activity = {
        id: Date.now(),
        type: ['workout', 'xp', 'connection'][Math.floor(Math.random() * 3)] as any,
        user: ['Alex', 'Jordan', 'Sam', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn'][Math.floor(Math.random() * 8)],
        message: [
          'just completed PR1ME',
          'finished FORGE',
          'reached Level 15',
          'leveled up to Level 22',
          'connected with Taylor',
          'added Avery to network',
        ][Math.floor(Math.random() * 6)],
        time: 'just now',
        icon: Icons.PR1ME,
      };

      setActivities((prev) => [newActivity, ...prev.slice(0, 7)]);
    }, 8000); // New activity every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'workout':
        return Icons.PR1ME;
      case 'xp':
        return Icons.CELEBRATION;
      case 'connection':
        return Icons.USERS;
      default:
        return Icons.USERS;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'workout':
        return 'text-node-volt';
      case 'xp':
        return 'text-yellow-400';
      case 'connection':
        return 'text-blue-400';
      default:
        return 'text-node-volt';
    }
  };

  return (
    <div className="space-y-3 h-[400px] overflow-y-auto pr-2">
      {activities.map((activity) => {
        const Icon = getActivityIcon(activity.type);
        const colorClass = getActivityColor(activity.type);

        return (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 bg-dark/40 thin-border rounded-lg hover:bg-dark/60 transition-all group animate-fade-in"
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-node-volt/10 border border-node-volt/30 flex items-center justify-center ${colorClass}`}>
              <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-text-white text-sm">{activity.user}</span>
                <span className="text-muted-text text-xs">{activity.message}</span>
              </div>
              <div className="text-xs text-muted-text">{activity.time}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

