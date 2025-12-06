'use client';

import { useState } from 'react';
import { workoutsApi } from '@/lib/api';
import { Icons } from '@/lib/iconMapping';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface RatingModalProps {
  workoutId: string;
  sessionLogId?: string;
  onComplete: (rating: any) => void;
  onCancel: () => void;
}

const RATING_TAGS = [
  'Too Easy',
  'Perfect',
  'Too Hard',
  'Loved It',
  'Challenging',
  'Fun',
  'Boring',
  'Effective',
  'Would Do Again',
  'Not For Me',
];

export function RatingModal({ workoutId, sessionLogId, onComplete, onCancel }: RatingModalProps) {
  const [starRating, setStarRating] = useState(0);
  const [showDetailed, setShowDetailed] = useState(false);
  const [difficultyRating, setDifficultyRating] = useState(5);
  const [enjoymentRating, setEnjoymentRating] = useState(5);
  const [effectivenessRating, setEffectivenessRating] = useState(5);
  const [wouldDoAgain, setWouldDoAgain] = useState<boolean | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [favoriteExercises, setFavoriteExercises] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { config, isMobile } = useResponsiveLayout();

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (starRating === 0) {
      setError('Please provide a star rating');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const ratingData: any = {
        sessionLogId: sessionLogId || undefined,
        starRating,
        difficultyRating: showDetailed ? difficultyRating : undefined,
        enjoymentRating: showDetailed ? enjoymentRating : undefined,
        effectivenessRating: showDetailed ? effectivenessRating : undefined,
        wouldDoAgain: showDetailed ? wouldDoAgain : undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        notes: notes.trim() || undefined,
        favoriteExercises: favoriteExercises.length > 0 ? favoriteExercises : undefined,
      };

      const rating = await workoutsApi.createRating(workoutId, ratingData);
      onComplete(rating);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit rating. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-panel thin-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ minWidth: isMobile ? '100%' : '500px' }}
      >
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-2xl sm:text-3xl font-bold"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Rate This Workout
            </h2>
            <button
              onClick={onCancel}
              className="text-muted-text hover:text-text-white transition-colors"
              style={{ minWidth: config.touchTargetSize, minHeight: config.touchTargetSize }}
            >
              <Icons.X size={24} />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-400">
              {error}
            </div>
          )}

          {/* Quick Star Rating */}
          <div>
            <label className="block text-sm font-medium mb-4 text-muted-text">
              Overall Rating <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setStarRating(star)}
                  className={`
                    transition-all duration-200
                    ${starRating >= star
                      ? 'scale-110 text-node-volt'
                      : 'scale-100 text-muted-text hover:text-node-volt/50'
                    }
                  `}
                  style={{
                    minWidth: config.touchTargetSize,
                    minHeight: config.touchTargetSize,
                  }}
                >
                  <Icons.STAR
                    size={isMobile ? 40 : 48}
                    fill={starRating >= star ? 'currentColor' : 'none'}
                  />
                </button>
              ))}
            </div>
            {starRating > 0 && (
              <div className="text-center mt-2 text-muted-text text-sm">
                {starRating === 1 && 'Poor'}
                {starRating === 2 && 'Fair'}
                {starRating === 3 && 'Good'}
                {starRating === 4 && 'Very Good'}
                {starRating === 5 && 'Excellent'}
              </div>
            )}
          </div>

          {/* Toggle Detailed Feedback */}
          <button
            onClick={() => setShowDetailed(!showDetailed)}
            className="w-full bg-panel/50 thin-border rounded-lg px-4 py-3 text-left hover:bg-panel transition-colors flex items-center justify-between"
          >
            <span className="text-sm font-medium text-muted-text">
              {showDetailed ? 'Hide' : 'Show'} Detailed Feedback (Optional)
            </span>
            <Icons.CHEVRON_DOWN
              size={20}
              className={`transition-transform ${showDetailed ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Detailed Feedback */}
          {showDetailed && (
            <div className="space-y-6 pt-4 border-t thin-border">
              {/* Difficulty Rating */}
              <div>
                <label className="block text-sm font-medium mb-3 text-muted-text">
                  Difficulty: {difficultyRating}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={difficultyRating}
                  onChange={(e) => setDifficultyRating(Number(e.target.value))}
                  className="w-full accent-node-volt"
                />
                <div className="flex justify-between text-xs text-muted-text mt-1">
                  <span>Too Easy</span>
                  <span>Perfect</span>
                  <span>Too Hard</span>
                </div>
              </div>

              {/* Enjoyment Rating */}
              <div>
                <label className="block text-sm font-medium mb-3 text-muted-text">
                  Enjoyment: {enjoymentRating}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={enjoymentRating}
                  onChange={(e) => setEnjoymentRating(Number(e.target.value))}
                  className="w-full accent-node-volt"
                />
                <div className="flex justify-between text-xs text-muted-text mt-1">
                  <span>Not Fun</span>
                  <span>Neutral</span>
                  <span>Loved It</span>
                </div>
              </div>

              {/* Effectiveness Rating */}
              <div>
                <label className="block text-sm font-medium mb-3 text-muted-text">
                  Effectiveness: {effectivenessRating}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={effectivenessRating}
                  onChange={(e) => setEffectivenessRating(Number(e.target.value))}
                  className="w-full accent-node-volt"
                />
                <div className="flex justify-between text-xs text-muted-text mt-1">
                  <span>Not Effective</span>
                  <span>Moderate</span>
                  <span>Very Effective</span>
                </div>
              </div>

              {/* Would Do Again */}
              <div>
                <label className="block text-sm font-medium mb-3 text-muted-text">
                  Would you do this workout again?
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setWouldDoAgain(true)}
                    className={`
                      flex-1 px-6 py-3 rounded-lg font-medium transition-all
                      ${wouldDoAgain === true
                        ? 'bg-node-volt text-dark'
                        : 'bg-panel/50 thin-border text-muted-text hover:bg-panel'
                      }
                    `}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setWouldDoAgain(false)}
                    className={`
                      flex-1 px-6 py-3 rounded-lg font-medium transition-all
                      ${wouldDoAgain === false
                        ? 'bg-red-500/20 border-red-500 text-red-400'
                        : 'bg-panel/50 thin-border text-muted-text hover:bg-panel'
                      }
                    `}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-3 text-muted-text">
                  Tags (select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {RATING_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${selectedTags.includes(tag)
                          ? 'bg-node-volt text-dark'
                          : 'bg-panel/50 thin-border text-muted-text hover:bg-panel'
                        }
                      `}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-3 text-muted-text">
                  Additional Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-dark thin-border rounded-lg px-4 py-3 text-text-white focus:outline-none focus:border-node-volt resize-none"
                  rows={4}
                  placeholder="Any additional thoughts about this workout?"
                />
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t thin-border">
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 bg-panel thin-border text-text-white px-6 py-3 rounded-lg hover:bg-panel transition-colors font-medium disabled:opacity-50"
            >
              Skip
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || starRating === 0}
              className="flex-1 bg-node-volt text-dark font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

