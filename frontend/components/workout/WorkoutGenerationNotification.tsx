'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkoutGeneration } from '@/contexts/WorkoutGenerationContext';
import { Icons } from '@/lib/iconMapping';

interface Notification {
  id: string;
  workoutId: string;
  workoutName: string;
  generatedAt: Date;
}

export function WorkoutGenerationNotification() {
  const router = useRouter();
  const { unsavedWorkouts, removeUnsavedWorkout } = useWorkoutGeneration();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [visibleNotifications, setVisibleNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Listen for new workout generation events
    const handleWorkoutGenerated = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { generationId, workout } = customEvent.detail || {};
      
      if (!generationId || !workout) {
        console.warn('Workout generation event missing data:', { generationId, hasWorkout: !!workout });
        return;
      }

      // Handle both single workouts and multi-day programs
      let workoutName = 'New Workout';
      if (workout.name) {
        workoutName = workout.name;
      } else if (workout.workouts && Array.isArray(workout.workouts) && workout.workouts.length > 0) {
        workoutName = `${workout.workouts.length}-Day Program`;
      } else if (Array.isArray(workout) && workout.length > 0) {
        workoutName = `${workout.length}-Day Program`;
      }
      
      console.log('🔔 Received workout-generated event:', { generationId, workoutName });
      
      const notification: Notification = {
        id: generationId,
        workoutId: generationId,
        workoutName,
        generatedAt: new Date(),
      };

      setNotifications((prev) => [notification, ...prev].slice(0, 5)); // Keep last 5
      setVisibleNotifications((prev) => new Set([...prev, generationId]));

      // Auto-hide after 30 seconds (increased from 10 seconds)
      setTimeout(() => {
        setVisibleNotifications((prev) => {
          const next = new Set(prev);
          next.delete(generationId);
          return next;
        });
      }, 30000);
    };

    window.addEventListener('workout-generated', handleWorkoutGenerated);

    return () => {
      window.removeEventListener('workout-generated', handleWorkoutGenerated);
    };
  }, []);

  const handleViewWorkout = (notification: Notification) => {
    // Since workouts are now auto-saved, navigate directly to the workouts page
    // The workout should already be in "My Workouts"
    router.push(`/workouts?tab=my-workouts&_t=${Date.now()}`);
    setVisibleNotifications((prev) => {
      const next = new Set(prev);
      next.delete(notification.id);
      return next;
    });
  };

  const handleDismiss = (notificationId: string) => {
    setVisibleNotifications((prev) => {
      const next = new Set(prev);
      next.delete(notificationId);
      return next;
    });
  };

  // Debug: log when component renders and what notifications exist
  useEffect(() => {
    console.log('🔔 WorkoutGenerationNotification render:', {
      totalNotifications: notifications.length,
      visibleCount: visibleNotifications.size,
      visibleIds: Array.from(visibleNotifications),
    });
  }, [notifications, visibleNotifications]);

  if (visibleNotifications.size === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {notifications
        .filter((n) => visibleNotifications.has(n.id))
        .map((notification) => (
          <div
            key={notification.id}
            className="bg-panel/95 backdrop-blur-md thin-border border-node-volt/50 rounded-lg shadow-2xl shadow-black/50 p-4 min-w-[320px] max-w-[400px] animate-slide-in-right"
            style={{
              animation: 'slideInFromRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <style jsx>{`
              @keyframes slideInFromRight {
                from {
                  opacity: 0;
                  transform: translateX(100%);
                }
                to {
                  opacity: 1;
                  transform: translateX(0);
                }
              }
            `}</style>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-node-volt/20 flex items-center justify-center flex-shrink-0">
                <Icons.WORKOUT size={20} className="text-node-volt" />
              </div>
              <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text-white mb-1">
                Workout Ready!
              </p>
              <p className="text-xs text-muted-text mb-1 truncate">
                {notification.workoutName}
              </p>
              <p className="text-xs text-node-volt mb-3">
                Auto-saved to My Workouts
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewWorkout(notification)}
                  className="flex-1 px-3 py-1.5 bg-node-volt text-dark text-xs font-bold rounded hover:bg-node-volt/90 transition-all duration-200 hover:scale-105"
                >
                  View
                </button>
                <button
                  onClick={() => handleDismiss(notification.id)}
                  className="px-3 py-1.5 text-muted-text hover:text-text-white text-xs transition-all duration-200 hover:scale-105"
                >
                  Dismiss
                </button>
              </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}

