'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { programsApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Program {
  id: string;
  name: string;
  slug: string;
  description?: string;
  level?: string;
  goal?: string;
  durationWeeks?: number;
}

export default function ProgramsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      loadPrograms();
    }
  }, [user, authLoading]);

  const loadPrograms = async () => {
    try {
      const data = await programsApi.getAll();
      setPrograms(data);
    } catch (error) {
      console.error('Failed to load programs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-deep-asphalt flex items-center justify-center">
        <div className="text-muted-text">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-deep-asphalt">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8 font-heading">Programs</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <Link
              key={program.id}
              href={`/programs/${program.slug}`}
              className="bg-concrete-grey border border-border-dark rounded-lg p-6 hover:border-node-volt transition-colors"
            >
              <h2 className="text-2xl font-bold mb-2 font-heading">{program.name}</h2>
              {program.description && (
                <p className="text-muted-text mb-4 font-body">{program.description}</p>
              )}
              <div className="flex gap-4 text-sm">
                {program.level && (
                  <span className="text-node-volt">Level: {program.level}</span>
                )}
                {program.durationWeeks && (
                  <span className="text-muted-text">{program.durationWeeks} weeks</span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {programs.length === 0 && (
          <div className="bg-concrete-grey border border-border-dark rounded-lg p-8 text-center">
            <p className="text-muted-text font-body">No programs available yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}

