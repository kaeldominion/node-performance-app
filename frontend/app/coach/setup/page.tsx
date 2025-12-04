'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { coachApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function CoachSetupPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    bio: '',
    specialties: [] as string[],
    certifications: [] as string[],
    website: '',
    instagram: '',
  });
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [certInput, setCertInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'COACH' && !user.isAdmin))) {
      router.push('/');
      return;
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await coachApi.createProfile(formData);
      router.push('/coach');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const addSpecialty = () => {
    if (specialtyInput.trim() && !formData.specialties.includes(specialtyInput.trim())) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, specialtyInput.trim()],
      });
      setSpecialtyInput('');
    }
  };

  const removeSpecialty = (spec: string) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter((s) => s !== spec),
    });
  };

  const addCertification = () => {
    if (certInput.trim() && !formData.certifications.includes(certInput.trim())) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, certInput.trim()],
      });
      setCertInput('');
    }
  };

  const removeCertification = (cert: string) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((c) => c !== cert),
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-deep-asphalt flex items-center justify-center">
        <div className="text-muted-text">Loading...</div>
      </div>
    );
  }

  if (!user || (user.role !== 'COACH' && !user.isAdmin)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-deep-asphalt">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Set Up Coach Profile
          </h1>
          <p className="text-muted-text">Create your coach profile to start managing clients</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-concrete-grey border border-border-dark rounded-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-text">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell clients about your coaching philosophy and experience..."
              className="w-full bg-tech-grey border border-border-dark rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt resize-none"
              rows={5}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-muted-text">Specialties</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={specialtyInput}
                onChange={(e) => setSpecialtyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSpecialty();
                  }
                }}
                placeholder="e.g., Strength Training, Hyrox Prep"
                className="flex-1 bg-tech-grey border border-border-dark rounded-lg px-4 py-2 text-text-white focus:outline-none focus:border-node-volt"
              />
              <button
                type="button"
                onClick={addSpecialty}
                className="bg-node-volt text-deep-asphalt font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.specialties.map((spec) => (
                <span
                  key={spec}
                  className="bg-tech-grey border border-border-dark px-3 py-1 rounded flex items-center gap-2"
                >
                  {spec}
                  <button
                    type="button"
                    onClick={() => removeSpecialty(spec)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-muted-text">Certifications</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCertification();
                  }
                }}
                placeholder="e.g., NASM-CPT, CrossFit L1"
                className="flex-1 bg-tech-grey border border-border-dark rounded-lg px-4 py-2 text-text-white focus:outline-none focus:border-node-volt"
              />
              <button
                type="button"
                onClick={addCertification}
                className="bg-node-volt text-deep-asphalt font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.certifications.map((cert) => (
                <span
                  key={cert}
                  className="bg-tech-grey border border-border-dark px-3 py-1 rounded flex items-center gap-2"
                >
                  {cert}
                  <button
                    type="button"
                    onClick={() => removeCertification(cert)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-text">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://yourwebsite.com"
                className="w-full bg-tech-grey border border-border-dark rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-text">Instagram</label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="@yourhandle"
                className="w-full bg-tech-grey border border-border-dark rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Link
              href="/coach"
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

