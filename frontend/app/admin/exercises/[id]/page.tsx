'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

const EXERCISE_CATEGORIES = ['STRENGTH', 'MIXED', 'SKILL', 'ENGINE', 'CORE', 'MOBILITY'];
const MOVEMENT_PATTERNS = [
  'HORIZONTAL_PUSH', 'HORIZONTAL_PULL', 'VERTICAL_PUSH', 'VERTICAL_PULL',
  'SQUAT', 'HINGE', 'LUNGE', 'CARRY', 'LOC0MOTION', 'FULL_BODY',
  'CORE_ANTI_EXTENSION', 'CORE_ROTATION', 'BREATH_MOBILITY'
];
const SPACE_REQUIREMENTS = ['SPOT', 'OPEN_AREA', 'LANE_5M', 'LANE_10M', 'RUN_ROUTE'];
const IMPACT_LEVELS = ['LOW', 'MEDIUM', 'HIGH'];
const TYPICAL_USE = ['PRIMARY', 'ASSISTANCE', 'CONDITIONING', 'WARMUP', 'FINISHER', 'FLOWSTATE'];
const ARCHETYPES = ['PR1ME', 'FORGE', 'ENGIN3', 'CIRCUIT_X', 'CAPAC1TY', 'FLOWSTATE'];
const TIERS = ['SILVER', 'GOLD', 'BLACK'];

export default function ExerciseEditPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const exerciseId = params.id as string;
  const isNew = exerciseId === 'new';

  const [formData, setFormData] = useState({
    exerciseId: '',
    name: '',
    aliases: [] as string[],
    category: 'STRENGTH',
    movementPattern: 'HORIZONTAL_PUSH',
    primaryMuscles: [] as string[],
    secondaryMuscles: [] as string[],
    equipment: [] as string[],
    space: 'SPOT',
    impactLevel: 'LOW',
    typicalUse: [] as string[],
    suitableArchetypes: [] as string[],
    indoorFriendly: true,
    notes: '',
    tiers: [
      { tier: 'SILVER', description: '', typicalReps: '' },
      { tier: 'GOLD', description: '', typicalReps: '' },
      { tier: 'BLACK', description: '', typicalReps: '' },
    ] as Array<{ tier: string; description: string; typicalReps: string }>,
  });

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push('/');
      return;
    }

    if (!isNew && user?.isAdmin) {
      loadExercise();
    }
  }, [user, authLoading, router, exerciseId]);

  const loadExercise = async () => {
    try {
      setLoading(true);
      const exercise = await adminApi.getExercise(exerciseId);
      
      // Map tiers to form format
      const tierMap: Record<string, { description: string; typicalReps: string }> = {};
      exercise.tiers?.forEach((t: any) => {
        tierMap[t.tier] = { description: t.description || '', typicalReps: t.typicalReps || '' };
      });

      setFormData({
        exerciseId: exercise.exerciseId,
        name: exercise.name,
        aliases: exercise.aliases || [],
        category: exercise.category,
        movementPattern: exercise.movementPattern,
        primaryMuscles: exercise.primaryMuscles || [],
        secondaryMuscles: exercise.secondaryMuscles || [],
        equipment: exercise.equipment || [],
        space: exercise.space,
        impactLevel: exercise.impactLevel,
        typicalUse: exercise.typicalUse || [],
        suitableArchetypes: exercise.suitableArchetypes || [],
        indoorFriendly: exercise.indoorFriendly ?? true,
        notes: exercise.notes || '',
        tiers: TIERS.map((tier) => ({
          tier,
          description: tierMap[tier]?.description || '',
          typicalReps: tierMap[tier]?.typicalReps || '',
        })),
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load exercise');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = {
        ...formData,
        tiers: formData.tiers.filter((t) => t.description || t.typicalReps),
      };

      if (isNew) {
        await adminApi.createExercise(payload);
      } else {
        await adminApi.updateExercise(exerciseId, payload);
      }

      router.push('/admin/exercises');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save exercise');
    } finally {
      setSaving(false);
    }
  };

  const addArrayItem = (field: keyof typeof formData, value: string) => {
    if (!value.trim()) return;
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] as string[]), value.trim()],
    }));
  };

  const removeArrayItem = (field: keyof typeof formData, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  };

  if (authLoading || loading) {
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {isNew ? 'Create Exercise' : 'Edit Exercise'}
          </h1>
          <Link href="/admin/exercises" className="text-muted-text hover:text-text-white">
            ← Back to Exercises
          </Link>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded p-4 mb-6 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-concrete-grey border border-border-dark rounded-lg p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Exercise ID *</label>
              <input
                type="text"
                required
                value={formData.exerciseId}
                onChange={(e) => setFormData({ ...formData, exerciseId: e.target.value })}
                className="w-full bg-tech-grey border border-border-dark rounded px-4 py-2 text-text-white"
                disabled={!isNew}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-tech-grey border border-border-dark rounded px-4 py-2 text-text-white"
              />
            </div>
          </div>

          {/* Category & Pattern */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-tech-grey border border-border-dark rounded px-4 py-2 text-text-white"
              >
                {EXERCISE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Movement Pattern *</label>
              <select
                required
                value={formData.movementPattern}
                onChange={(e) => setFormData({ ...formData, movementPattern: e.target.value })}
                className="w-full bg-tech-grey border border-border-dark rounded px-4 py-2 text-text-white"
              >
                {MOVEMENT_PATTERNS.map((mp) => (
                  <option key={mp} value={mp}>{mp}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Space & Impact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Space Requirement *</label>
              <select
                required
                value={formData.space}
                onChange={(e) => setFormData({ ...formData, space: e.target.value })}
                className="w-full bg-tech-grey border border-border-dark rounded px-4 py-2 text-text-white"
              >
                {SPACE_REQUIREMENTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Impact Level *</label>
              <select
                required
                value={formData.impactLevel}
                onChange={(e) => setFormData({ ...formData, impactLevel: e.target.value })}
                className="w-full bg-tech-grey border border-border-dark rounded px-4 py-2 text-text-white"
              >
                {IMPACT_LEVELS.map((il) => (
                  <option key={il} value={il}>{il}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Arrays */}
          <div>
            <label className="block text-sm font-medium mb-2">Primary Muscles</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.primaryMuscles.map((muscle, i) => (
                <span key={i} className="bg-node-volt/20 text-node-volt px-3 py-1 rounded flex items-center gap-2">
                  {muscle}
                  <button
                    type="button"
                    onClick={() => removeArrayItem('primaryMuscles', i)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add muscle (press Enter)"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addArrayItem('primaryMuscles', e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
              className="w-full bg-tech-grey border border-border-dark rounded px-4 py-2 text-text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Equipment</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.equipment.map((eq, i) => (
                <span key={i} className="bg-node-volt/20 text-node-volt px-3 py-1 rounded flex items-center gap-2">
                  {eq}
                  <button
                    type="button"
                    onClick={() => removeArrayItem('equipment', i)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add equipment (press Enter)"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addArrayItem('equipment', e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
              className="w-full bg-tech-grey border border-border-dark rounded px-4 py-2 text-text-white"
            />
          </div>

          {/* Typical Use & Archetypes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Typical Use</label>
              <div className="space-y-2">
                {TYPICAL_USE.map((use) => (
                  <label key={use} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.typicalUse.includes(use)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, typicalUse: [...formData.typicalUse, use] });
                        } else {
                          setFormData({ ...formData, typicalUse: formData.typicalUse.filter((u) => u !== use) });
                        }
                      }}
                      className="rounded"
                    />
                    <span>{use}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Suitable Archetypes</label>
              <div className="space-y-2">
                {ARCHETYPES.map((arch) => (
                  <label key={arch} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.suitableArchetypes.includes(arch)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, suitableArchetypes: [...formData.suitableArchetypes, arch] });
                        } else {
                          setFormData({ ...formData, suitableArchetypes: formData.suitableArchetypes.filter((a) => a !== arch) });
                        }
                      }}
                      className="rounded"
                    />
                    <span>{arch}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Tiers */}
          <div>
            <label className="block text-sm font-medium mb-2">Tier Prescriptions</label>
            <div className="space-y-4">
              {formData.tiers.map((tier, i) => (
                <div key={tier.tier} className="bg-tech-grey p-4 rounded">
                  <h4 className="font-semibold mb-3">{tier.tier} Tier</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1">Description</label>
                      <input
                        type="text"
                        value={tier.description}
                        onChange={(e) => {
                          const newTiers = [...formData.tiers];
                          newTiers[i].description = e.target.value;
                          setFormData({ ...formData, tiers: newTiers });
                        }}
                        className="w-full bg-deep-asphalt border border-border-dark rounded px-3 py-2 text-text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Typical Reps</label>
                      <input
                        type="text"
                        value={tier.typicalReps}
                        onChange={(e) => {
                          const newTiers = [...formData.tiers];
                          newTiers[i].typicalReps = e.target.value;
                          setFormData({ ...formData, tiers: newTiers });
                        }}
                        className="w-full bg-deep-asphalt border border-border-dark rounded px-3 py-2 text-text-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full bg-tech-grey border border-border-dark rounded px-4 py-2 text-text-white"
            />
          </div>

          {/* Indoor Friendly */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.indoorFriendly}
                onChange={(e) => setFormData({ ...formData, indoorFriendly: e.target.checked })}
                className="rounded"
              />
              <span>Indoor Friendly</span>
            </label>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-node-volt text-deep-asphalt font-bold py-3 px-6 rounded hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : isNew ? 'Create Exercise' : 'Save Changes'}
            </button>
            <Link
              href="/admin/exercises"
              className="bg-tech-grey text-text-white font-bold py-3 px-6 rounded hover:opacity-90"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

