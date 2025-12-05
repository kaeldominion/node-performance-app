'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function SchedulePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [schedule, setSchedule] = useState<any[]>([]);
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    today.toISOString().split('T')[0].substring(0, 7)
  );
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      loadSchedule();
    }
  }, [user, authLoading, selectedMonth]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const startDate = new Date(selectedMonth + '-01');
      startDate.setDate(startDate.getDate() - 7); // Show 7 days before month
      const endDate = new Date(selectedMonth + '-01');
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0); // Last day of selected month
      endDate.setDate(endDate.getDate() + 7); // Show 7 days after month

      const data = await userApi.getSchedule(
        startDate.toISOString(),
        endDate.toISOString()
      ).catch(() => ({ schedule: [], progress: { completed: 0, total: 0, percentage: 0 } }));

      setSchedule(data.schedule || []);
      setProgress(data.progress || { completed: 0, total: 0, percentage: 0 });
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-muted-text">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Group schedule by date for calendar view
  const scheduleByDate = schedule.reduce((acc: any, item: any) => {
    const date = new Date(item.date).toISOString().split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  // Get dates for calendar view (current month)
  const currentMonth = new Date(selectedMonth + '-01');
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const calendarDays = [];
  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    calendarDays.push(date);
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Training Schedule
            </h1>
            <p className="text-muted-text">View your upcoming workouts and track progress</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-panel thin-border rounded-lg p-2">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-node-volt text-dark font-bold'
                    : 'text-text-white hover:bg-tech-grey'
                }`}
              >
                Calendar
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-node-volt text-dark font-bold'
                    : 'text-text-white hover:bg-tech-grey'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Progress Summary */}
        {progress.total > 0 && (
          <div className="bg-panel thin-border rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Program Progress
              </h2>
              <div className="text-3xl font-bold text-node-volt">
                {progress.percentage}%
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-tech-grey rounded-full h-4 overflow-hidden">
                <div
                  className="bg-node-volt h-full transition-all duration-500"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <div className="text-sm text-muted-text">
                {progress.completed} / {progress.total} workouts completed
              </div>
            </div>
          </div>
        )}

        {viewMode === 'calendar' ? (
          <div className="bg-panel thin-border rounded-lg p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const prev = new Date(currentMonth);
                    prev.setMonth(prev.getMonth() - 1);
                    setSelectedMonth(prev.toISOString().split('T')[0].substring(0, 7));
                  }}
                  className="bg-panel thin-border px-4 py-2 rounded hover:border-node-volt"
                >
                  ←
                </button>
                <button
                  onClick={() => setSelectedMonth(today.toISOString().split('T')[0].substring(0, 7))}
                  className="bg-panel thin-border px-4 py-2 rounded hover:border-node-volt text-sm"
                >
                  Today
                </button>
                <button
                  onClick={() => {
                    const next = new Date(currentMonth);
                    next.setMonth(next.getMonth() + 1);
                    setSelectedMonth(next.toISOString().split('T')[0].substring(0, 7));
                  }}
                  className="bg-panel thin-border px-4 py-2 rounded hover:border-node-volt"
                >
                  →
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-bold text-muted-text py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((date, idx) => {
                if (!date) {
                  return <div key={`empty-${idx}`} className="aspect-square" />;
                }

                const dateStr = date.toISOString().split('T')[0];
                const dayWorkouts = scheduleByDate[dateStr] || [];
                const isToday = dateStr === today.toISOString().split('T')[0];
                const isPast = date < today && !isToday;

                return (
                  <div
                    key={dateStr}
                    className={`aspect-square bg-panel/50 thin-border rounded-lg p-2 ${
                      isToday ? 'ring-2 ring-node-volt' : ''
                    } ${isPast ? 'opacity-50' : ''}`}
                  >
                    <div className={`text-sm font-bold mb-1 ${isToday ? 'text-node-volt' : 'text-text-white'}`}>
                      {date.getDate()}
                    </div>
                    {dayWorkouts.map((item: any, workoutIdx: number) => (
                      <div
                        key={workoutIdx}
                        className={`text-xs p-1 rounded mb-1 ${
                          item.completed
                            ? 'bg-green-600/30 text-green-400'
                            : isPast
                            ? 'bg-red-600/30 text-red-400'
                            : 'bg-node-volt/30 text-node-volt'
                        }`}
                        title={item.workout.name}
                      >
                        {item.workout.displayCode || item.workout.name.substring(0, 10)}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {schedule.length === 0 ? (
              <div className="bg-panel thin-border rounded-lg p-8 text-center">
                <p className="text-muted-text mb-4">No active program scheduled</p>
                <Link
                  href="/ai/workout-builder"
                  className="bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 inline-block"
                >
                  Create a Program
                </Link>
              </div>
            ) : (
              schedule.map((item: any) => {
                const date = new Date(item.date);
                const isToday = date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
                const isPast = date < today && !isToday;

                return (
                  <Link
                    key={item.date}
                    href={`/workouts/${item.workout.id}`}
                    className={`block bg-panel thin-border rounded-lg p-6 hover:border-node-volt transition-colors ${
                      isPast && !item.completed ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`text-sm font-bold ${
                            isToday ? 'text-node-volt' : 'text-muted-text'
                          }`}>
                            {date.toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          {item.workout.weekIndex && (
                            <span className="text-xs bg-node-volt/20 text-node-volt px-2 py-1 rounded">
                              Week {item.workout.weekIndex}
                            </span>
                          )}
                          {item.workout.dayIndex && (
                            <span className="text-xs bg-panel text-muted-text px-2 py-1 rounded">
                              Day {item.workout.dayIndex}
                            </span>
                          )}
                          {item.completed && (
                            <span className="text-xs bg-green-600/30 text-green-400 px-2 py-1 rounded">
                              ✓ Completed
                            </span>
                          )}
                          {isPast && !item.completed && (
                            <span className="text-xs bg-red-600/30 text-red-400 px-2 py-1 rounded">
                              Missed
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                          {item.workout.name}
                        </h3>
                        {item.workout.displayCode && (
                          <p className="text-node-volt font-mono text-sm">{item.workout.displayCode}</p>
                        )}
                      </div>
                      <div className="text-2xl">→</div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}

