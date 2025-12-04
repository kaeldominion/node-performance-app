'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { gymApi, workoutsApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function GymDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalMembers: 0, activeMembers: 0, classesToday: 0, totalClasses: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'GYM_OWNER' && !user.isAdmin))) {
      router.push('/');
      return;
    }

    if (user) {
      loadGymData();
    }
  }, [user, authLoading]);

  const loadGymData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [profileData, membersData, classesData] = await Promise.all([
        gymApi.getProfile().catch(() => null),
        gymApi.getMembers().catch(() => []),
        gymApi.getClasses(today.toISOString(), tomorrow.toISOString()).catch(() => []),
      ]);

      setProfile(profileData);
      setMembers(membersData);
      setUpcomingClasses(classesData.filter((c: any) => new Date(c.scheduledAt) >= today));

      // Calculate stats
      const activeMembers = membersData.filter((m: any) => m.status === 'ACTIVE').length;
      const classesToday = classesData.filter((c: any) => {
        const classDate = new Date(c.scheduledAt);
        return classDate.toDateString() === today.toDateString();
      }).length;

      setStats({
        totalMembers: membersData.length,
        activeMembers,
        classesToday,
        totalClasses: classesData.length,
      });
    } catch (error) {
      console.error('Failed to load gym data:', error);
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

  if (!user || (user.role !== 'GYM_OWNER' && !user.isAdmin)) {
    return null;
  }

  // If no profile exists, show setup
  if (!profile) {
    return (
      <div className="min-h-screen bg-deep-asphalt">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-concrete-grey border border-border-dark rounded-lg p-8 text-center">
            <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Set Up Your Gym Profile
            </h1>
            <p className="text-muted-text mb-8" style={{ fontFamily: 'var(--font-manrope)' }}>
              Create your gym profile to start managing classes and members.
            </p>
            <Link
              href="/gym/setup"
              className="inline-block bg-node-volt text-deep-asphalt font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
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
    <div className="min-h-screen bg-deep-asphalt">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            {profile.name || 'Gym Dashboard'}
          </h1>
          <p className="text-muted-text">Manage your classes, members, and operations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-concrete-grey border border-border-dark rounded-lg p-6">
            <div className="text-muted-text text-sm mb-2">Total Members</div>
            <div className="text-3xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {stats.totalMembers}
            </div>
          </div>
          <div className="bg-concrete-grey border border-border-dark rounded-lg p-6">
            <div className="text-muted-text text-sm mb-2">Active Members</div>
            <div className="text-3xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {stats.activeMembers}
            </div>
          </div>
          <div className="bg-concrete-grey border border-border-dark rounded-lg p-6">
            <div className="text-muted-text text-sm mb-2">Classes Today</div>
            <div className="text-3xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {stats.classesToday}
            </div>
          </div>
          <div className="bg-concrete-grey border border-border-dark rounded-lg p-6">
            <div className="text-muted-text text-sm mb-2">Upcoming Classes</div>
            <div className="text-3xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              {upcomingClasses.length}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/gym/classes"
            className="bg-concrete-grey border border-border-dark rounded-lg p-6 hover:border-node-volt transition-colors"
          >
            <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Manage Classes
            </h3>
            <p className="text-muted-text">Schedule and manage gym classes</p>
          </Link>
          <Link
            href="/gym/members"
            className="bg-concrete-grey border border-border-dark rounded-lg p-6 hover:border-node-volt transition-colors"
          >
            <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Manage Members
            </h3>
            <p className="text-muted-text">View and manage your member roster</p>
          </Link>
          <Link
            href="/gym/calendar"
            className="bg-concrete-grey border border-border-dark rounded-lg p-6 hover:border-node-volt transition-colors"
          >
            <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Class Calendar
            </h3>
            <p className="text-muted-text">View class schedule and calendar</p>
          </Link>
        </div>

        {/* Upcoming Classes */}
        {upcomingClasses.length > 0 && (
          <div className="bg-concrete-grey border border-border-dark rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Upcoming Classes
              </h2>
              <Link
                href="/gym/classes"
                className="text-node-volt hover:underline text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingClasses.slice(0, 5).map((gymClass: any) => (
                <Link
                  key={gymClass.id}
                  href={`/gym/classes/${gymClass.id}`}
                  className="block bg-tech-grey border border-border-dark rounded-lg p-4 hover:border-node-volt transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-text-white text-lg">
                        {gymClass.name}
                      </div>
                      <div className="text-sm text-muted-text mt-1">
                        {new Date(gymClass.scheduledAt).toLocaleString()} • {gymClass.attendance?.length || 0} attendees
                      </div>
                    </div>
                    <div className="text-node-volt">→</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Gym Info */}
        {profile && (
          <div className="bg-concrete-grey border border-border-dark rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Gym Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.address && (
                <div>
                  <div className="text-muted-text text-sm mb-2">Address</div>
                  <div className="text-text-white">{profile.address}</div>
                </div>
              )}
              {profile.phone && (
                <div>
                  <div className="text-muted-text text-sm mb-2">Phone</div>
                  <div className="text-text-white">{profile.phone}</div>
                </div>
              )}
              {profile.website && (
                <div>
                  <div className="text-muted-text text-sm mb-2">Website</div>
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-node-volt hover:underline"
                  >
                    {profile.website}
                  </a>
                </div>
              )}
              {profile.capacity && (
                <div>
                  <div className="text-muted-text text-sm mb-2">Capacity</div>
                  <div className="text-text-white">{profile.capacity} members</div>
                </div>
              )}
            </div>
            <Link
              href="/gym/settings"
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

