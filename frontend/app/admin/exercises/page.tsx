'use client';

// Dynamic import to prevent SSR issues

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Exercise {
  id: string;
  exerciseId: string;
  name: string;
  category: string;
  movementPattern: string;
  equipment: string[];
  suitableArchetypes: string[];
  imageUrl?: string;
  tiers: Array<{
    tier: string;
    description?: string;
    typicalReps?: string;
  }>;
}

export default function ExercisesAdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push('/');
      return;
    }

    if (user?.isAdmin) {
      loadExercises();
    }
  }, [user, authLoading, router]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getExercises();
      setExercises(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exercise?')) return;

    try {
      await adminApi.deleteExercise(id);
      await loadExercises();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete exercise');
    }
  };

  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.exerciseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-muted-text">Loading...</div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Exercise Management</h1>
            <p className="text-muted-text">Manage the exercise database</p>
          </div>
          <Link
            href="/admin/exercises/new"
            className="bg-node-volt text-dark font-bold py-2 px-6 rounded hover:opacity-90 transition-opacity"
          >
            + Add Exercise
          </Link>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded p-4 mb-6 text-red-400">
            {error}
          </div>
        )}

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-panel thin-border rounded px-4 py-2 text-text-white focus:outline-none focus:border-node-volt"
          />
        </div>

        <div className="bg-panel thin-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-panel border-b thin-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Image</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Equipment</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Archetypes</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExercises.map((exercise) => (
                  <tr key={exercise.id} className="border-b thin-border hover:bg-panel/50">
                    <td className="px-6 py-4">
                      {exercise.imageUrl ? (
                        <div className="w-16 h-16 rounded overflow-hidden bg-transparent" style={{ aspectRatio: '1' }}>
                          <img
                            src={exercise.imageUrl}
                            alt={exercise.name}
                            className="w-full h-full object-cover"
                            style={{
                              filter: 'brightness(0) saturate(100%) invert(85%) sepia(100%) saturate(10000%) hue-rotate(30deg)', // Volt green
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-panel/50 rounded flex items-center justify-center text-muted-text text-xs">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-muted-text">{exercise.exerciseId}</td>
                    <td className="px-6 py-4 text-sm">{exercise.name}</td>
                    <td className="px-6 py-4 text-sm text-muted-text">{exercise.category}</td>
                    <td className="px-6 py-4 text-sm text-muted-text">
                      {exercise.equipment.join(', ')}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-text">
                      {exercise.suitableArchetypes.join(', ')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/exercises/${exercise.id}`}
                          className="text-node-volt hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(exercise.id)}
                          className="text-red-400 hover:underline"
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

        {filteredExercises.length === 0 && (
          <div className="text-center py-12 text-muted-text">
            {searchTerm ? 'No exercises found matching your search.' : 'No exercises found.'}
          </div>
        )}

        <div className="mt-6">
          <Link
            href="/admin"
            className="text-muted-text hover:text-text-white transition-colors"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

