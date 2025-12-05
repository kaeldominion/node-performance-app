'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { gamificationApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { AchievementIcon } from '@/components/achievements/AchievementIcon';
import { Icons } from '@/lib/iconMapping';
import Link from 'next/link';

export default function BadgesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRarity, setSelectedRarity] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      console.log('👤 User loaded, loading badges...', { userId: user.id });
      loadBadges();
    } else {
      console.log('⏳ Waiting for user...', { authLoading, hasUser: !!user });
    }
  }, [user, authLoading]);

  const loadBadges = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading badges...', { user: user?.id });
      const badges = await gamificationApi.getAllAchievements();
      console.log('✅ Loaded badges:', badges?.length || 0, badges);
      if (badges && Array.isArray(badges)) {
        setAllBadges(badges);
        console.log(`✅ Set ${badges.length} badges to state`);
      } else {
        console.warn('⚠️ Badges data is not an array:', badges);
        setAllBadges([]);
      }
    } catch (error: any) {
      console.error('❌ Failed to load badges:', {
        error,
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        config: {
          url: error?.config?.url,
          baseURL: error?.config?.baseURL,
          method: error?.config?.method,
        },
      });
      setAllBadges([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['STREAK', 'VOLUME', 'CONSISTENCY', 'INTENSITY', 'MILESTONE', 'SPECIAL', 'CONTRIBUTION'];
  const rarities = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'];

  const filteredBadges = allBadges.filter((badge) => {
    if (selectedCategory && badge.category !== selectedCategory) return false;
    if (selectedRarity && badge.rarity !== selectedRarity) return false;
    return true;
  });

  const earnedCount = allBadges.filter((b: any) => b.earned).length;
  const totalCount = allBadges.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-dark">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-node-volt border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="text-muted-text">Loading badges...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      
      {/* Header */}
      <div className="relative bg-gradient-to-br from-deep-asphalt via-concrete-grey to-deep-asphalt border-b border-border-dark overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-node-volt rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Link href="/dashboard" className="text-muted-text hover:text-text-white mb-6 inline-block transition-colors flex items-center gap-2">
            <span>←</span>
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-text-white to-node-volt bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            All Badges
          </h1>
          <p className="text-xl text-muted-text mb-6" style={{ fontFamily: 'var(--font-manrope)' }}>
            Complete challenges to unlock achievements and earn badges
          </p>
          <div className="flex items-center gap-6">
            <div className="bg-node-volt/20 border border-node-volt/50 rounded-lg px-6 py-3">
              <div className="text-3xl font-bold text-node-volt" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                {earnedCount} / {totalCount}
              </div>
              <div className="text-sm text-muted-text">Badges Earned</div>
            </div>
            <div className="text-muted-text">
              {totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0}% Complete
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="bg-panel thin-border rounded-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="text-sm text-muted-text font-heading uppercase tracking-[0.1em]">Filters:</span>
            
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  selectedCategory === null
                    ? 'bg-node-volt text-dark'
                    : 'bg-tech-grey text-muted-text hover:text-text-white'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-node-volt text-dark'
                      : 'bg-tech-grey text-muted-text hover:text-text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Rarity Filter */}
            <div className="flex gap-2 flex-wrap ml-auto">
              <button
                onClick={() => setSelectedRarity(null)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  selectedRarity === null
                    ? 'bg-node-volt text-dark'
                    : 'bg-tech-grey text-muted-text hover:text-text-white'
                }`}
              >
                All Rarities
              </button>
              {rarities.map((rarity) => (
                <button
                  key={rarity}
                  onClick={() => setSelectedRarity(rarity)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    selectedRarity === rarity
                      ? 'bg-node-volt text-dark'
                      : 'bg-tech-grey text-muted-text hover:text-text-white'
                  }`}
                >
                  {rarity}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Badges Grid - Grouped by Category */}
        {totalCount === 0 ? (
          <div className="text-center py-12 text-muted-text">
            <Icons.GAMIFICATION size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-bold mb-2">No badges available</p>
            <p className="text-sm mb-4">Badges are being initialized. Please refresh the page in a moment.</p>
            <button
              onClick={loadBadges}
              className="bg-node-volt text-dark px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity"
            >
              Retry Loading
            </button>
          </div>
        ) : (
          categories.map((category) => {
            const categoryBadges = filteredBadges.filter((b: any) => b?.category === category);
            if (categoryBadges.length === 0) return null;

          return (
            <div key={category} className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-node-volt uppercase tracking-[0.1em]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {category}
                </h2>
                <div className="text-sm text-muted-text">
                  {categoryBadges.filter((b: any) => b.earned).length} / {categoryBadges.length} earned
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categoryBadges.map((badge: any) => {
                  const isClose = !badge.earned && badge.progress >= 85;
                  const progress = badge.progress || 0;
                  
                  return (
                    <div
                      key={badge.id}
                      className={`relative bg-panel thin-border rounded-lg p-4 text-center transition-all group overflow-hidden ${
                        badge.earned
                          ? 'hover:border-node-volt opacity-100'
                          : isClose
                          ? 'opacity-70 hover:opacity-90 border-node-volt/30'
                          : 'opacity-40 hover:opacity-60'
                      }`}
                    >
                      {/* "Almost There" indicator */}
                      {isClose && (
                        <div className="absolute top-2 right-2 z-20">
                          <div className="bg-node-volt text-dark text-[8px] font-bold px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                            <span>⚡</span>
                            <span>{progress}%</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Progress bar for unearned badges */}
                      {!badge.earned && progress > 0 && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-tech-grey">
                          <div 
                            className={`h-full transition-all ${
                              isClose ? 'bg-node-volt' : 'bg-muted-text'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                      
                      {/* Rarity glow effect - only for earned */}
                      {badge.earned && (
                        <div 
                          className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity ${
                            badge.rarity === 'LEGENDARY' ? 'bg-yellow-500' :
                            badge.rarity === 'EPIC' ? 'bg-purple-500' :
                            badge.rarity === 'RARE' ? 'bg-blue-500' :
                            'bg-gray-500'
                          }`}
                        />
                      )}
                      
                      {/* Close indicator glow */}
                      {isClose && (
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-node-volt" />
                      )}
                      
                      <div className="relative z-10">
                        <div className={badge.earned ? '' : 'grayscale opacity-50'}>
                          <AchievementIcon
                            icon={badge.icon}
                            rarity={badge.rarity}
                            size="md"
                            className="mx-auto mb-2"
                          />
                        </div>
                        <div className={`text-xs font-bold mb-1 ${badge.earned ? 'text-text-white' : isClose ? 'text-node-volt' : 'text-muted-text'}`} style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                          {badge.name}
                        </div>
                        <div className="text-[10px] text-muted-text mb-2 line-clamp-2 min-h-[2.5rem]">
                          {badge.description}
                        </div>
                        
                        {/* Progress info for unearned badges */}
                        {!badge.earned && progress > 0 && (
                          <div className="text-[9px] text-muted-text mb-1">
                            {progress}% complete
                            {badge.value !== null && badge.value !== undefined && (
                              <span className="block text-node-volt font-bold mt-0.5">
                                {badge.value}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {badge.earned && badge.earnedAt && (
                          <div className="text-[9px] text-node-volt font-bold mb-1">
                            Earned {new Date(badge.earnedAt).toLocaleDateString()}
                          </div>
                        )}
                        {!badge.earned && progress === 0 && (
                          <div className="text-[9px] text-muted-text font-bold mb-1">
                            🔒 Locked
                          </div>
                        )}
                        <div className={`text-[9px] uppercase tracking-[0.1em] font-bold ${
                          badge.rarity === 'LEGENDARY' ? 'text-yellow-400' :
                          badge.rarity === 'EPIC' ? 'text-purple-400' :
                          badge.rarity === 'RARE' ? 'text-blue-400' :
                          'text-gray-400'
                        }`}>
                          {badge.rarity}
                        </div>
                        {badge.xpReward > 0 && (
                          <div className="text-[9px] text-node-volt font-bold mt-1">
                            +{badge.xpReward} XP
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
          })
        )}

        {totalCount > 0 && filteredBadges.length === 0 && (
          <div className="text-center py-12 text-muted-text">
            <Icons.GAMIFICATION size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-bold mb-2">No badges match your filters</p>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedRarity(null);
              }}
              className="text-node-volt hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

