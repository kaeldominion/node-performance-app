'use client';

import { useEffect, useState, useCallback } from 'react';
import { scheduleApi } from '@/lib/api';
import { Icons } from '@/lib/iconMapping';
import Link from 'next/link';
import ArchetypeBadge from '@/components/workout/ArchetypeBadge';

interface ScheduledWorkout {
  id: string;
  scheduledDate: string;
  duration?: number;
  notes?: string;
  order: number;
  isCompleted: boolean;
  workout?: {
    id: string;
    name: string;
    displayCode?: string;
    archetype?: string;
  };
  program?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface WorkoutSchedulerProps {
  onScheduleCreated?: () => void;
}

export function WorkoutScheduler({ onScheduleCreated }: WorkoutSchedulerProps) {
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [draggedItem, setDraggedItem] = useState<ScheduledWorkout | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadSchedule();
  }, [currentMonth]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      const schedule = await scheduleApi.getSchedule(
        startDate.toISOString(),
        endDate.toISOString(),
      );
      setScheduledWorkouts(schedule || []);
    } catch (error: any) {
      // Handle case where schedule table doesn't exist yet or other errors
      if (error?.response?.status === 404 || error?.code === 'P2021') {
        // Table doesn't exist yet, just show empty schedule
        setScheduledWorkouts([]);
      } else {
        console.error('Failed to load schedule:', error);
        setScheduledWorkouts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (workout: ScheduledWorkout) => {
    setDraggedItem(workout);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetDate: Date, targetOrder: number = 0) => {
    e.preventDefault();
    if (!draggedItem) return;

    try {
      const newDate = new Date(targetDate);
      newDate.setHours(draggedItem.scheduledDate ? new Date(draggedItem.scheduledDate).getHours() : 9, 
                       draggedItem.scheduledDate ? new Date(draggedItem.scheduledDate).getMinutes() : 0);

      await scheduleApi.update(draggedItem.id, {
        scheduledDate: newDate.toISOString(),
        order: targetOrder,
      });

      await loadSchedule();
      setDraggedItem(null);
    } catch (error) {
      console.error('Failed to move workout:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this workout from your schedule?')) return;

    try {
      await scheduleApi.delete(id);
      await loadSchedule();
      if (onScheduleCreated) onScheduleCreated();
    } catch (error) {
      console.error('Failed to delete scheduled workout:', error);
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getWorkoutsForDate = (date: Date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return scheduledWorkouts
      .filter((w) => {
        const workoutDate = new Date(w.scheduledDate).toISOString().split('T')[0];
        return workoutDate === dateStr;
      })
      .sort((a, b) => a.order - b.order);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-text">Loading schedule...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-panel rounded-lg transition-colors"
          >
            <Icons.CHEVRON_LEFT size={20} />
          </button>
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-panel rounded-lg transition-colors"
          >
            <Icons.CHEVRON_RIGHT size={20} />
          </button>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-node-volt text-dark font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          + Add Workout
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-panel thin-border rounded-lg overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b thin-border">
          {dayNames.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-medium text-muted-text border-r thin-border last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {getDaysInMonth().map((date, idx) => {
            const workouts = date ? getWorkoutsForDate(date) : [];
            const isToday = date && date.toDateString() === new Date().toDateString();
            const isPast = date && date < new Date() && !isToday;

            return (
              <div
                key={idx}
                className={`min-h-[120px] border-r thin-border border-b thin-border last:border-r-0 p-2 ${
                  !date ? 'bg-dark/30' : isToday ? 'bg-node-volt/10' : 'bg-panel'
                }`}
                onDragOver={handleDragOver}
                onDrop={(e) => date && handleDrop(e, date, workouts.length)}
              >
                {date && (
                  <>
                    <div
                      className={`text-sm font-medium mb-2 ${
                        isToday ? 'text-node-volt font-bold' : 'text-muted-text'
                      }`}
                    >
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {workouts.map((workout) => (
                        <div
                          key={workout.id}
                          draggable
                          onDragStart={() => handleDragStart(workout)}
                          className={`group relative bg-node-volt/20 thin-border border-node-volt/50 rounded p-2 text-xs cursor-move hover:bg-node-volt/30 transition-all ${
                            workout.isCompleted ? 'opacity-50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex-1 min-w-0">
                              {workout.workout?.displayCode && (
                                <div className="text-node-volt font-mono text-[10px] mb-0.5">
                                  {workout.workout.displayCode}
                                </div>
                              )}
                              <div className="font-bold text-text-white truncate">
                                {workout.workout?.name || workout.program?.name || 'Workout'}
                              </div>
                              <div className="text-muted-text text-[10px]">
                                {formatTime(workout.scheduledDate)}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(workout.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                            >
                              <Icons.X size={12} />
                            </button>
                          </div>
                          {workout.workout?.archetype && (
                            <div className="mt-1">
                              <ArchetypeBadge archetype={workout.workout.archetype} size="sm" />
                            </div>
                          )}
                          {workout.workout && (
                            <Link
                              href={`/workouts/${workout.workout.id}`}
                              className="absolute inset-0"
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Workout Modal - Simplified for now */}
      {showAddModal && (
        <AddWorkoutModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadSchedule();
            if (onScheduleCreated) onScheduleCreated();
          }}
        />
      )}
    </div>
  );
}

// Simple Add Workout Modal - can be enhanced later
function AddWorkoutModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-panel thin-border rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Add Workout to Schedule
          </h3>
          <button onClick={onClose} className="text-muted-text hover:text-text-white">
            <Icons.X size={24} />
          </button>
        </div>
        <p className="text-muted-text mb-4">
          Go to the Workouts page to schedule workouts, or use the AI Builder to create and schedule new workouts.
        </p>
        <div className="flex gap-3">
          <Link
            href="/workouts"
            className="flex-1 bg-node-volt text-dark font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-center"
          >
            Browse Workouts
          </Link>
          <Link
            href="/ai/workout-builder"
            className="flex-1 bg-panel thin-border text-text-white px-4 py-2 rounded-lg hover:bg-panel transition-colors text-center"
          >
            AI Builder
          </Link>
        </div>
      </div>
    </div>
  );
}

