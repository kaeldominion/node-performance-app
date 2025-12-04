'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { gymApi, workoutsApi, programsApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function GymClassesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    scheduledAt: '',
    workoutId: '',
    maxCapacity: 20,
    instructorId: '',
  });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'GYM_OWNER' && !user.isAdmin))) {
      router.push('/');
      return;
    }

    if (user) {
      loadClasses();
    }
  }, [user, authLoading, dateRange]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const start = dateRange.start || new Date().toISOString();
      const end = dateRange.end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const [classesData, workoutsData] = await Promise.all([
        gymApi.getClasses(start, end),
        workoutsApi.getById('').catch(() => []), // This won't work, but we'll handle it
      ]);
      setClasses(classesData);
    } catch (error) {
      console.error('Failed to load classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await gymApi.createClass(formData);
      await loadClasses();
      setShowCreateModal(false);
      setFormData({
        name: '',
        scheduledAt: '',
        workoutId: '',
        maxCapacity: 20,
        instructorId: '',
      });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create class');
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;

    try {
      await gymApi.deleteClass(classId);
      await loadClasses();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete class');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-deep-asphalt flex items-center justify-center">
        <div className="text-muted-text">Loading...</div>
      </div>
    );
  }

  if (!user || (user.role !== 'GYM_OWNER' && !user.isAdmin)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-deep-asphalt">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Classes
            </h1>
            <p className="text-muted-text">Manage your gym class schedule</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-node-volt text-deep-asphalt font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            + Create Class
          </button>
        </div>

        {/* Date Range Filter */}
        <div className="mb-6 flex gap-4">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="bg-tech-grey border border-border-dark rounded-lg px-4 py-2 text-text-white focus:outline-none focus:border-node-volt"
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="bg-tech-grey border border-border-dark rounded-lg px-4 py-2 text-text-white focus:outline-none focus:border-node-volt"
          />
        </div>

        {/* Classes List */}
        <div className="bg-concrete-grey border border-border-dark rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-tech-grey border-b border-border-dark">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Class Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Date & Time</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Workout</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Capacity</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Attendance</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((gymClass) => (
                  <tr key={gymClass.id} className="border-b border-border-dark hover:bg-tech-grey/50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/gym/classes/${gymClass.id}`}
                        className="font-medium text-text-white hover:text-node-volt transition-colors"
                      >
                        {gymClass.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-muted-text">
                      {new Date(gymClass.scheduledAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-muted-text">
                      {gymClass.workout?.name || 'No workout assigned'}
                    </td>
                    <td className="px-6 py-4 text-muted-text">
                      {gymClass.attendance?.length || 0} / {gymClass.maxCapacity || '∞'}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/gym/classes/${gymClass.id}`}
                        className="text-node-volt hover:underline text-sm"
                      >
                        View
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/gym/classes/${gymClass.id}/display`}
                          className="text-node-volt hover:underline text-sm"
                          target="_blank"
                        >
                          Display
                        </Link>
                        <button
                          onClick={() => handleDeleteClass(gymClass.id)}
                          className="text-red-400 hover:underline text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {classes.length === 0 && (
          <div className="text-center py-12 text-muted-text">
            <p className="mb-4">No classes scheduled.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-node-volt hover:underline"
            >
              Create your first class →
            </button>
          </div>
        )}

        {/* Create Class Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-concrete-grey border border-border-dark rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Create Class
              </h2>

              <form onSubmit={handleCreateClass} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-text">
                    Class Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Morning Strength"
                    className="w-full bg-tech-grey border border-border-dark rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-text">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    required
                    className="w-full bg-tech-grey border border-border-dark rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-text">
                    Workout ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.workoutId}
                    onChange={(e) => setFormData({ ...formData, workoutId: e.target.value })}
                    placeholder="Workout ID"
                    className="w-full bg-tech-grey border border-border-dark rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-text">
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
                    min="1"
                    className="w-full bg-tech-grey border border-border-dark rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
                  />
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({
                        name: '',
                        scheduledAt: '',
                        workoutId: '',
                        maxCapacity: 20,
                        instructorId: '',
                      });
                    }}
                    className="flex-1 bg-tech-grey border border-border-dark text-text-white px-6 py-3 rounded-lg hover:bg-concrete-grey transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-node-volt text-deep-asphalt font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    Create Class
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="mt-6">
          <Link
            href="/gym"
            className="text-muted-text hover:text-text-white transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

