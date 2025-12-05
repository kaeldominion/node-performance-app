'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { workoutsApi, programsApi } from '@/lib/api';
import { Logo } from '@/components/Logo';
import { Icons } from '@/lib/iconMapping';

export default function RecommendedPage() {
  const [recommendedWorkouts, setRecommendedWorkouts] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [workouts, programsData] = await Promise.all([
          workoutsApi.getRecommended().catch(() => []),
          programsApi.getAll().catch(() => []),
        ]);
        
        if (Array.isArray(workouts)) {
          setRecommendedWorkouts(workouts);
        }
        if (Array.isArray(programsData)) {
          setPrograms(programsData.filter((p: any) => p.isPublic).slice(0, 10));
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-dark text-text-white">
      {/* Header */}
      <nav className="border-b thin-border bg-dark/95 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/">
            <Logo className="text-xl transition-transform hover:scale-105" />
          </Link>
          <Link
            href="/"
            className="px-5 py-2 thin-border border-node-volt text-node-volt font-heading font-bold text-xs uppercase tracking-[0.2em] hover:bg-node-volt hover:text-dark transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-heading font-bold mb-4">
            Recommended <span className="text-node-volt">Workouts</span> & <span className="text-node-volt">Programs</span>
          </h1>
          <p className="text-muted-text text-lg">
            Explore our curated selection of workouts and training programs
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-node-volt"></div>
            <p className="mt-4 text-muted-text">Loading...</p>
          </div>
        ) : (
          <>
            {/* Recommended Workouts */}
            {recommendedWorkouts.length > 0 && (
              <section className="mb-16">
                <h2 className="text-3xl font-heading font-bold mb-8 flex items-center gap-3">
                  <Icons.SESSIONS className="w-8 h-8 text-node-volt" />
                  Recommended Workouts
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendedWorkouts.map((workout: any) => (
                    <div
                      key={workout.id}
                      className="bg-panel/50 thin-border rounded-lg p-6 hover:border-node-volt transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-heading font-bold mb-2">
                            {workout.name}
                          </h3>
                          {workout.displayCode && (
                            <span className="text-node-volt font-mono text-sm">
                              {workout.displayCode}
                            </span>
                          )}
                        </div>
                        {workout.archetype && (
                          <span className="px-3 py-1 bg-node-volt/10 text-node-volt text-xs font-bold uppercase">
                            {workout.archetype}
                          </span>
                        )}
                      </div>
                      {workout.description && (
                        <p className="text-muted-text text-sm mb-4 line-clamp-2">
                          {workout.description}
                        </p>
                      )}
                      {workout.sections && (
                        <div className="text-xs text-muted-text mb-4">
                          {workout.sections.length} section{workout.sections.length !== 1 ? 's' : ''}
                        </div>
                      )}
                      <Link
                        href={`/workouts/${workout.id}`}
                        className="inline-block w-full text-center px-4 py-2 thin-border border-node-volt text-node-volt font-heading font-bold text-xs uppercase tracking-[0.2em] hover:bg-node-volt hover:text-dark transition-colors"
                      >
                        View Workout
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Programs */}
            {programs.length > 0 && (
              <section className="mb-16">
                <h2 className="text-3xl font-heading font-bold mb-8 flex items-center gap-3">
                  <Icons.PROGRAMS className="w-8 h-8 text-node-volt" />
                  Training Programs
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {programs.map((program: any) => (
                    <div
                      key={program.id}
                      className="bg-panel/50 thin-border rounded-lg p-6 hover:border-node-volt transition-all duration-300"
                    >
                      <div className="mb-4">
                        <h3 className="text-xl font-heading font-bold mb-2">
                          {program.name}
                        </h3>
                        {program.description && (
                          <p className="text-muted-text text-sm mb-4 line-clamp-2">
                            {program.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {program.level && (
                            <span className="px-2 py-1 bg-panel text-xs uppercase">
                              {program.level}
                            </span>
                          )}
                          {program.durationWeeks && (
                            <span className="px-2 py-1 bg-panel text-xs">
                              {program.durationWeeks} weeks
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/programs/${program.slug}`}
                        className="inline-block w-full text-center px-4 py-2 thin-border border-node-volt text-node-volt font-heading font-bold text-xs uppercase tracking-[0.2em] hover:bg-node-volt hover:text-dark transition-colors"
                      >
                        View Program
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            {recommendedWorkouts.length === 0 && programs.length === 0 && (
              <div className="text-center py-20">
                <p className="text-muted-text text-lg mb-6">
                  No recommended content available at the moment.
                </p>
                <Link
                  href="/auth/register"
                  className="inline-block px-8 py-4 bg-node-volt text-black font-heading font-bold uppercase tracking-[0.25em] hover:bg-text-white transition-all duration-300"
                >
                  Join NØDE to Access More
                </Link>
              </div>
            )}

            {/* CTA */}
            <div className="text-center mt-16 pt-16 border-t thin-border">
              <h2 className="text-3xl font-heading font-bold mb-4">
                Ready to Start Training?
              </h2>
              <p className="text-muted-text mb-8">
                Join NØDE to access all workouts, programs, and AI-powered training tools
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/register"
                  className="inline-block px-8 py-4 bg-node-volt text-black font-heading font-bold uppercase tracking-[0.25em] hover:bg-text-white transition-all duration-300"
                >
                  Join NØDE
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-block px-8 py-4 thin-border border-text-white/30 text-text-white font-heading font-bold uppercase tracking-[0.25em] hover:border-node-volt hover:text-node-volt transition-all duration-300"
                >
                  Login
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

