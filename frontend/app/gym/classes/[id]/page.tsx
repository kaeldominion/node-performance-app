'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { gymApi, workoutsApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function GymClassDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;

  const [gymClass, setGymClass] = useState<any>(null);
  const [workout, setWorkout] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'GYM_OWNER' && !user.isAdmin))) {
      router.push('/');
      return;
    }

    if (user && classId) {
      loadClassData();
    }
  }, [user, authLoading, classId]);

  const loadClassData = async () => {
    try {
      setLoading(true);
      const [classData, attendanceData] = await Promise.all([
        gymApi.getClass(classId),
        gymApi.getClassAttendance(classId).catch(() => []),
      ]);

      setGymClass(classData);
      setAttendance(attendanceData);

      if (classData.workoutId) {
        try {
          const workoutData = await workoutsApi.getById(classData.workoutId);
          setWorkout(workoutData);
        } catch (error) {
          console.error('Failed to load workout:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load class data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (memberId: string, attended: boolean) => {
    try {
      await gymApi.markAttendance(classId, memberId, attended);
      await loadClassData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update attendance');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-muted-text">Loading...</div>
      </div>
    );
  }

  if (!user || (user.role !== 'GYM_OWNER' && !user.isAdmin)) {
    return null;
  }

  if (!gymClass) {
    return (
      <div className="min-h-screen bg-dark">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-text">
            <p>Class not found</p>
            <Link href="/gym/classes" className="text-node-volt hover:underline">
              Back to Classes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/gym/classes"
            className="text-muted-text hover:text-text-white transition-colors text-sm mb-2 inline-block"
          >
            ← Back to Classes
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                {gymClass.name}
              </h1>
              <p className="text-muted-text">
                {new Date(gymClass.scheduledAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/gym/classes/${classId}/display`}
                target="_blank"
                className="bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Display Mode
              </Link>
            </div>
          </div>
        </div>

        {/* Class Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-panel thin-border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Class Details
            </h2>
            <div className="space-y-3">
              <div>
                <div className="text-muted-text text-sm mb-1">Scheduled Time</div>
                <div className="text-text-white">
                  {new Date(gymClass.scheduledAt).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-muted-text text-sm mb-1">Capacity</div>
                <div className="text-text-white">
                  {attendance.length} / {gymClass.maxCapacity || '∞'}
                </div>
              </div>
              {workout && (
                <div>
                  <div className="text-muted-text text-sm mb-1">Workout</div>
                  <Link
                    href={`/workouts/${workout.id}`}
                    className="text-node-volt hover:underline"
                  >
                    {workout.name}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {workout && (
            <div className="bg-panel thin-border rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Workout Preview
              </h2>
              <div className="space-y-2">
                {workout.sections?.slice(0, 3).map((section: any, idx: number) => (
                  <div key={idx} className="text-muted-text text-sm">
                    {section.type}: {section.name || 'Section'}
                  </div>
                ))}
                {workout.sections && workout.sections.length > 3 && (
                  <div className="text-muted-text text-sm">
                    + {workout.sections.length - 3} more sections
                  </div>
                )}
              </div>
              <Link
                href={`/workouts/${workout.id}`}
                className="inline-block mt-4 text-node-volt hover:underline text-sm"
              >
                View Full Workout →
              </Link>
            </div>
          )}
        </div>

        {/* Attendance */}
        <div className="bg-panel thin-border rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Attendance
          </h2>
          {attendance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-panel border-b thin-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Member</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record.id} className="border-b thin-border">
                      <td className="px-6 py-4">
                        {record.member?.name || record.member?.email || 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded text-sm ${
                            record.attended
                              ? 'bg-node-volt/20 text-node-volt'
                              : 'bg-panel text-muted-text'
                          }`}
                        >
                          {record.attended ? 'Attended' : 'Absent'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleMarkAttendance(record.memberId, !record.attended)}
                          className="text-node-volt hover:underline text-sm"
                        >
                          {record.attended ? 'Mark Absent' : 'Mark Attended'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-text">
              <p>No attendance records yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

