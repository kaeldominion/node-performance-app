'use client';

import { Icons } from '@/lib/iconMapping';
import { networkApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface NotificationItemProps {
  notification: any;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const router = useRouter();
  const isUnread = !notification.read;

  const getNotificationMessage = () => {
    switch (notification.type) {
      case 'NETWORK_REQUEST':
        return 'sent you a network request';
      case 'NETWORK_ACCEPTED':
        return 'accepted your network request';
      case 'NETWORK_REJECTED':
        return 'rejected your network request';
      case 'FRIEND_WORKOUT_STARTED':
        return 'started a workout';
      case 'FRIEND_WORKOUT_COMPLETED':
        return 'completed a workout';
      case 'FRIEND_WORKOUT_CREATED':
        return 'created a new workout';
      case 'FRIEND_STATS_IMPROVED':
        return 'achieved a new personal record';
      case 'FRIEND_LEVEL_UP':
        return 'leveled up';
      case 'FRIEND_LEADERBOARD_ENTRY':
        return 'entered the leaderboard';
      default:
        return 'has a notification for you';
    }
  };

  const handleClick = async () => {
    if (isUnread) {
      await onMarkAsRead(notification.id);
    }
    // Navigate to network page
    router.push('/network');
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now.getTime() - notificationDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notificationDate.toLocaleDateString();
  };

  const getNotificationColor = () => {
    switch (notification.type) {
      case 'NETWORK_REQUEST':
        return 'border-node-volt bg-node-volt/10';
      case 'NETWORK_ACCEPTED':
        return 'border-green-500 bg-green-500/10';
      case 'NETWORK_REJECTED':
        return 'border-red-500 bg-red-500/10';
      case 'FRIEND_WORKOUT_STARTED':
      case 'FRIEND_WORKOUT_COMPLETED':
      case 'FRIEND_WORKOUT_CREATED':
        return 'border-blue-500 bg-blue-500/10';
      case 'FRIEND_STATS_IMPROVED':
      case 'FRIEND_LEVEL_UP':
        return 'border-purple-500 bg-purple-500/10';
      default:
        return 'border-node-volt bg-node-volt/5';
    }
  };

  return (
    <div
      className={`p-4 hover:bg-dark/50 transition-all duration-200 cursor-pointer group ${
        isUnread ? `${getNotificationColor()} border-l-4` : 'border-l-4 border-transparent'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-110 ${
          notification.type === 'NETWORK_REQUEST' ? 'bg-node-volt/20 group-hover:bg-node-volt/30' :
          notification.type === 'NETWORK_ACCEPTED' ? 'bg-green-500/20 group-hover:bg-green-500/30' :
          notification.type === 'NETWORK_REJECTED' ? 'bg-red-500/20 group-hover:bg-red-500/30' :
          'bg-blue-500/20 group-hover:bg-blue-500/30'
        }`}>
          {notification.type === 'NETWORK_REQUEST' && <Icons.USER_PLUS size={18} className="text-node-volt" />}
          {notification.type === 'NETWORK_ACCEPTED' && <Icons.CHECK size={18} className="text-green-500" />}
          {notification.type === 'NETWORK_REJECTED' && <Icons.X size={18} className="text-red-500" />}
          {(notification.type === 'FRIEND_WORKOUT_STARTED' || notification.type === 'FRIEND_WORKOUT_COMPLETED' || notification.type === 'FRIEND_WORKOUT_CREATED') && (
            <Icons.SESSIONS size={18} className="text-blue-500" />
          )}
          {(notification.type === 'FRIEND_STATS_IMPROVED' || notification.type === 'FRIEND_LEVEL_UP') && (
            <Icons.CELEBRATION size={18} className="text-purple-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-white leading-relaxed">
            <span className="font-bold text-node-volt">Someone</span> {getNotificationMessage()}
          </p>
          <p className="text-xs text-muted-text mt-1.5 flex items-center gap-1">
            <span>{formatTime(notification.createdAt)}</span>
            {isUnread && (
              <span className="w-1.5 h-1.5 bg-node-volt rounded-full animate-pulse"></span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="text-muted-text hover:text-red-500 transition-all duration-200 hover:scale-110 p-1.5 rounded hover:bg-red-500/10"
          >
            <Icons.X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

