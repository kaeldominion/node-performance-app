'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ exercises: 0, programs: 0, users: 0 });

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push('/');
      return;
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-deep-asphalt flex items-center justify-center">
        <div className="text-muted-text">Loading...</div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-deep-asphalt">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-text">Manage exercises, programs, and app settings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-concrete-grey border border-border-dark rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Exercises</h3>
            <p className="text-3xl font-bold text-node-volt mb-1">{stats.exercises}</p>
            <Link href="/admin/exercises" className="text-node-volt hover:underline text-sm">
              Manage Exercises →
            </Link>
          </div>

          <div className="bg-concrete-grey border border-border-dark rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Programs</h3>
            <p className="text-3xl font-bold text-node-volt mb-1">{stats.programs}</p>
            <p className="text-muted-text text-sm">Coming soon</p>
          </div>

          <div className="bg-concrete-grey border border-border-dark rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Users</h3>
            <p className="text-3xl font-bold text-node-volt mb-1">{stats.users}</p>
            <p className="text-muted-text text-sm">Coming soon</p>
          </div>
        </div>

        <div className="bg-concrete-grey border border-border-dark rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/admin/exercises"
              className="bg-node-volt text-deep-asphalt font-bold py-3 px-6 rounded hover:opacity-90 transition-opacity text-center"
            >
              Manage Exercises
            </Link>
            <button
              disabled
              className="bg-tech-grey text-muted-text font-bold py-3 px-6 rounded opacity-50 cursor-not-allowed text-center"
            >
              Manage Programs (Coming Soon)
            </button>
            <button
              disabled
              className="bg-tech-grey text-muted-text font-bold py-3 px-6 rounded opacity-50 cursor-not-allowed text-center"
            >
              Manage Users (Coming Soon)
            </button>
            <button
              disabled
              className="bg-tech-grey text-muted-text font-bold py-3 px-6 rounded opacity-50 cursor-not-allowed text-center"
            >
              App Settings (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

