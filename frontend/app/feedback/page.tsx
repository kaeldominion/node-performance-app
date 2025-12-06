'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { feedbackApi } from '@/lib/api';
import { Icons } from '@/lib/iconMapping';

type FeedbackType = 'BUG_REPORT' | 'FEATURE_REQUEST' | 'GENERAL_FEEDBACK' | 'UI_UX_FEEDBACK' | 'PERFORMANCE_ISSUE' | 'OTHER';

const FEEDBACK_TYPES: { value: FeedbackType; label: string; icon: keyof typeof Icons; description: string }[] = [
  { value: 'BUG_REPORT', label: 'Bug Report', icon: 'BUG', description: 'Report a bug or error' },
  { value: 'FEATURE_REQUEST', label: 'Feature Request', icon: 'LIGHTBULB', description: 'Suggest a new feature' },
  { value: 'UI_UX_FEEDBACK', label: 'UI/UX Feedback', icon: 'DESIGN', description: 'Share design feedback' },
  { value: 'PERFORMANCE_ISSUE', label: 'Performance Issue', icon: 'SPEED', description: 'Report slow loading or performance' },
  { value: 'GENERAL_FEEDBACK', label: 'General Feedback', icon: 'COMMENT', description: 'General comments or suggestions' },
  { value: 'OTHER', label: 'Other', icon: 'MORE_VERTICAL', description: 'Something else' },
];

export default function FeedbackPage() {
  const { user } = useAuth();
  const [type, setType] = useState<FeedbackType>('GENERAL_FEEDBACK');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
      const userAgent = typeof window !== 'undefined' ? navigator.userAgent : '';

      await feedbackApi.create({
        type,
        title,
        description,
        category: category || undefined,
        pageUrl,
        userAgent,
      });

      setSubmitted(true);
      setTitle('');
      setDescription('');
      setCategory('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-panel thin-border rounded-lg p-8 text-center">
          <div className="mb-4">
            <Icons.CHECK size={48} className="text-node-volt mx-auto" />
          </div>
          <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Thank You!
          </h1>
          <p className="text-muted-text mb-6">
            Your feedback has been submitted successfully. We appreciate you taking the time to help us improve NØDE OS.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setType('GENERAL_FEEDBACK');
            }}
            className="bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Share Your Feedback
          </h1>
          <p className="text-muted-text text-lg">
            Help us improve NØDE OS. Report bugs, suggest features, or share your thoughts.
          </p>
        </div>

        {/* Feedback Form */}
        <div className="bg-panel thin-border rounded-lg p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Feedback Type Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">
                What type of feedback is this?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {FEEDBACK_TYPES.map((feedbackType) => {
                  const Icon = Icons[feedbackType.icon] || Icons.COMMENT;
                  return (
                    <button
                      key={feedbackType.value}
                      type="button"
                      onClick={() => setType(feedbackType.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        type === feedbackType.value
                          ? 'border-node-volt bg-node-volt/10'
                          : 'thin-border bg-panel/50 hover:bg-panel'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon size={20} className={type === feedbackType.value ? 'text-node-volt' : 'text-muted-text'} />
                        <span className={`font-semibold ${type === feedbackType.value ? 'text-node-volt' : 'text-text-white'}`}>
                          {feedbackType.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-text">{feedbackType.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Title <span className="text-node-volt">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
                placeholder="Brief summary of your feedback"
                className="w-full px-4 py-3 bg-dark thin-border rounded-lg text-text-white placeholder-muted-text focus:outline-none focus:border-node-volt transition-colors"
              />
              <p className="text-xs text-muted-text mt-1">{title.length}/200 characters</p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description <span className="text-node-volt">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                maxLength={5000}
                rows={8}
                placeholder="Please provide as much detail as possible. For bugs, include steps to reproduce. For feature requests, explain the use case."
                className="w-full px-4 py-3 bg-dark thin-border rounded-lg text-text-white placeholder-muted-text focus:outline-none focus:border-node-volt transition-colors resize-y"
              />
              <p className="text-xs text-muted-text mt-1">{description.length}/5000 characters</p>
            </div>

            {/* Category (Optional) */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">
                Category <span className="text-muted-text text-xs">(Optional)</span>
              </label>
              <input
                id="category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                maxLength={50}
                placeholder="e.g., Workout Player, AI Builder, Dashboard"
                className="w-full px-4 py-3 bg-dark thin-border rounded-lg text-text-white placeholder-muted-text focus:outline-none focus:border-node-volt transition-colors"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-text">
                {user ? `Submitting as ${user.email}` : 'Submitting anonymously'}
              </p>
              <button
                type="submit"
                disabled={submitting || !title.trim() || !description.trim()}
                className="bg-node-volt text-dark font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Icons.SEND size={18} />
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-panel/50 thin-border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            What happens next?
          </h2>
          <ul className="space-y-2 text-muted-text">
            <li className="flex items-start gap-2">
              <Icons.CHECK size={16} className="text-node-volt mt-1 flex-shrink-0" />
              <span>Your feedback is reviewed by our team</span>
            </li>
            <li className="flex items-start gap-2">
              <Icons.CHECK size={16} className="text-node-volt mt-1 flex-shrink-0" />
              <span>We prioritize based on impact and user needs</span>
            </li>
            <li className="flex items-start gap-2">
              <Icons.CHECK size={16} className="text-node-volt mt-1 flex-shrink-0" />
              <span>You'll receive updates if you're logged in</span>
            </li>
            <li className="flex items-start gap-2">
              <Icons.CHECK size={16} className="text-node-volt mt-1 flex-shrink-0" />
              <span>We use your feedback to improve NØDE OS</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

