'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { programsApi, userApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import ArchetypeBadge from '@/components/workout/ArchetypeBadge';
import Link from 'next/link';

interface Program {
  id: string;
  name: string;
  slug: string;
  description?: string;
  level?: string;
  goal?: string;
  durationWeeks?: number;
  workouts: Array<{
    id: string;
    name: string;
    displayCode?: string;
    dayIndex?: number;
    archetype?: string;
  }>;
}

export default function ProgramDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && slug) {
      loadProgram();
    }
  }, [user, authLoading, slug]);

  const loadProgram = async () => {
    try {
      const data = await programsApi.getBySlug(slug);
      setProgram(data);
    } catch (error) {
      console.error('Failed to load program:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartProgram = async () => {
    if (!program) return;

    setStarting(true);
    try {
      await userApi.startProgram({
        programId: program.id,
        startDate: new Date().toISOString(),
      });
      router.push('/');
    } catch (error) {
      console.error('Failed to start program:', error);
      alert('Failed to start program. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-muted-text">Loading...</div>
      </div>
    );
  }

  if (!user || !program) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/programs" className="text-muted-text hover:text-text-white mb-4 inline-block">
          ← Back to Programs
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 font-heading">{program.name}</h1>
          {program.description && (
            <p className="text-muted-text text-lg mb-4 font-body">{program.description}</p>
          )}
          <div className="flex gap-4 text-sm">
            {program.level && (
              <span className="text-node-volt">Level: {program.level}</span>
            )}
            {program.goal && (
              <span className="text-muted-text">Goal: {program.goal}</span>
            )}
            {program.durationWeeks && (
              <span className="text-muted-text">Duration: {program.durationWeeks} weeks</span>
            )}
          </div>
        </div>

        <div className="bg-panel thin-border rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 font-heading">Workouts</h2>
          <div className="space-y-3">
            {program.workouts.map((workout) => (
              <Link
                key={workout.id}
                href={`/workouts/${workout.id}`}
                className="block p-4 bg-panel thin-border rounded hover:border-node-volt transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      {workout.displayCode && (
                        <span className="text-node-volt font-mono">{workout.displayCode}</span>
                      )}{' '}
                      <span className="font-medium font-body">{workout.name}</span>
                      {workout.dayIndex !== null && workout.dayIndex !== undefined && (
                        <span className="text-muted-text ml-2">Day {workout.dayIndex + 1}</span>
                      )}
                    </div>
                    {workout.archetype && <ArchetypeBadge archetype={workout.archetype} size="sm" />}
                  </div>
                  <span className="text-muted-text">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <button
          onClick={handleStartProgram}
          disabled={starting}
          className="bg-node-volt text-dark font-bold px-8 py-3 rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-heading"
        >
          {starting ? 'Starting...' : 'Start This Program'}
        </button>
      </main>
    </div>
  );
}

