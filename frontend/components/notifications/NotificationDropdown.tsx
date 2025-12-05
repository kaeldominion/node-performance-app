'use client';

import { useState, useEffect } from 'react';
import { notificationsApi } from '@/lib/api';
import { NotificationItem } from './NotificationItem';
import { Icons } from '@/lib/iconMapping';

interface NotificationDropdownProps {
  onClose: () => void;
  onNotificationRead?: () => void;
}

export function NotificationDropdown({ onClose, onNotificationRead }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsApi.getAll();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      await loadNotifications();
      if (onNotificationRead) {
        onNotificationRead();
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      await loadNotifications();
      if (onNotificationRead) {
        onNotificationRead();
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationsApi.delete(notificationId);
      await loadNotifications();
      if (onNotificationRead) {
        onNotificationRead();
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  return (
    <div 
      className="absolute right-0 mt-2 w-96 bg-panel/95 backdrop-blur-md thin-border rounded-lg shadow-2xl shadow-black/50 z-50 max-h-[600px] flex flex-col animate-slide-in"
      style={{
        animation: 'slideInFromTop 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <style jsx>{`
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b thin-border bg-gradient-to-r from-panel to-panel/80">
        <h3 className="font-bold text-text-white" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 text-sm text-node-volt animate-pulse">({unreadCount})</span>
          )}
        </h3>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-node-volt hover:underline transition-all hover:scale-105"
            >
              Mark all read
            </button>
          )}
          <button 
            onClick={onClose} 
            className="text-muted-text hover:text-text-white transition-all hover:scale-110 p-1 rounded hover:bg-dark/50"
          >
            <Icons.X size={16} />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="p-4 text-center text-muted-text">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-text">
            <Icons.BELL 
              size={32} 
              className="mx-auto mb-2 opacity-50 animate-pulse" 
            />
            <p className="text-sm">No notifications</p>
            <p className="text-xs mt-2 opacity-70">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-border-dark">
            {notifications.map((notification, index) => (
              <div
                key={notification.id}
                style={{
                  animation: `slideInFromRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.05}s both`,
                }}
              >
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

