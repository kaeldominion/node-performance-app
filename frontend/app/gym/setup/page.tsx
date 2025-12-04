'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { gymApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function GymSetupPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    website: '',
    capacity: 50,
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'GYM_OWNER' && !user.isAdmin))) {
      router.push('/');
      return;
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await gymApi.createProfile(formData);
      router.push('/gym');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-deep-asphalt flex items-center justify-center">
        <div className="text-muted-text">Loading...</div>
      </div>
    );
  }

  if (!user || (user.role !== 'GYM_OWNER' && !user.isAdmin)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-deep-asphalt">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Set Up Gym Profile
          </h1>
          <p className="text-muted-text">Create your gym profile to start managing classes and members</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-concrete-grey border border-border-dark rounded-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-text">Gym Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="NØDE Performance Gym"
              className="w-full bg-tech-grey border border-border-dark rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-muted-text">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main St, City, State 12345"
              className="w-full bg-tech-grey border border-border-dark rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-text">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
                className="w-full bg-tech-grey border border-border-dark rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-text">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://yourgym.com"
                className="w-full bg-tech-grey border border-border-dark rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-muted-text">Capacity</label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              min="1"
              className="w-full bg-tech-grey border border-border-dark rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-muted-text">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell members about your gym..."
              className="w-full bg-tech-grey border border-border-dark rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt resize-none"
              rows={5}
            />
          </div>

          <div className="flex gap-4">
            <Link
              href="/gym"
              className="flex-1 bg-tech-grey border border-border-dark text-text-white px-6 py-3 rounded-lg hover:bg-concrete-grey transition-colors font-medium text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-node-volt text-deep-asphalt font-bold px-6 py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              {loading ? 'Creating...' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

