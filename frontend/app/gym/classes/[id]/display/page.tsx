'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { gymApi, workoutsApi } from '@/lib/api';
import WorkoutDeckPlayer from '@/components/workout/WorkoutDeckPlayer';

export default function GymClassDisplayPage() {
  const params = useParams();
  const classId = params.id as string;

  const [gymClass, setGymClass] = useState<any>(null);
  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (classId) {
      loadClassData();
    }
  }, [classId]);

  const loadClassData = async () => {
    try {
      setLoading(true);
      const classData = await gymApi.getClass(classId);
      setGymClass(classData);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-asphalt flex items-center justify-center">
        <div className="text-muted-text text-2xl">Loading class...</div>
      </div>
    );
  }

  if (!gymClass || !workout) {
    return (
      <div className="min-h-screen bg-deep-asphalt flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-text text-2xl mb-4">Class or workout not found</div>
          <div className="text-muted-text">This class may not have a workout assigned yet.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-asphalt">
      <WorkoutDeckPlayer
        workout={workout}
        sessionId={null}
        onWorkoutComplete={() => {
          // In display mode, just reload
          window.location.reload();
        }}
      />
    </div>
  );
}

