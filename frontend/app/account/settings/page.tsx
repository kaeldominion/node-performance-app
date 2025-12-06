'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, type User } from '@/contexts/AuthContext';
import { useUser } from '@clerk/nextjs';
import { userApi, coachApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Icons } from '@/lib/iconMapping';
import { UserCircle, Save, ArrowLeft } from 'lucide-react';

export default function AccountSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { user: clerkUser } = useUser();
  
  // Explicitly type user to ensure TypeScript recognizes username property
  const typedUser: User | null = user;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    username: '',
    imageUrl: '',
    weight: '',
    height: '',
    location: '',
    bio: '',
    trainingLevel: 'INTERMEDIATE' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE',
    primaryGoal: 'HYBRID' as 'STRENGTH' | 'HYPERTROPHY' | 'HYBRID' | 'CONDITIONING' | 'FAT_LOSS' | 'LONGEVITY' | undefined,
    daysPerWeek: 3,
    notes: '',
  });
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [showCoachUpgradeModal, setShowCoachUpgradeModal] = useState(false);
  const [coachUpgradeData, setCoachUpgradeData] = useState({
    bio: '',
    specialties: [] as string[],
    certifications: [] as string[],
    website: '',
    instagram: '',
  });
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      loadProfile();
    }
  }, [user, authLoading]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profileData, userData] = await Promise.all([
        userApi.getProfile().catch(() => null),
        userApi.getMe().catch(() => null),
      ]);
      setProfile(profileData);
      
      // Use Clerk image as default
      const imageUrl = clerkUser?.imageUrl || profileData?.imageUrl || '';
      
      // Type assertion to ensure username is available
      const username = (userData as { username?: string } | null)?.username || '';
      
      setFormData({
        username,
        imageUrl,
        weight: profileData?.weight?.toString() || '',
        height: profileData?.height?.toString() || '',
        location: profileData?.location || '',
        bio: profileData?.bio || '',
        trainingLevel: profileData?.trainingLevel || 'INTERMEDIATE',
        primaryGoal: profileData?.primaryGoal || 'HYBRID',
        daysPerWeek: profileData?.daysPerWeek || 3,
        notes: profileData?.notes || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      // Set defaults if no profile exists
      setFormData({
        ...formData,
        imageUrl: clerkUser?.imageUrl || '',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateUsername = (username: string): string | null => {
    if (!username) return null; // Username is optional
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 20) return 'Username must be at most 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
    return null;
  };

  const handleSave = async () => {
    // Validate username
    const usernameValidation = validateUsername(formData.username);
    if (usernameValidation) {
      setUsernameError(usernameValidation);
      return;
    }
    setUsernameError(null);

    try {
      setSaving(true);
      const updatePayload: any = {
        trainingLevel: formData.trainingLevel,
        username: formData.username || '', // Send empty string to clear, or value to set
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        location: formData.location || undefined,
        bio: formData.bio || undefined,
        imageUrl: formData.imageUrl || undefined,
        daysPerWeek: formData.daysPerWeek || undefined,
        primaryGoal: formData.primaryGoal || undefined,
        notes: formData.notes || undefined,
      };
      
      await userApi.updateProfile(updatePayload);
      alert('Profile updated successfully!');
      await loadProfile();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      if (errorMessage.includes('username') || errorMessage.includes('unique')) {
        setUsernameError('This username is already taken');
      } else {
        alert(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-muted-text">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userImageUrl = clerkUser?.imageUrl || formData.imageUrl;
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-muted-text hover:text-node-volt transition-colors mb-4"
          >
            <ArrowLeft size={18} />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-4xl font-heading font-bold mb-2">Account Settings</h1>
          <p className="text-muted-text">Manage your profile and preferences</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Picture Section */}
          <div className="lg:col-span-1">
            <div className="bg-panel thin-border rounded-lg p-6">
              <h2 className="text-lg font-heading font-bold mb-4">Profile Picture</h2>
              <div className="flex flex-col items-center gap-4">
                {userImageUrl ? (
                  <img
                    src={userImageUrl}
                    alt={user?.name || 'User'}
                    className="w-32 h-32 rounded-full border-2 border-node-volt/50 object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-node-volt/20 border-2 border-node-volt/50 flex items-center justify-center text-node-volt font-bold text-4xl">
                    {userInitial}
                  </div>
                )}
                <p className="text-sm text-muted-text text-center">
                  Profile pictures are managed through Clerk. Update your picture in your Clerk account settings.
                </p>
                <a
                  href="https://dashboard.clerk.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-node-volt hover:underline text-sm"
                >
                  Manage in Clerk →
                </a>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-panel thin-border rounded-lg p-6">
              <h2 className="text-lg font-heading font-bold mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-text mb-2">
                    Username
                    <span className="text-xs text-muted-text ml-2">(optional, 3-20 characters, alphanumeric + underscore)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-text">@</span>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => {
                        const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                        setFormData({ ...formData, username: value });
                        setUsernameError(null);
                      }}
                      placeholder="username"
                      maxLength={20}
                      className="flex-1 bg-dark thin-border rounded-lg px-4 py-2 text-text-white focus:outline-none focus:border-node-volt"
                    />
                  </div>
                  {usernameError && (
                    <p className="text-sm text-red-500 mt-1">{usernameError}</p>
                  )}
                  <p className="text-xs text-muted-text mt-1">
                    Your username will be visible to others in the network. Leave empty to hide.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-text mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="e.g., 75"
                      className="w-full bg-dark thin-border rounded-lg px-4 py-2 text-text-white focus:outline-none focus:border-node-volt"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-text mb-2">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      placeholder="e.g., 180"
                      className="w-full bg-dark thin-border rounded-lg px-4 py-2 text-text-white focus:outline-none focus:border-node-volt"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-text mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., New York, USA"
                    className="w-full bg-dark thin-border rounded-lg px-4 py-2 text-text-white focus:outline-none focus:border-node-volt"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-text mb-2">
                    Bio / About Me
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full bg-dark thin-border rounded-lg px-4 py-2 text-text-white focus:outline-none focus:border-node-volt resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Training Information */}
            <div className="bg-panel thin-border rounded-lg p-6">
              <h2 className="text-lg font-heading font-bold mb-4">Training Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-text mb-2">
                    Training Level
                  </label>
                  <select
                    value={formData.trainingLevel}
                    onChange={(e) => setFormData({ ...formData, trainingLevel: e.target.value as any })}
                    className="w-full bg-dark thin-border rounded-lg px-4 py-2 text-text-white focus:outline-none focus:border-node-volt"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="ELITE">Elite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-text mb-2">
                    Primary Goal
                  </label>
                  <select
                    value={formData.primaryGoal || ''}
                    onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value as any || undefined })}
                    className="w-full bg-dark thin-border rounded-lg px-4 py-2 text-text-white focus:outline-none focus:border-node-volt"
                  >
                    <option value="">Select a goal</option>
                    <option value="STRENGTH">Strength</option>
                    <option value="HYPERTROPHY">Hypertrophy</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="CONDITIONING">Conditioning</option>
                    <option value="FAT_LOSS">Fat Loss</option>
                    <option value="LONGEVITY">Longevity</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-text mb-2">
                    Days Per Week
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={formData.daysPerWeek}
                    onChange={(e) => setFormData({ ...formData, daysPerWeek: parseInt(e.target.value) || 3 })}
                    className="w-full bg-dark thin-border rounded-lg px-4 py-2 text-text-white focus:outline-none focus:border-node-volt"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-text mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any additional notes about your training..."
                    rows={3}
                    className="w-full bg-dark thin-border rounded-lg px-4 py-2 text-text-white focus:outline-none focus:border-node-volt resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-3 thin-border border-border-dark text-muted-text hover:text-text-white hover:border-node-volt transition-colors rounded-lg"
              >
                Cancel
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-node-volt text-dark font-heading font-bold hover:opacity-90 transition-opacity rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Coach Upgrade Section - Show for users who aren't already coaches */}
        {user && user.role !== 'COACH' && (
          <div className="mt-8 bg-gradient-to-r from-node-volt/20 to-node-volt/10 border border-node-volt/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Become a Coach
                </h2>
                <p className="text-muted-text mb-4">
                  Share your expertise and help others achieve their fitness goals. Upgrade to coach status to manage clients, assign workouts, and track progress.
                </p>
                <ul className="text-sm text-muted-text space-y-1 mb-4">
                  <li>• Manage clients and track their progress</li>
                  <li>• Assign workouts and programs</li>
                  <li>• Schedule in-person sessions</li>
                  <li>• Receive weekly progress summaries</li>
                </ul>
              </div>
              <button
                onClick={() => setShowCoachUpgradeModal(true)}
                className="ml-6 bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Upgrade to Coach
              </button>
            </div>
          </div>
        )}

        {/* Coach Upgrade Modal */}
        {showCoachUpgradeModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-panel thin-border rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Upgrade to Coach
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-text">
                    Bio *
                  </label>
                  <textarea
                    value={coachUpgradeData.bio}
                    onChange={(e) => setCoachUpgradeData({ ...coachUpgradeData, bio: e.target.value })}
                    placeholder="Tell us about your coaching experience and philosophy..."
                    className="w-full bg-dark thin-border rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt resize-none"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-text">
                    Specialties (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={coachUpgradeData.specialties.join(', ')}
                    onChange={(e) => setCoachUpgradeData({
                      ...coachUpgradeData,
                      specialties: e.target.value.split(',').map(s => s.trim()).filter(s => s),
                    })}
                    placeholder="e.g., Strength Training, Hypertrophy, Conditioning"
                    className="w-full bg-dark thin-border rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-text">
                    Certifications (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={coachUpgradeData.certifications.join(', ')}
                    onChange={(e) => setCoachUpgradeData({
                      ...coachUpgradeData,
                      certifications: e.target.value.split(',').map(s => s.trim()).filter(s => s),
                    })}
                    placeholder="e.g., NASM-CPT, CSCS, CrossFit Level 1"
                    className="w-full bg-dark thin-border rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-text">
                    Website (optional)
                  </label>
                  <input
                    type="url"
                    value={coachUpgradeData.website}
                    onChange={(e) => setCoachUpgradeData({ ...coachUpgradeData, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                    className="w-full bg-dark thin-border rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-text">
                    Instagram (optional)
                  </label>
                  <input
                    type="text"
                    value={coachUpgradeData.instagram}
                    onChange={(e) => setCoachUpgradeData({ ...coachUpgradeData, instagram: e.target.value })}
                    placeholder="@yourusername"
                    className="w-full bg-dark thin-border rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => {
                    setShowCoachUpgradeModal(false);
                    setCoachUpgradeData({
                      bio: '',
                      specialties: [],
                      certifications: [],
                      website: '',
                      instagram: '',
                    });
                  }}
                  className="flex-1 bg-panel thin-border text-text-white px-6 py-3 rounded-lg hover:bg-panel transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      setUpgrading(true);
                      await coachApi.upgradeToCoach(coachUpgradeData);
                      alert('Successfully upgraded to coach! Redirecting...');
                      window.location.href = '/coach';
                    } catch (error: any) {
                      alert(error.response?.data?.message || 'Failed to upgrade to coach');
                    } finally {
                      setUpgrading(false);
                    }
                  }}
                  disabled={upgrading || !coachUpgradeData.bio}
                  className="flex-1 bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  {upgrading ? 'Upgrading...' : 'Upgrade to Coach'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

