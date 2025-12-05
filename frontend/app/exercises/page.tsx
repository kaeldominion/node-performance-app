'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { exercisesApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Icons } from '@/lib/iconMapping';
import { ExerciseDetailsModal } from '@/components/workout/ExerciseDetailsModal';
import { Search } from 'lucide-react';

interface Exercise {
  id: string;
  exerciseId: string;
  name: string;
  category: string;
  movementPattern: string;
  primaryMuscles: string[];
  equipment: string[];
  instructions?: string;
  graphics?: string[];
}

export default function ExercisesLibraryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedExercise, setSelectedExercise] = useState<{ name: string; id?: string } | null>(null);

  const categories = ['ALL', 'STRENGTH', 'MIXED', 'SKILL', 'ENGINE', 'CORE', 'MOBILITY'];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      loadExercises();
    }
  }, [user, authLoading]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await exercisesApi.getAll();
      setExercises(data);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.exerciseId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-muted-text">Loading exercises...</div>
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
          <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Exercise Library
          </h1>
          <p className="text-muted-text">
            Browse all available exercises with detailed instructions, images, and movement patterns
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-text" size={20} />
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-panel thin-border rounded-lg pl-12 pr-4 py-3 text-text-white placeholder-muted-text focus:outline-none focus:border-node-volt"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded border transition-colors font-medium ${
                  selectedCategory === category
                    ? 'bg-node-volt text-dark border-node-volt'
                    : 'bg-panel thin-border text-text-white hover:border-node-volt'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise Count */}
        <div className="mb-6 text-muted-text">
          Showing {filteredExercises.length} of {exercises.length} exercises
        </div>

        {/* Exercise Grid */}
        {filteredExercises.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-text text-lg mb-4">
              No exercises found
            </p>
            <p className="text-muted-text text-sm">
              Try adjusting your search or category filter
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="group bg-panel thin-border rounded-lg p-6 hover:border-node-volt transition-all hover:shadow-lg hover:shadow-node-volt/20 cursor-pointer"
                onClick={() => setSelectedExercise({ name: exercise.name, id: exercise.id })}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-heading font-bold group-hover:text-node-volt transition-colors">
                    {exercise.name}
                  </h3>
                  <Icons.EXERCISE_LIBRARY size={20} className="text-node-volt opacity-60" />
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-text uppercase">Category:</span>
                    <span className="text-node-volt text-sm font-medium">{exercise.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-text uppercase">Pattern:</span>
                    <span className="text-text-white text-sm">{exercise.movementPattern.replace(/_/g, ' ')}</span>
                  </div>
                  {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-muted-text uppercase">Muscles:</span>
                      <span className="text-text-white text-sm">{exercise.primaryMuscles.join(', ')}</span>
                    </div>
                  )}
                  {exercise.equipment && exercise.equipment.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-muted-text uppercase">Equipment:</span>
                      <span className="text-text-white text-sm">{exercise.equipment.join(', ')}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-node-volt">
                  <span>View Details →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exercise Details Modal */}
      {selectedExercise && (
        <ExerciseDetailsModal
          exerciseName={selectedExercise.name}
          exerciseId={selectedExercise.id}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
}
