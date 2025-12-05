'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { coachApi, analyticsApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { ClickableUserName } from '@/components/user/ClickableUserName';

export default function CoachDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalClients: 0, activeClients: 0, totalPrograms: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'COACH' && !user.isAdmin))) {
      router.push('/');
      return;
    }

    if (user) {
      loadCoachData();
    }
  }, [user, authLoading]);

  const loadCoachData = async () => {
    try {
      setLoading(true);
      const [profileData, clientsData] = await Promise.all([
        coachApi.getProfile().catch(() => null),
        coachApi.getClients().catch(() => []),
      ]);

      setProfile(profileData);
      setClients(clientsData);

      // Calculate stats
      const activeClients = clientsData.filter((c: any) => c.status === 'ACTIVE').length;
      const totalPrograms = clientsData.reduce((sum: number, c: any) => sum + (c.assignments?.length || 0), 0);

      setStats({
        totalClients: clientsData.length,
        activeClients,
        totalPrograms,
      });
    } catch (error) {
      console.error('Failed to load coach data:', error);
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

  if (!user || (user.role !== 'COACH' && !user.isAdmin)) {
    return null;
  }

  // If no profile exists, show setup
  if (!profile) {
    return (
      <div className="min-h-screen bg-dark">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-panel thin-border rounded-lg p-8 text-center">
            <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Set Up Your Coach Profile
            </h1>
            <p className="text-muted-text mb-8" style={{ fontFamily: 'var(--font-manrope)' }}>
              Create your coach profile to start managing clients and programs.
            </p>
            <Link
              href="/coach/setup"
              className="inline-block bg-node-volt text-dark font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Create Profile
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
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Coach Dashboard
          </h1>
          <p className="text-muted-text">Manage your clients and programs</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-panel thin-border rounded-lg p-6">
            <div className="text-muted-text text-sm mb-2">Total Clients</div>
            <div className="text-3xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {stats.totalClients}
            </div>
          </div>
          <div className="bg-panel thin-border rounded-lg p-6">
            <div className="text-muted-text text-sm mb-2">Active Clients</div>
            <div className="text-3xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {stats.activeClients}
            </div>
          </div>
          <div className="bg-panel thin-border rounded-lg p-6">
            <div className="text-muted-text text-sm mb-2">Active Programs</div>
            <div className="text-3xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {stats.totalPrograms}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/coach/clients"
            className="bg-panel thin-border rounded-lg p-6 hover:border-node-volt transition-colors"
          >
            <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Manage Clients
            </h3>
            <p className="text-muted-text">View and manage your client roster</p>
          </Link>
          <Link
            href="/coach/programs"
            className="bg-panel thin-border rounded-lg p-6 hover:border-node-volt transition-colors"
          >
            <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              My Programs
            </h3>
            <p className="text-muted-text">Create and manage training programs</p>
          </Link>
        </div>

        {/* Recent Clients */}
        {clients.length > 0 && (
          <div className="bg-panel thin-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Recent Clients
              </h2>
              <Link
                href="/coach/clients"
                className="text-node-volt hover:underline text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {clients.slice(0, 5).map((client: any) => (
                <Link
                  key={client.id}
                  href={`/coach/clients/${client.clientId}`}
                  className="block bg-panel thin-border rounded-lg p-4 hover:border-node-volt transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-text-white">
                        <ClickableUserName
                          userId={client.clientId}
                          name={client.client.name}
                          email={client.client.email}
                          className="text-text-white"
                        />
                      </div>
                      <div className="text-sm text-muted-text">
                        {client.assignments?.length || 0} active programs • {client.status}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/coach/clients/${client.clientId}`}
                        className="text-node-volt hover:underline text-sm"
                      >
                        Coach View
                      </Link>
                      <span className="text-node-volt">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Profile Info */}
        {profile && (
          <div className="mt-8 bg-panel thin-border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Coach Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-muted-text text-sm mb-2">Specialties</div>
                <div className="flex flex-wrap gap-2">
                  {profile.specialties && profile.specialties.length > 0 ? (
                    profile.specialties.map((spec: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-panel thin-border px-3 py-1 rounded text-sm"
                      >
                        {spec}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-text text-sm">No specialties listed</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-muted-text text-sm mb-2">Certifications</div>
                <div className="flex flex-wrap gap-2">
                  {profile.certifications && profile.certifications.length > 0 ? (
                    profile.certifications.map((cert: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-panel thin-border px-3 py-1 rounded text-sm"
                      >
                        {cert}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-text text-sm">No certifications listed</span>
                  )}
                </div>
              </div>
            </div>
            {profile.bio && (
              <div className="mt-4">
                <div className="text-muted-text text-sm mb-2">Bio</div>
                <p className="text-muted-text" style={{ fontFamily: 'var(--font-manrope)' }}>
                  {profile.bio}
                </p>
              </div>
            )}
            <Link
              href="/coach/settings"
              className="inline-block mt-4 text-node-volt hover:underline text-sm font-medium"
            >
              Edit Profile →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

