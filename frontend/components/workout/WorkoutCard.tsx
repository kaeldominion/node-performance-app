'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { workoutsApi, scheduleApi } from '@/lib/api';
import { Icons } from '@/lib/iconMapping';
import ArchetypeBadge from './ArchetypeBadge';

// ScheduleWorkoutModal component (inline, same as in workouts page)
function ScheduleWorkoutModal({
  workoutId,
  workoutName,
  onClose,
  onSuccess,
}: {
  workoutId: string;
  workoutName: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set default to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const handleSchedule = async () => {
    if (!selectedDate) return;

    try {
      setLoading(true);
      const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}`);
      await scheduleApi.create({
        workoutId,
        scheduledDate: scheduledDateTime.toISOString(),
        duration: 60, // Default 60 minutes
      });
      window.dispatchEvent(new Event('schedule-updated'));
      onSuccess();
    } catch (error) {
      console.error('Failed to schedule workout:', error);
      alert('Failed to schedule workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-panel thin-border rounded-lg max-w-md w-full p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Schedule Workout
          </h2>
          <button
            onClick={onClose}
            className="text-muted-text hover:text-text-white transition-colors"
          >
            <Icons.X size={24} />
          </button>
        </div>
        <div>
          <p className="text-muted-text mb-4">{workoutName}</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-dark thin-border rounded px-4 py-2 text-text-white"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Time</label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full bg-dark thin-border rounded px-4 py-2 text-text-white"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-panel thin-border rounded px-4 py-2 hover:bg-dark transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            disabled={loading || !selectedDate}
            className="flex-1 bg-node-volt text-dark font-bold rounded px-4 py-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Scheduling...' : 'Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface WorkoutCardProps {
  workout: {
    id: string;
    name: string;
    displayCode?: string;
    archetype?: string;
    description?: string;
    sections?: any[];
    averageRating?: number | null;
    ratingCount?: number;
  };
  openMenuId?: string | null;
  setOpenMenuId?: (id: string | null) => void;
  setSelectedWorkoutForSchedule?: (workout: { id: string; name: string } | null) => void;
  setShowScheduleModal?: (show: boolean) => void;
  loadWorkouts?: () => void;
}

export function WorkoutCard({
  workout,
  openMenuId,
  setOpenMenuId,
  setSelectedWorkoutForSchedule,
  setShowScheduleModal,
  loadWorkouts,
}: WorkoutCardProps) {
  const [localOpenMenuId, setLocalOpenMenuId] = useState<string | null>(null);
  const [localShowScheduleModal, setLocalShowScheduleModal] = useState(false);
  const [localSelectedWorkoutForSchedule, setLocalSelectedWorkoutForSchedule] = useState<{ id: string; name: string } | null>(null);

  // Use provided state handlers or local state
  const menuId = openMenuId !== undefined ? openMenuId : localOpenMenuId;
  const setMenuId = setOpenMenuId || setLocalOpenMenuId;

  const handleSchedule = () => {
    const workoutData = { id: workout.id, name: workout.name };
    if (setSelectedWorkoutForSchedule) {
      setSelectedWorkoutForSchedule(workoutData);
    } else {
      setLocalSelectedWorkoutForSchedule(workoutData);
    }
    if (setShowScheduleModal) {
      setShowScheduleModal(true);
    } else {
      setLocalShowScheduleModal(true);
    }
    setMenuId(null);
  };

  const handleShare = async () => {
    setMenuId(null);
    try {
      const shareData = await workoutsApi.generateShareLink(workout.id);
      await navigator.clipboard.writeText(shareData.shareUrl);
      alert('Share link copied to clipboard!');
    } catch (error) {
      console.error('Failed to generate share link:', error);
      alert('Failed to generate share link. Please try again.');
    }
  };

  const handleDelete = async () => {
    setMenuId(null);
    if (confirm('Are you sure you want to delete this workout? This action cannot be undone.')) {
      try {
        await workoutsApi.delete(workout.id);
        if (loadWorkouts) {
          loadWorkouts();
        } else {
          // Trigger a page reload or update
          window.location.reload();
        }
      } catch (error) {
        console.error('Failed to delete workout:', error);
        alert('Failed to delete workout. Please try again.');
      }
    }
  };

  return (
    <>
      <div
        className="group bg-panel thin-border rounded-lg p-6 hover:border-node-volt transition-all hover:shadow-lg hover:shadow-node-volt/20 relative"
      >
        <div className="flex items-start justify-between mb-4">
          <Link href={`/workouts/${workout.id}`} className="flex-1">
            {workout.displayCode && (
              <div className="text-node-volt font-mono text-sm mb-1">
                {workout.displayCode}
              </div>
            )}
            <h3 className="text-xl font-heading font-bold mb-2 group-hover:text-node-volt transition-colors">
              {workout.name}
            </h3>
            {workout.archetype && (
              <ArchetypeBadge archetype={workout.archetype} size="sm" />
            )}
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSchedule();
              }}
              className="opacity-0 group-hover:opacity-100 bg-node-volt/20 hover:bg-node-volt/30 text-node-volt px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1"
              title="Schedule this workout"
            >
              <Icons.TIMER size={14} />
              Schedule
            </button>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuId(menuId === workout.id ? null : workout.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-panel rounded transition-all"
                title="More options"
              >
                <Icons.MORE_VERTICAL size={18} className="text-muted-text" />
              </button>
              {menuId === workout.id && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuId(null)}
                  />
                  <div className="absolute right-0 top-10 z-20 bg-panel thin-border rounded-lg shadow-lg min-w-[160px] overflow-hidden">
                    <button
                      onClick={handleShare}
                      className="w-full text-left px-4 py-2 hover:bg-dark transition-colors flex items-center gap-2 text-sm"
                    >
                      <Icons.SHARE size={16} className="text-muted-text" />
                      Share Workout
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-4 py-2 hover:bg-dark transition-colors flex items-center gap-2 text-sm text-red-400"
                    >
                      <Icons.TRASH size={16} />
                      Delete Workout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        {workout.description && (
          <p className="text-muted-text text-sm mb-4 line-clamp-2">
            {workout.description}
          </p>
        )}
        {workout.averageRating !== null && workout.averageRating !== undefined && workout.ratingCount !== undefined && workout.ratingCount > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Icons.STAR
                  key={i}
                  size={14}
                  className={i < Math.round(workout.averageRating!) ? 'text-yellow-400 fill-current' : 'text-muted-text'}
                />
              ))}
            </div>
            <span className="text-xs text-muted-text">
              {workout.averageRating.toFixed(1)} ({workout.ratingCount} {workout.ratingCount === 1 ? 'rating' : 'ratings'})
            </span>
          </div>
        )}
        <Link href={`/workouts/${workout.id}`}>
          <div className="flex items-center justify-between text-sm text-muted-text">
            <span>{workout.sections?.length || 0} sections</span>
            <span className="text-node-volt font-semibold">Start →</span>
          </div>
        </Link>
      </div>

      {/* Schedule Modal - only show if using local state */}
      {localShowScheduleModal && localSelectedWorkoutForSchedule && (
        <ScheduleWorkoutModal
          workoutId={localSelectedWorkoutForSchedule.id}
          workoutName={localSelectedWorkoutForSchedule.name}
          onClose={() => {
            setLocalShowScheduleModal(false);
            setLocalSelectedWorkoutForSchedule(null);
          }}
          onSuccess={() => {
            setLocalShowScheduleModal(false);
            setLocalSelectedWorkoutForSchedule(null);
            window.dispatchEvent(new Event('schedule-updated'));
            if (loadWorkouts) {
              loadWorkouts();
            }
          }}
        />
      )}
    </>
  );
}

